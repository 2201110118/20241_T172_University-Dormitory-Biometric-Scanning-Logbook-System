import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import wallpaper from './assets/wallpaper.png';
import wallpaper2 from './assets/wallpaper2.png';
import BuksuLogo from './components/BuksuLogo';
import './admin/Login.css';

function Homepage() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Clear any existing auth states
        fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).catch(error => {
            console.error('Error clearing session:', error);
        });

        setIsVisible(true);
    }, []);

    return (
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
                </div>

                {/* Right Side - Content */}
                <div className="d-flex flex-column justify-content-center align-items-center h-100 p-5">
                    <div className="text-center mb-5">
                        <h3 className="mb-3 fw-bold" style={{ color: '#0056b3' }}>Welcome to</h3>
                        <h4 className="mb-4 fw-bold" style={{ color: '#003366' }}>Mahogany Dormitory</h4>
                        <p className="text-muted">Please select your login type</p>
                    </div>

                    <div className="d-flex gap-4 justify-content-center align-items-center mb-5">
                        <Link
                            to="/admin/login"
                            className="btn btn-primary d-flex flex-column align-items-center justify-content-center"
                            style={{
                                width: '200px',
                                height: '200px',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            <i className="bi bi-shield-lock-fill mb-3" style={{ fontSize: '2.5rem' }}></i>
                            <span style={{ fontSize: '1.25rem' }}>Admin</span>
                            <span style={{ fontSize: '1.25rem' }}>Login</span>
                        </Link>
                        <Link
                            to="/student/login"
                            className="btn btn-success d-flex flex-column align-items-center justify-content-center"
                            style={{
                                width: '200px',
                                height: '200px',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            <i className="bi bi-person-circle mb-3" style={{ fontSize: '2.5rem' }}></i>
                            <span style={{ fontSize: '1.25rem' }}>Student</span>
                            <span style={{ fontSize: '1.25rem' }}>Login</span>
                        </Link>
                    </div>

                    <div className="text-center mt-auto">
                        <small className="text-muted d-block">
                            © {new Date().getFullYear()} Bukidnon State University
                        </small>
                        <small className="text-muted d-block">
                            All rights reserved
                        </small>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
                    }
                    
                    .btn:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                    }
                    
                    .btn-primary {
                        background-color: #0d6efd;
                        border-color: #0d6efd;
                    }
                    
                    .btn-primary:hover {
                        background-color: #0b5ed7;
                        border-color: #0a58ca;
                    }
                    
                    .btn-success {
                        background-color: #198754;
                        border-color: #198754;
                    }
                    
                    .btn-success:hover {
                        background-color: #157347;
                        border-color: #146c43;
                    }
                `}
            </style>
        </div>
    );
}

export default Homepage; 