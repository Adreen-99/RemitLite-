# backend/models/database.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Create database instance
db = SQLAlchemy()

def generate_uuid():
    """Generate unique ID for records"""
    return str(uuid.uuid4())

def init_db(app):
    """Initialize database with app"""
    # SQLite for development, PostgreSQL for production
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///remitlite.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        db.create_all()
        print("✅ Database tables created!")