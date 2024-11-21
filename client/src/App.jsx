import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminAccountManagement from './admin/AccountManagement';
import AdminMessageRequest from './admin/MessageRequest';
import AdminLogbookHistory from './admin/LogbookHistory';
import AdminDashboard from './admin/Dashboard';
import AdminLogin from './admin/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSettings from './admin/Settings';

const App = () => {
  return (
    <Router>
      <Routes>
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
        <Route path="/AdminMessageRequest" element={
          <ProtectedRoute>
            <AdminMessageRequest />
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
        <Route path="/" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;

