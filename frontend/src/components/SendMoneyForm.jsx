import React, { useState, useEffect } from 'react';

const SendMoneyForm = ({ user, onTransactionComplete }) => {
  const [formData, setFormData] = useState({
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    recipientEmail: '',
    recipientName: '',
    purpose: 'family support'
  });
  
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [fee, setFee] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formData.fromCurrency && formData.toCurrency && formData.fromCurrency !== formData.toCurrency) {
      fetchExchangeRate();
    } else {
      setExchangeRate(1);
      setConvertedAmount(parseFloat(formData.amount) || 0);
    }
  }, [formData.fromCurrency, formData.toCurrency]);

  useEffect(() => {
    if (formData.amount && exchangeRate) {
      const amount = parseFloat(formData.amount) || 0;
      setConvertedAmount(amount * exchangeRate);
      calculateFeeAndDelivery(amount);
    } else {
      setConvertedAmount(0);
      setFee(0);
      setEstimatedDelivery('');
    }
  }, [formData.amount, exchangeRate]);

  const fetchExchangeRate = async () => {
    try {
      setRateLoading(true);
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:5000/api/convert-rate?from=${formData.fromCurrency}&to=${formData.toCurrency}&amount=1`
      );

      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rate);
      } else {
        throw new Error('Failed to fetch exchange rate');
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setError('Using reference exchange rate');
      // Fallback to approximate rates
      const fallbackRates = getFallbackRates();
      const rateKey = `${formData.fromCurrency}-${formData.toCurrency}`;
      setExchangeRate(fallbackRates[rateKey] || 1);
    } finally {
      setRateLoading(false);
    }
  };

  const getFallbackRates = () => {
    return {
      'USD-EUR': 0.92, 'USD-GBP': 0.79, 'USD-JPY': 148.32, 'USD-CAD': 1.35,
      'USD-AUD': 1.52, 'USD-ZAR': 18.75, 'USD-NGN': 845.50, 'USD-KES': 157.80,
      'USD-GHS': 11.45, 'USD-EGP': 30.90, 'USD-XOF': 605.80,
      'EUR-USD': 1.09, 'EUR-GBP': 0.86, 'EUR-ZAR': 20.45, 'EUR-NGN': 920.25,
      'GBP-USD': 1.27, 'GBP-EUR': 1.16, 'GBP-ZAR': 23.75, 'GBP-NGN': 1075.75
    };
  };

  const calculateFeeAndDelivery = (amount) => {
    // Calculate fee (1.5% of amount, minimum $2, maximum $15)
    const calculatedFee = Math.min(Math.max(amount * 0.015, 2), 15);
    setFee(calculatedFee);

    // Estimate delivery time based on currencies
    const deliveryTimes = {
      'USD-EUR': '1-2 hours', 'USD-GBP': '1-2 hours', 'USD-CAD': '1-2 hours',
      'USD-AUD': '2-3 hours', 'USD-JPY': '2-3 hours', 'USD-ZAR': '2-3 hours',
      'USD-NGN': '1-3 hours', 'USD-KES': '1-3 hours', 'USD-GHS': '1-3 hours',
      'USD-EGP': '1-3 hours', 'EUR-USD': '1-2 hours', 'EUR-GBP': '1-2 hours',
      'EUR-ZAR': '2-3 hours', 'EUR-NGN': '2-3 hours', 'GBP-USD': '1-2 hours',
      'GBP-EUR': '1-2 hours', 'GBP-ZAR': '2-3 hours'
    };
    
    const deliveryKey = `${formData.fromCurrency}-${formData.toCurrency}`;
    const delivery = deliveryTimes[deliveryKey] || '2-3 hours';
    setEstimatedDelivery(delivery);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For demo purposes, simulate a successful transfer without backend
      // In production, you would use the actual backend API
      const demoTransfer = {
        id: Date.now().toString(),
        sender_id: user?.id || 'demo-user',
        recipient_id: 'demo-recipient',
        amount: parseFloat(formData.amount),
        from_currency: formData.fromCurrency,
        to_currency: formData.toCurrency,
        converted_amount: convertedAmount,
        exchange_rate: exchangeRate,
        fee: fee,
        total_amount: (parseFloat(formData.amount) || 0) + fee,
        delivery_time: estimatedDelivery,
        tracking_number: `RM${Date.now().toString().slice(-8)}`,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Money sent successfully! (Demo Mode)');
      
      // Reset form
      setFormData({
        amount: '',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        recipientEmail: '',
        recipientName: '',
        purpose: 'family support'
      });
      setExchangeRate(null);
      setConvertedAmount(0);
      setFee(0);
      setEstimatedDelivery('');
      
      // Notify parent component
      if (onTransactionComplete) {
        onTransactionComplete(demoTransfer);
      }

    } catch (err) {
      console.error('Error sending money:', err);
      setError('Transfer completed in demo mode. Backend integration required for live transfers.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = (parseFloat(formData.amount) || 0) + fee;

  return (
    <div className="send-money-form">
      <div className="form-header">
        <h3>Send Money Worldwide</h3>
        <p>Fast, secure, and affordable international transfers</p>
        <div className="demo-notice">
          <i className="fas fa-info-circle"></i>
          Demo Mode - Transfers are simulated
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Transfer Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount to Send</label>
              <div className="input-with-currency">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="0.01"
                />
                <select
                  name="fromCurrency"
                  className="currency-select"
                  value={formData.fromCurrency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="toCurrency">Send to Currency</label>
              <select
                id="toCurrency"
                name="toCurrency"
                className="form-control"
                value={formData.toCurrency}
                onChange={handleInputChange}
              >
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="GHS">Ghanaian Cedi (GHS)</option>
                <option value="EGP">Egyptian Pound (EGP)</option>
                <option value="XOF">West African CFA (XOF)</option>
              </select>
            </div>
          </div>

          {formData.fromCurrency && formData.toCurrency && formData.fromCurrency !== formData.toCurrency && (
            <div className="rate-info">
              {rateLoading ? (
                <div className="rate-loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  Loading exchange rate...
                </div>
              ) : exchangeRate ? (
                <div className="live-rate">
                  <i className="fas fa-bolt"></i>
                  Live rate: 1 {formData.fromCurrency} = {exchangeRate.toFixed(4)} {formData.toCurrency}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="form-section">
          <h4>Recipient Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                className="form-control"
                placeholder="Full name of recipient"
                value={formData.recipientName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientEmail">Recipient Email</label>
              <input
                type="email"
                id="recipientEmail"
                name="recipientEmail"
                className="form-control"
                placeholder="email@example.com"
                value={formData.recipientEmail}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Transfer</label>
            <select
              id="purpose"
              name="purpose"
              className="form-control"
              value={formData.purpose}
              onChange={handleInputChange}
            >
              <option value="family support">Family Support</option>
              <option value="education">Education Fees</option>
              <option value="business">Business Payment</option>
              <option value="gift">Gift</option>
              <option value="travel">Travel Expenses</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {formData.amount && (
          <div className="transfer-summary">
            <h4>Transfer Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Amount to send:</span>
                <span>{formData.amount} {formData.fromCurrency}</span>
              </div>
              <div className="summary-item">
                <span>Transfer fee:</span>
                <span>{fee.toFixed(2)} {formData.fromCurrency}</span>
              </div>
              <div className="summary-item total">
                <span>Total amount:</span>
                <span>{totalAmount.toFixed(2)} {formData.fromCurrency}</span>
              </div>
              <div className="summary-item">
                <span>Recipient gets:</span>
                <span className="recipient-amount">
                  {convertedAmount.toFixed(2)} {formData.toCurrency}
                </span>
              </div>
              <div className="summary-item">
                <span>Exchange rate:</span>
                <span>
                  {exchangeRate 
                    ? `1 ${formData.fromCurrency} = ${exchangeRate.toFixed(4)} ${formData.toCurrency}`
                    : 'Calculating...'
                  }
                </span>
              </div>
              <div className="summary-item">
                <span>Estimated delivery:</span>
                <span className="delivery-time">{estimatedDelivery}</span>
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary submit-btn"
          disabled={loading || !formData.amount || !formData.recipientName || !formData.recipientEmail}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Processing Transfer...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              Send Money Now
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        .send-money-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-header h3 {
          color: var(--dark);
          margin-bottom: 8px;
        }

        .form-header p {
          color: #6c757d;
          margin-bottom: 10px;
        }

        .demo-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 10px 15px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }

        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .form-section h4 {
          margin-bottom: 20px;
          color: var(--dark);
          font-size: 1.1rem;
        }

        .rate-info {
          margin-top: 15px;
          padding: 12px;
          background: white;
          border-radius: 5px;
          border-left: 4px solid var(--primary);
        }

        .rate-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--primary);
        }

        .live-rate {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--success);
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
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
          transition: border 0.3s;
        }

        .form-control:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }

        .input-with-currency {
          display: flex;
          align-items: center;
        }

        .input-with-currency .form-control {
          border-radius: 5px 0 0 5px;
          border-right: none;
        }

        .currency-select {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 0 5px 5px 0;
          background: white;
          font-weight: 600;
          min-width: 80px;
        }

        .transfer-summary {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }

        .transfer-summary h4 {
          margin-bottom: 15px;
          color: var(--dark);
        }

        .summary-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .summary-item.total {
          border-top: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
          font-weight: 700;
          font-size: 1.1rem;
          margin: 8px 0;
          padding: 12px 0;
        }

        .recipient-amount {
          font-weight: 700;
          color: var(--success);
          font-size: 1.1rem;
        }

        .delivery-time {
          color: var(--primary);
          font-weight: 600;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-section {
            padding: 15px;
          }

          .input-with-currency {
            flex-direction: column;
          }

          .input-with-currency .form-control {
            border-radius: 5px;
            border-right: 1px solid #ddd;
            margin-bottom: 10px;
          }

          .currency-select {
            border-radius: 5px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SendMoneyForm;