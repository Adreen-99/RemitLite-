# backend/seed.py
import random
from datetime import datetime, timedelta
from app import app, db
from models.user import User
from models.transfer import Transfer
from models.exchange_rate import ExchangeRate
from werkzeug.security import generate_password_hash

SEED_PASSWORD = generate_password_hash("Password123!")

def generate_phone_number(country_code):
    """Generate a realistic phone number based on country"""
    formats = {
        'US': '+1-{}{}{}-{}{}{}-{}{}{}{}',
        'GB': '+44-{}{}{}-{}{}{}-{}{}{}',
        'CA': '+1-{}{}{}-{}{}{}-{}{}{}{}',
        'AU': '+61-{}{}-{}{}{}{}-{}{}{}{}',
        'DE': '+49-{}{}{}-{}{}{}-{}{}{}',
        'FR': '+33-{}{}{}-{}{}{}-{}{}{}',
        'IN': '+91-{}{}{}{}-{}{}{}{}',
        'JP': '+81-{}{}-{}{}{}{}-{}{}{}{}'
    }
    
    format_template = formats.get(country_code, '+1-{}{}{}-{}{}{}-{}{}{}{}')
    digits = [str(random.randint(0, 9)) for _ in range(10)]
    return format_template.format(*digits)

def generate_email(name, provider="example.com"):
    """Generate email from name"""
    clean_name = name.lower().replace(' ', '.')
    return f"{clean_name}@{provider}"

def create_sample_users():
    """Create realistic sample users from different countries"""
    print("👥 Creating sample users...")
    
    users_data = [
        # North America
        {"name": "John Smith", "country_code": "US", "city": "New York"},
        {"name": "Maria Garcia", "country_code": "US", "city": "Los Angeles"},
        {"name": "David Johnson", "country_code": "CA", "city": "Toronto"},
        {"name": "Sarah Chen", "country_code": "CA", "city": "Vancouver"},
        
        # Europe
        {"name": "Emma Wilson", "country_code": "GB", "city": "London"},
        {"name": "Lucas Müller", "country_code": "DE", "city": "Berlin"},
        {"name": "Sophie Martin", "country_code": "FR", "city": "Paris"},
        {"name": "Marco Rossi", "country_code": "IT", "city": "Rome"},
        
        # Asia
        {"name": "Wei Zhang", "country_code": "CN", "city": "Beijing"},
        {"name": "Priya Patel", "country_code": "IN", "city": "Mumbai"},
        {"name": "Yuki Tanaka", "country_code": "JP", "city": "Tokyo"},
        {"name": "Min-jun Kim", "country_code": "KR", "city": "Seoul"},
        
        # Australia
        {"name": "Liam Brown", "country_code": "AU", "city": "Sydney"},
        {"name": "Charlotte Taylor", "country_code": "AU", "city": "Melbourne"},
        
        # More diverse users
        {"name": "Carlos Rodriguez", "country_code": "MX", "city": "Mexico City"},
        {"name": "Anna Kowalski", "country_code": "PL", "city": "Warsaw"},
        {"name": "Mohammed Ahmed", "country_code": "AE", "city": "Dubai"},
        {"name": "James O'Connor", "country_code": "IE", "city": "Dublin"},
    ]
    
    users = []
    for user_data in users_data:
        email = generate_email(user_data["name"])
        phone = generate_phone_number(user_data["country_code"])
        
        user = User(
            name=user_data["name"],
            country_code=user_data["country_code"],
            email=email,
            phone=phone,
            password_hash=SEED_PASSWORD 
        )
        users.append(user)
    
    db.session.add_all(users)
    db.session.commit()
    print(f"✅ Created {len(users)} sample users")
    return users

