import React, { useState } from "react";
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function AdminSettings() {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPasswords, setPendingPasswords] = useState(null);

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ text: 'New passwords do not match!', type: 'danger' });
            return;
        }

        // Store pending changes and show confirmation modal
        setPendingPasswords(passwords);
        setShowConfirmModal(true);
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

    return (
        <>
            <header className="navbar border-dark border-bottom shadow container-fluid bg-white"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1030
                }}>
                <div className="container-fluid">
                    <Link>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/8/86/Shield_logo_of_Bukidnon_State_University.png"
                            alt="Buksu Logo"
                            width="48"
                            height="48"
                        />
                    </Link>
                    <Link className="multiline-text ms-1 text-decoration-none fw-bold fs-5" style={{ lineHeight: "1.1rem" }}>
                        <span style={{ color: "#0056b3" }}>Buksu</span>
                        <br />
                        <span style={{ color: "#003366" }}>Mahogany Dormitory</span>
                    </Link>
                    <ul className="ms-auto navbar-nav flex-row">
                        <li className="nav-item">
                            <Link
                                className="btn btn-outline-dark text-center border-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    localStorage.removeItem('adminLoggedIn');
                                    window.location.href = '/';
                                }}
                            >
                                Sign out <i className="bi bi-door-open-fill" style={{ fontSize: "1rem" }} />
                            </Link>
                        </li>
                    </ul>
                </div>
            </header>

            <div className="container-fluid d-flex row" style={{ marginTop: '64px' }}>
                <nav className="sidebar bg-dark fixed-top"
                    style={{
                        width: "250px",
                        height: "100vh",
                        marginTop: "64px",
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
                                <span className="ms-2 fw-bold fs-6 text-start">Account Management</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom border-white">
                            <Link to="/AdminMessageRequest" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Message Request</span>
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
                                <span className="ms-2 fw-bold fs-6">Report Logs</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom border-white">
                            <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Setting</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <main className="container-fluid px-4"
                    style={{
                        flex: 1,
                        marginLeft: "275px",
                        marginTop: "20px"
                    }}>
                    <h2 className="my-4">Settings</h2>
                    <div className="border-3 border-bottom border-black mb-4" />

                    <div className="card shadow-sm" style={{ maxWidth: "500px" }}>
                        <div className="card-header bg-primary text-white">
                            <h5 className="card-title mb-0">Change Password</h5>
                        </div>
                        <div className="card-body">
                            {message.text && (
                                <div className={`alert alert-${message.type}`} role="alert">
                                    {message.text}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="currentPassword"
                                        placeholder="Enter current password"
                                        value={passwords.currentPassword}
                                        onChange={handleChange}
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
                                        onChange={handleChange}
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
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>

            {/* Confirmation Modal */}
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
        </>
    );
}

export default AdminSettings;
