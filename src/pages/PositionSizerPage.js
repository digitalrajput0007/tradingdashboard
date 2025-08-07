import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

const PositionSizerPage = () => {
  const [formData, setFormData] = useState({
    capital: '',
    riskPercent: '1',
    entry: '',
    stopLoss: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCalculate = () => {
    setError('');
    setResult(null);

    const capital = parseFloat(formData.capital);
    const riskPercent = parseFloat(formData.riskPercent);
    const entryPrice = parseFloat(formData.entry);
    const stopLossPrice = parseFloat(formData.stopLoss);

    if (isNaN(capital) || isNaN(riskPercent) || isNaN(entryPrice) || isNaN(stopLossPrice)) {
      setError('Please fill in all fields with valid numbers.');
      return;
    }

    if (entryPrice <= stopLossPrice) {
      setError('Entry price must be higher than the stop-loss price.');
      return;
    }

    const riskAmount = (capital * riskPercent) / 100;
    const riskPerShare = entryPrice - stopLossPrice;
    const quantity = Math.floor(riskAmount / riskPerShare);

    if (quantity > 0) {
      setResult({
        quantity,
        riskAmount: riskAmount.toFixed(2),
        positionValue: (quantity * entryPrice).toFixed(2),
      });
    } else {
      setError('Calculation resulted in 0 shares. Your risk per share might be too high for your capital.');
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Position Size Calculator</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label htmlFor="capital" className="block text-sm font-medium text-gray-300 mb-1">Account Capital (₹)</label>
            <input type="number" name="capital" id="capital" value={formData.capital} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 100000" />
          </div>
          <div>
            <label htmlFor="riskPercent" className="block text-sm font-medium text-gray-300 mb-1">Risk per Trade (%)</label>
            <input type="number" name="riskPercent" id="riskPercent" value={formData.riskPercent} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 1" />
          </div>
          <div>
            <label htmlFor="entry" className="block text-sm font-medium text-gray-300 mb-1">Entry Price (₹)</label>
            <input type="number" name="entry" id="entry" value={formData.entry} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 100" />
          </div>
          <div>
            <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-300 mb-1">Stop-Loss Price (₹)</label>
            <input type="number" name="stopLoss" id="stopLoss" value={formData.stopLoss} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 98" />
          </div>
          <button onClick={handleCalculate} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition duration-300">
            Calculate Position
          </button>
        </div>

        {error && <p className="bg-red-500 text-white p-3 rounded mt-6 text-center">{error}</p>}

        {result && (
          <div className="mt-6 p-6 bg-gray-900 rounded-lg text-center">
            <p className="text-gray-400">Maximum shares to buy:</p>
            <p className="text-3xl font-bold text-green-400 my-2">{result.quantity}</p>
            <div className="flex justify-around mt-4 text-sm">
              <div>
                <p className="text-gray-400">Total Position Value</p>
                <p className="font-semibold">₹{result.positionValue}</p>
              </div>
              <div>
                <p className="text-gray-400">Potential Loss</p>
                <p className="font-semibold text-red-400">₹{result.riskAmount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PositionSizerPage;