def create_sample_exchange_rates():
    """Create initial exchange rate cache"""
    print("💱 Creating sample exchange rates...")
    
    # Common currency pairs with realistic rates
    rate_pairs = [
        # USD pairs
        {"from_currency": "USD", "to_currency": "EUR", "rate": 0.85},
        {"from_currency": "USD", "to_currency": "GBP", "rate": 0.73},
        {"from_currency": "USD", "to_currency": "CAD", "rate": 1.35},
        {"from_currency": "USD", "to_currency": "AUD", "rate": 1.52},
        {"from_currency": "USD", "to_currency": "JPY", "rate": 150.0},
        {"from_currency": "USD", "to_currency": "INR", "rate": 83.0},
        
        # EUR pairs
        {"from_currency": "EUR", "to_currency": "USD", "rate": 1.18},
        {"from_currency": "EUR", "to_currency": "GBP", "rate": 0.86},
        {"from_currency": "EUR", "to_currency": "CHF", "rate": 0.95},
        
        # GBP pairs
        {"from_currency": "GBP", "to_currency": "USD", "rate": 1.37},
        {"from_currency": "GBP", "to_currency": "EUR", "rate": 1.16},
        
        # Asian currencies
        {"from_currency": "JPY", "to_currency": "USD", "rate": 0.0067},
        {"from_currency": "INR", "to_currency": "USD", "rate": 0.012},
        {"from_currency": "CNY", "to_currency": "USD", "rate": 0.14},
    ]
    
    rates = []
    for pair in rate_pairs:
        # Make rates slightly older to trigger API refresh on first use
        old_timestamp = datetime.utcnow() - timedelta(hours=2)
        
        rate = ExchangeRate(
            from_currency=pair["from_currency"],
            to_currency=pair["to_currency"],
            rate=pair["rate"],
            last_updated=old_timestamp
        )
        rates.append(rate)
    
    db.session.add_all(rates)
    db.session.commit()
    print(f"✅ Created {len(rates)} sample exchange rates")
    return rates

def create_sample_transfers(users):
    """Create realistic sample transfer history"""
    print("💰 Creating sample transfers...")
    
    # Common transfer scenarios
    scenarios = [
        # Family support
        {"description": "Family support", "min_amount": 100, "max_amount": 500, "probability": 0.3},
        # Education fees
        {"description": "Education fees", "min_amount": 1000, "max_amount": 5000, "probability": 0.15},
        # Business payments
        {"description": "Business payment", "min_amount": 500, "max_amount": 2000, "probability": 0.2},
        # Travel money
        {"description": "Travel money", "min_amount": 200, "max_amount": 1000, "probability": 0.15},
        # Gift
        {"description": "Gift", "min_amount": 50, "max_amount": 200, "probability": 0.2},
    ]
    
    # Common currency routes
    currency_routes = [
        {"from": "USD", "to": "EUR", "rate": 0.85},
        {"from": "USD", "to": "GBP", "rate": 0.73},
        {"from": "USD", "to": "CAD", "rate": 1.35},
        {"from": "USD", "to": "INR", "rate": 83.0},
        {"from": "EUR", "to": "USD", "rate": 1.18},
        {"from": "GBP", "to": "USD", "rate": 1.37},
        {"from": "CAD", "to": "USD", "rate": 0.74},
    ]
    
    # Country to currency mapping
    country_currencies = {
        'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR',
        'IT': 'EUR', 'AU': 'AUD', 'JP': 'JPY', 'IN': 'INR', 'CN': 'CNY',
        'KR': 'KRW', 'MX': 'MXN', 'PL': 'PLN', 'AE': 'AED', 'IE': 'EUR'
    }
    
    transfers = []
    num_transfers = 50  # Create 50 sample transfers
    
    for i in range(num_transfers):
        # Pick random sender and recipient (different people)
        sender = random.choice(users)
        recipient = random.choice([u for u in users if u.id != sender.id])
        
        # Get currencies based on countries
        from_currency = country_currencies.get(sender.country_code, 'USD')
        to_currency = country_currencies.get(recipient.country_code, 'USD')
        
        # Pick a random scenario
        scenario = random.choice(scenarios)
        amount = random.uniform(scenario["min_amount"], scenario["max_amount"])
        
        # Find exchange rate for this currency pair
        exchange_rate = 1.0
        for route in currency_routes:
            if route["from"] == from_currency and route["to"] == to_currency:
                exchange_rate = route["rate"]
                break
        
        # Add some random variation to exchange rate
        exchange_rate *= random.uniform(0.98, 1.02)
        
        # Calculate converted amount
        converted_amount = amount * exchange_rate
        
        # Calculate fee (same logic as TransferService)
        if amount <= 100:
            fee = 2.99
        elif amount <= 500:
            fee = 4.99
        elif amount <= 1000:
            fee = 7.99
        else:
            fee = amount * 0.01
        
        total_amount = amount + fee
        
        # Delivery time based on recipient country
        delivery_times = {
            'US': '1-2 hours', 'CA': '2-3 hours', 'GB': '1-2 hours',
            'DE': '1-3 hours', 'FR': '1-3 hours', 'IT': '1-3 hours',
            'AU': '3-5 hours', 'JP': '2-4 hours', 'IN': '2-4 hours',
            'CN': '3-5 hours', 'KR': '2-4 hours', 'MX': '3-5 hours',
        }
        delivery_time = delivery_times.get(recipient.country_code, '3-5 business days')
        
        # Create random date in the past 90 days
        days_ago = random.randint(1, 90)
        hours_ago = random.randint(1, 23)
        minutes_ago = random.randint(1, 59)
        created_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        # For completed transfers, set completed time
        completed_at = created_at + timedelta(hours=random.randint(1, 6))
        
        # Generate tracking number
        tracking_number = f"RM{created_at.strftime('%m%d')}{i:04d}"
        
        transfer = Transfer(
            sender_id=sender.id,
            recipient_id=recipient.id,
            amount=round(amount, 2),
            from_currency=from_currency,
            to_currency=to_currency,
            converted_amount=round(converted_amount, 2),
            exchange_rate=round(exchange_rate, 4),
            fee=round(fee, 2),
            total_amount=round(total_amount, 2),
            delivery_time=delivery_time,
            tracking_number=tracking_number,
            status=Transfer.STATUS_COMPLETED,
            created_at=created_at,
            completed_at=completed_at
        )
        
        transfers.append(transfer)
    
    db.session.add_all(transfers)
    db.session.commit()
    print(f"✅ Created {len(transfers)} sample transfers")
    return transfers

