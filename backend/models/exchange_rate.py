# backend/models/exchange_rate.py
from .database import db
from datetime import datetime

class ExchangeRate(db.Model):
    """Model to cache exchange rates and avoid too many API calls"""
    __tablename__ = 'exchange_rates'
    
    id = db.Column(db.Integer, primary_key=True)
    from_currency = db.Column(db.String(3), nullable=False)
    to_currency = db.Column(db.String(3), nullable=False)
    rate = db.Column(db.Float, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint for currency pair
    __table_args__ = (db.UniqueConstraint('from_currency', 'to_currency', name='unique_currency_pair'),)
    
    def is_fresh(self):
        """Check if rate is fresh (less than 1 hour old)"""
        return (datetime.utcnow() - self.last_updated).total_seconds() < 3600
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'from_currency': self.from_currency,
            'to_currency': self.to_currency,
            'rate': self.rate,
            'last_updated': self.last_updated.isoformat(),
            'is_fresh': self.is_fresh()
        }
    
    def __repr__(self):
        return f'<ExchangeRate {self.from_currency}/{self.to_currency}: {self.rate}>'