import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header>
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <i className="fas fa-money-bill-transfer"></i>
            <Link to="/">RemitLite</Link>
          </div>
          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            {user && <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>}
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#footer" onClick={() => setMobileMenuOpen(false)}>Support</a>
          </div>
          <div className="auth-buttons">
            {user ? (
              <div className="user-menu">
                <span>Welcome, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
          <div 
            className="mobile-menu" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </div>
      <style jsx>{`
        header {
          background-color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .logo a {
          text-decoration: none;
          color: var(--primary);
        }

        .logo i {
          font-size: 1.8rem;
        }

        .nav-links {
          display: flex;
          gap: 30px;
        }

        .nav-links a {
          text-decoration: none;
          color: var(--dark);
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: var(--primary);
        }

        .auth-buttons {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .mobile-menu {
          display: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .nav-links, .auth-buttons {
            display: none;
          }

          .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 20px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
          }

          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;