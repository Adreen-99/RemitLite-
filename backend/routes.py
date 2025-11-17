from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import requests
import uuid
from datetime import datetime
import random

routes_bp = Blueprint('routes', __name__)

# Mock data for countries
COUNTRIES = [
    {"code": "US", "name": "United States", "currency": "USD"},
    {"code": "GB", "name": "United Kingdom", "currency": "GBP"},
    {"code": "EU", "name": "European Union", "currency": "EUR"},
    {"code": "JP", "name": "Japan", "currency": "JPY"},
    {"code": "CA", "name": "Canada", "currency": "CAD"},
    {"code": "AU", "name": "Australia", "currency": "AUD"},
    {"code": "IN", "name": "India", "currency": "INR"},
    {"code": "NG", "name": "Nigeria", "currency": "NGN"},
    {"code": "KE", "name": "Kenya", "currency": "KES"},
    {"code": "PH", "name": "Philippines", "currency": "PHP"}
]

# In-memory storage for transfers (in production, use a database)
transfers = []

@routes_bp.route('/api/countries', methods=['GET'])
@cross_origin()
def get_countries():
    """Get list of supported countries with their currencies"""
    return jsonify({
        "status": "success",
        "data": COUNTRIES
    })

@routes_bp.route('/api/rates', methods=['GET'])
@cross_origin()
def get_fx_rates():
    """Get real-time FX rates from exchangerate.host"""
    try:
        base = request.args.get('base', 'USD')
        response = requests.get(f'https://api.exchangerate.host/latest?base={base}')
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "status": "success",
                "data": {
                    "base": data.get('base', base),
                    "rates": data.get('rates'),
                    "date": data.get('date')
                }
            })
        else:
            # Fallback to mock rates if API fails
            mock_rates = generate_mock_rates(base)
            return jsonify({
                "status": "success",
                "data": mock_rates,
                "source": "mock"
            })
    except Exception as e:
        # Fallback to mock rates on any error
        mock_rates = generate_mock_rates(base)
        return jsonify({
            "status": "success",
            "data": mock_rates,
            "source": "mock"
        })

def generate_mock_rates(base='USD'):
    """Generate mock FX rates for fallback"""
    rates = {}
    for country in COUNTRIES:
        if country['currency'] != base:
            # Generate realistic-ish exchange rates
            if base == 'USD':
                if country['currency'] == 'EUR':
                    rates[country['currency']] = 0.92
                elif country['currency'] == 'GBP':
                    rates[country['currency']] = 0.79
                elif country['currency'] == 'JPY':
                    rates[country['currency']] = 150.25
                elif country['currency'] == 'CAD':
                    rates[country['currency']] = 1.36
                elif country['currency'] == 'AUD':
                    rates[country['currency']] = 1.53
                elif country['currency'] == 'INR':
                    rates[country['currency']] = 83.12
                elif country['currency'] == 'NGN':
                    rates[country['currency']] = 785.50
                elif country['currency'] == 'KES':
                    rates[country['currency']] = 152.75
                elif country['currency'] == 'PHP':
                    rates[country['currency']] = 58.95
            elif base == 'EUR':
                if country['currency'] == 'USD':
                    rates[country['currency']] = 1.09
                elif country['currency'] == 'GBP':
                    rates[country['currency']] = 0.86
                elif country['currency'] == 'JPY':
                    rates[country['currency']] = 163.54
                elif country['currency'] == 'CAD':
                    rates[country['currency']] = 1.48
                elif country['currency'] == 'AUD':
                    rates[country['currency']] = 1.67
                elif country['currency'] == 'INR':
                    rates[country['currency']] = 90.57
                elif country['currency'] == 'NGN':
                    rates[country['currency']] = 856.00
                elif country['currency'] == 'KES':
                    rates[country['currency']] = 166.25
                elif country['currency'] == 'PHP':
                    rates[country['currency']] = 64.18
            elif base == 'GBP':
                if country['currency'] == 'USD':
                    rates[country['currency']] = 1.27
                elif country['currency'] == 'EUR':
                    rates[country['currency']] = 1.16
                elif country['currency'] == 'JPY':
                    rates[country['currency']] = 190.32
                elif country['currency'] == 'CAD':
                    rates[country['currency']] = 1.72
                elif country['currency'] == 'AUD':
                    rates[country['currency']] = 1.94
                elif country['currency'] == 'INR':
                    rates[country['currency']] = 105.22
                elif country['currency'] == 'NGN':
                    rates[country['currency']] = 994.30
                elif country['currency'] == 'KES':
                    rates[country['currency']] = 193.48
                elif country['currency'] == 'PHP':
                    rates[country['currency']] = 74.62
            else:
                # Default conversion for other bases
                rates[country['currency']] = random.uniform(0.5, 150.0)
    return {
        "base": base,
        "rates": rates,
        "date": datetime.now().strftime('%Y-%m-%d')
    }

