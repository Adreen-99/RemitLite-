from flask import request, jsonify
from datetime import datetime, timedelta
import jwt
import os
from models.user import User
from models.database import db

# Secret key for JWT (in production, use environment variable)
SECRET_KEY = os.getenv('SECRET_KEY', 'remitlite-secret-key-2024')

def init_auth_routes(app):
    
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data or not all(k in data for k in ['name', 'email', 'password']):
                return jsonify({'error': 'Missing required fields: name, email, password'}), 400
            
            # Check if user already exists
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'User with this email already exists'}), 400
            
            # Create new user
            user = User(
                name=data['name'],
                email=data['email'],
                country_code=data.get('country_code', 'US'),
                phone=data.get('phone')
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=7)  # 7 days expiration
            }, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'message': 'User created successfully',
                'user': user.to_dict(),
                'token': token
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            
            if not data or not all(k in data for k in ['email', 'password']):
                return jsonify({'error': 'Missing email or password'}), 400
            
            user = User.query.filter_by(email=data['email']).first()
            
            if not user or not user.check_password(data['password']):
                return jsonify({'error': 'Invalid email or password'}), 401
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=7)
            }, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict(),
                'token': token
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/auth/profile', methods=['GET'])
    def get_profile():
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                return jsonify({'error': 'Authorization token required'}), 401
            
            # Verify token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({'user': user.to_dict()})
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/auth/profile', methods=['PUT'])
    def update_profile():
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                return jsonify({'error': 'Authorization token required'}), 401
            
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            # Update allowed fields
            if 'name' in data:
                user.name = data['name']
            if 'country_code' in data:
                user.country_code = data['country_code']
            if 'phone' in data:
                user.phone = data['phone']
            
            db.session.commit()
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/auth/verify', methods=['GET'])
    def verify_token():
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                return jsonify({'error': 'Token required'}), 401
            
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'valid': True,
                'user': user.to_dict()
            })
            
        except jwt.ExpiredSignatureError:
            return jsonify({'valid': False, 'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'valid': False, 'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'valid': False, 'error': str(e)}), 500