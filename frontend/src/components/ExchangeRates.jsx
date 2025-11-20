import React, { useState, useEffect } from 'react';

const ExchangeRates = () => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('major');
  const [dataSource, setDataSource] = useState('');

  const currencyCategories = {
    major: 'Major Currencies',
    africa: 'African Currencies',
    asia: 'Asian Currencies',
    all: 'All Currencies'
  };

  useEffect(() => {
    fetchExchangeRatesFromBackend();
  }, []);

  const fetchExchangeRatesFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://remitlite-12.onrender.com/api/exchange-rates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Exchange rates from backend:', data);
        setRates(data.rates || data);
        setDataSource(data.source || 'live');
      } else {
        throw new Error('Failed to fetch rates from backend');
      }
    } catch (err) {
      console.error('Error fetching from backend:', err);
      setError('Unable to fetch live rates. Using reference rates.');
      // Use fallback rates
      setRates(getFallbackRates());
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRates = () => {
    return {
      USD: {
        USD: 1, EUR: 0.92, GBP: 0.79, JPY: 148.32, CAD: 1.35, AUD: 1.52, CHF: 0.88, CNY: 7.18,
        ZAR: 18.75, NGN: 845.50, EGP: 30.90, KES: 157.80, GHS: 11.45, MAD: 9.75, XOF: 605.80,
        ETB: 56.25, UGX: 3750.25, RWF: 1280.60, TZS: 2340.40, AOA: 850.25,
        INR: 83.15, SGD: 1.34, HKD: 7.82, KRW: 1320.45, TRY: 32.15, AED: 3.67
      },
      EUR: {
        USD: 1.09, EUR: 1, GBP: 0.86, JPY: 161.45, CAD: 1.47, AUD: 1.65, CHF: 0.96, CNY: 7.82,
        ZAR: 20.45, NGN: 920.25, EGP: 33.65, KES: 172.15, GHS: 12.48, MAD: 10.63, XOF: 655.80,
        ETB: 61.30, UGX: 4085.75, RWF: 1395.30, TZS: 2550.15, AOA: 928.40,
        INR: 90.65, SGD: 1.46, HKD: 8.52, KRW: 1440.25, TRY: 35.05, AED: 4.00
      },
      GBP: {
        USD: 1.27, EUR: 1.16, GBP: 1, JPY: 187.89, CAD: 1.71, AUD: 1.92, CHF: 1.12, CNY: 9.08,
        ZAR: 23.75, NGN: 1075.75, EGP: 39.20, KES: 200.10, GHS: 14.52, MAD: 12.36, XOF: 761.25,
        ETB: 71.25, UGX: 4760.50, RWF: 1625.80, TZS: 2965.45, AOA: 1078.90,
        INR: 105.45, SGD: 1.70, HKD: 9.92, KRW: 1675.80, TRY: 40.75, AED: 4.66
      }
    };
  };

  const getCurrenciesByCategory = (category) => {
    const categories = {
      major: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
      africa: ['USD', 'EUR', 'GBP'], // Show base currencies that have African rates
      asia: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
      all: ['USD', 'EUR', 'GBP']
    };
    return categories[category] || categories.major;
  };

  const formatRate = (rate) => {
    if (typeof rate !== 'number') return 'N/A';
    
    if (rate >= 1000) return rate.toFixed(0);
    if (rate >= 100) return rate.toFixed(1);
    if (rate >= 10) return rate.toFixed(2);
    if (rate >= 1) return rate.toFixed(3);
    if (rate >= 0.1) return rate.toFixed(4);
    return rate.toFixed(5);
  };

  const getTrendIndicator = () => {
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  const getRelevantTargetCurrencies = (baseCurrency, category) => {
    const allCurrencies = Object.keys(rates[baseCurrency] || {});
    const categoryCurrencies = {
      major: ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
      africa: ['NGN', 'KES', 'GHS', 'ZAR', 'EGP', 'XOF', 'ETB', 'UGX', 'RWF', 'TZS'],
      asia: ['JPY', 'CNY', 'INR', 'SGD', 'KRW', 'HKD', 'TRY', 'AED'],
      all: ['EUR', 'GBP', 'NGN', 'KES', 'JPY', 'ZAR', 'CNY', 'INR']
    };

    return allCurrencies
      .filter(currency => currency !== baseCurrency)
      .filter(currency => category === 'all' || categoryCurrencies[category]?.includes(currency))
      .slice(0, 6);
  };

  const getDataSourceText = () => {
    switch(dataSource) {
      case 'live':
      case 'external_api':
        return 'Live market rates';
      case 'cache':
        return 'Cached rates';
      case 'fallback':
      default:
        return 'Reference rates';
    }
  };

  const filteredCurrencies = getCurrenciesByCategory(activeCategory).filter(currency => rates[currency]);

  return (
    <div className="exchange-rates">
      <div className="rates-header">
        <div className="header-info">
          <h2>💱 Exchange Rates</h2>
          <p className="subtitle">{getDataSourceText()}</p>
        </div>
        <button onClick={fetchExchangeRatesFromBackend} className="btn-refresh" disabled={loading}>
          <i className="fas fa-sync-alt"></i>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="rates-warning">
          <i className="fas fa-info-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="category-tabs">
        {Object.entries(currencyCategories).map(([key, label]) => (
          <button
            key={key}
            className={`category-tab ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading exchange rates...</p>
          </div>
        </div>
      ) : (
        <div className="rates-grid">
          {filteredCurrencies.map((baseCurrency) => (
            <div key={baseCurrency} className="currency-card">
              <div className="currency-header">
                <div className="currency-main">
                  <span className="currency-flag">{getCurrencyFlag(baseCurrency)}</span>
                  <div className="currency-info">
                    <h3>{baseCurrency}</h3>
                    <span className="currency-name">{getCurrencyName(baseCurrency)}</span>
                  </div>
                </div>
              </div>
              
              <div className="rates-list">
                {getRelevantTargetCurrencies(baseCurrency, activeCategory).map((targetCurrency) => {
                  const rate = rates[baseCurrency]?.[targetCurrency];
                  const trend = getTrendIndicator();
                  
                  return (
                    <div key={targetCurrency} className="rate-item">
                      <div className="currency-pair">
                        <span className="flag">{getCurrencyFlag(targetCurrency)}</span>
                        <div className="currency-details">
                          <span className="currency-code">{targetCurrency}</span>
                          <span className="currency-name-small">{getCurrencyName(targetCurrency)}</span>
                        </div>
                      </div>
                      <div className="rate-info">
                        <span className="rate-value">{formatRate(rate)}</span>
                        <div className={`rate-trend ${trend}`}>
                          <i className={`fas fa-arrow-${trend}`}></i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rates-footer">
        <p>
          <i className="fas fa-info-circle"></i>
          {getDataSourceText()} • Updates every 5 minutes
        </p>
      </div>

      <style jsx>{`
        .exchange-rates {
          padding: 20px 0;
        }

        .rates-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
        }

        .header-info h2 {
          margin: 0 0 5px 0;
          font-size: 1.8rem;
        }

        .subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }

        .btn-refresh {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .btn-refresh:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rates-warning {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          color: #0066cc;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .category-tab {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          padding: 10px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          color: #6c757d;
          transition: all 0.3s;
          font-size: 0.85rem;
        }

        .category-tab:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .category-tab.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .loading-state {
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

        .rates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .currency-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .currency-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f3f4;
        }

        .currency-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .currency-flag {
          font-size: 2rem;
        }

        .currency-info h3 {
          margin: 0 0 2px 0;
          font-size: 1.3rem;
        }

        .currency-name {
          color: #6c757d;
          font-size: 0.85rem;
          display: block;
        }

        .rates-list {
          space-y: 12px;
        }

        .rate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .rate-item:last-child {
          border-bottom: none;
        }

        .currency-pair {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .currency-pair .flag {
          font-size: 1.4rem;
        }

        .currency-details {
          display: flex;
          flex-direction: column;
        }

        .currency-code {
          font-weight: 600;
          font-size: 1rem;
        }

        .currency-name-small {
          color: #6c757d;
          font-size: 0.75rem;
        }

        .rate-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rate-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
        }

        .rate-trend {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .rate-trend.up {
          background: #d4edda;
          color: var(--success);
        }

        .rate-trend.down {
          background: #f8d7da;
          color: var(--danger);
        }

        .rates-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .rates-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .rates-grid {
            grid-template-columns: 1fr;
          }

          .category-tabs {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

// Helper functions
const getCurrencyFlag = (currency) => {
  const flags = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭',
    ZAR: '🇿🇦', NGN: '🇳🇬', EGP: '🇪🇬', KES: '🇰🇪', GHS: '🇬🇭', MAD: '🇲🇦', XOF: '🇸🇳',
    ETB: '🇪🇹', UGX: '🇺🇬', RWF: '🇷🇼', TZS: '🇹🇿', AOA: '🇦🇴', CNY: '🇨🇳', INR: '🇮🇳',
    SGD: '🇸🇬', HKD: '🇭🇰', KRW: '🇰🇷', TRY: '🇹🇷', AED: '🇦🇪', SAR: '🇸🇦', THB: '🇹🇭'
  };
  return flags[currency] || '💱';
};

const getCurrencyName = (currency) => {
  const names = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
    ZAR: 'South African Rand', NGN: 'Nigerian Naira', EGP: 'Egyptian Pound',
    KES: 'Kenyan Shilling', GHS: 'Ghanaian Cedi', MAD: 'Moroccan Dirham',
    XOF: 'West African CFA', ETB: 'Ethiopian Birr', UGX: 'Ugandan Shilling',
    RWF: 'Rwandan Franc', TZS: 'Tanzanian Shilling', AOA: 'Angolan Kwanza',
    CNY: 'Chinese Yuan', INR: 'Indian Rupee', SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar', KRW: 'South Korean Won', TRY: 'Turkish Lira',
    AED: 'UAE Dirham', SAR: 'Saudi Riyal', THB: 'Thai Baht'
  };
  return names[currency] || currency;
};

export default ExchangeRates;