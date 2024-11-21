import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';

function AdminMessageRequest() {
    const [messages, setMessages] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState('');
    const [filterText, setFilterText] = useState('');
    const [filterTextNo, setFilterTextNo] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [studentIdFilter, setStudentIdFilter] = useState('');
    const [studentIdFilterNo, setStudentIdFilterNo] = useState('');
    const [firstNameFilter, setFirstNameFilter] = useState('');
    const [lastNameFilter, setLastNameFilter] = useState('');
    const [firstNameFilterNo, setFirstNameFilterNo] = useState('');
    const [lastNameFilterNo, setLastNameFilterNo] = useState('');
    const [filterInputs, setFilterInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        date: '',
        time: ''
    });
    const [activeFilters, setActiveFilters] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        date: '',
        time: ''
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);

    // Separate filter states for confirmed messages
    const [confirmedFilterInputs, setConfirmedFilterInputs] = useState({
        messageid: '',
        studentid: '',
        firstname: '',
        lastname: '',
        date: ''
    });
    const [confirmedActiveFilters, setConfirmedActiveFilters] = useState({
        messageid: '',
        studentid: '',
        firstname: '',
        lastname: '',
        date: ''
    });

    // Separate filter states for pending messages
    const [pendingFilterInputs, setPendingFilterInputs] = useState({
        messageid: '',
        studentid: '',
        firstname: '',
        lastname: '',
        date: ''
    });
    const [pendingActiveFilters, setPendingActiveFilters] = useState({
        messageid: '',
        studentid: '',
        firstname: '',
        lastname: '',
        date: ''
    });

    // Add new state for the info modal
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        console.log('Attempting to fetch messages...');
        try {
            const response = await fetch("http://localhost:5000/api/message");
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Fetch messages response not OK:', errorData);
                throw new Error(errorData.message || 'Network response was not ok');
            }
            const data = await response.json();
            console.log('Successfully fetched messages:', data);
            const sortedData = data.sort((a, b) =>
                new Date(b.requestStatus.requestDate) - new Date(a.requestStatus.requestDate)
            );
            console.log('Sorted messages:', sortedData);
            setMessages(sortedData);
        } catch (error) {
            console.error('Error in fetchMessages:', error);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, []);

    const confirmedYesMessages = messages.filter((message) => message.requestStatus.isConfirmed);
    const confirmedNoMessages = messages.filter((message) => !message.requestStatus.isConfirmed);

    const openDeleteModal = (messageid) => {
        console.log('Opening delete modal for message ID:', messageid);
        setMessageToDelete(messageid);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        console.log('Attempting to delete message ID:', messageToDelete);
        try {
            const response = await fetch(`http://localhost:5000/api/message/${messageToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                console.error('Delete response not OK:', response);
                throw new Error('Failed to delete message');
            }

            console.log('Message successfully deleted, fetching updated messages...');
            const updatedMessages = await fetch("http://localhost:5000/api/message")
                .then((response) => response.json())
                .catch((error) => {
                    console.error("Error fetching updated messages:", error);
                    return null;
                });

            if (updatedMessages) {
                console.log('Successfully fetched updated messages:', updatedMessages);
                setMessages(updatedMessages);
            }
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error in handleDelete:', error);
        }
    };

    const openConfirmModal = (messageid) => {
        console.log('Opening confirm modal for message ID:', messageid);
        setSelectedMessageId(messageid);
        setShowConfirmModal(true);
    };

    const handleAccept = async () => {
        console.log('Attempting to confirm message ID:', selectedMessageId);
        try {
            const requestBody = {
                requestStatus: {
                    isConfirmed: true,
                    confirmationDate: formatDate(new Date())
                }
            };
            console.log('Request body:', requestBody);

            const response = await fetch(`http://localhost:5000/api/message/${selectedMessageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Confirm response not OK:', errorData);
                throw new Error(errorData.message || 'Failed to update message status');
            }

            console.log('Message successfully confirmed, refreshing messages...');
            await fetchMessages();
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error in handleAccept:', error);
        }
    };

    const formatDate = (date) => {
        console.log('Formatting date:', date);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
        console.log('Formatted date:', formatted);
        return formatted;
    };

    // Separate handlers for confirmed messages
    const handleConfirmedFilterChange = (e) => {
        const { name, value } = e.target;
        setConfirmedFilterInputs(prev => ({
            ...prev,
            [name]: value
        }));
        setConfirmedActiveFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Separate handlers for pending messages
    const handlePendingFilterChange = (e) => {
        const { name, value } = e.target;
        setPendingFilterInputs(prev => ({
            ...prev,
            [name]: value
        }));
        setPendingActiveFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Separate filter functions for confirmed messages
    const getFilteredConfirmedMessages = (messages) => {
        return messages.filter(message => {
            const messageid = message.messageid?.toString().toLowerCase() || '';
            const studentid = message.student?.studentid?.toString().toLowerCase() || '';
            const firstname = message.student?.fullname?.firstname?.toLowerCase() || '';
            const lastname = message.student?.fullname?.lastname?.toLowerCase() || '';
            const date = message.requestStatus?.confirmationDate || '';

            return (
                messageid.includes(confirmedActiveFilters.messageid.toLowerCase()) &&
                studentid.includes(confirmedActiveFilters.studentid.toLowerCase()) &&
                firstname.includes(confirmedActiveFilters.firstname.toLowerCase()) &&
                lastname.includes(confirmedActiveFilters.lastname.toLowerCase()) &&
                date.includes(confirmedActiveFilters.date)
            );
        });
    };

    // Separate filter functions for pending messages
    const getFilteredPendingMessages = (messages) => {
        return messages.filter(message => {
            const messageid = message.messageid?.toString().toLowerCase() || '';
            const studentid = message.student?.studentid?.toString().toLowerCase() || '';
            const firstname = message.student?.fullname?.firstname?.toLowerCase() || '';
            const lastname = message.student?.fullname?.lastname?.toLowerCase() || '';
            const date = message.requestStatus?.requestDate || '';

            return (
                messageid.includes(pendingActiveFilters.messageid.toLowerCase()) &&
                studentid.includes(pendingActiveFilters.studentid.toLowerCase()) &&
                firstname.includes(pendingActiveFilters.firstname.toLowerCase()) &&
                lastname.includes(pendingActiveFilters.lastname.toLowerCase()) &&
                date.includes(pendingActiveFilters.date)
            );
        });
    };

    // Add handler for info button click
    const handleInfoClick = (message) => {
        setSelectedMessage(message);
        setShowInfoModal(true);
    };

    // Modify the column definitions to include the info button
    const confirmedColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ? `${student.fullname.firstname} ${student.fullname.lastname}` : 'N/A';
            },
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Confirmation Date',
            selector: row => row.requestStatus.confirmationDate || 'Pending',
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end w-100">
                    <button
                        className="btn btn-info btn-sm me-1"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-black" style={{ fontSize: "0.875rem" }} />
                    </button>
                    {!row.requestStatus.isConfirmed && (
                        <button
                            className="btn btn-success btn-sm me-1"
                            onClick={() => openConfirmModal(row.messageid)}
                        >
                            <i className="bi bi-check-square-fill" style={{ fontSize: "0.875rem" }} />
                        </button>
                    )}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openDeleteModal(row.messageid)}
                    >
                        <i className="bi bi-trash2-fill" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '120px',
            right: true,
        },
    ];

    const pendingColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ? `${student.fullname.firstname} ${student.fullname.lastname}` : 'N/A';
            },
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Request Date',
            selector: row => row.requestStatus.requestDate,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end w-100">
                    <button
                        className="btn btn-info btn-sm me-1"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-black" style={{ fontSize: "0.875rem" }} />
                    </button>
                    {!row.requestStatus.isConfirmed && (
                        <button
                            className="btn btn-success btn-sm me-1"
                            onClick={() => openConfirmModal(row.messageid)}
                        >
                            <i className="bi bi-check-square-fill" style={{ fontSize: "0.875rem" }} />
                        </button>
                    )}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openDeleteModal(row.messageid)}
                    >
                        <i className="bi bi-trash2-fill" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '120px',
            right: true,
        },
    ];

    const customStyles = {
        rows: {
            style: {
                minHeight: '45px',
                padding: '2px 0px',
            },
        },
        headCells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                backgroundColor: '#f8f9fa',
                fontWeight: 'bold',
                minHeight: '45px',
            },
        },
        cells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '2px',
                paddingBottom: '2px',
            },
        },
        subHeader: {
            style: {
                padding: '0px',
                marginBottom: '8px',
            },
        },
        modal: {
            style: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
        },
    };

    useEffect(() => {
        console.log('Modal state changed:', {
            showConfirmModal,
            showSaveConfirmModal,
            showDeleteModal
        });
        if (showConfirmModal || showSaveConfirmModal || showDeleteModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showConfirmModal, showSaveConfirmModal, showDeleteModal]);

    const openSaveConfirmModal = (changes) => {
        console.log('Opening save confirm modal with changes:', changes);
        setPendingChanges(changes);
        setShowSaveConfirmModal(true);
    };

    const handleSaveConfirm = async () => {
        console.log('Attempting to save changes:', pendingChanges);
        try {
            await handleSave(pendingChanges);
            console.log('Changes saved successfully');
            setShowSaveConfirmModal(false);
        } catch (error) {
            console.error('Error in handleSaveConfirm:', error);
        }
    };

    return (
        <>
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
                    <ul className="ms-auto navbar-nav flex-row">
                        <li className="nav-item">
                            <Link
                                className="btn btn-outline-dark text-center border-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    localStorage.removeItem('adminLoggedIn');
                                    window.location.href = '/';
                                }}
                            >
                                Sign out <i className="bi bi-door-open-fill" style={{ fontSize: "1rem" }} />
                            </Link>
                        </li>
                    </ul>
                </div>
            </header>

            <div className="container-fluid d-flex row" style={{ marginTop: '64px' }}>
                <nav className="sidebar bg-dark fixed-top"
                    style={{
                        width: "250px",
                        height: "100vh",
                        marginTop: "64px",
                        zIndex: 1020
                    }}>
                    <ul className="flex-column text-white text-decoration-none navbar-nav">
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminDashboard" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Dashboard</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminAccountManagement" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Account Management</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminMessageRequest" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6 text-start">Message Request</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminLogbookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Logbook History</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="#" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-clipboard-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Report Logs</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminSettings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Setting</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <main className="container-fluid px-4"
                    style={{
                        flex: 1,
                        marginLeft: "275px",
                        marginTop: "20px"
                    }}>
                    <h2 className="my-4">Message Request</h2>
                    <div className="border-3 border-bottom border-black mb-4" />

                    <h3 className="my-4 fw-normal">Confirmed Student Message Requests</h3>
                    <div className="row mb-3">
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Message ID"
                                name="messageid"
                                value={confirmedFilterInputs.messageid}
                                onChange={handleConfirmedFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Student ID"
                                name="studentid"
                                value={confirmedFilterInputs.studentid}
                                onChange={handleConfirmedFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="First Name"
                                name="firstname"
                                value={confirmedFilterInputs.firstname}
                                onChange={handleConfirmedFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Last Name"
                                name="lastname"
                                value={confirmedFilterInputs.lastname}
                                onChange={handleConfirmedFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="date"
                                name="date"
                                value={confirmedFilterInputs.date}
                                onChange={handleConfirmedFilterChange}
                            />
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    setConfirmedFilterInputs({
                                        messageid: '',
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        date: ''
                                    });
                                    setConfirmedActiveFilters({
                                        messageid: '',
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        date: ''
                                    });
                                }}
                            >
                                <i className="bi bi-trash2-fill"></i> Clear
                            </button>
                        </div>
                    </div>
                    <DataTable
                        className="border"
                        columns={confirmedColumns}
                        data={getFilteredConfirmedMessages(confirmedYesMessages)}
                        pagination
                        responsive
                        highlightOnHover
                        striped
                        noDataComponent="No confirmed messages found"
                    />

                    <div className="border-3 border-bottom border-black mt-4 mb-4"></div>

                    <h3 className="my-4 fw-normal">Student Night Pass Requests</h3>
                    <div className="row mb-3">
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Message ID"
                                name="messageid"
                                value={pendingFilterInputs.messageid}
                                onChange={handlePendingFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Student ID"
                                name="studentid"
                                value={pendingFilterInputs.studentid}
                                onChange={handlePendingFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="First Name"
                                name="firstname"
                                value={pendingFilterInputs.firstname}
                                onChange={handlePendingFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Last Name"
                                name="lastname"
                                value={pendingFilterInputs.lastname}
                                onChange={handlePendingFilterChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="date"
                                name="date"
                                value={pendingFilterInputs.date}
                                onChange={handlePendingFilterChange}
                            />
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    setPendingFilterInputs({
                                        messageid: '',
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        date: ''
                                    });
                                    setPendingActiveFilters({
                                        messageid: '',
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        date: ''
                                    });
                                }}
                            >
                                <i className="bi bi-trash2-fill"></i> Clear
                            </button>
                        </div>
                    </div>
                    <DataTable
                        className="border mb-5"
                        columns={pendingColumns}
                        data={getFilteredPendingMessages(confirmedNoMessages)}
                        pagination
                        responsive
                        highlightOnHover
                        striped
                        noDataComponent="No pending messages found"
                    />
                </main>
            </div>

            {/* Confirmation Modal */}
            <div className={`modal fade ${showConfirmModal ? 'show' : ''}`}
                style={{ display: showConfirmModal ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="confirmModalLabel"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmModalLabel">Confirm Request</h5>
                            <button type="button"
                                className="btn-close"
                                onClick={() => setShowConfirmModal(false)}
                                aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to confirm this request?
                        </div>
                        <div className="modal-footer">
                            <button type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </button>
                            <button type="button"
                                className="btn btn-success"
                                onClick={handleAccept}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop */}
            {showConfirmModal && (
                <div className="modal-backdrop fade show"></div>
            )}

            {/* Save Changes Confirmation Modal */}
            <div className={`modal fade ${showSaveConfirmModal ? 'show' : ''}`}
                style={{ display: showSaveConfirmModal ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="saveConfirmModalLabel"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="saveConfirmModalLabel">Confirm Save Changes</h5>
                            <button type="button"
                                className="btn-close"
                                onClick={() => setShowSaveConfirmModal(false)}
                                aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to save these changes?
                        </div>
                        <div className="modal-footer">
                            <button type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowSaveConfirmModal(false)}>
                                Cancel
                            </button>
                            <button type="button"
                                className="btn btn-primary"
                                onClick={handleSaveConfirm}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop for Save Confirmation */}
            {showSaveConfirmModal && (
                <div className="modal-backdrop fade show"></div>
            )}

            {/* Delete Confirmation Modal */}
            <div className={`modal fade ${showDeleteModal ? 'show' : ''}`}
                style={{ display: showDeleteModal ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="deleteModalLabel"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                            <button type="button"
                                className="btn-close"
                                onClick={() => setShowDeleteModal(false)}
                                aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this message? This action cannot be undone.
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
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop for Delete Confirmation */}
            {showDeleteModal && (
                <div className="modal-backdrop fade show"></div>
            )}

            {/* Info Modal */}
            {showInfoModal && selectedMessage && (
                <>
                    <div className="modal fade show"
                        style={{ display: 'block' }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="infoModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="infoModalLabel">Message Details</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowInfoModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="fw-bold">Description:</label>
                                        <p className="mb-0">{selectedMessage.description}</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowInfoModal(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </>
    );
}

export default AdminMessageRequest;
