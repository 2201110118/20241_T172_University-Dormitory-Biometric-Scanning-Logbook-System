import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal } from 'bootstrap';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import BuksuLogo from '../components/BuksuLogo';
import './AdminAuth.css';

// Debug logging function
const debugLog = (message, data = null) => {
    if (import.meta.env.DEV) {
        console.log(`[reCAPTCHA Client] ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
};

function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const recaptchaRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        recaptchaToken: ''
    });
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        // Initialize modal
        const modal = new Modal(document.getElementById('errorModal'));
        setErrorModal(modal);

        // Log reCAPTCHA initialization
        debugLog('reCAPTCHA component initialized');
        debugLog('Site Key Configuration', {
            siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY.substring(0, 10) + '...',
            environment: import.meta.env.MODE
        });

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

    const handleRecaptchaChange = (token) => {
        debugLog(token ? 'reCAPTCHA token received' : 'reCAPTCHA token cleared', {
            tokenLength: token ? token.length : 0,
            timestamp: new Date().toISOString()
        });

        setFormData(prev => ({
            ...prev,
            recaptchaToken: token || ''
        }));
    };

    const handleRecaptchaError = () => {
        debugLog('reCAPTCHA error occurred', {
            timestamp: new Date().toISOString()
        });
        setError('reCAPTCHA error occurred. Please try again.');
    };

    const handleRecaptchaExpired = () => {
        debugLog('reCAPTCHA token expired', {
            timestamp: new Date().toISOString()
        });
        setFormData(prev => ({ ...prev, recaptchaToken: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        debugLog('Login attempt started', {
            username: formData.username,
            hasRecaptchaToken: !!formData.recaptchaToken,
            timestamp: new Date().toISOString()
        });

        if (!formData.recaptchaToken) {
            debugLog('Login failed: No reCAPTCHA token');
            setError('Please complete the reCAPTCHA verification');
            setIsLoading(false);
            return;
        }

        try {
            debugLog('Sending login request to server');
            await login(formData, 'admin');
            debugLog('Login successful', {
                username: formData.username,
                timestamp: new Date().toISOString()
            });
            navigate('/AdminDashboard');
        } catch (error) {
            debugLog('Login error', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            console.error('Login error:', error);
            setError(error.message || 'Unable to connect to the server. Please try again.');
            // Reset reCAPTCHA on error
            recaptchaRef.current?.reset();
            setFormData(prev => ({ ...prev, recaptchaToken: '' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Error Modal */}
            <div className="modal fade admin-modal" id="errorModal" tabIndex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="errorModalTitle">Error</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-exclamation-circle text-warning error-icon" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3" id="errorModalBody">Error message here</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
                        <div className="mt-3 text-dark">Logging in...</div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div
                className={`login-page ${isVisible ? 'visible' : ''}`}
                style={{
                    backgroundImage: `url(${wallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className={`login-container ${isVisible ? 'visible' : ''}`}>
                    {/* Left Side - Image */}
                    <div
                        style={{
                            backgroundImage: `url(${wallpaper2})`,
                            position: 'relative'
                        }}
                    >
                        <BuksuLogo />
                        <Link
                            to="/"
                            className="btn btn-light position-absolute bottom-0 start-0 m-4 d-flex align-items-center"
                            style={{
                                backgroundColor: '#ffffff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                color: '#6c757d',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}
                        >
                            <i className="bi bi-house-door"></i>
                            <span>Return to Homepage</span>
                        </Link>
                    </div>

                    {/* Right Side - Form */}
                    <div>
                        <i className="bi bi-shield-lock-fill mb-3" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mb-4">Admin Login</h4>
                        {error && (
                            <div
                                className="alert alert-danger py-1 px-2 d-flex align-items-center"
                                style={{
                                    fontSize: '0.875rem',
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    maxWidth: '90%',
                                    zIndex: 1000,
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <i className="bi bi-exclamation-circle-fill me-2"></i>
                                {error}
                            </div>
                        )}

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
                            <div className="mb-4 position-relative">
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onMouseDown={() => setShowPassword(true)}
                                        onMouseUp={() => setShowPassword(false)}
                                        onMouseLeave={() => setShowPassword(false)}
                                        onTouchStart={() => setShowPassword(true)}
                                        onTouchEnd={() => setShowPassword(false)}
                                        tabIndex="-1"
                                    >
                                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}-fill`}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 d-flex justify-content-center">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                    onChange={handleRecaptchaChange}
                                    onError={handleRecaptchaError}
                                    onExpired={handleRecaptchaExpired}
                                />
                            </div>
                            <div className="d-flex justify-content-center">
                                <button
                                    type="submit"
                                    className="btn btn-primary position-relative"
                                    style={{ width: '150px' }}
                                    disabled={!formData.recaptchaToken}
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

