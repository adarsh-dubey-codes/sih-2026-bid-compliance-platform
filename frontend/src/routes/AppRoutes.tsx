import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ChecklistPage } from '../pages/ChecklistPage';
import { InspectorPage } from '../pages/InspectorPage';
import { LedgerPage } from '../pages/LedgerPage';
import { SupabaseTestPage } from '../pages/SupabaseTestPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/checklist" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="inspector" element={<InspectorPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="supabase-test" element={<SupabaseTestPage />} />
          <Route path="*" element={<Navigate to="/checklist" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

