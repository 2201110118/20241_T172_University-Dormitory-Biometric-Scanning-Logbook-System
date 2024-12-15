import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import StudentHeader from '../components/StudentHeader';

function StudentNightPass() {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const dropdownRef = useRef(null);
    const [newRequest, setNewRequest] = useState({
        description: ''
    });
    const [studentId, setStudentId] = useState(null);
    const [studentName, setStudentName] = useState('');

    const [confirmedInputs, setConfirmedInputs] = useState({
        description: '',
        date: ''
    });

    const [pendingInputs, setPendingInputs] = useState({
        description: '',
        date: ''
    });

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'confirmed');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editMessage, setEditMessage] = useState({
        messageid: null,
        description: ''
    });
    const [isEditLoading, setIsEditLoading] = useState(false);

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

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            // First get the student's ID from the session
            const sessionResponse = await fetch("http://localhost:5000/api/auth/check-session", {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();

            if (sessionData.isAuthenticated && sessionData.user) {
                setStudentId(sessionData.user.studentid);

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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleConfirmedInputChange = (e) => {
        const { name, value } = e.target;
        setConfirmedInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePendingInputChange = (e) => {
        const { name, value } = e.target;
        setPendingInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNewRequestChange = (e) => {
        setNewRequest({
            ...newRequest,
            [e.target.name]: e.target.value
        });
    };

    const handleRequestSubmit = async () => {
        try {
            // Get the latest message ID
            const response = await fetch("http://localhost:5000/api/message");
            const messages = await response.json();
            const latestMessageId = Math.max(...messages.map(m => m.messageid), 0);

            // Create new message
            const newMessage = {
                student: studentId,
                description: newRequest.description,
                messageid: latestMessageId + 1,
                requestStatus: {
                    isConfirmed: false,
                    requestDate: new Date().toLocaleDateString('en-US')
                }
            };

            const submitResponse = await fetch("http://localhost:5000/api/message", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMessage)
            });

            if (!submitResponse.ok) {
                throw new Error('Failed to submit request');
            }

            // Refresh messages and close modal
            await fetchMessages();
            setShowRequestModal(false);
            setNewRequest({ description: '' });

        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const getFilteredConfirmedMessages = () => {
        return messages.filter(message => message.requestStatus.isConfirmed).filter(message => {
            const description = message.description?.toLowerCase() || '';
            let confirmationDate = '';
            if (message.requestStatus?.confirmationDate) {
                try {
                    const parts = message.requestStatus.confirmationDate.split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        confirmationDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                } catch (error) {
                    console.error('Date parsing error:', error);
                }
            }

            const dateFilter = confirmedInputs.date
                ? confirmationDate === confirmedInputs.date
                : true;

            return (
                description.includes(confirmedInputs.description.toLowerCase()) &&
                dateFilter
            );
        });
    };

    const getFilteredPendingMessages = () => {
        return messages.filter(message => !message.requestStatus.isConfirmed).filter(message => {
            const description = message.description?.toLowerCase() || '';
            let requestDate = '';
            if (message.requestStatus?.requestDate) {
                try {
                    const parts = message.requestStatus.requestDate.split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        requestDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                } catch (error) {
                    console.error('Date parsing error:', error);
                }
            }

            const dateFilter = pendingInputs.date
                ? requestDate === pendingInputs.date
                : true;

            return (
                description.includes(pendingInputs.description.toLowerCase()) &&
                dateFilter
            );
        });
    };

    const handleInfoClick = (message) => {
        setSelectedMessage(message);
        setShowInfoModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/message/${messageToDelete}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archive: true })
            });

            if (!response.ok) {
                throw new Error('Failed to archive message');
            }

            await fetchMessages();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error archiving message:', error);
        }
    };

    const handleEditClick = (message) => {
        setEditMessage({
            messageid: message.messageid,
            description: message.description
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        setIsEditLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/message/${editMessage.messageid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: editMessage.description
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update message');
            }

            await fetchMessages();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating message:', error);
        } finally {
            setIsEditLoading(false);
        }
    };

    const confirmedColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
            width: '20%',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
            width: '20%',
            cell: row => (
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                    {row.description}
                </div>
            ),
        },
        {
            name: 'Confirmation Date',
            selector: row => row.requestStatus.confirmationDate || 'N/A',
            sortable: true,
            width: '20%',
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: true,
            width: '20%',
            cell: row => (
                <span className={`badge ${row.requestStatus.isConfirmed ? 'bg-success' : 'bg-warning'}`}>
                    {row.requestStatus.isConfirmed ? "Confirmed" : "Pending"}
                </span>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end">
                    <button
                        className="btn btn-info btn-sm me-1"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                            setMessageToDelete(row.messageid);
                            setShowDeleteModal(true);
                        }}
                    >
                        <i className="bi bi-archive-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '20%',
            right: true,
        },
    ];

    const pendingColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
            width: '20%',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
            width: '20%',
            cell: row => (
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                    {row.description}
                </div>
            ),
        },
        {
            name: 'Request Date',
            selector: row => row.requestStatus.requestDate || 'N/A',
            sortable: true,
            width: '20%',
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: true,
            width: '20%',
            cell: row => (
                <span className={`badge ${row.requestStatus.isConfirmed ? 'bg-success' : 'bg-warning'}`}>
                    {row.requestStatus.isConfirmed ? "Confirmed" : "Pending"}
                </span>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end">
                    <button
                        className="btn btn-info btn-sm me-1"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                    <button
                        className="btn btn-warning btn-sm me-1"
                        onClick={() => handleEditClick(row)}
                    >
                        <i className="bi bi-pencil-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                            setMessageToDelete(row.messageid);
                            setShowDeleteModal(true);
                        }}
                    >
                        <i className="bi bi-archive-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '20%',
            right: true,
        },
    ];

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
                                    <Link to="/StudentDashboard" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentNightPass" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentLogbookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">My Logbook History</span>
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

                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">Night Pass Requests</h2>
                                    <div className="d-flex align-items-center gap-3">
                                        <button
                                            className="btn btn-primary d-flex align-items-center"
                                            onClick={() => setShowRequestModal(true)}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            New Request
                                        </button>
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
                                </div>

                                <div className="row g-4 mb-4">
                                    {/* Total Requests Card */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Total Requests</h6>
                                                        <h3 className="mb-0">{messages.length}</h3>
                                                    </div>
                                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-chat-left-dots text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmed Requests Card */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Confirmed Requests</h6>
                                                        <h3 className="mb-0">{messages.filter(message => message.requestStatus.isConfirmed).length}</h3>
                                                    </div>
                                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pending Requests Card */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Pending Requests</h6>
                                                        <h3 className="mb-0">{messages.filter(message => !message.requestStatus.isConfirmed).length}</h3>
                                                    </div>
                                                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-transparent border-0">
                                        <ul className="nav nav-tabs card-header-tabs">
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${activeTab === 'confirmed' ? 'active text-primary' : 'text-secondary'}`}
                                                    onClick={() => setActiveTab('confirmed')}
                                                    style={{
                                                        backgroundColor: activeTab === 'confirmed' ? '#e7f1ff' : ''
                                                    }}
                                                >
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Confirmed Passes
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${activeTab === 'pending' ? 'active text-primary' : 'text-secondary'}`}
                                                    onClick={() => setActiveTab('pending')}
                                                    style={{
                                                        backgroundColor: activeTab === 'pending' ? '#e7f1ff' : ''
                                                    }}
                                                >
                                                    <i className="bi bi-hourglass-split me-2"></i>
                                                    Pending Passes
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="card-body p-0">
                                        {activeTab === 'confirmed' && (
                                            <>
                                                <div className="p-4 border-bottom">
                                                    <div className="row g-3">
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Search by description..."
                                                                name="description"
                                                                value={confirmedInputs.description}
                                                                onChange={handleConfirmedInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="date"
                                                                placeholder="Confirmation Date"
                                                                name="date"
                                                                value={confirmedInputs.date}
                                                                onChange={handleConfirmedInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-auto">
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => {
                                                                    setConfirmedInputs({
                                                                        description: '',
                                                                        date: ''
                                                                    });
                                                                }}
                                                            >
                                                                <i className="bi bi-trash2-fill"></i> Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DataTable
                                                    columns={confirmedColumns}
                                                    data={getFilteredConfirmedMessages()}
                                                    customStyles={customTableStyles}
                                                    pagination
                                                    responsive
                                                    highlightOnHover
                                                    striped
                                                    progressPending={isLoading}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No confirmed night passes found"
                                                    dense={false}
                                                />
                                            </>
                                        )}

                                        {activeTab === 'pending' && (
                                            <>
                                                <div className="p-4 border-bottom">
                                                    <div className="row g-3">
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Search by description..."
                                                                name="description"
                                                                value={pendingInputs.description}
                                                                onChange={handlePendingInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="date"
                                                                placeholder="Request Date"
                                                                name="date"
                                                                value={pendingInputs.date}
                                                                onChange={handlePendingInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-auto">
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => {
                                                                    setPendingInputs({
                                                                        description: '',
                                                                        date: ''
                                                                    });
                                                                }}
                                                            >
                                                                <i className="bi bi-trash2-fill"></i> Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DataTable
                                                    columns={pendingColumns}
                                                    data={getFilteredPendingMessages()}
                                                    customStyles={customTableStyles}
                                                    pagination
                                                    responsive
                                                    highlightOnHover
                                                    striped
                                                    progressPending={isLoading}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No pending night passes found"
                                                    dense={false}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete/Archive Confirmation Modal */}
            {showDeleteModal && (
                <>
                    <div className={`modal fade show`}
                        style={{ display: 'block' }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="deleteModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="deleteModalLabel">Confirm Archive</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to archive this night pass request? This will hide it from the list.
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-danger"
                                        onClick={handleDelete}>
                                        Archive
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* Info Modal */}
            {showInfoModal && selectedMessage && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Request Details</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowInfoModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="fw-bold">Description:</label>
                                        <p className="mb-0">{selectedMessage.description}</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowInfoModal(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}

            {/* New Request Modal */}
            {showRequestModal && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">New Night Pass Request</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowRequestModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            value={newRequest.description}
                                            onChange={handleNewRequestChange}
                                            rows="4"
                                            placeholder="Enter your request details..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleRequestSubmit}
                                        disabled={!newRequest.description.trim()}
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Night Pass Request</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            value={editMessage.description}
                                            onChange={(e) => setEditMessage({ ...editMessage, description: e.target.value })}
                                            rows="4"
                                            placeholder="Enter your request details..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={handleEditSubmit}
                                        disabled={!editMessage.description.trim() || isEditLoading}
                                    >
                                        {isEditLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}
        </>
    );
}

export default StudentNightPass; 