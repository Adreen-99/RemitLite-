import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Send Money Across Borders, Simplified</h1>
            <p>RemitLite makes international money transfers fast, secure, and affordable. Send money to loved ones anywhere in the world with just a few clicks.</p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-light">Get Started</Link>
              <a href="#features" className="btn btn-outline">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Money Transfer" 
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        .hero {
          padding: 80px 0;
          background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
          color: white;
          border-radius: 0 0 30px 30px;
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .hero-text {
          flex: 1;
        }

        .hero-image {
          flex: 1;
          text-align: center;
        }

        .hero-image img {
          max-width: 100%;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          gap: 15px;
        }

        .hero .btn {
          padding: 12px 30px;
        }

        @media (max-width: 992px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
          }

          .hero-buttons {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.2rem;
          }

          .hero p {
            font-size: 1rem;
          }
        }

        @media (max-width: 576px) {
          .hero {
            padding: 60px 0;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;