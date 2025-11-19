# backend/app.py
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import uuid
from datetime import datetime, timedelta
import jwt
from sqlalchemy import text  
from werkzeug.security import generate_password_hash, check_password_hash

# Add the root directory to Python path so we can import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now import from models (which is at root level)
from models.database import db
from models.user import User
from models.transfer import Transfer
from models.exchange_rate import ExchangeRate

# JWT Secret Key
SECRET_KEY = os.getenv('SECRET_KEY', 'remitlite-secret-key-2024')

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    CORS(app)
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///remitlite.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database with app
    db.init_app(app)
    
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
        print("✅ Database tables created!")
    
    return app

# Create the Flask app
app = create_app()

# ==================== EXCHANGE RATES CACHE & ENDPOINTS ====================

# Simple cache for rates with expiration
exchange_rates_cache = {
    'data': None,
    'timestamp': None,
    'expires_at': None
}

CACHE_DURATION = 300  # 5 minutes in seconds

def get_cached_rates():
    """Get cached rates if they are still valid"""
    if (exchange_rates_cache['data'] and 
        exchange_rates_cache['expires_at'] and 
        datetime.now() < exchange_rates_cache['expires_at']):
        return exchange_rates_cache['data']
    return None

def set_cached_rates(rates_data):
    """Set rates in cache with expiration"""
    exchange_rates_cache['data'] = rates_data
    exchange_rates_cache['timestamp'] = datetime.now()
    exchange_rates_cache['expires_at'] = datetime.now() + timedelta(seconds=CACHE_DURATION)

def get_fallback_rates():
    """Comprehensive fallback exchange rates"""
    return {
        'USD': {
            'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 148.32, 'CAD': 1.35, 
            'AUD': 1.52, 'CHF': 0.88, 'CNY': 7.18,
            # African currencies
            'ZAR': 18.75, 'NGN': 845.50, 'EGP': 30.90, 'KES': 157.80, 
            'GHS': 11.45, 'MAD': 9.75, 'XOF': 605.80, 'ETB': 56.25,
            'UGX': 3750.25, 'RWF': 1280.60, 'TZS': 2340.40, 'AOA': 850.25,
            'MZN': 63.90, 'ZMW': 24.80, 'BWP': 13.65,
            # Asian currencies
            'INR': 83.15, 'SGD': 1.34, 'HKD': 7.82, 'KRW': 1320.45,
            'TRY': 32.15, 'AED': 3.67, 'SAR': 3.75, 'THB': 35.80, 'MYR': 4.70
        },
        'EUR': {
            'USD': 1.09, 'EUR': 1, 'GBP': 0.86, 'JPY': 161.45, 'CAD': 1.47,
            'AUD': 1.65, 'CHF': 0.96, 'CNY': 7.82,
            # African currencies
            'ZAR': 20.45, 'NGN': 920.25, 'EGP': 33.65, 'KES': 172.15,
            'GHS': 12.48, 'MAD': 10.63, 'XOF': 655.80, 'ETB': 61.30,
            'UGX': 4085.75, 'RWF': 1395.30, 'TZS': 2550.15, 'AOA': 928.40,
            'MZN': 69.65, 'ZMW': 27.05, 'BWP': 14.88,
            # Asian currencies
            'INR': 90.65, 'SGD': 1.46, 'HKD': 8.52, 'KRW': 1440.25,
            'TRY': 35.05, 'AED': 4.00, 'SAR': 4.09, 'THB': 39.05, 'MYR': 5.12
        },
        'GBP': {
            'USD': 1.27, 'EUR': 1.16, 'GBP': 1, 'JPY': 187.89, 'CAD': 1.71,
            'AUD': 1.92, 'CHF': 1.12, 'CNY': 9.08,
            # African currencies
            'ZAR': 23.75, 'NGN': 1075.75, 'EGP': 39.20, 'KES': 200.10,
            'GHS': 14.52, 'MAD': 12.36, 'XOF': 761.25, 'ETB': 71.25,
            'UGX': 4760.50, 'RWF': 1625.80, 'TZS': 2965.45, 'AOA': 1078.90,
            'MZN': 81.05, 'ZMW': 31.45, 'BWP': 17.30,
            # Asian currencies
            'INR': 105.45, 'SGD': 1.70, 'HKD': 9.92, 'KRW': 1675.80,
            'TRY': 40.75, 'AED': 4.66, 'SAR': 4.76, 'THB': 45.40, 'MYR': 5.95
        }
    }

