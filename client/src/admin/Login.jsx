import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal } from 'bootstrap';
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import logo from '../assets/logo.png';
import logotitle from '../assets/logotitle.png';
import './Login.css';

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(null);

    useEffect(() => {
        setIsVisible(true);
        // Initialize modal
        const modal = new Modal(document.getElementById('errorModal'));
        setErrorModal(modal);
        return () => {
            setIsVisible(false);
            if (errorModal) {
                errorModal.dispose();
            }
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', formData);

            const response = await fetch('http://localhost:5000/api/login/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403 && data.isConfirmed === false) {
                    // Show modal only for unconfirmed but existing accounts
                    document.getElementById('errorModalTitle').textContent = 'Account Not Confirmed';
                    document.getElementById('errorModalBody').textContent = 'Your account is pending confirmation. Please contact the administrator.';
                    errorModal.show();
                } else {
                    // For all other errors (including 401 invalid credentials)
                    setError(data.message || 'Login failed');
                }
                setIsLoading(false);
                return;
            }

            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminId', data.admin.id);
            localStorage.setItem('admin', JSON.stringify(data.admin));

            console.log('Login successful:', data);
            navigate('/AdminDashboard');

        } catch (error) {
            console.error('Login error:', error);
            setError('Unable to connect to the server. Please check your internet connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Error Modal */}
            <div className="modal fade" id="errorModal" tabIndex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="errorModalTitle">Error</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3" id="errorModalBody">Error message here</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of your existing JSX... */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner-container">
                        <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 text-dark">Logging in...</div>
                    </div>
                </div>
            )}
            <div
                className={`login-page min-vh-100 w-100 d-flex justify-content-center align-items-center ${isVisible ? 'visible' : ''}`}
                style={{
                    backgroundImage: `url(${wallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className={`login-container shadow-lg d-flex rounded overflow-hidden ${isVisible ? 'visible' : ''}`}>
                    <div
                        className="position-relative"
                        style={{
                            width: '400px',
                            height: '450px',
                            backgroundImage: `url(${wallpaper2})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <div
                            className="position-absolute top-50 start-50 translate-middle bg-white rounded d-flex flex-column justify-content-center align-items-center"
                            style={{
                                width: '240px',
                                height: '280px'
                            }}
                        >
                            <img
                                src={logotitle}
                                alt="Logo Title"
                                style={{
                                    maxWidth: '200px',
                                    height: 'auto',
                                }}
                            />
                            <img
                                src={logo}
                                alt="Logo"
                                style={{
                                    maxWidth: '160px',
                                    height: 'auto'
                                }}
                            />
                        </div>
                    </div>
                    <div
                        className="bg-white d-flex flex-column justify-content-center align-items-center p-5"
                        style={{
                            width: '400px',
                            height: '450px',
                            padding: '30px'
                        }}
                    >
                        <i className="bi bi-person-circle mb-3" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mb-4">Admin Login</h4>
                        {error && <div className="alert alert-danger py-2">{error}</div>}
                        <form className="w-100" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-center">
                                <button
                                    type="submit"
                                    className="btn btn-primary position-relative"
                                    style={{ width: '150px' }}
                                >
                                    Login
                                </button>
                            </div>
                            <div className="text-center mt-3">
                                <span className="text-muted">Don't have an account? </span>
                                <Link to="/admin/signup" className="text-primary text-decoration-none">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminLogin;

