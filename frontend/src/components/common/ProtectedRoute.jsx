import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';


export const HarshLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#6c584c] bg-[#fbfaf5]">
    <div className="w-12 h-12 border-4 border-[#adc178] border-t-[#a98467] rounded-full animate-spin mb-4"></div>
    <p className="text-sm font-medium tracking-widest uppercase">Loading Harsh collection...</p>
  </div>
);


export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <HarshLoader />;
  }

  if (!isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};


export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <HarshLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && user.role !== 'admin') {
    
    return <Navigate to="/" replace />;
  }

  return children;
};
