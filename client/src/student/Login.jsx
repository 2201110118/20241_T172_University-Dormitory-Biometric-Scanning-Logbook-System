import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal } from 'bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import BuksuLogo from '../components/BuksuLogo';
import './StudentAuth.css';

// Debug logging function
const debugLog = (message, data = null) => {
    if (import.meta.env.DEV) {
        console.log(`[reCAPTCHA Client] ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
};

function StudentLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const recaptchaRef = useRef(null);
    const [formData, setFormData] = useState({
        studentid: '',
        password: '',
        recaptchaToken: ''
    });
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
    const [recaptchaError, setRecaptchaError] = useState(null);

    useEffect(() => {
        // Set a small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            setIsVisible(true);
            setContentLoaded(true);
        }, 100);

        const modal = new Modal(document.getElementById('errorModal'));
        setErrorModal(modal);

        // Log reCAPTCHA initialization
        debugLog('reCAPTCHA component initialized');
        debugLog('Site Key Configuration', {
            siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY.substring(0, 10) + '...',
            environment: import.meta.env.MODE
        });

        // Add reCAPTCHA script load error handler
        const handleRecaptchaLoadError = () => {
            setRecaptchaError('Failed to load reCAPTCHA. Please refresh the page or check your internet connection.');
            debugLog('reCAPTCHA script failed to load');
        };

        // Monitor reCAPTCHA script loading
        const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
        if (recaptchaScript) {
            recaptchaScript.addEventListener('error', handleRecaptchaLoadError);
        }

        return () => {
            clearTimeout(timer);
            setIsVisible(false);
            if (errorModal) {
                errorModal.dispose();
            }
            if (recaptchaScript) {
                recaptchaScript.removeEventListener('error', handleRecaptchaLoadError);
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

    const handleRecaptchaLoad = () => {
        setRecaptchaLoaded(true);
        setRecaptchaError(null);
        debugLog('reCAPTCHA loaded successfully');
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');

        debugLog('Google login attempt started', {
            timestamp: new Date().toISOString()
        });

        if (!formData.recaptchaToken) {
            debugLog('Google login failed: No reCAPTCHA token');
            setError('Please complete the reCAPTCHA verification');
            setIsLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(credentialResponse.credential);

            debugLog('Google credential decoded', {
                gmail: decoded.email,
                timestamp: new Date().toISOString()
            });

            // First, check if a student with this email exists
            const checkResponse = await fetch('http://localhost:5000/api/student/check-google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gmail: decoded.email
                })
            });

            const checkData = await checkResponse.json();

            if (checkData.exists) {
                // If student exists, attempt to login
                try {
                    debugLog('Sending Google login request to server');
                    await login({
                        googleId: decoded.sub,
                        gmail: decoded.email,
                        recaptchaToken: formData.recaptchaToken
                    }, 'student/google');
                    debugLog('Google login successful');
                    navigate('/StudentDashboard');
                } catch (error) {
                    if (error.message.includes('pending confirmation')) {
                        document.getElementById('errorModalTitle').textContent = 'Account Not Confirmed';
                        document.getElementById('errorModalBody').textContent = 'Your account is pending confirmation. Please wait for admin approval.';
                        errorModal.show();
                    } else {
                        setError(error.message || 'Login failed');
                    }
                }
            } else {
                // If student doesn't exist, redirect to signup with Google data
                debugLog('Redirecting to signup: Student not found');
                navigate('/student/signup', {
                    state: {
                        googleData: {
                            googleId: decoded.sub,
                            firstname: decoded.given_name,
                            lastname: decoded.family_name,
                            gmail: decoded.email
                        }
                    }
                });
            }
        } catch (error) {
            debugLog('Google login error', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            console.error('Google login error:', error);
            setError('Unable to process Google login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        debugLog('Google login failed', {
            timestamp: new Date().toISOString()
        });
        console.error('Google login failed');
        setError('Google login failed. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        debugLog('Login attempt started', {
            studentid: formData.studentid,
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
            await login(formData, 'student');
            debugLog('Login successful', {
                studentid: formData.studentid,
                timestamp: new Date().toISOString()
            });
            navigate('/StudentDashboard');
        } catch (error) {
            debugLog('Login error', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            if (error.message.includes('pending confirmation')) {
                document.getElementById('errorModalTitle').textContent = 'Account Not Confirmed';
                document.getElementById('errorModalBody').textContent = 'Your account is pending confirmation. Please wait for admin approval.';
                errorModal.show();
            } else {
                setError(error.message || 'Login failed');
            }
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
                        <i className="bi bi-person-circle mb-3" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mb-4">Student Login</h4>
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
                                    placeholder="Student ID"
                                    name="studentid"
                                    value={formData.studentid}
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
                            <div className="recaptcha-container">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                    onChange={handleRecaptchaChange}
                                    onError={handleRecaptchaError}
                                    onExpired={handleRecaptchaExpired}
                                    onLoad={handleRecaptchaLoad}
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
                                <Link to="/student/signup" className="text-primary text-decoration-none">
                                    Sign up
                                </Link>
                            </div>
                            <div className="text-center mt-3">
                                <div className="divider">
                                    <hr />
                                    <span>OR</span>
                                    <hr />
                                </div>
                                <div className="mt-3">
                                    <GoogleLogin
                                        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        useOneTap={true}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentLogin; 