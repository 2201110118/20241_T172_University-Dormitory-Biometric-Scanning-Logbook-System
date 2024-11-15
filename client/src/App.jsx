import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminAccountManagement from './admin/AccountManagement';
import AdminMessageRequest from './admin/MessageRequest';
import AdminLogbookHistory from './admin/LogbookHistory';
import AdminDashboard from './admin/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/AdminLogbookHistory" element={<AdminLogbookHistory />} />
        <Route path="/" element={<AdminAccountManagement />} />
        <Route path="/AdminAccountManagement" element={<AdminAccountManagement />} />
        <Route path="/AdminMessageRequest" element={<AdminMessageRequest />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
