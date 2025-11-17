# backend/models/transfer.py
from .database import db, generate_uuid
from datetime import datetime

class Transfer(db.Model):
    """Model for money transfers"""
    __tablename__ = 'transfers'
    
    # Status options
    STATUS_PENDING = 'pending'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'
    STATUS_CANCELLED = 'cancelled'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    
    # Sender and Recipient (linked to User model)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Transfer details
    amount = db.Column(db.Float, nullable=False)
    from_currency = db.Column(db.String(3), nullable=False)  # USD, EUR, etc.
    to_currency = db.Column(db.String(3), nullable=False)
    converted_amount = db.Column(db.Float, nullable=False)
    exchange_rate = db.Column(db.Float, nullable=False)
    
    # Fees and timing
    fee = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    delivery_time = db.Column(db.String(50), nullable=False)
    
    # Status and tracking
    status = db.Column(db.String(20), default=STATUS_PENDING)
    tracking_number = db.Column(db.String(20), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        """Convert transfer to dictionary for JSON response"""
        return {
            'id': self.id,
            'sender': self.sender.to_dict() if self.sender else None,
            'recipient': self.recipient.to_dict() if self.recipient else None,
            'amount': self.amount,
            'from_currency': self.from_currency,
            'to_currency': self.to_currency,
            'converted_amount': self.converted_amount,
            'exchange_rate': self.exchange_rate,
            'fee': self.fee,
            'total_amount': self.total_amount,
            'delivery_time': self.delivery_time,
            'status': self.status,
            'tracking_number': self.tracking_number,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def mark_completed(self):
        """Mark transfer as completed"""
        self.status = self.STATUS_COMPLETED
        self.completed_at = datetime.utcnow()
    
    def __repr__(self):
        return f'<Transfer {self.tracking_number}: {self.amount} {self.from_currency} -> {self.converted_amount} {self.to_currency}>'