import React, { useState } from "react";
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

function AccountSettings() {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [username, setUsername] = useState({
        currentPassword: '',
        newUsername: '',
        confirmUsername: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [usernameMessage, setUsernameMessage] = useState({ text: '', type: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showUsernameConfirmModal, setShowUsernameConfirmModal] = useState(false);
    const [pendingPasswords, setPendingPasswords] = useState(null);
    const [pendingUsername, setPendingUsername] = useState(null);

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.id]: e.target.value
        });
    };

    const handleUsernameChange = (e) => {
        setUsername({
            ...username,
            [e.target.id]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ text: 'New passwords do not match!', type: 'danger' });
            return;
        }

        setPendingPasswords(passwords);
        setShowConfirmModal(true);
    };

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();

        if (username.newUsername !== username.confirmUsername) {
            setUsernameMessage({ text: 'New usernames do not match!', type: 'danger' });
            return;
        }

        setPendingUsername(username);
        setShowUsernameConfirmModal(true);
    };

    const handleConfirmChange = async () => {
        try {
            const adminId = localStorage.getItem('adminId');
            console.log('AdminId:', adminId);

            if (!adminId) {
                throw new Error('Admin ID not found. Please log in again.');
            }

            const response = await fetch(`http://localhost:5000/api/admin/change-password/${adminId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: pendingPasswords.currentPassword,
                    newPassword: pendingPasswords.newPassword
                })
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (!response.ok) {
                setShowConfirmModal(false);
                if (response.status === 401) {
                    setMessage({ text: 'Current password is incorrect', type: 'danger' });
                } else {
                    throw new Error(data.message || 'Error updating password');
                }
                return;
            }

            setMessage({ text: 'Password updated successfully!', type: 'success' });
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Full error:', error);
            setMessage({
                text: `Error updating password: ${error.message}`,
                type: 'danger'
            });
            setShowConfirmModal(false);
        }
    };

    const handleConfirmUsernameChange = async () => {
        try {
            const adminId = localStorage.getItem('adminId');
            console.log('AdminId:', adminId);

            if (!adminId) {
                throw new Error('Admin ID not found. Please log in again.');
            }

            const response = await fetch(`http://localhost:5000/api/admin/change-username/${adminId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: pendingUsername.currentPassword,
                    newUsername: pendingUsername.newUsername
                })
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (!response.ok) {
                setShowUsernameConfirmModal(false);
                if (response.status === 401) {
                    setUsernameMessage({ text: 'Current password is incorrect', type: 'danger' });
                } else if (response.status === 400) {
                    setUsernameMessage({ text: data.message, type: 'danger' });
                } else {
                    throw new Error(data.message || 'Error updating username');
                }
                return;
            }

            setUsernameMessage({ text: 'Username updated successfully!', type: 'success' });
            setUsername({
                currentPassword: '',
                newUsername: '',
                confirmUsername: ''
            });
            setShowUsernameConfirmModal(false);

            // Update the username in localStorage
            const currentAdmin = JSON.parse(localStorage.getItem('admin'));
            if (currentAdmin) {
                currentAdmin.username = pendingUsername.newUsername;
                localStorage.setItem('admin', JSON.stringify(currentAdmin));
            }
        } catch (error) {
            console.error('Full error:', error);
            setUsernameMessage({
                text: `Error updating username: ${error.message}`,
                type: 'danger'
            });
            setShowUsernameConfirmModal(false);
        }
    };

    return (
        <>
            <AdminHeader />
            <div className="d-flex flex-column min-vh-100">
                <div style={{ height: '64px' }}></div> {/* Spacer div to compensate for fixed header */}
                <div className="flex-grow-1" style={{ backgroundColor: "#ebedef" }}>
                    <div className="d-flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
                        <nav className="sidebar bg-dark"
                            style={{
                                width: "250px",
                                position: "fixed",
                                top: "64px",
                                bottom: 0,
                                left: 0,
                                overflowY: "auto",
                                zIndex: 1020
                            }}>
                            <ul className="flex-column text-white text-decoration-none navbar-nav">
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminDashboard" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminAccountManagement" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Account Management</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminNightPass" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminLogBookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Logbook History</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="#" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clipboard-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Generate Report</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminSettings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Setting</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">Account Settings</h2>
                                    <div className="text-muted">
                                        <i className="bi bi-clock me-2"></i>
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="row g-4">
                                    {/* Change Password Card */}
                                    <div className="col-12 col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-transparent border-0 py-3">
                                                <h5 className="mb-0 fw-bold">
                                                    <i className="bi bi-key me-2"></i>
                                                    Change Password
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                {message.text && (
                                                    <div className={`alert alert-${message.type}`} role="alert">
                                                        {message.text}
                                                    </div>
                                                )}
                                                <form onSubmit={handlePasswordSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="currentPassword"
                                                            placeholder="Enter current password"
                                                            value={passwords.currentPassword}
                                                            onChange={handlePasswordChange}
                                                            required
                                                            minLength="6"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="newPassword" className="form-label">New Password</label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="newPassword"
                                                            placeholder="Enter new password"
                                                            value={passwords.newPassword}
                                                            onChange={handlePasswordChange}
                                                            required
                                                            minLength="6"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="confirmPassword"
                                                            placeholder="Confirm new password"
                                                            value={passwords.confirmPassword}
                                                            onChange={handlePasswordChange}
                                                            required
                                                            minLength="6"
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">
                                                        <i className="bi bi-check2-circle me-2"></i>
                                                        Change Password
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Username Card */}
                                    <div className="col-12 col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-transparent border-0 py-3">
                                                <h5 className="mb-0 fw-bold">
                                                    <i className="bi bi-person me-2"></i>
                                                    Change Username
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                {usernameMessage.text && (
                                                    <div className={`alert alert-${usernameMessage.type}`} role="alert">
                                                        {usernameMessage.text}
                                                    </div>
                                                )}
                                                <form onSubmit={handleUsernameSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="currentPassword"
                                                            placeholder="Enter current password"
                                                            value={username.currentPassword}
                                                            onChange={handleUsernameChange}
                                                            required
                                                            minLength="6"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="newUsername" className="form-label">New Username</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="newUsername"
                                                            placeholder="Enter new username"
                                                            value={username.newUsername}
                                                            onChange={handleUsernameChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="confirmUsername" className="form-label">Confirm New Username</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="confirmUsername"
                                                            placeholder="Confirm new username"
                                                            value={username.confirmUsername}
                                                            onChange={handleUsernameChange}
                                                            required
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">
                                                        <i className="bi bi-check2-circle me-2"></i>
                                                        Change Username
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Confirmation Modal */}
            {showConfirmModal && (
                <>
                    <div className="modal fade show"
                        style={{
                            display: 'block',
                            zIndex: 1060
                        }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="confirmModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="confirmModalLabel">Confirm Password Change</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowConfirmModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to change your password?
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowConfirmModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-primary"
                                        onClick={handleConfirmChange}>
                                        Confirm Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
                </>
            )}

            {/* Username Change Confirmation Modal */}
            {showUsernameConfirmModal && (
                <>
                    <div className="modal fade show"
                        style={{
                            display: 'block',
                            zIndex: 1060
                        }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="usernameConfirmModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="usernameConfirmModalLabel">Confirm Username Change</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowUsernameConfirmModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to change your username?
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowUsernameConfirmModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-primary"
                                        onClick={handleConfirmUsernameChange}>
                                        Confirm Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
                </>
            )}
        </>
    );
}

export default AccountSettings; 