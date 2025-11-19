import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({ type, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>{type === 'login' ? 'Login to Your Account' : 'Create an Account'}</h2>
          <p>
            {type === 'login' 
              ? 'Welcome back! Please enter your details.' 
              : 'Join RemitLite today and start sending money globally.'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {type === 'signup' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required={type === 'signup'}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder={type === 'login' ? 'Enter your password' : 'Create a password'}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {type === 'signup' && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required={type === 'signup'}
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            {type === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            {type === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "
            }
            <Link to={type === 'login' ? '/signup' : '/login'}>
              {type === 'login' ? 'Sign Up' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .auth-container {
          padding: 80px 0;
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-form {
          width: 100%;
          max-width: 400px;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h2 {
          color: var(--primary);
          margin-bottom: 10px;
          font-size: 1.8rem;
        }

        .auth-header p {
          color: #6c757d;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--dark);
        }

        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-control:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }

        .auth-switch {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .auth-switch p {
          color: #6c757d;
          margin: 0;
        }

        .auth-switch a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .auth-switch a:hover {
          color: var(--secondary);
          text-decoration: underline;
        }

        @media (max-width: 576px) {
          .auth-container {
            padding: 40px 20px;
          }
          
          .auth-form {
            padding: 20px;
          }
          
          .auth-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthForm;