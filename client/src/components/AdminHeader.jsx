import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../admin/Login.css';
import wallpaper from '../assets/wallpaper.png';

function AdminHeader() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [adminUsername, setAdminUsername] = useState('Admin');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get admin info from session
        fetch('http://localhost:5000/api/auth/check-session', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.isAuthenticated && data.user) {
                    setAdminUsername(data.user.username);
                }
            })
            .catch(error => {
                console.error('Error fetching admin info:', error);
            });
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        setIsExiting(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsExiting(false);
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .dropdown-menu.show {
                        animation: slideIn 0.2s ease forwards;
                    }
                    
                    .dropdown-item {
                        transition: background-color 0.2s ease;
                    }
                    
                    .dropdown-item:hover {
                        background-color: #f8f9fa;
                    }

                    .header-dropdown {
                        position: relative;
                    }

                    .header-dropdown .dropdown-menu {
                        position: absolute;
                        right: 0;
                        top: 100%;
                        margin-top: 0.5rem;
                        min-width: 200px;
                        transform-origin: top right;
                        z-index: 1030;
                    }
                `}
            </style>
            {isExiting && (
                <div
                    className="loading-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <div className="spinner-container">
                        <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 text-dark">Logging out...</div>
                    </div>
                </div>
            )}
            <header className="navbar navbar-expand-lg navbar-light bg-white fixed-top border-bottom shadow" style={{ height: '64px', zIndex: 1030 }}>
                <div className="container-fluid px-4">
                    <Link className="navbar-brand d-flex align-items-center" to="/AdminDashboard">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/8/86/Shield_logo_of_Bukidnon_State_University.png"
                            alt="Buksu Logo"
                            width="48"
                            height="48"
                        />
                        <div className="multiline-text ms-2 fw-bold" style={{ lineHeight: "1.1rem" }}>
                            <span style={{ color: "#0056b3" }}>Buksu</span>
                            <br />
                            <span style={{ color: "#003366" }}>Mahogany Dormitory</span>
                        </div>
                    </Link>
                    <div className="d-flex align-items-center">
                        <div className="header-dropdown" ref={dropdownRef}>
                            <button
                                className="btn btn-light dropdown-toggle d-flex align-items-center"
                                onClick={() => setShowDropdown(!showDropdown)}
                                type="button"
                                aria-expanded={showDropdown}
                            >
                                <i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
                                <span>{adminUsername}</span>
                            </button>
                            <div className={`dropdown-menu shadow ${showDropdown ? 'show' : ''}`}>
                                <Link to="/admin/account-settings" className="dropdown-item">
                                    <i className="bi bi-gear me-2"></i>
                                    Account Settings
                                </Link>
                                <hr className="dropdown-divider" />
                                <button
                                    className="dropdown-item text-danger"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

export default AdminHeader; 