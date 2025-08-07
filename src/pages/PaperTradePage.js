import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const PaperTradePage = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({ symbol: '', quantity: '', price: '', type: 'BUY' });
  const [openPositions, setOpenPositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch trades from Firestore in real-time
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const tradesRef = collection(db, "users", currentUser.uid, "trades");

    const q = query(tradesRef); // You can add orderBy here later if needed

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const positions = [];
      const closed = [];
      querySnapshot.forEach((doc) => {
        const trade = { id: doc.id, ...doc.data() };
        if (trade.status === 'OPEN') {
          positions.push(trade);
        } else {
          closed.push(trade);
        }
      });
      setOpenPositions(positions);
      setClosedTrades(closed);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching trades:", err);
      setError("Could not fetch trades.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewTrade = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.symbol || !formData.quantity || !formData.price) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const tradesRef = collection(db, "users", currentUser.uid, "trades");
      await addDoc(tradesRef, {
        symbol: formData.symbol.toUpperCase(),
        quantity: Number(formData.quantity),
        entryPrice: Number(formData.price),
        type: formData.type,
        status: 'OPEN',
        entryDate: new Date(),
      });
      setFormData({ symbol: '', quantity: '', price: '', type: 'BUY' }); // Reset form
    } catch (err) {
      console.error("Error adding new trade:", err);
      setError("Failed to add new trade.");
    }
  };

  const handleCloseTrade = async (tradeId, exitPrice) => {
    if (!exitPrice || isNaN(exitPrice)) {
      alert("Please enter a valid exit price.");
      return;
    }

    const tradeToClose = openPositions.find(p => p.id === tradeId);
    const pnl = (exitPrice - tradeToClose.entryPrice) * tradeToClose.quantity;

    try {
      const tradeRef = doc(db, "users", currentUser.uid, "trades", tradeId);
      await updateDoc(tradeRef, {
        status: 'CLOSED',
        exitPrice: Number(exitPrice),
        exitDate: new Date(),
        pnl: pnl
      });
    } catch (err) {
      console.error("Error closing trade:", err);
      setError("Failed to close trade.");
    }
  };

  const totalPnl = closedTrades.reduce((acc, trade) => acc + trade.pnl, 0);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Paper Trading</h1>

      {/* New Trade Form */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Enter a New Trade</h2>
        <form onSubmit={handleNewTrade} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <input name="symbol" value={formData.symbol} onChange={handleChange} placeholder="Symbol (e.g., RELIANCE)" className="md:col-span-2 p-3 bg-gray-700 rounded" />
          <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" className="p-3 bg-gray-700 rounded" />
          <input name="price" type="number" step="any" value={formData.price} onChange={handleChange} placeholder="Entry Price" className="p-3 bg-gray-700 rounded" />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg">Place Order</button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* Open Positions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Open Positions</h2>
        <div className="overflow-x-auto">
          {loading ? <p>Loading...</p> : openPositions.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-left p-2">Quantity</th>
                  <th className="text-left p-2">Entry Price</th>
                  <th className="text-left p-2">Entry Date</th>
                  <th className="text-left p-2">Exit Price</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map(pos => (
                  <tr key={pos.id} className="border-t border-gray-700">
                    <td className="p-2 font-bold">{pos.symbol}</td>
                    <td className="p-2">{pos.quantity}</td>
                    <td className="p-2">₹{pos.entryPrice.toFixed(2)}</td>
                    <td className="p-2 text-sm text-gray-400">{new Date(pos.entryDate.seconds * 1000).toLocaleDateString()}</td>
                    <td className="p-2">
                      <input type="number" step="any" placeholder="Exit Price" id={`exit-${pos.id}`} className="p-2 bg-gray-700 rounded w-28" />
                    </td>
                    <td className="p-2">
                      <button onClick={() => handleCloseTrade(pos.id, document.getElementById(`exit-${pos.id}`).value)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Close</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No open positions.</p>}
        </div>
      </div>

      {/* Closed Trades */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Trade History</h2>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total P/L</p>
            <p className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <p>Loading...</p> : closedTrades.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-left p-2">P/L</th>
                  <th className="text-left p-2">Entry Price</th>
                  <th className="text-left p-2">Exit Price</th>
                  <th className="text-left p-2">Exit Date</th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.map(trade => (
                  <tr key={trade.id} className="border-t border-gray-700">
                    <td className="p-2 font-bold">{trade.symbol}</td>
                    <td className={`p-2 font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                    </td>
                    <td className="p-2">₹{trade.entryPrice.toFixed(2)}</td>
                    <td className="p-2">₹{trade.exitPrice.toFixed(2)}</td>
                    <td className="p-2 text-sm text-gray-400">{new Date(trade.exitDate.seconds * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No closed trades yet.</p>}
        </div>
      </div>

    </MainLayout>
  );
};

export default PaperTradePage;