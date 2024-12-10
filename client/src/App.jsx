import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminAccountManagement from './admin/AccountManagement';
import AdminNightPass from './admin/NightPass';
import AdminLogbookHistory from './admin/LogbookHistory';
import AdminDashboard from './admin/Dashboard';
import AdminLogin from './admin/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSettings from './admin/Settings';
import AccountSettings from './admin/AccountSettings';
import AdminSignup from './admin/Signup';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        <Route path="/AdminLogbookHistory" element={
          <ProtectedRoute>
            <AdminLogbookHistory />
          </ProtectedRoute>
        } />
        <Route path="/AdminAccountManagement" element={
          <ProtectedRoute>
            <AdminAccountManagement />
          </ProtectedRoute>
        } />
        <Route path="/AdminNightPass" element={
          <ProtectedRoute>
            <AdminNightPass />
          </ProtectedRoute>
        } />
        <Route path="/AdminDashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/AdminSettings" element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/AdminAccountSettings" element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

