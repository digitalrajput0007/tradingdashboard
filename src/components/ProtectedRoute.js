import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // Destructure both currentUser and loading

  if (loading) {
    // Show a loading indicator while Firebase checks the auth state
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!currentUser) {
    // User is not logged in after the check is complete, so redirect
    return <Navigate to="/login" />;
  }

  // User is logged in, render the protected content
  return children;
};

export default ProtectedRoute;