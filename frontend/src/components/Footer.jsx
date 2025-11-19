import React from 'react';

const Footer = () => {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>RemitLite</h3>
            <p>Making global money transfers simple, secure, and affordable for everyone.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="#features">How It Works</a></li>
              <li><a href="#footer">Support</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#">Send Money</a></li>
              <li><a href="#">Request Money</a></li>
              <li><a href="#">Currency Exchange</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="footer-links">
              <li><i className="fas fa-envelope"></i> support@remitlite.com</li>
              <li><i className="fas fa-phone"></i> +1 (800) 123-4567</li>
              <li><i className="fas fa-map-marker-alt"></i> 123 Finance St, New York, NY</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; 2023 RemitLite. All rights reserved.</p>
        </div>
      </div>
      <style jsx>{`
        footer {
          background: var(--dark);
          color: white;
          padding: 50px 0 20px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-column h3 {
          font-size: 1.2rem;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }

        .footer-column h3::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: var(--primary);
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-links a {
          color: #adb5bd;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: white;
        }

        .social-links {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: background 0.3s;
        }

        .social-links a:hover {
          background: var(--primary);
        }

        .copyright {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #adb5bd;
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
};

export default Footer;