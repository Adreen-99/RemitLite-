import React, { useState, useEffect } from 'react';

const TransactionHistory = ({ userId, isNewUser }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isNewUser) {
      fetchTransactionHistory();
    } else {
      setLoading(false);
    }
  }, [userId, isNewUser]);

  const fetchTransactionHistory = async () => {
    try {
      // Simulate API call - for new users, this would return empty array
      setTimeout(() => {
        setTransactions([]); // Empty array for new users
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setLoading(false);
    }
  };

  if (isNewUser) {
    return (
      <div className="transaction-history">
        <div className="no-transactions">
          <div className="empty-state">
            <i className="fas fa-exchange-alt"></i>
            <h4>No transactions yet</h4>
            <p>Your transaction history will appear here once you start sending money.</p>
            <p className="hint">Make your first transfer to get started!</p>
          </div>
        </div>

        <style jsx>{`
          .transaction-history {
            padding: 20px 0;
          }

          .no-transactions {
            text-align: center;
            padding: 60px 20px;
          }

          .empty-state {
            color: #6c757d;
          }

          .empty-state i {
            font-size: 4rem;
            margin-bottom: 25px;
            color: #dee2e6;
          }

          .empty-state h4 {
            margin-bottom: 15px;
            color: #6c757d;
            font-size: 1.5rem;
          }

          .empty-state p {
            margin-bottom: 10px;
            font-size: 1.1rem;
            line-height: 1.6;
          }

          .hint {
            color: var(--primary);
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="transaction-history-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h3>Transaction History</h3>
        <p>Your recent money transfers and receipts</p>
      </div>

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <div className="empty-state">
            <i className="fas fa-exchange-alt"></i>
            <h4>No transactions found</h4>
            <p>You haven't made any transactions yet.</p>
          </div>
        </div>
      ) : (
        <div className="transactions-list">
          {/* Transaction list would go here for non-new users */}
        </div>
      )}

      <style jsx>{`
        .transaction-history {
          padding: 20px 0;
        }

        .history-header {
          margin-bottom: 30px;
        }

        .history-header h3 {
          color: var(--dark);
          margin-bottom: 8px;
        }

        .history-header p {
          color: #6c757d;
          margin: 0;
        }

        .transaction-history-loading {
          text-align: center;
          padding: 40px 20px;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .loading-spinner i {
          font-size: 2rem;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;