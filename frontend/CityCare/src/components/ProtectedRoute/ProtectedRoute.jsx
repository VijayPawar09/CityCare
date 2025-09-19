import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  const userType = user.userType || user.role; // fallback if older shape
  if (roles && !roles.includes(userType)) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
