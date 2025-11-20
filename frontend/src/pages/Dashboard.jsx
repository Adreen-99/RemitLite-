import React, { useState, useEffect } from 'react';
import SendMoneyForm from '../components/SendMoneyForm';
import TransactionHistory from '../components/TransactionHistory';
import TransferForm from '../components/TransferForm';
import TransferHistory from '../components/TransferHistory';
import ExchangeRates from '../components/ExchangeRates';


const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    try {
      // For new users, we don't need to fetch any data
      setTimeout(() => {
        setIsNewUser(true); // All users start as new
        setUserData({
          ...user,
          balance: 0.00,
          totalSent: 0.00,
          totalReceived: 0.00,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleTransactionComplete = (transaction) => {
    // After first transaction, user is no longer new
    setIsNewUser(false);
    // Update user data with new balance
    setUserData(prev => ({
      ...prev,
      balance: (prev.balance || 0) - (Math.abs(transaction.amount) + transaction.fee),
      totalSent: (prev.totalSent || 0) + Math.abs(transaction.amount)
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="dashboard">
      <div className="container">
        {/* Remove the entire dashboard-header section */}
        
        {isNewUser ? (
          <div className="new-user-welcome">
            <div className="welcome-card">
              <div className="welcome-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>Welcome to RemitLite! </h3>
              <p>You're all set to start sending money globally. Make your first transfer to get started and see your transaction history here.</p>
              <div className="welcome-features">
                <div className="feature">
                  <i className="fas fa-bolt"></i>
                  <span>Fast international and regional transfers</span>
                </div>
                <div className="feature">
                  <i className="fas fa-lock"></i>
                  <span>Secure & encrypted</span>
                </div>
                <div className="feature">
                  <i className="fas fa-percent"></i>
                  <span>Low transfer fees</span>
                </div>
              </div>
              <button 
                className="btn btn-primary welcome-cta"
                onClick={() => setActiveTab('send')}
              >
                <i className="fas fa-paper-plane"></i>
                Send Your First Transfer
              </button>
            </div>
          </div>
        ) : (
          <div className="user-dashboard">
            <div className="dashboard-header">
              <h2>Welcome back{userData?.name ? `, ${userData.name}` : ''}!</h2>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-wallet"></i>
                </div>
                <div className="stat-info">
                  <h3>Account Balance</h3>
                  <div className="stat-value">${userData?.balance?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-paper-plane"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Sent</h3>
                  <div className="stat-value">${userData?.totalSent?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-download"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Received</h3>
                  <div className="stat-value">${userData?.totalReceived?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-tabs">
          <div className="tab-headers">
            <button 
              className={`tab-header ${activeTab === 'send' ? 'active' : ''}`}
              onClick={() => setActiveTab('send')}
            >
              <i className="fas fa-paper-plane"></i>
              Send Money
            </button>
            <button 
              className={`tab-header ${activeTab === 'rates' ? 'active' : ''}`}
              onClick={() => setActiveTab('rates')}
            >
              <i className="fas fa-chart-line"></i>
              Exchange Rates
            </button>
            <button 
              className={`tab-header ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <i className="fas fa-history"></i>
              Transaction History
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'send' && (
              <SendMoneyForm 
                user={userData} 
                onTransactionComplete={handleTransactionComplete}
              />
            )}
            
            {activeTab === 'rates' && (
              <ExchangeRates />
            )}
            
            {activeTab === 'history' && (
              <TransactionHistory userId={userData?.id} isNewUser={isNewUser} />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 40px 0;
          min-height: calc(100vh - 200px);
        }

        .dashboard-loading {
          padding: 80px 0;
          text-align: center;
        }

        .loading-spinner {
          font-size: 2rem;
          color: var(--primary);
        }

        .loading-spinner p {
          margin-top: 20px;
          font-size: 1.1rem;
        }

        .new-user-welcome {
          margin: 20px 0 40px 0;
        }

        .welcome-card {
          background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
          color: white;
          padding: 50px 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(67, 97, 238, 0.3);
        }

        .welcome-icon {
          font-size: 4rem;
          margin-bottom: 25px;
          opacity: 0.9;
        }

        .welcome-card h3 {
          font-size: 2.2rem;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .welcome-card p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          opacity: 0.9;
          line-height: 1.6;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .welcome-features {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 35px;
          flex-wrap: wrap;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          opacity: 0.9;
        }

        .feature i {
          font-size: 1.2rem;
        }

        .welcome-cta {
          background: white;
          color: var(--primary);
          border: none;
          padding: 15px 30px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .welcome-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
        }

        .user-dashboard {
          margin-bottom: 40px;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h2 {
          color: var(--dark);
          font-size: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-info h3 {
          font-size: 1rem;
          margin-bottom: 8px;
          color: #6c757d;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary);
        }

        .dashboard-tabs {
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .tab-headers {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .tab-header {
          flex: 1;
          padding: 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          color: #6c757d;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }

        .tab-header:hover {
          background: #e9ecef;
          color: var(--primary);
        }

        .tab-header.active {
          background: white;
          color: var(--primary);
          border-bottom: 3px solid var(--primary);
        }

        .tab-content {
          padding: 30px;
        }

        @media (max-width: 768px) {
          .tab-headers {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .welcome-card {
            padding: 30px 20px;
          }

          .welcome-card h3 {
            font-size: 1.8rem;
          }

          .welcome-card p {
            font-size: 1.1rem;
          }

          .welcome-features {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </section>
  );
};

export default Dashboard;