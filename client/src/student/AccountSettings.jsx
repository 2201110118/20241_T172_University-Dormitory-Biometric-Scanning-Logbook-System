import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentHeader from '../components/StudentHeader';

function StudentAccountSettings() {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [name, setName] = useState({
        currentPassword: '',
        newFirstName: '',
        newLastName: '',
        confirmFirstName: '',
        confirmLastName: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [nameMessage, setNameMessage] = useState({ text: '', type: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNameConfirmModal, setShowNameConfirmModal] = useState(false);
    const [pendingPasswords, setPendingPasswords] = useState(null);
    const [pendingName, setPendingName] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPasswordUsername, setShowCurrentPasswordUsername] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isNameLoading, setIsNameLoading] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleNameChange = (e) => {
        setName({
            ...name,
            [e.target.name]: e.target.value
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

    const handleNameSubmit = async (e) => {
        e.preventDefault();

        if (name.newFirstName !== name.confirmFirstName || name.newLastName !== name.confirmLastName) {
            setNameMessage({ text: 'New names do not match!', type: 'danger' });
            return;
        }

        setPendingName(name);
        setShowNameConfirmModal(true);
    };

    const handleConfirmChange = async () => {
        setIsPasswordLoading(true);
        try {
            if (!user?.studentid) {
                throw new Error('Student ID not found. Please log in again.');
            }

            const response = await fetch(`http://localhost:5000/api/student/${user.studentid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: pendingPasswords.currentPassword,
                    password: pendingPasswords.newPassword
                })
            });

            const data = await response.json();

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
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleConfirmNameChange = async () => {
        setIsNameLoading(true);
        try {
            if (!user?.studentid) {
                throw new Error('Student ID not found. Please log in again.');
            }

            const response = await fetch(`http://localhost:5000/api/student/${user.studentid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullname: {
                        firstname: pendingName.newFirstName,
                        lastname: pendingName.newLastName
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setShowNameConfirmModal(false);
                if (response.status === 401) {
                    setNameMessage({ text: 'Current password is incorrect', type: 'danger' });
                } else if (response.status === 400) {
                    setNameMessage({ text: data.message, type: 'danger' });
                } else {
                    throw new Error(data.message || 'Error updating name');
                }
                return;
            }

            setNameMessage({ text: 'Name updated successfully!', type: 'success' });
            setName({
                currentPassword: '',
                newFirstName: '',
                newLastName: '',
                confirmFirstName: '',
                confirmLastName: ''
            });
            setShowNameConfirmModal(false);

            // Update the name in session storage
            const currentStudent = JSON.parse(sessionStorage.getItem('student'));
            if (currentStudent) {
                currentStudent.fullname = {
                    firstname: pendingName.newFirstName,
                    lastname: pendingName.newLastName
                };
                sessionStorage.setItem('student', JSON.stringify(currentStudent));
                // Dispatch custom event to update header
                window.dispatchEvent(new Event('nameChanged'));
            }
        } catch (error) {
            console.error('Full error:', error);
            setNameMessage({
                text: `Error updating name: ${error.message}`,
                type: 'danger'
            });
            setShowNameConfirmModal(false);
        } finally {
            setIsNameLoading(false);
        }
    };

    return (
        <>
            <StudentHeader />
            <div className="d-flex flex-column min-vh-100">
                <div style={{ height: '64px' }}></div>
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
                                    <Link to="/StudentDashboard" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentNightPass" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentLogbookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">My Logbook History</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentSettings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Settings</span>
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
                                                        <label htmlFor="currentPasswordChange" className="form-label">Current Password</label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showCurrentPassword ? "text" : "password"}
                                                                className="form-control"
                                                                id="currentPasswordChange"
                                                                placeholder="Enter current password"
                                                                name="currentPassword"
                                                                value={passwords.currentPassword}
                                                                onChange={handlePasswordChange}
                                                                required
                                                                minLength="6"
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onMouseDown={() => setShowCurrentPassword(true)}
                                                                onMouseUp={() => setShowCurrentPassword(false)}
                                                                onMouseLeave={() => setShowCurrentPassword(false)}
                                                                onTouchStart={() => setShowCurrentPassword(true)}
                                                                onTouchEnd={() => setShowCurrentPassword(false)}
                                                                tabIndex="-1"
                                                            >
                                                                <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}-fill`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="newPassword" className="form-label">New Password</label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showNewPassword ? "text" : "password"}
                                                                className="form-control"
                                                                id="newPassword"
                                                                placeholder="Enter new password"
                                                                name="newPassword"
                                                                value={passwords.newPassword}
                                                                onChange={handlePasswordChange}
                                                                required
                                                                minLength="6"
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onMouseDown={() => setShowNewPassword(true)}
                                                                onMouseUp={() => setShowNewPassword(false)}
                                                                onMouseLeave={() => setShowNewPassword(false)}
                                                                onTouchStart={() => setShowNewPassword(true)}
                                                                onTouchEnd={() => setShowNewPassword(false)}
                                                                tabIndex="-1"
                                                            >
                                                                <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}-fill`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                className="form-control"
                                                                id="confirmPassword"
                                                                name="confirmPassword"
                                                                placeholder="Confirm new password"
                                                                value={passwords.confirmPassword}
                                                                onChange={handlePasswordChange}
                                                                required
                                                                minLength="6"
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onMouseDown={() => setShowConfirmPassword(true)}
                                                                onMouseUp={() => setShowConfirmPassword(false)}
                                                                onMouseLeave={() => setShowConfirmPassword(false)}
                                                                onTouchStart={() => setShowConfirmPassword(true)}
                                                                onTouchEnd={() => setShowConfirmPassword(false)}
                                                                tabIndex="-1"
                                                            >
                                                                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}-fill`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">
                                                        <i className="bi bi-check2-circle me-2"></i>
                                                        Change Password
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Name Card */}
                                    <div className="col-12 col-lg-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-transparent border-0 py-3">
                                                <h5 className="mb-0 fw-bold">
                                                    <i className="bi bi-person me-2"></i>
                                                    Change Name
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                {nameMessage.text && (
                                                    <div className={`alert alert-${nameMessage.type}`} role="alert">
                                                        {nameMessage.text}
                                                    </div>
                                                )}
                                                <form onSubmit={handleNameSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="currentPasswordName" className="form-label">Current Password</label>
                                                        <div className="input-group">
                                                            <input
                                                                type={showCurrentPasswordUsername ? "text" : "password"}
                                                                className="form-control"
                                                                id="currentPasswordName"
                                                                placeholder="Enter current password"
                                                                name="currentPassword"
                                                                value={name.currentPassword}
                                                                onChange={handleNameChange}
                                                                required
                                                                minLength="6"
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                type="button"
                                                                onMouseDown={() => setShowCurrentPasswordUsername(true)}
                                                                onMouseUp={() => setShowCurrentPasswordUsername(false)}
                                                                onMouseLeave={() => setShowCurrentPasswordUsername(false)}
                                                                onTouchStart={() => setShowCurrentPasswordUsername(true)}
                                                                onTouchEnd={() => setShowCurrentPasswordUsername(false)}
                                                                tabIndex="-1"
                                                            >
                                                                <i className={`bi bi-eye${showCurrentPasswordUsername ? '-slash' : ''}-fill`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="newFirstName" className="form-label">New First Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="newFirstName"
                                                            name="newFirstName"
                                                            placeholder="Enter new first name"
                                                            value={name.newFirstName}
                                                            onChange={handleNameChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="newLastName" className="form-label">New Last Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="newLastName"
                                                            name="newLastName"
                                                            placeholder="Enter new last name"
                                                            value={name.newLastName}
                                                            onChange={handleNameChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="confirmFirstName" className="form-label">Confirm First Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="confirmFirstName"
                                                            name="confirmFirstName"
                                                            placeholder="Confirm new first name"
                                                            value={name.confirmFirstName}
                                                            onChange={handleNameChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="confirmLastName" className="form-label">Confirm Last Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="confirmLastName"
                                                            name="confirmLastName"
                                                            placeholder="Confirm new last name"
                                                            value={name.confirmLastName}
                                                            onChange={handleNameChange}
                                                            required
                                                        />
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">
                                                        <i className="bi bi-check2-circle me-2"></i>
                                                        Change Name
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
                                        onClick={() => setShowConfirmModal(false)}
                                        disabled={isPasswordLoading}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={handleConfirmChange}
                                        disabled={isPasswordLoading}>
                                        {isPasswordLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Confirm Change'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
                </>
            )}

            {/* Name Change Confirmation Modal */}
            {showNameConfirmModal && (
                <>
                    <div className="modal fade show"
                        style={{
                            display: 'block',
                            zIndex: 1060
                        }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="nameConfirmModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="nameConfirmModalLabel">Confirm Name Change</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowNameConfirmModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to change your name?
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowNameConfirmModal(false)}
                                        disabled={isNameLoading}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={handleConfirmNameChange}
                                        disabled={isNameLoading}>
                                        {isNameLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Confirm Change'
                                        )}
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

export default StudentAccountSettings;
