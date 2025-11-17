# backend/init_database.py
from models.user import User
from models.transfer import Transfer
from models.exchange_rate import ExchangeRate

def init_sample_data():
    """Add sample data for testing"""
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create sample users
        user1 = User(name="John Doe", country_code="US", email="john@example.com")
        user2 = User(name="Jane Smith", country_code="GB", email="jane@example.com")
        
        db.session.add_all([user1, user2])
        db.session.commit()
        
        print("✅ Sample data created!")
        print(f"Users: {User.query.count()}")
        print(f"Transfers: {Transfer.query.count()}")

if __name__ == '__main__':
    init_sample_data()