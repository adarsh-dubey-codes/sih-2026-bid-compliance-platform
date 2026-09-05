import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ChecklistPage } from '../pages/ChecklistPage';
import { InspectorPage } from '../pages/InspectorPage';
import { LedgerPage } from '../pages/LedgerPage';
import { SupabaseTestPage } from '../pages/SupabaseTestPage';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/checklist" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="compliance" element={<ChecklistPage />} />
          <Route path="inspector" element={<InspectorPage />} />
          <Route path="documents" element={<InspectorPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="audit" element={<LedgerPage />} />
          <Route path="tenders" element={<DashboardPage />} />
          <Route path="supabase-test" element={<SupabaseTestPage />} />
          <Route path="*" element={<Navigate to="/checklist" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
