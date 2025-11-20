import { useState } from 'react';
import { apiService } from '../services/api';

const TransferForm = () => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderCountry: 'US',
    recipientName: '',
    recipientCountry: 'GB',
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  const [conversion, setConversion] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConvert = async () => {
    if (!formData.amount || formData.amount <= 0) return;
    
    setLoading(true);
    try {
      const conversionResult = await apiService.convertAmount(
        parseFloat(formData.amount),
        formData.fromCurrency,
        formData.toCurrency
      );
      setConversion(conversionResult);

      const estimateResult = await apiService.getEstimate(
        parseFloat(formData.amount),
        formData.recipientCountry
      );
      setEstimate(estimateResult);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!conversion) {
      alert('Please convert the amount first');
      return;
    }

    try {
      const transferData = {
        ...formData,
        amount: parseFloat(formData.amount),
        convertedAmount: conversion.convertedAmount,
        exchangeRate: conversion.rate,
        fee: estimate?.fee || 0,
        deliveryTime: estimate?.deliveryTime || '1-2 business days'
      };

      const result = await apiService.createTransfer(transferData);
      alert('Transfer created successfully!');
      console.log('Transfer result:', result);
      
      // Reset form
      setFormData({
        senderName: '',
        senderCountry: 'US',
        recipientName: '',
        recipientCountry: 'GB',
        amount: '',
        fromCurrency: 'USD',
        toCurrency: 'EUR'
      });
      setConversion(null);
      setEstimate(null);
    } catch (error) {
      console.error('Transfer creation error:', error);
      alert('Error creating transfer');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Send Money</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sender Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sender Name</label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sender Country</label>
            <select
              name="senderCountry"
              value={formData.senderCountry}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipient Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Name</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Country</label>
            <select
              name="recipientCountry"
              value={formData.recipientCountry}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount and Currencies */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">From Currency</label>
            <select
              name="fromCurrency"
              value={formData.fromCurrency}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To Currency</label>
            <select
              name="toCurrency"
              value={formData.toCurrency}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert Button */}
        <button
          type="button"
          onClick={handleConvert}
          disabled={loading || !formData.amount}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Converting...' : 'Convert Amount'}
        </button>

        {/* Conversion Results */}
        {conversion && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Conversion Details</h3>
            <p><strong>Exchange Rate:</strong> 1 {formData.fromCurrency} = {conversion.rate} {formData.toCurrency}</p>
            <p><strong>Converted Amount:</strong> {conversion.convertedAmount} {formData.toCurrency}</p>
            {estimate && (
              <>
                <p><strong>Transfer Fee:</strong> ${estimate.fee}</p>
                <p><strong>Delivery Time:</strong> {estimate.deliveryTime}</p>
                <p><strong>Total Cost:</strong> ${(parseFloat(formData.amount) + estimate.fee).toFixed(2)}</p>
              </>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!conversion}
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          Send Money
        </button>
      </form>
    </div>
  );
};

export default TransferForm;