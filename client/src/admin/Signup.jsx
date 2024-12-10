import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal } from 'bootstrap';
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import logo from '../assets/logo.png';
import logotitle from '../assets/logotitle.png';

function AdminSignup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(null);

    useEffect(() => {
        setIsVisible(true);
        // Initialize modal
        const modal = new Modal(document.getElementById('successModal'));
        setSuccessModal(modal);
        return () => {
            setIsVisible(false);
            if (successModal) {
                successModal.dispose();
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

        // Password validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    setError(data.message || 'Validation error');
                } else if (response.status === 409) {
                    setError('Username already exists');
                } else {
                    setError('Registration failed');
                }
                setIsLoading(false);
                return;
            }

            // Log success in console
            console.log('Account created successfully!');

            // Show success modal
            successModal.show();

            // Redirect to login page after modal is closed
            document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
                navigate('/admin/login');
            }, { once: true });

        } catch (error) {
            console.error('Registration error:', error);
            setError('Unable to connect to the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Success Modal */}
            <div className="modal fade" id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="successModalLabel">Success</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">Account created successfully!</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Continue to Login</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner-container">
                        <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 text-dark">Creating account...</div>
                    </div>
                </div>
            )}

            {/* Main Content */}
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
                            height: '500px',
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
                            height: '500px',
                            padding: '30px'
                        }}
                    >
                        <i className="bi bi-person-plus-fill mb-3" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mb-4">Admin Registration</h4>
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
                            <div className="mb-3">
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
                            <div className="mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
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
                                    Sign Up
                                </button>
                            </div>
                            <div className="text-center mt-3">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/admin/login" className="text-primary text-decoration-none">
                                    Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminSignup; 