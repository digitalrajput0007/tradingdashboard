import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';

// Pass setIsSidebarOpen as a prop
const Header = ({ setIsSidebarOpen }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="bg-gray-800 p-4 flex justify-between lg:justify-end items-center">
      {/* Hamburger Menu Button - visible only on small screens */}
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        className="lg:hidden text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Profile Section */}
      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
          <img
            src={`https://ui-avatars.com/api/?name=${userData?.firstName || 'User'}+${userData?.lastName || ''}&background=0D8ABC&color=fff`}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span className="hidden md:block">{userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20">
            <a href="/edit-profile" className="block px-4 py-2 text-sm text-white hover:bg-gray-600">Edit Profile</a>
            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-white hover:bg-gray-600">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;