@app.route('/api/exchange-rates', methods=['GET'])
def get_exchange_rates():
    """Get comprehensive exchange rates with caching"""
    try:
        # Check cache first
        cached_rates = get_cached_rates()
        if cached_rates:
            return jsonify({
                'rates': cached_rates,
                'source': 'cache',
                'cached': True,
                'timestamp': exchange_rates_cache['timestamp'].isoformat()
            })
        
        # If no cache, fetch from external API
        base_currencies = ['USD', 'EUR', 'GBP']
        all_rates = {}
        
        for base_currency in base_currencies:
            try:
                response = requests.get(
                    f'https://api.exchangerate.host/latest?base={base_currency}',
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        # Extract major currencies and African currencies
                        target_currencies = {
                            # Major currencies
                            'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
                            # African currencies  
                            'ZAR', 'NGN', 'EGP', 'KES', 'GHS', 'MAD', 'XOF', 'ETB',
                            'UGX', 'RWF', 'TZS', 'AOA',
                            # Asian currencies
                            'INR', 'SGD', 'HKD', 'KRW', 'TRY', 'AED', 'SAR', 'THB', 'MYR'
                        }
                        
                        filtered_rates = {}
                        for currency in target_currencies:
                            if currency in data['rates']:
                                filtered_rates[currency] = data['rates'][currency]
                        
                        all_rates[base_currency] = filtered_rates
                        
            except requests.exceptions.Timeout:
                print(f"Timeout fetching rates for {base_currency}")
                continue
            except Exception as e:
                print(f"Error fetching rates for {base_currency}: {e}")
                continue
        
        # If we got some rates, cache them
        if all_rates:
            set_cached_rates(all_rates)
            return jsonify({
                'rates': all_rates,
                'source': 'external_api',
                'cached': False,
                'timestamp': datetime.now().isoformat()
            })
        else:
            # If external API fails, return fallback rates
            fallback_rates = get_fallback_rates()
            set_cached_rates(fallback_rates)
            return jsonify({
                'rates': fallback_rates,
                'source': 'fallback',
                'cached': False,
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        print(f"Error in get_exchange_rates: {e}")
        # Return fallback rates in case of complete failure
        fallback_rates = get_fallback_rates()
        return jsonify({
            'rates': fallback_rates,
            'source': 'fallback_error',
            'cached': False,
            'timestamp': datetime.now().isoformat()
        })

@app.route('/api/convert-rate', methods=['GET'])
def convert_exchange_rate():
    """Convert between two specific currencies"""
    try:
        from_currency = request.args.get('from', 'USD').upper()
        to_currency = request.args.get('to', 'EUR').upper()
        amount = float(request.args.get('amount', 1))
        
        if from_currency == to_currency:
            return jsonify({
                'from': from_currency,
                'to': to_currency,
                'amount': amount,
                'converted_amount': amount,
                'rate': 1.0
            })
        
        # Try to get rate from cache first
        cached_rates = get_cached_rates()
        if cached_rates and from_currency in cached_rates:
            if to_currency in cached_rates[from_currency]:
                rate = cached_rates[from_currency][to_currency]
                return jsonify({
                    'from': from_currency,
                    'to': to_currency,
                    'amount': amount,
                    'converted_amount': round(amount * rate, 2),
                    'rate': round(rate, 4)
                })
        
        # If not in cache, fetch directly from API
        response = requests.get(
            f'https://api.exchangerate.host/convert?from={from_currency}&to={to_currency}',
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                rate = data['result']
                return jsonify({
                    'from': from_currency,
                    'to': to_currency,
                    'amount': amount,
                    'converted_amount': round(amount * rate, 2),
                    'rate': round(rate, 4)
                })
        
        # Fallback to backup rates
        backup_rates = get_fallback_rates()
        if from_currency in backup_rates and to_currency in backup_rates[from_currency]:
            rate = backup_rates[from_currency][to_currency]
            return jsonify({
                'from': from_currency,
                'to': to_currency,
                'amount': amount,
                'converted_amount': round(amount * rate, 2),
                'rate': round(rate, 4),
                'source': 'fallback'
            })
        
        # Ultimate fallback
        return jsonify({
            'from': from_currency,
            'to': to_currency,
            'amount': amount,
            'converted_amount': amount,
            'rate': 1.0,
            'source': 'default'
        })
        
    except Exception as e:
        print(f"Error in convert_exchange_rate: {e}")
        return jsonify({
            'from': from_currency,
            'to': to_currency,
            'amount': amount,
            'converted_amount': amount,
            'rate': 1.0,
            'source': 'error',
            'error': str(e)
        })

@app.route('/api/refresh-rates', methods=['POST'])
def refresh_exchange_rates():
    """Force refresh of exchange rates cache"""
    try:
        # Clear cache to force refresh
        exchange_rates_cache['data'] = None
        exchange_rates_cache['timestamp'] = None
        exchange_rates_cache['expires_at'] = None
        
        # Fetch new rates
        get_exchange_rates()
        return jsonify({
            'message': 'Exchange rates refreshed successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to refresh rates: {str(e)}'}), 500

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ['name', 'email', 'password']):
            return jsonify({'error': 'Missing required fields: name, email, password'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            country_code=data.get('country_code', 'US'),
            phone=data.get('phone')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Authorization token required'}), 401
        
        # Verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = User.query.get(payload['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()})
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== EXISTING APPLICATION CODE ====================

class MoneyConverter:
    @staticmethod
    def get_exchange_rate(from_currency, to_currency):
        """Get live exchange rate from free API"""
        try:
            url = f"https://api.exchangerate.host/convert?from={from_currency}&to={to_currency}"
            response = requests.get(url)
            data = response.json()
            
            if data['success']:
                return data['result']
            else:
                return MoneyConverter.get_backup_rate(from_currency, to_currency)
        except:
            return MoneyConverter.get_backup_rate(from_currency, to_currency)
    
    @staticmethod
    def get_backup_rate(from_currency, to_currency):
        """Backup rates in case everything fails"""
        backup_rates = {
            'USD_EUR': 0.85, 'USD_GBP': 0.73, 'USD_INR': 83.0,
            'EUR_USD': 1.18, 'GBP_USD': 1.37, 'INR_USD': 0.012,
            'USD_CAD': 1.35, 'USD_AUD': 1.52, 'USD_JPY': 150.0,
        }
        key = f"{from_currency}_{to_currency}"
        return backup_rates.get(key, 1.0)

class UserService:
    @staticmethod
    def find_or_create_user(name, country_code, email=None, phone=None):
        """Find user by email or create new one without password"""
        user = None
        
        if email:
            user = User.query.filter_by(email=email).first()
        
        if not user:
            user = User(
                name=name,
                country_code=country_code,
                email=email,
                phone=phone
            )
            # Set a temporary password or leave it null if your model allows
            user.set_password(None)  # This will set password_hash to None
            db.session.add(user)
            db.session.commit()
            print(f"✅ Created new user: {name}")
        else:
            print(f"✅ Found existing user: {name}")
        
        return user
class TransferService:
    @staticmethod
    def generate_tracking_number():
        return f"RM{str(uuid.uuid4())[:8].upper()}"
    
    @staticmethod
    def calculate_fee(amount):
        if amount <= 100:
            return 2.99
        elif amount <= 500:
            return 4.99
        elif amount <= 1000:
            return 7.99
        else:
            return amount * 0.01
    
    @staticmethod
    def get_delivery_time(country_code):
        delivery_map = {
            'US': '1-2 hours', 'CA': '2-3 hours', 'GB': '1-2 hours',
            'FR': '1-3 hours', 'DE': '1-3 hours', 'IN': '2-4 hours',
            'AU': '3-5 hours', 'JP': '2-4 hours'
        }
        return delivery_map.get(country_code, '3-5 business days')

# ========== API ROUTES ==========

@app.route('/')
def home():
    return jsonify({
        "message": "RemitLite API is running! 🚀",
        "status": "active",
        "endpoints": {
            "exchange_rates": "/api/exchange-rates (GET)",
            "convert_rate": "/api/convert-rate (GET)",
            "refresh_rates": "/api/refresh-rates (POST)",
            "auth_register": "/api/auth/register (POST)",
            "auth_login": "/api/auth/login (POST)", 
            "auth_profile": "/api/auth/profile (GET)",
            "health_check": "/api/health (GET)",
            "currencies": "/api/currencies (GET)",
            "convert": "/api/convert (POST)",
            "estimate": "/api/estimate (POST)", 
            "transfers": "/api/transfers (GET)",
            "create_transfer": "/api/transfer (POST)"
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Check database connection
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'OK', 
            'message': 'RemitLite API is running!',
            'database': 'Connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'ERROR',
            'message': 'Database connection failed',
            'error': str(e)
        }), 500

@app.route('/api/currencies', methods=['GET'])
def get_currencies():
    currencies = [
        {'code': 'USD', 'name': 'US Dollar', 'symbol': '$', 'flag': '🇺🇸'},
        {'code': 'EUR', 'name': 'Euro', 'symbol': '€', 'flag': '🇪🇺'},
        {'code': 'GBP', 'name': 'British Pound', 'symbol': '£', 'flag': '🇬🇧'},
        {'code': 'JPY', 'name': 'Japanese Yen', 'symbol': '¥', 'flag': '🇯🇵'},
        {'code': 'CAD', 'name': 'Canadian Dollar', 'symbol': 'C$', 'flag': '🇨🇦'},
        {'code': 'AUD', 'name': 'Australian Dollar', 'symbol': 'A$', 'flag': '🇦🇺'},
        {'code': 'CHF', 'name': 'Swiss Franc', 'symbol': 'CHF', 'flag': '🇨🇭'},
        {'code': 'CNY', 'name': 'Chinese Yuan', 'symbol': '¥', 'flag': '🇨🇳'},
        {'code': 'ZAR', 'name': 'South African Rand', 'symbol': 'R', 'flag': '🇿🇦'},
        {'code': 'NGN', 'name': 'Nigerian Naira', 'symbol': '₦', 'flag': '🇳🇬'},
        {'code': 'EGP', 'name': 'Egyptian Pound', 'symbol': 'E£', 'flag': '🇪🇬'},
        {'code': 'KES', 'name': 'Kenyan Shilling', 'symbol': 'KSh', 'flag': '🇰🇪'},
        {'code': 'GHS', 'name': 'Ghanaian Cedi', 'symbol': '₵', 'flag': '🇬🇭'},
        {'code': 'XOF', 'name': 'West African CFA', 'symbol': 'CFA', 'flag': '🇸🇳'},
    ]
    return jsonify(currencies)

@app.route('/api/convert', methods=['POST'])
def convert_currency():
    data = request.json
    
    rate = MoneyConverter.get_exchange_rate(
        data['fromCurrency'], 
        data['toCurrency']
    )
    
    converted_amount = data['amount'] * rate
    
    return jsonify({
        'fromCurrency': data['fromCurrency'],
        'toCurrency': data['toCurrency'],
        'originalAmount': data['amount'],
        'convertedAmount': round(converted_amount, 2),
        'exchangeRate': round(rate, 4),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/estimate', methods=['POST'])
def get_estimate():
    data = request.json
    
    fee = TransferService.calculate_fee(data['amount'])
    delivery_time = TransferService.get_delivery_time(data['countryCode'])
    
    return jsonify({
        'fee': fee,
        'totalCost': data['amount'] + fee,
        'deliveryTime': delivery_time
    })

@app.route('/api/transfer', methods=['POST'])
def create_transfer():
    data = request.json
    
    try:
        sender = UserService.find_or_create_user(
            name=data['sender']['name'],
            country_code=data['sender']['country'],
            email=data['sender'].get('email')
        )
        
        recipient = UserService.find_or_create_user(
            name=data['recipient']['name'],
            country_code=data['recipient']['country'],
            email=data['recipient'].get('email')
        )
        
        fee = TransferService.calculate_fee(data['amount'])
        delivery_time = TransferService.get_delivery_time(data['recipient']['country'])
        
        tracking_number = TransferService.generate_tracking_number()
        
        transfer = Transfer(
            sender_id=sender.id,
            recipient_id=recipient.id,
            amount=data['amount'],
            from_currency=data['fromCurrency'],
            to_currency=data['toCurrency'],
            converted_amount=data['convertedAmount'],
            exchange_rate=data['exchangeRate'],
            fee=fee,
            total_amount=data['amount'] + fee,
            delivery_time=delivery_time,
            tracking_number=tracking_number,
            status=Transfer.STATUS_COMPLETED
        )
        
        db.session.add(transfer)
        db.session.commit()
        
        return jsonify(transfer.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transfers', methods=['GET'])
def get_transfers():
    transfers = Transfer.query.order_by(Transfer.created_at.desc()).all()
    return jsonify([transfer.to_dict() for transfer in transfers])

# ========== DEBUG INFO ==========
print("Registered API Routes:")
for rule in app.url_map.iter_rules():
    if not rule.rule.startswith('/static/'):  # Skip static files
        methods = ','.join(rule.methods)
        print(f"   {rule.rule} -> {methods}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)