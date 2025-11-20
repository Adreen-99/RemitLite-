import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login - in real app, this would be an API call
    onLogin({
      name: 'John Smith',
      email: formData.email
    });
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="auth-form">
          <div className="auth-header">
            <h2>Login to Your Account</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              Login
            </button>
          </form>
          <div className="auth-switch">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
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

export default Login;