def calculate_statistics():
    """Calculate and display database statistics"""
    print("\n📊 Database Statistics:")
    print(f"   Users: {User.query.count()}")
    print(f"   Transfers: {Transfer.query.count()}")
    print(f"   Exchange Rates: {ExchangeRate.query.count()}")
    
    # Total transfer volume
    total_volume = db.session.query(db.func.sum(Transfer.amount)).scalar() or 0
    total_fees = db.session.query(db.func.sum(Transfer.fee)).scalar() or 0
    
    print(f"   Total Volume: ${total_volume:,.2f}")
    print(f"   Total Fees: ${total_fees:,.2f}")
    
    # Most popular currency pairs
    from sqlalchemy import func
    popular_pairs = db.session.query(
        Transfer.from_currency, 
        Transfer.to_currency, 
        func.count(Transfer.id)
    ).group_by(
        Transfer.from_currency, 
        Transfer.to_currency
    ).order_by(func.count(Transfer.id).desc()).limit(5).all()
    
    print("\n   Most Popular Currency Pairs:")
    for from_curr, to_curr, count in popular_pairs:
        print(f"     {from_curr} → {to_curr}: {count} transfers")

def clear_existing_data():
    """Clear all existing data (optional)"""
    print("🧹 Clearing existing data...")
    
    # Delete in correct order to handle foreign key constraints
    Transfer.query.delete()
    ExchangeRate.query.delete()
    User.query.delete()
    
    db.session.commit()
    print("✅ Existing data cleared")

def main():
    """Main seeding function"""
    print("🚀 Starting database seeding...")
    
    with app.app_context():
        # Clear existing data (comment this out if you want to keep existing data)
        clear_existing_data()
        
        # Create sample data
        users = create_sample_users()
        exchange_rates = create_sample_exchange_rates()
        transfers = create_sample_transfers(users)
        
        # Show statistics
        calculate_statistics()
        
        print("\n Database seeding completed successfully!")
        print("\n Sample Data Overview:")
        print("   • 18 users from different countries")
        print("   • 13 cached exchange rates") 
        print("   • 50 historical transfers")
        print("   • Realistic transfer scenarios (family, business, gifts, etc.)")
        print("   • 90 days of transfer history")
        
        print("\n Sample User Credentials:")
        sample_user = User.query.first()
        print(f"   Name: {sample_user.name}")
        print(f"   Email: {sample_user.email}")
        print(f"   Country: {sample_user.country_code}")
        
        print("\n You can now run the app and see realistic data!")

if __name__ == '__main__':
    main()