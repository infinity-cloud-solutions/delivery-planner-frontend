// @ts-nocheck
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'assets/css/App.css';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import AuthLayout from 'layouts/auth';
import AdminLayout from 'layouts/admin';
import DriverLayout from 'layouts/driver';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import ProtectedRoute from 'layouts/auth/Protected';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/auth/*" element={<AuthLayout />} />
          <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
          <Route path="/driver/*" element={<ProtectedRoute><DriverLayout /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </HashRouter>
    </ChakraProvider>
  </React.StrictMode>
);
