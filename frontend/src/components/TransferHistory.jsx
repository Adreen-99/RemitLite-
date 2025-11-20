import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      const data = await apiService.getTransfers();
      setTransfers(data.transfers || []);
    } catch (error) {
      console.error('Error loading transfers:', error);
      // Fallback to local storage if API fails
      const localTransfers = JSON.parse(localStorage.getItem('remitlite-transfers') || '[]');
      setTransfers(localTransfers);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading transfer history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Transfer History</h2>
      
      {transfers.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No transfers yet. Send your first transfer!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sender</p>
                  <p className="font-medium">{transfer.senderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recipient</p>
                  <p className="font-medium">{transfer.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">
                    {transfer.amount} {transfer.fromCurrency} → {transfer.convertedAmount} {transfer.toCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Completed</p>
                </div>
              </div>
              {transfer.fee && (
                <div className="mt-2 text-sm text-gray-600">
                  Fee: ${transfer.fee} • Delivery: {transfer.deliveryTime}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransferHistory;