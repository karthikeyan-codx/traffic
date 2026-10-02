import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ViolationsList } from './pages/ViolationsList';
import { ViolationCreate } from './pages/ViolationCreate';
import { ViolationDetail } from './pages/ViolationDetail';
import { ChallanView } from './pages/ChallanView';
import { PublicChallanView } from './pages/PublicChallanView';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/public/challan/:challanId" element={<PublicChallanView />} />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Officer Dashboard Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/violations" element={<ViolationsList />} />
              <Route path="/violations/new" element={<ViolationCreate />} />
              <Route path="/violations/:id" element={<ViolationDetail />} />
              <Route path="/challans/:id" element={<ChallanView />} />
            </Route>

            {/* Error 404 Routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
