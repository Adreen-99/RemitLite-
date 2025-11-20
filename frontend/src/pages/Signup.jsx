import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = ({ onLogin }) => {
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
    // Simulate registration - in real app, this would be an API call
    onLogin({
      name: formData.name,
      email: formData.email
    });
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="auth-form">
          <div className="auth-header">
            <h2>Create an Account</h2>
            <p>Join RemitLite today and start sending money globally.</p>
          </div>
          <form onSubmit={handleSubmit}>
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
                required
              />
            </div>
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
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
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              Sign Up
            </button>
          </form>
          <div className="auth-switch">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .auth-container {
          padding: 80px 0;
        }

        .auth-form {
          max-width: 400px;
          margin: 0 auto;
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
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border 0.3s;
        }

        .form-control:focus {
          border-color: var(--primary);
          outline: none;
        }

        .auth-switch {
          text-align: center;
          margin-top: 20px;
        }

        .auth-switch a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default Signup;