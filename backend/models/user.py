from .database import db, generate_uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """Model for people who send or receive money"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # Changed to nullable=False
    password_hash = db.Column(db.String(255), nullable=False)  # New field for authentication
    country_code = db.Column(db.String(3), nullable=False, default='US')
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)  # New field
    
    # Relationships
    sent_transfers = db.relationship('Transfer', foreign_keys='Transfer.sender_id', backref='sender', lazy=True)
    received_transfers = db.relationship('Transfer', foreign_keys='Transfer.recipient_id', backref='recipient', lazy=True)
    
    # Password handling methods
    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary for JSON response (exclude password)"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'country_code': self.country_code,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.name} ({self.country_code})>'