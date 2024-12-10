import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import AdminHeader from '../components/AdminHeader';

function AdminNightPass() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const [confirmedInputs, setConfirmedInputs] = useState({
        messageid: '',
        studentid: '',
        firstname: '',
        lastname: '',
        roomnumber: '',
        date: ''
    });

    const [pendingInputs, setPendingInputs] = useState({
        messageid: '',
        studentid: '',
        firstname: '',
        lastname: '',
        roomnumber: '',
        date: ''
    });

    const [activeTab, setActiveTab] = useState('confirmed');

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/message");
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log("Fetched messages:", data);
            const sortedData = data.sort((a, b) =>
                new Date(b.requestStatus.requestDate) - new Date(a.requestStatus.requestDate)
            );
            setMessages(sortedData);
        } catch (error) {
            console.error('Error fetching messages:', error);
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

    const getFilteredConfirmedMessages = () => {
        if (!messages) return [];
        return messages.filter(message => message.requestStatus.isConfirmed).filter(message => {
            const messageid = message.messageid?.toString().toLowerCase() || '';
            const studentid = message.student?.studentid?.toString().toLowerCase() || '';
            const firstname = message.student?.fullname?.firstname?.toLowerCase() || '';
            const lastname = message.student?.fullname?.lastname?.toLowerCase() || '';
            const roomnumber = message.student?.roomnumber?.toString().toLowerCase() || '';

            // Format the confirmation date to match the input date format (YYYY-MM-DD)
            let confirmationDate = '';
            if (message.requestStatus?.confirmationDate) {
                try {
                    // Convert MM/DD/YYYY to YYYY-MM-DD
                    const parts = message.requestStatus.confirmationDate.split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        confirmationDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                } catch (error) {
                    console.error('Date parsing error:', error);
                }
            }

            // Debug logs
            console.log('Original Confirmation Date:', message.requestStatus?.confirmationDate);
            console.log('Formatted Confirmation Date:', confirmationDate);
            console.log('Input Date:', confirmedInputs.date);
            console.log('Date Match:', confirmationDate === confirmedInputs.date);

            const dateFilter = confirmedInputs.date
                ? confirmationDate === confirmedInputs.date
                : true;

            return (
                messageid.includes(confirmedInputs.messageid.toLowerCase()) &&
                studentid.includes(confirmedInputs.studentid.toLowerCase()) &&
                firstname.includes(confirmedInputs.firstname.toLowerCase()) &&
                lastname.includes(confirmedInputs.lastname.toLowerCase()) &&
                roomnumber.includes(confirmedInputs.roomnumber.toLowerCase()) &&
                dateFilter
            );
        });
    };

    const getFilteredPendingMessages = () => {
        if (!messages) return [];
        return messages.filter(message => !message.requestStatus.isConfirmed).filter(message => {
            const messageid = message.messageid?.toString().toLowerCase() || '';
            const studentid = message.student?.studentid?.toString().toLowerCase() || '';
            const firstname = message.student?.fullname?.firstname?.toLowerCase() || '';
            const lastname = message.student?.fullname?.lastname?.toLowerCase() || '';
            const roomnumber = message.student?.roomnumber?.toString().toLowerCase() || '';

            // Format the request date to match the input date format (YYYY-MM-DD)
            let requestDate = '';
            if (message.requestStatus?.requestDate) {
                try {
                    // Convert MM/DD/YYYY to YYYY-MM-DD
                    const parts = message.requestStatus.requestDate.split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        requestDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                } catch (error) {
                    console.error('Date parsing error:', error);
                }
            }

            // Debug logs
            console.log('Original Request Date:', message.requestStatus?.requestDate);
            console.log('Formatted Request Date:', requestDate);
            console.log('Input Date:', pendingInputs.date);
            console.log('Date Match:', requestDate === pendingInputs.date);

            const dateFilter = pendingInputs.date
                ? requestDate === pendingInputs.date
                : true;

            return (
                messageid.includes(pendingInputs.messageid.toLowerCase()) &&
                studentid.includes(pendingInputs.studentid.toLowerCase()) &&
                firstname.includes(pendingInputs.firstname.toLowerCase()) &&
                lastname.includes(pendingInputs.lastname.toLowerCase()) &&
                roomnumber.includes(pendingInputs.roomnumber.toLowerCase()) &&
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
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete message');
            await fetchMessages();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleAccept = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/message/${selectedMessageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestStatus: {
                        isConfirmed: true,
                        confirmationDate: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to confirm message');
            await fetchMessages();
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error confirming message:', error);
        }
    };

    const confirmedColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
            width: '10%',
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: true,
            width: '10%',
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ? `${student.fullname.firstname} ${student.fullname.lastname}` : 'N/A';
            },
            sortable: true,
            width: '18%',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
            width: '18%',
        },
        {
            name: 'Confirmation Date',
            selector: row => row.requestStatus.confirmationDate || 'N/A',
            sortable: true,
            width: '14%',
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: true,
            width: '10%',
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
                        <i className="bi bi-trash2-fill text-white" style={{ fontSize: "0.875rem" }} />
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
            width: '10%',
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: true,
            width: '10%',
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ? `${student.fullname.firstname} ${student.fullname.lastname}` : 'N/A';
            },
            sortable: true,
            width: '15%',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
            width: '15%',
        },
        {
            name: 'Request Date',
            selector: row => row.requestStatus.requestDate || 'N/A',
            sortable: true,
            width: '14%',
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: true,
            width: '10%',
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
                        className="btn btn-success btn-sm me-1"
                        onClick={() => {
                            setSelectedMessageId(row.messageid);
                            setShowConfirmModal(true);
                        }}
                    >
                        <i className="bi bi-check-square-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                            setMessageToDelete(row.messageid);
                            setShowDeleteModal(true);
                        }}
                    >
                        <i className="bi bi-trash2-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '26%',
            right: true,
        },
    ];

    return (
        <>
            <AdminHeader />
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
                                    <Link to="/AdminDashboard" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminAccountManagement" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Account Management</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6 text-start">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminLogBookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Logbook History</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="#" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clipboard-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Generate Report</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminSettings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Setting</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">Night Pass</h2>
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
                                    {/* Total Night Passes */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Total Night Passes</h6>
                                                        <h3 className="mb-0">{messages.length}</h3>
                                                    </div>
                                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-card-list text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmed Passes */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Confirmed Passes</h6>
                                                        <h3 className="mb-0">{messages.filter(message => message.requestStatus.isConfirmed).length}</h3>
                                                    </div>
                                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pending Passes */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Pending Passes</h6>
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

                                {/* Tabs Navigation */}
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
                                        {/* Confirmed Night Passes Table */}
                                        {activeTab === 'confirmed' && (
                                            <>
                                                <div className="p-4 border-bottom">
                                                    <div className="row g-3">
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Message ID"
                                                                name="messageid"
                                                                value={confirmedInputs.messageid}
                                                                onChange={handleConfirmedInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Student ID"
                                                                name="studentid"
                                                                value={confirmedInputs.studentid}
                                                                onChange={handleConfirmedInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="First Name"
                                                                name="firstname"
                                                                value={confirmedInputs.firstname}
                                                                onChange={handleConfirmedInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                name="lastname"
                                                                value={confirmedInputs.lastname}
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
                                                                        messageid: '',
                                                                        studentid: '',
                                                                        firstname: '',
                                                                        lastname: '',
                                                                        roomnumber: '',
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

                                        {/* Pending Night Passes Table */}
                                        {activeTab === 'pending' && (
                                            <>
                                                <div className="p-4 border-bottom">
                                                    <div className="row g-3">
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Message ID"
                                                                name="messageid"
                                                                value={pendingInputs.messageid}
                                                                onChange={handlePendingInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Student ID"
                                                                name="studentid"
                                                                value={pendingInputs.studentid}
                                                                onChange={handlePendingInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="First Name"
                                                                name="firstname"
                                                                value={pendingInputs.firstname}
                                                                onChange={handlePendingInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                name="lastname"
                                                                value={pendingInputs.lastname}
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
                                                                        messageid: '',
                                                                        studentid: '',
                                                                        firstname: '',
                                                                        lastname: '',
                                                                        roomnumber: '',
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

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Request</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)} />
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to confirm this request?
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-success" onClick={handleAccept}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Delete Request</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to delete this request?
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
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
        </>
    );
}

export default AdminNightPass;