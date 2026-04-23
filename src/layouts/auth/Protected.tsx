import React from 'react';
import { Navigate } from 'react-router-dom';
import { validateJWT, getAccessToken } from 'security';

const isAuthenticated = () => getAccessToken() && validateJWT();

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
