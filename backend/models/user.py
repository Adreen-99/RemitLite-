# backend/models/user.py
from .database import db, generate_uuid
from datetime import datetime

class User(db.Model):
    """Model for people who send or receive money"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    country_code = db.Column(db.String(3), nullable=False)  # like 'US', 'GB'
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sent_transfers = db.relationship('Transfer', foreign_keys='Transfer.sender_id', backref='sender', lazy=True)
    received_transfers = db.relationship('Transfer', foreign_keys='Transfer.recipient_id', backref='recipient', lazy=True)
    
    def to_dict(self):
        """Convert user to dictionary for JSON response"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'country_code': self.country_code,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.name} ({self.country_code})>'