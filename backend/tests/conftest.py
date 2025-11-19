import pytest
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your actual app
from app import app as flask_app

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

@pytest.fixture
def sample_transfer_data():
    return {
        'sender_name': 'John Doe',
        'sender_country': 'US',
        'recipient_name': 'Jane Smith', 
        'recipient_country': 'GB',
        'amount': 100.0,
        'from_currency': 'USD',
        'to_currency': 'EUR'
    }

@pytest.fixture
def sample_user_data():
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    }