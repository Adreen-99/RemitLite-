const API_BASE = 'http://localhost:5000/api';

class ApiService {
  async getHealth() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  }

  async getCurrencies() {
    const response = await fetch(`${API_BASE}/currencies`);
    return response.json();
  }

  async convertAmount(amount, fromCurrency, toCurrency) {
    const response = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCurrency
      })
    });
    return response.json();
  }

  async getEstimate(amount, countryCode) {
    const response = await fetch(`${API_BASE}/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        countryCode
      })
    });
    return response.json();
  }

  async createTransfer(transferData) {
    const response = await fetch(`${API_BASE}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData)
    });
    return response.json();
  }

  async getTransfers() {
    const response = await fetch(`${API_BASE}/transfers`);
    return response.json();
  }
}

export const apiService = new ApiService();