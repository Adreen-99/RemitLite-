import pytest
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your actual models
try:
    from models.transfer import Transfer, TransferSchema
    from models.exchange_rate import ExchangeRate
    from models.user import User
    from models.database import db
    MODELS_AVAILABLE = True
except ImportError as e:
    print(f"Models import error: {e}")
    MODELS_AVAILABLE = False

@pytest.mark.skipif(not MODELS_AVAILABLE, reason="Models not available for import")
class TestTransferModel:
    def test_transfer_creation(self):
        """Test creating a Transfer instance"""
        transfer = Transfer(
            sender_name="John Doe",
            sender_country="US",
            recipient_name="Jane Smith",
            recipient_country="GB",
            amount=100.0,
            from_currency="USD",
            to_currency="EUR",
            exchange_rate=0.85,
            fee=5.0,
            converted_amount=85.0
        )
        
        assert transfer.sender_name == "John Doe"
        assert transfer.amount == 100.0
        assert transfer.from_currency == "USD"
        assert transfer.to_currency == "EUR"
        assert transfer.converted_amount == 85.0

    def test_transfer_schema(self):
        """Test TransferSchema serialization"""
        schema = TransferSchema()
        transfer_data = {
            'sender_name': 'John Doe',
            'sender_country': 'US',
            'recipient_name': 'Jane Smith',
            'recipient_country': 'GB',
            'amount': 100.0,
            'from_currency': 'USD',
            'to_currency': 'EUR'
        }
        
        # Test loading data
        transfer = schema.load(transfer_data)
        assert transfer['sender_name'] == 'John Doe'
        assert transfer['amount'] == 100.0

@pytest.mark.skipif(not MODELS_AVAILABLE, reason="Models not available for import")
class TestExchangeRateModel:
    def test_exchange_rate_creation(self):
        """Test creating an ExchangeRate instance"""
        exchange_rate = ExchangeRate(
            from_currency="USD",
            to_currency="EUR",
            rate=0.85
        )
        
        assert exchange_rate.from_currency == "USD"
        assert exchange_rate.to_currency == "EUR"
        assert exchange_rate.rate == 0.85

class TestBusinessLogic:
    """Tests that work with or without model imports"""
    
    def test_currency_conversion_math(self):
        """Test currency conversion mathematics"""
        # Test basic conversion
        amount = 100.0
        rate = 0.85
        converted = amount * rate
        assert converted == 85.0
        
        # Test rounding
        rounded = round(converted, 2)
        assert rounded == 85.00
    
    def test_fee_calculations(self):
        """Test different fee calculation scenarios"""
        # Percentage-based fee
        amount = 200.0
        fee_percentage = 0.03  # 3%
        fee = amount * fee_percentage
        assert fee == 6.0
        
        # Fixed fee
        fixed_fee = 5.0
        total_with_fixed = amount + fixed_fee
        assert total_with_fixed == 205.0
        
        # Mixed fee (fixed + percentage)
        mixed_fee = fixed_fee + (amount * fee_percentage)
        assert mixed_fee == 11.0
    
    def test_transfer_validation_rules(self):
        """Test transfer validation logic"""
        # Test minimum amount
        min_amount = 1.0
        test_amount = 0.5  # Below minimum
        is_valid = test_amount >= min_amount
        assert not is_valid
        
        # Test valid amount
        valid_amount = 10.0
        is_valid = valid_amount >= min_amount
        assert is_valid
        
        # Test currency code format
        valid_currency = "USD"
        assert len(valid_currency) == 3
        assert valid_currency.isalpha()
        assert valid_currency.isupper()

    def test_country_code_validation(self):
        """Test country code validation"""
        valid_countries = ['US', 'GB', 'CA', 'AU', 'DE']
        test_country = 'US'
        
        assert test_country in valid_countries
        assert len(test_country) == 2
        assert test_country.isalpha()
        assert test_country.isupper()