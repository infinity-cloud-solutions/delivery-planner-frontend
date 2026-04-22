import React from 'react';
import { Navigate } from 'react-router-dom';
import { validateJWT, getAccessToken } from 'security';

const isAuthenticated = () => getAccessToken() && validateJWT();

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default ProtectedRoute;
