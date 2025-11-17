# backend/app.py
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import uuid
from datetime import datetime
from sqlalchemy import text  

# Add the root directory to Python path so we can import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now import from models (which is at root level)
from models.database import db
from models.user import User
from models.transfer import Transfer
from models.exchange_rate import ExchangeRate
from models.auth import Auth

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

# Rest of your existing classes (MoneyConverter, UserService, TransferService)
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
        """Find user by email or create new one"""
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
        {'code': 'INR', 'name': 'Indian Rupee', 'symbol': '₹', 'flag': '🇮🇳'},
        {'code': 'CAD', 'name': 'Canadian Dollar', 'symbol': 'C$', 'flag': '🇨🇦'},
        {'code': 'AUD', 'name': 'Australian Dollar', 'symbol': 'A$', 'flag': '🇦🇺'},
        {'code': 'JPY', 'name': 'Japanese Yen', 'symbol': '¥', 'flag': '🇯🇵'},
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
print("🌐 Registered API Routes:")
for rule in app.url_map.iter_rules():
    if not rule.rule.startswith('/static/'):  # Skip static files
        methods = ','.join(rule.methods)
        print(f"   {rule.rule} -> {methods}")

if __name__ == '__main__':
    print("🚀 Starting RemitLite API Server on http://localhost:5000")
    print("📚 Visit http://localhost:5000 for available endpoints")
    app.run(debug=True, port=5000)