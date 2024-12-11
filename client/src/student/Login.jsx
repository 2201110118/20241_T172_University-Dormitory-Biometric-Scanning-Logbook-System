import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal } from 'bootstrap';
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import logo from '../assets/logo.png';
import logotitle from '../assets/logotitle.png';
import './StudentAuth.css';

function StudentLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentid: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Set a small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            setIsVisible(true);
            setContentLoaded(true);
        }, 100);

        const modal = new Modal(document.getElementById('errorModal'));
        setErrorModal(modal);

        return () => {
            clearTimeout(timer);
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

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');

        try {
            const decoded = jwtDecode(credentialResponse.credential);

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
                const loginResponse = await fetch('http://localhost:5000/api/login/student/google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        googleId: decoded.sub,
                        gmail: decoded.email
                    }),
                    credentials: 'include'
                });

                const loginData = await loginResponse.json();

                if (!loginResponse.ok) {
                    if (loginResponse.status === 403 && !loginData.isConfirmed) {
                        document.getElementById('errorModalTitle').textContent = 'Account Not Confirmed';
                        document.getElementById('errorModalBody').textContent = 'Your account is pending confirmation. Please wait for admin approval.';
                        errorModal.show();
                    } else {
                        setError(loginData.message || 'Login failed');
                    }
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem('studentLoggedIn', 'true');
                localStorage.setItem('student', JSON.stringify(loginData.student));
                navigate('/StudentDashboard');
            } else {
                // If student doesn't exist, redirect to signup with Google data
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
            console.error('Google login error:', error);
            setError('Unable to process Google login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
        setError('Google login failed. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!captchaToken) {
            setError('Please complete the reCAPTCHA verification');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    captchaToken
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403 && data.isConfirmed === false) {
                    document.getElementById('errorModalTitle').textContent = 'Account Not Confirmed';
                    document.getElementById('errorModalBody').textContent = 'Your account is pending confirmation. Please wait for admin approval.';
                    errorModal.show();
                } else {
                    setError(data.message || 'Login failed');
                }
                setIsLoading(false);
                return;
            }

            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('student', JSON.stringify(data.student));
            navigate('/StudentDashboard');

        } catch (error) {
            console.error('Login error:', error);
            setError('Unable to connect to the server. Please try again.');
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
                            backgroundImage: `url(${wallpaper2})`
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

                    {/* Right Side - Form */}
                    <div>
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

                        <i className="bi bi-person-circle mb-3" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mb-4">Student Login</h4>

                        {/* Google Sign-In Button */}
                        <div className="w-100 mb-4">
                            <div className="d-flex align-items-center justify-content-center mb-3">
                                <hr className="flex-grow-1 me-3" />
                                <span className="text-muted">Sign in with</span>
                                <hr className="flex-grow-1 ms-3" />
                            </div>
                            <div className="d-flex justify-content-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap
                                    shape="rectangular"
                                    theme="filled_blue"
                                    size="large"
                                    width="250px"
                                />
                            </div>
                            <div className="d-flex align-items-center justify-content-center my-3">
                                <hr className="flex-grow-1 me-3" />
                                <span className="text-muted">or</span>
                                <hr className="flex-grow-1 ms-3" />
                            </div>
                        </div>

                        {/* Regular Login Form */}
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
                            <div className="mb-4 d-flex justify-content-center">
                                <ReCAPTCHA
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                    onChange={handleCaptchaChange}
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
                                <Link to="/student/signup" className="text-primary text-decoration-none">
                                    Sign up
                                </Link>
                            </div>
                            <div className="text-center mt-3">
                                <Link to="/" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center" style={{ gap: '0.5rem' }}>
                                    <i className="bi bi-house-door"></i>
                                    <span>Return to Homepage</span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentLogin; 