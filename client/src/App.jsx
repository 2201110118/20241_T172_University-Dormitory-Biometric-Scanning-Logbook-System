import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Admin Components
import AdminDashboard from './admin/Dashboard';
import AdminLogin from './admin/Login';
import AdminSignup from './admin/Signup';
import AdminAccountManagement from './admin/AccountManagement';
import AdminNightPass from './admin/NightPass';
import AdminLogbookHistory from './admin/LogbookHistory';
import AdminSettings from './admin/Settings';
import AccountSettings from './admin/AccountSettings';

// Student Components
import StudentDashboard from './student/Dashboard';
import StudentLogin from './student/Login';
import StudentSignup from './student/Signup';
import StudentNightPass from './student/NightPass';

// Other Components
import Homepage from './Homepage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Homepage route */}
          <Route path="/" element={<Homepage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          <Route path="/AdminDashboard" element={
            <ProtectedRoute userType="admin" requireAuth={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/AdminAccountManagement" element={
            <ProtectedRoute userType="admin" requireAuth={true}>
              <AdminAccountManagement />
            </ProtectedRoute>
          } />
          <Route path="/AdminNightPass" element={
            <ProtectedRoute userType="admin" requireAuth={true}>
              <AdminNightPass />
            </ProtectedRoute>
          } />
          <Route path="/AdminLogbookHistory" element={
            <ProtectedRoute userType="admin" requireAuth={true}>
              <AdminLogbookHistory />
            </ProtectedRoute>
          } />
          <Route path="/AdminSettings" element={
            <ProtectedRoute userType="admin" requireAuth={true}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/account-settings" element={
            <ProtectedRoute userType="admin" requireAuth={true}>
              <AccountSettings />
            </ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />

          <Route path="/StudentDashboard" element={
            <ProtectedRoute userType="student" requireAuth={true}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/StudentLogbookHistory" element={
            <ProtectedRoute userType="student" requireAuth={true}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/StudentNightPass" element={
            <ProtectedRoute userType="student" requireAuth={true}>
              <StudentNightPass />
            </ProtectedRoute>
          } />
          <Route path="/StudentSettings" element={
            <ProtectedRoute userType="student" requireAuth={true}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

