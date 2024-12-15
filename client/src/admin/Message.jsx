import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import AdminHeader from '../components/AdminHeader';
import { Modal } from 'bootstrap';

function Message() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedContact, setSelectedContact] = useState('');
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messageType, setMessageType] = useState('sms');
    const [emailSubject, setEmailSubject] = useState('');

    // Filter states
    const [inputs, setInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: ''
    });

    const [activeFilters, setActiveFilters] = useState({
        studentid: '',
        firstname: '',
        lastname: ''
    });

    // Add refs for modals
    const successModalRef = React.useRef(null);
    const errorModalRef = React.useRef(null);

    // Initialize bootstrap modals after component mounts
    useEffect(() => {
        const successModal = document.getElementById('successModal');
        const errorModal = document.getElementById('errorModal');
        
        if (successModal) {
            successModalRef.current = new Modal(successModal);
        }
        if (errorModal) {
            errorModalRef.current = new Modal(errorModal);
        }

        // Cleanup on unmount
        return () => {
            if (successModalRef.current) {
                successModalRef.current.dispose();
            }
            if (errorModalRef.current) {
                errorModalRef.current.dispose();
            }
        };
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/student/');
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            setStudents(data.filter(student => student.registeredaccount && !student.archive));
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleMessageClick = (student, type) => {
        setSelectedStudent(student);
        setSelectedContact('');
        setMessageText('');
        setMessageType(type);
        setEmailSubject('');
        setShowMessageModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: value
        }));
        setActiveFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setInputs({
            studentid: '',
            firstname: '',
            lastname: ''
        });
        setActiveFilters({
            studentid: '',
            firstname: '',
            lastname: ''
        });
    };

    const getFilteredStudents = () => {
        return students.filter(student => {
            const studentid = student.studentid?.toString().toLowerCase() || '';
            const firstname = student.fullname?.firstname?.toLowerCase() || '';
            const lastname = student.fullname?.lastname?.toLowerCase() || '';

            return (
                studentid.includes(activeFilters.studentid.toLowerCase()) &&
                firstname.includes(activeFilters.firstname.toLowerCase()) &&
                lastname.includes(activeFilters.lastname.toLowerCase())
            );
        });
    };

    const handleSendMessage = async () => {
        if (!selectedContact || !messageText.trim() || (messageType === 'email' && !emailSubject.trim())) {
            const errorModalBody = document.getElementById('errorModalBody');
            if (errorModalBody) {
                errorModalBody.textContent = messageType === 'email' 
                    ? 'Please select a contact, enter a subject, and enter a message' 
                    : 'Please select a contact and enter a message';
            }
            errorModalRef.current?.show();
            return;
        }

        setIsSending(true);
        try {
            let endpoint, payload;

            if (messageType === 'sms') {
                // Format phone number for Twilio (ensure it starts with +63)
                let formattedNumber = selectedContact;
                formattedNumber = formattedNumber.replace(/^\+/, '').replace(/^63/, '');
                if (formattedNumber.startsWith('0')) {
                    formattedNumber = formattedNumber.substring(1);
                }
                formattedNumber = '+63' + formattedNumber;

                endpoint = 'http://localhost:5000/api/sms/send';
                payload = {
                    to: formattedNumber,
                    message: messageText
                };
            } else {
                endpoint = 'http://localhost:5000/api/email/send';
                payload = {
                    to: selectedContact,
                    subject: emailSubject,
                    message: messageText
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send message');
            }

            const successModalBody = document.getElementById('successModalBody');
            if (successModalBody) {
                successModalBody.textContent = `${messageType.toUpperCase()} sent successfully!`;
            }
            successModalRef.current?.show();

            setShowMessageModal(false);
            setSelectedContact('');
            setMessageText('');
            setEmailSubject('');
        } catch (error) {
            console.error('Error sending message:', error);
            const errorModalBody = document.getElementById('errorModalBody');
            if (errorModalBody) {
                errorModalBody.textContent = error.message || 'Failed to send message. Please try again.';
            }
            errorModalRef.current?.show();
        } finally {
            setIsSending(false);
        }
    };

    const columns = [
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'First Name',
            selector: row => row.fullname?.firstname || '',
            sortable: true,
        },
        {
            name: 'Last Name',
            selector: row => row.fullname?.lastname || '',
            sortable: true,
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber || '',
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMessageClick(row, 'sms')}
                        title="Send SMS"
                    >
                        <i className="bi bi-chat-dots-fill"></i>
                    </button>
                    <button
                        className="btn btn-info btn-sm text-white"
                        onClick={() => handleMessageClick(row, 'email')}
                        title="Send Email"
                    >
                        <i className="bi bi-envelope-fill"></i>
                    </button>
                </div>
            ),
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
                                    <Link to="/AdminNightPass" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminLogBookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Logbook History</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminMessage" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Message</span>
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
                                        <span className="ms-2 fw-bold fs-6">Settings</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">Message</h2>
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

                                <div className="card">
                                    <div className="card-body">
                                        {/* Filter Inputs */}
                                        <div className="border-bottom p-4">
                                            <div className="row g-3">
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Student ID"
                                                        name="studentid"
                                                        value={inputs.studentid}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="First Name"
                                                        name="firstname"
                                                        value={inputs.firstname}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Last Name"
                                                        name="lastname"
                                                        value={inputs.lastname}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-auto">
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={handleClearFilters}
                                                    >
                                                        <i className="bi bi-trash2-fill"></i> Clear
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <DataTable
                                            columns={columns}
                                            data={getFilteredStudents()}
                                            customStyles={customTableStyles}
                                            pagination
                                            progressPending={isLoading}
                                            progressComponent={<TableLoader />}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && selectedStudent && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Send {messageType === 'email' ? 'Email' : 'SMS'} to {selectedStudent.fullname?.firstname} {selectedStudent.fullname?.lastname}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowMessageModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Select Contact:</label>
                                    <select 
                                        className="form-select"
                                        value={selectedContact}
                                        onChange={(e) => setSelectedContact(e.target.value)}
                                    >
                                        <option value="">Choose a contact...</option>
                                        {selectedStudent.contacts?.family?.[messageType === 'email' ? 'gmail' : 'contactNumber'] && (
                                            <option value={selectedStudent.contacts.family[messageType === 'email' ? 'gmail' : 'contactNumber']}>
                                                Family: {selectedStudent.contacts.family[messageType === 'email' ? 'gmail' : 'contactNumber']}
                                            </option>
                                        )}
                                        {selectedStudent.contacts?.guardian?.[messageType === 'email' ? 'gmail' : 'contactNumber'] && (
                                            <option value={selectedStudent.contacts.guardian[messageType === 'email' ? 'gmail' : 'contactNumber']}>
                                                Guardian: {selectedStudent.contacts.guardian[messageType === 'email' ? 'gmail' : 'contactNumber']}
                                            </option>
                                        )}
                                        {selectedStudent.contacts?.friend?.[messageType === 'email' ? 'gmail' : 'contactNumber'] && (
                                            <option value={selectedStudent.contacts.friend[messageType === 'email' ? 'gmail' : 'contactNumber']}>
                                                Friend: {selectedStudent.contacts.friend[messageType === 'email' ? 'gmail' : 'contactNumber']}
                                            </option>
                                        )}
                                    </select>
                                </div>
                                {messageType === 'email' && (
                                    <div className="mb-3">
                                        <label className="form-label">Subject:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            placeholder="Enter email subject..."
                                        />
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Message:</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Enter your message here..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowMessageModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSendMessage}
                                    disabled={isSending || !selectedContact || !messageText.trim() || (messageType === 'email' && !emailSubject.trim())}
                                >
                                    {isSending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Sending...
                                        </>
                                    ) : `Send ${messageType === 'email' ? 'Email' : 'SMS'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <div className="modal fade admin-modal" id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Success</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-check-circle text-success success-icon" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3" id="successModalBody">Message sent successfully!</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <div className="modal fade admin-modal" id="errorModal" tabIndex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Error</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-exclamation-circle text-danger error-icon" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3" id="errorModalBody">An error occurred.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Message; 