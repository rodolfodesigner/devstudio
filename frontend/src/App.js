import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Payments from './pages/Payments';
import EmailCampaigns from './pages/EmailCampaigns';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/leads" element={
        <PrivateRoute>
          <AppLayout>
            <Leads />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/payments" element={
        <PrivateRoute>
          <AppLayout>
            <Payments />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/email-campaigns" element={
        <PrivateRoute>
          <AppLayout>
            <EmailCampaigns />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 