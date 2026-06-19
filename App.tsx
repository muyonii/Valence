import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './src/pages/LandingPage';
import WorkspaceLayout from './src/pages/WorkspaceLayout';
import VdrIngestion from './src/pages/VdrIngestion';
import Dashboard from './src/pages/Dashboard';
import Workstreams from './src/pages/Workstreams';
import Valuation from './src/pages/Valuation';
import ExecutiveBrief from './src/pages/ExecutiveBrief';
import AuthPage from './src/pages/AuthPage';
import ProfilePage from './src/pages/ProfilePage';
import SettingsPage from './src/pages/SettingsPage';
import { AuthProvider } from './src/lib/auth';
import { SessionProvider } from './src/lib/sessions';
import { ProtectedRoute } from './src/components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/workspace" element={<WorkspaceLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="ingestion" element={<VdrIngestion />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="workstreams" element={<Workstreams />} />
              <Route path="valuation" element={<Valuation />} />
              <Route path="brief" element={<ExecutiveBrief />} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;
