import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import MarketMood from '../components/MarketMood';
import SectorPerformance from '../components/SectorPerformance';
import Heatmap from '../components/Heatmap'; // Import the new component

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().firstName);
        }
      }
    };
    fetchUserName();
  }, [currentUser]);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Welcome, {userName || 'User'}!</h1>

      {/* Top row with Mood and Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <MarketMood />
        </div>
        <div className="lg:col-span-2">
          <SectorPerformance />
        </div>
      </div>

      {/* Second row with Heatmap */}
      <div>
        <Heatmap />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;