@routes_bp.route('/api/transfers', methods=['POST'])
@cross_origin()
def create_transfer():
    """Create a new transfer"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['sender_name', 'sender_country', 'recipient_name', 
                          'recipient_country', 'amount', 'from_currency', 'to_currency']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400
        
        # Create transfer record
        transfer = {
            "id": str(uuid.uuid4()),
            "sender_name": data['sender_name'],
            "sender_country": data['sender_country'],
            "recipient_name": data['recipient_name'],
            "recipient_country": data['recipient_country'],
            "amount": float(data['amount']),
            "from_currency": data['from_currency'],
            "to_currency": data['to_currency'],
            "exchange_rate": data.get('exchange_rate', 1.0),
            "converted_amount": data.get('converted_amount', float(data['amount'])),
            "fee": calculate_transfer_fee(float(data['amount']), data['from_currency']),
            "delivery_time": estimate_delivery_time(data['sender_country'], data['recipient_country']),
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        transfers.append(transfer)
        
        return jsonify({
            "status": "success",
            "data": transfer
        }), 201
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@routes_bp.route('/api/transfers', methods=['GET'])
@cross_origin()
def get_transfers():
    """Get transfer history"""
    try:
        # Sort by created_at descending
        sorted_transfers = sorted(transfers, key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            "status": "success",
            "data": sorted_transfers,
            "count": len(sorted_transfers)
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@routes_bp.route('/api/transfers/<transfer_id>', methods=['GET'])
@cross_origin()
def get_transfer(transfer_id):
    """Get a specific transfer by ID"""
    try:
        transfer = next((t for t in transfers if t['id'] == transfer_id), None)
        
        if not transfer:
            return jsonify({
                "status": "error",
                "message": "Transfer not found"
            }), 404
        
        return jsonify({
            "status": "success",
            "data": transfer
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

def calculate_transfer_fee(amount, currency):
    """Calculate transfer fee based on amount and currency"""
    # Simple fee calculation: 2% of amount + fixed fee
    base_fee = 2.99  # USD equivalent
    percentage_fee = amount * 0.02
    
    # Convert base fee to the sender's currency (mock conversion)
    if currency != 'USD':
        currency_multipliers = {
            'EUR': 0.92, 'GBP': 0.79, 'JPY': 150.25, 'CAD': 1.36,
            'AUD': 1.53, 'INR': 83.12, 'NGN': 785.50, 'KES': 152.75, 'PHP': 58.95
        }
        base_fee = base_fee * currency_multipliers.get(currency, 1.0)
    
    return round(percentage_fee + base_fee, 2)

def estimate_delivery_time(sender_country, recipient_country):
    """Estimate delivery time based on countries"""
    # Simple logic: same country = instant, different countries = 1-3 days
    if sender_country == recipient_country:
        return "Instant"
    
    # Major corridors have faster delivery
    fast_corridors = [
        ('US', 'CA'), ('CA', 'US'), ('GB', 'EU'), ('EU', 'GB'),
        ('US', 'GB'), ('GB', 'US'), ('US', 'EU'), ('EU', 'US')
    ]
    
    if (sender_country, recipient_country) in fast_corridors or \
       (recipient_country, sender_country) in fast_corridors:
        return "1-2 business days"
    
    return "2-4 business days"

@routes_bp.route('/api/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })
