import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import StudentHeader from '../components/StudentHeader';

function StudentDashboard() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [messages, setMessages] = useState([]);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get student info from session
        fetch('http://localhost:5000/api/auth/check-session', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.isAuthenticated && data.user && data.user.fullname) {
                    setStudentName(`${data.user.fullname.firstname} ${data.user.fullname.lastname}`);
                }
            })
            .catch(error => {
                console.error('Error fetching student info:', error);
            });
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // First get the student's ID from the session
                const sessionResponse = await fetch("http://localhost:5000/api/auth/check-session", {
                    credentials: 'include'
                });
                const sessionData = await sessionResponse.json();

                if (sessionData.isAuthenticated && sessionData.user) {
                    // Then fetch all messages
                    const response = await fetch("http://localhost:5000/api/message");
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();

                    // Filter messages for the current student
                    const studentMessages = data.filter(message =>
                        message.student?.studentid === sessionData.user.studentid && !message.archive
                    );

                    const sortedData = studentMessages.sort((a, b) =>
                        new Date(b.requestStatus.requestDate) - new Date(a.requestStatus.requestDate)
                    );
                    setMessages(sortedData);
                }
            } catch (error) {
                console.error(`Error fetching messages: ${error}`);
            }
        };

        fetchMessages();
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
            <StudentHeader />
            <div className="d-flex flex-column min-vh-100">
                <div style={{ height: '64px' }}></div>
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
                                    <Link to="/StudentNightPass" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentLogbookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">My Logbook</span>
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
                                                <Link
                                                    to="/StudentNightPass"
                                                    state={{ activeTab: 'pending' }}
                                                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                >
                                                    <i className="bi bi-chat-left-dots me-2"></i>
                                                    <span>View All Requests</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                <DataTable
                                                    columns={[
                                                        {
                                                            name: 'Description',
                                                            selector: row => row.description,
                                                            sortable: true,
                                                            cell: row => (
                                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                                                    {row.description}
                                                                </div>
                                                            ),
                                                        },
                                                        {
                                                            name: 'Date',
                                                            selector: row => row.requestStatus.requestDate,
                                                            sortable: true,
                                                        },
                                                        {
                                                            name: 'Status',
                                                            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
                                                            sortable: true,
                                                            cell: row => (
                                                                <span className="badge bg-warning">Pending</span>
                                                            ),
                                                        }
                                                    ]}
                                                    data={messages
                                                        .filter(message => !message.requestStatus.isConfirmed)
                                                        .sort((a, b) => new Date(b.requestStatus.requestDate) - new Date(a.requestStatus.requestDate))
                                                        .slice(0, 3)}
                                                    customStyles={customTableStyles}
                                                    responsive
                                                    highlightOnHover
                                                    noDataComponent="No pending requests found"
                                                    pagination={false}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Night Pass Confirmations */}
                                    <div className="col-12">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Night Pass Confirmations</h5>
                                                <Link
                                                    to="/StudentNightPass"
                                                    state={{ activeTab: 'confirmed' }}
                                                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                >
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    <span>View All Confirmations</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                <DataTable
                                                    columns={[
                                                        {
                                                            name: 'Description',
                                                            selector: row => row.description,
                                                            sortable: true,
                                                            cell: row => (
                                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                                                    {row.description}
                                                                </div>
                                                            ),
                                                        },
                                                        {
                                                            name: 'Request Date',
                                                            selector: row => row.requestStatus.requestDate,
                                                            sortable: true,
                                                        },
                                                        {
                                                            name: 'Confirmation Date',
                                                            selector: row => row.requestStatus.confirmationDate,
                                                            sortable: true,
                                                        },
                                                        {
                                                            name: 'Status',
                                                            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
                                                            sortable: true,
                                                            cell: row => (
                                                                <span className="badge bg-success">Confirmed</span>
                                                            ),
                                                        }
                                                    ]}
                                                    data={messages
                                                        .filter(message => message.requestStatus.isConfirmed)
                                                        .sort((a, b) => new Date(b.requestStatus.confirmationDate) - new Date(a.requestStatus.confirmationDate))
                                                        .slice(0, 3)}
                                                    customStyles={customTableStyles}
                                                    responsive
                                                    highlightOnHover
                                                    noDataComponent="No confirmed requests found"
                                                    pagination={false}
                                                />
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