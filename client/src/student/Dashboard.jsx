import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';

function StudentDashboard() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [studentName, setStudentName] = useState('');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const student = JSON.parse(localStorage.getItem('student'));
        if (student && student.fullname) {
            setStudentName(`${student.fullname.firstname} ${student.fullname.lastname}`);
        }
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

    const handleLogout = (e) => {
        e.preventDefault();
        setIsExiting(true);

        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.getElementById('root').style.overflow = '';
        document.getElementById('root').style.paddingRight = '';

        setTimeout(() => {
            localStorage.removeItem('studentLoggedIn');
            localStorage.removeItem('student');
            navigate('/', { replace: true });

            setTimeout(() => {
                window.scrollTo(0, 0);
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }, 0);
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
            {/* Header */}
            <header className="navbar navbar-expand-lg navbar-light bg-white fixed-top border-bottom shadow" style={{ height: '64px', zIndex: 1030 }}>
                <div className="container-fluid px-4">
                    <Link className="navbar-brand d-flex align-items-center" to="/StudentDashboard">
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
                                <span>{studentName}</span>
                            </button>
                            <div className={`dropdown-menu shadow ${showDropdown ? 'show' : ''}`}>
                                <Link to="/student/account-settings" className="dropdown-item">
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

            <div className="d-flex flex-column min-vh-100">
                <div style={{ height: '64px' }}></div> {/* Spacer div to compensate for fixed header */}
                <div className="flex-grow-1" style={{ backgroundColor: "#ebedef" }}>
                    <div className="d-flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
                        {/* Sidebar Navigation */}
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
                                    <Link to="/StudentDashboard" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/student/night-pass" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/student/logbook" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">My Logbook</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/student/settings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Settings</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Main Content Area */}
                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">Dashboard Overview</h2>
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

                                {/* Summary Cards */}
                                <div className="row g-4 mb-4">
                                    {/* Total Logs Card */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Total Logs</h6>
                                                        <h3 className="mb-0">0</h3>
                                                    </div>
                                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-clock-history text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Night Pass Requests Card */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Night Pass Requests</h6>
                                                        <h3 className="mb-0">0</h3>
                                                    </div>
                                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-chat-left-dots text-info" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Approved Requests Card */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Approved Requests</h6>
                                                        <h3 className="mb-0">0</h3>
                                                    </div>
                                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="row g-4">
                                    {/* Recent Logs */}
                                    <div className="col-12 col-xl-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Recent Logs</h5>
                                                <Link to="/student/logbook" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center">
                                                    <i className="bi bi-clock-history me-2"></i>
                                                    <span>View All Logs</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                {/* Table content will be added later */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Night Pass Requests */}
                                    <div className="col-12 col-xl-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Night Pass Requests</h5>
                                                <Link to="/student/night-pass" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center">
                                                    <i className="bi bi-chat-left-dots me-2"></i>
                                                    <span>View All Requests</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                {/* Table content will be added later */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentDashboard; 