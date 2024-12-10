import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../admin/Login.css';
import wallpaper from '../assets/wallpaper.png';

function AdminHeader() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [adminUsername, setAdminUsername] = useState('Admin');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (admin && admin.username) {
            setAdminUsername(admin.username);
        }
    }, []);

    // Add event listener for storage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const admin = JSON.parse(localStorage.getItem('admin'));
            if (admin && admin.username) {
                setAdminUsername(admin.username);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Custom event listener for username changes
        window.addEventListener('usernameChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('usernameChanged', handleStorageChange);
        };
    }, []);

    // Add click outside handler
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

    const handleLogout = (e) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('admin');
            window.location.href = '/';
        }, 500);
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
                `}
            </style>
            {isExiting && (
                <div className="loading-overlay" style={{ backgroundImage: `url(${wallpaper})` }}>
                    <div className="spinner-container">
                        <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 text-dark">Logging out...</div>
                    </div>
                </div>
            )}
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
                    <div className="ms-auto d-flex align-items-center position-relative" ref={dropdownRef}>
                        <button
                            className="btn btn-link text-dark d-flex align-items-center"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ textDecoration: 'none' }}
                        >
                            <span className="me-2">{adminUsername}</span>
                            <i className="bi bi-person-circle" style={{ fontSize: '1.5rem' }}></i>
                        </button>
                        <div className={`dropdown-menu dropdown-menu-end shadow ${showDropdown ? 'show' : ''}`}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '0.1rem',
                                minWidth: '120px',
                                padding: '0.25rem 0',
                                zIndex: 1000
                            }}>
                            <Link to="/AdminAccountSettings" className="dropdown-item text-dark py-2 px-3">
                                <i className="bi bi-gear-fill me-2"></i>
                                Account Settings
                            </Link>
                            <hr className="dropdown-divider" />
                            <button
                                className="dropdown-item text-dark py-2 px-3"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-door-open-fill me-2"></i>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

export default AdminHeader; 