import React from 'react';

const Features = () => {
  const features = [
    {
      icon: 'fas fa-bolt',
      title: 'Fast Transfers',
      description: 'Send money in minutes with our lightning-fast processing system.'
    },
    {
      icon: 'fas fa-lock',
      title: 'Secure & Safe',
      description: 'Your money and data are protected with bank-level security.'
    },
    {
      icon: 'fas fa-percent',
      title: 'Low Fees',
      description: 'Enjoy competitive exchange rates and minimal transfer fees.'
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-title">
          <h2>Why Choose RemitLite?</h2>
          <p>We provide the best money transfer experience with competitive rates and top-notch security.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .features {
          padding: 80px 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          text-align: center;
          transition: transform 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-10px);
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 1.8rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .features {
            padding: 60px 0;
          }
        }
      `}</style>
    </section>
  );
};

export default Features;