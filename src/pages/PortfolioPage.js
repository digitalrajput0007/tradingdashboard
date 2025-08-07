import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// IMPORTANT: Paste your Alpha Vantage API key here
const API_KEY = 'P2HWNE9Z73J93JE2';

const PortfolioPage = () => {
  const { currentUser } = useAuth();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const tradesRef = collection(db, "users", currentUser.uid, "trades");
    const q = query(tradesRef, where("status", "==", "OPEN"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const openPositions = [];
      querySnapshot.forEach((doc) => {
        openPositions.push({ id: doc.id, ...doc.data() });
      });

      // Now fetch live prices for these positions
      fetchLivePrices(openPositions);

    }, (err) => {
      console.error("Error fetching positions:", err);
      setError("Could not fetch portfolio positions.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const fetchLivePrices = async (openPositions) => {
    if (openPositions.length === 0) {
        setPositions([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    const updatedPositions = await Promise.all(
      openPositions.map(async (pos) => {
        try {
          // Note: Alpha Vantage uses '.' instead of '-' in symbols like 'M&M'
          const formattedSymbol = pos.symbol.replace('-', '.') + '.NSE';
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${API_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          const livePrice = parseFloat(data['Global Quote']['05. price']);

          if (!isNaN(livePrice)) {
            const currentValue = livePrice * pos.quantity;
            const unrealizedPnl = (livePrice - pos.entryPrice) * pos.quantity;
            return { ...pos, livePrice, currentValue, unrealizedPnl };
          }
        } catch (err) {
          console.warn(`Could not fetch price for ${pos.symbol}`, err);
        }
        // Return position without live data if fetch fails
        return { ...pos, livePrice: 'N/A', currentValue: 'N/A', unrealizedPnl: 'N/A' };
      })
    );
    setPositions(updatedPositions);
    setLoading(false);
  };

  const totalInvested = positions.reduce((acc, pos) => acc + (pos.entryPrice * pos.quantity), 0);
  const totalCurrentValue = positions.reduce((acc, pos) => acc + (pos.currentValue !== 'N/A' ? pos.currentValue : 0), 0);
  const totalUnrealizedPnl = totalCurrentValue - totalInvested;

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Investment</h3>
          <p className="text-2xl font-bold">₹{totalInvested.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Current Value</h3>
          <p className="text-2xl font-bold">₹{totalCurrentValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Unrealized P/L</h3>
          <p className={`text-2xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}₹{totalUnrealizedPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Current Holdings</h2>
        <div className="overflow-x-auto">
          {loading ? <p>Loading portfolio...</p> : positions.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-left p-2">Quantity</th>
                  <th className="text-left p-2">Avg. Price</th>
                  <th className="text-left p-2">Live Price</th>
                  <th className="text-left p-2">Unrealized P/L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.id} className="border-t border-gray-700">
                    <td className="p-2 font-bold">{pos.symbol}</td>
                    <td className="p-2">{pos.quantity}</td>
                    <td className="p-2">₹{pos.entryPrice.toFixed(2)}</td>
                    <td className="p-2 font-mono">
                      {typeof pos.livePrice === 'number' ? `₹${pos.livePrice.toFixed(2)}` : pos.livePrice}
                    </td>
                    <td className={`p-2 font-bold ${pos.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {typeof pos.unrealizedPnl === 'number' ? `₹${pos.unrealizedPnl.toFixed(2)}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>You have no open positions.</p>}
        </div>
      </div>
    </MainLayout>
  );
};

export default PortfolioPage;