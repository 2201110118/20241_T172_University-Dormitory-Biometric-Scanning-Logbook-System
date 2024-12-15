import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import AdminHeader from '../components/AdminHeader';

function AdminAccountManagement() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') === 'unregistered' ? 'unregistered' : 'registered';
    const [activeTab, setActiveTab] = useState(initialTab);

    const [students, setStudents] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [unregisteredStudents, setUnregisteredStudents] = useState([]);

    const [registeredInputs, setRegisteredInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        date: ''
    });

    const [unregisteredInputs, setUnregisteredInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        date: ''
    });

    const [activeRegisteredFilters, setActiveRegisteredFilters] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        date: ''
    });

    const [activeUnregisteredFilters, setActiveUnregisteredFilters] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        date: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        roomnumber: '',
        'contacts.family.contactNumber': '',
        'contacts.family.gmail': '',
        'contacts.guardian.contactNumber': '',
        'contacts.guardian.gmail': '',
        'contacts.friend.contactNumber': '',
        'contacts.friend.gmail': ''
    });

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [showVerifyConfirmModal, setShowVerifyConfirmModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showConfirmRegistrationModal, setShowConfirmRegistrationModal] = useState(false);
    const [studentToConfirm, setStudentToConfirm] = useState(null);
    const [pendingChanges, setPendingChanges] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/student/');
            if (!response.ok) {
                console.error('Failed to fetch students:', response.status, response.statusText);
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch students');
            }
            const data = await response.json();
            console.log('Fetched students:', data);

            setStudents(data);
            setRegisteredStudents(data.filter(student => student.registeredaccount));
            setUnregisteredStudents(data.filter(student => !student.registeredaccount));
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('Component mounted');
        fetchStudents();
    }, []);

    useEffect(() => {
        console.log('Registered students:', registeredStudents);
        console.log('Unregistered students:', unregisteredStudents);
    }, [registeredStudents, unregisteredStudents]);

    const handleArchive = async (studentid) => {
        setStudentToDelete(studentid);
        setShowDeleteConfirmModal(true);
    };

    const confirmArchive = async () => {
        try {
            setIsProcessing(true);
            const response = await fetch(`http://localhost:5000/api/student/${studentToDelete}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    archive: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to archive student');
            }

            await fetchStudents();
            setShowDeleteConfirmModal(false);

            // Show success modal
            const successModal = document.getElementById('successModal');
            const successModalBody = document.getElementById('successModalBody');
            successModalBody.textContent = 'Student has been archived successfully!';
            new bootstrap.Modal(successModal).show();

        } catch (error) {
            console.error('Error archiving student:', error);

            // Show error modal
            const errorModal = document.getElementById('errorModal');
            const errorModalBody = document.getElementById('errorModalBody');
            errorModalBody.textContent = error.message || 'An error occurred while archiving the student.';
            new bootstrap.Modal(errorModal).show();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRegisteredInputChange = (e) => {
        const { name, value } = e.target;
        setRegisteredInputs(prev => ({
            ...prev,
            [name]: value
        }));
        setActiveRegisteredFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUnregisteredInputChange = (e) => {
        const { name, value } = e.target;
        setUnregisteredInputs(prev => ({
            ...prev,
            [name]: value
        }));
        setActiveUnregisteredFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getRegisteredStudents = () => {
        return students.filter(student => student.registeredaccount && !student.archive);
    };

    const getUnregisteredStudents = () => {
        return students.filter(student => !student.registeredaccount && !student.archive);
    };

    const getTotalActiveStudents = () => {
        return students.filter(student => !student.archive).length;
    };

    const getFilteredRegisteredStudents = () => {
        return getRegisteredStudents().filter(student => {
            const studentid = student.studentid?.toString().toLowerCase() || '';
            const firstname = student.fullname?.firstname?.toLowerCase() || '';
            const lastname = student.fullname?.lastname?.toLowerCase() || '';
            const gmail = student.gmail?.toLowerCase() || '';
            const verificationDate = student.accountStatus?.verificationDate || '';

            const dateFilter = activeRegisteredFilters.date
                ? new Date(verificationDate).toLocaleDateString('en-CA') === activeRegisteredFilters.date
                : true;

            return (
                studentid.includes(activeRegisteredFilters.studentid.toLowerCase()) &&
                firstname.includes(activeRegisteredFilters.firstname.toLowerCase()) &&
                lastname.includes(activeRegisteredFilters.lastname.toLowerCase()) &&
                gmail.includes(activeRegisteredFilters.gmail.toLowerCase()) &&
                dateFilter
            );
        });
    };

    const getFilteredUnregisteredStudents = () => {
        return getUnregisteredStudents().filter(student => {
            const studentid = student.studentid?.toString().toLowerCase() || '';
            const firstname = student.fullname?.firstname?.toLowerCase() || '';
            const lastname = student.fullname?.lastname?.toLowerCase() || '';
            const gmail = student.gmail?.toLowerCase() || '';
            const submissionDate = student.accountStatus?.submissionDate || '';

            const dateFilter = activeUnregisteredFilters.date
                ? new Date(submissionDate).toLocaleDateString('en-CA') === activeUnregisteredFilters.date
                : true;

            return (
                studentid.includes(activeUnregisteredFilters.studentid.toLowerCase()) &&
                firstname.includes(activeUnregisteredFilters.firstname.toLowerCase()) &&
                lastname.includes(activeUnregisteredFilters.lastname.toLowerCase()) &&
                gmail.includes(activeUnregisteredFilters.gmail.toLowerCase()) &&
                dateFilter
            );
        });
    };

    const handleInfoClick = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleEditClick = (student) => {
        console.log('Editing student:', student);
        setEditingStudent(student);
        setEditForm({
            studentid: student.studentid || '',
            firstname: student.fullname?.firstname || '',
            lastname: student.fullname?.lastname || '',
            gmail: student.gmail || '',
            roomnumber: student.roomnumber || '',
            'contacts.family.contactNumber': student.contacts?.family?.contactNumber || '',
            'contacts.family.gmail': student.contacts?.family?.gmail || '',
            'contacts.guardian.contactNumber': student.contacts?.guardian?.contactNumber || '',
            'contacts.guardian.gmail': student.contacts?.guardian?.gmail || '',
            'contacts.friend.contactNumber': student.contacts?.friend?.contactNumber || '',
            'contacts.friend.gmail': student.contacts?.friend?.gmail || ''
        });
        setShowEditModal(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setShowSaveConfirmModal(true);
        setPendingChanges(editForm);
    };

    const handleSaveConfirm = async () => {
        if (!editingStudent) {
            console.error('No student selected');
            return;
        }

        try {
            setIsProcessing(true);
            const updatedData = {
                studentid: Number(pendingChanges.studentid),
                fullname: {
                    firstname: pendingChanges.firstname,
                    lastname: pendingChanges.lastname
                },
                gmail: pendingChanges.gmail,
                roomnumber: pendingChanges.roomnumber ? Number(pendingChanges.roomnumber) : null,
                contacts: {
                    family: {
                        contactNumber: pendingChanges['contacts.family.contactNumber'] ?
                            Number(pendingChanges['contacts.family.contactNumber']) : undefined,
                        gmail: pendingChanges['contacts.family.gmail']
                    },
                    guardian: {
                        contactNumber: pendingChanges['contacts.guardian.contactNumber'] ?
                            Number(pendingChanges['contacts.guardian.contactNumber']) : undefined,
                        gmail: pendingChanges['contacts.guardian.gmail']
                    },
                    friend: {
                        contactNumber: pendingChanges['contacts.friend.contactNumber'] ?
                            Number(pendingChanges['contacts.friend.contactNumber']) : undefined,
                        gmail: pendingChanges['contacts.friend.gmail']
                    }
                }
            };

            const cleanedData = JSON.parse(JSON.stringify(updatedData));

            const response = await fetch(`http://localhost:5000/api/student/${editingStudent.studentid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update student');
            }

            await fetchStudents();
            setShowEditModal(false);
            setShowSaveConfirmModal(false);

            // Show success modal
            const successModal = document.getElementById('successModal');
            const successModalBody = document.getElementById('successModalBody');
            successModalBody.textContent = 'Student information has been updated successfully!';
            new bootstrap.Modal(successModal).show();

        } catch (error) {
            console.error('Error updating student:', error);

            // Show error modal
            const errorModal = document.getElementById('errorModal');
            const errorModalBody = document.getElementById('errorModalBody');
            errorModalBody.textContent = error.message || 'An error occurred while updating student information.';
            new bootstrap.Modal(errorModal).show();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmStudent = async (student) => {
        setStudentToConfirm(student);
        setPendingChanges(editForm);
        setShowConfirmRegistrationModal(true);
    };

    const confirmRegistration = async () => {
        try {
            setIsProcessing(true);
            const currentDate = new Date().toISOString();
            const updatedData = {
                studentid: Number(editForm.studentid),
                fullname: {
                    firstname: editForm.firstname,
                    lastname: editForm.lastname
                },
                gmail: editForm.gmail,
                roomnumber: editForm.roomnumber ? Number(editForm.roomnumber) : null,
                contacts: {
                    family: {
                        contactNumber: editForm['contacts.family.contactNumber'] ?
                            Number(editForm['contacts.family.contactNumber']) : undefined,
                        gmail: editForm['contacts.family.gmail']
                    },
                    guardian: {
                        contactNumber: editForm['contacts.guardian.contactNumber'] ?
                            Number(editForm['contacts.guardian.contactNumber']) : undefined,
                        gmail: editForm['contacts.guardian.gmail']
                    },
                    friend: {
                        contactNumber: editForm['contacts.friend.contactNumber'] ?
                            Number(editForm['contacts.friend.contactNumber']) : undefined,
                        gmail: editForm['contacts.friend.gmail']
                    }
                },
                registeredaccount: true,
                accountStatus: {
                    isConfirmed: true,
                    verificationDate: currentDate
                }
            };

            const cleanedData = JSON.parse(JSON.stringify(updatedData));

            const response = await fetch(`http://localhost:5000/api/student/${studentToConfirm.studentid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm student');
            }

            await fetchStudents();
            setShowEditModal(false);
            setShowConfirmRegistrationModal(false);

            // Show success modal
            const successModal = document.getElementById('successModal');
            const successModalBody = document.getElementById('successModalBody');
            successModalBody.textContent = 'Student registration has been confirmed successfully!';
            new bootstrap.Modal(successModal).show();

        } catch (error) {
            console.error('Error confirming student:', error);

            // Show error modal
            const errorModal = document.getElementById('errorModal');
            const errorModalBody = document.getElementById('errorModalBody');
            errorModalBody.textContent = error.message || 'An error occurred while confirming student registration.';
            new bootstrap.Modal(errorModal).show();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmAction = async () => {
        try {
            setIsProcessing(true);
            const confirmBtn = document.getElementById('confirmActionBtn');
            const closeBtn = confirmBtn.previousElementSibling;

            // Disable both buttons during processing
            confirmBtn.disabled = true;
            closeBtn.disabled = true;

            if (selectedAction === 'confirm') {
                const response = await fetch(`http://localhost:5000/api/student/${selectedStudent._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'accountStatus.isConfirmed': true,
                        'accountStatus.verificationDate': new Date().toLocaleDateString(),
                        'registeredaccount': true
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to confirm student');
                }
            } else if (selectedAction === 'archive') {
                const response = await fetch(`http://localhost:5000/api/student/${selectedStudent._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        archive: true
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to archive student');
                }
            }

            // Close confirmation modal
            const confirmationModal = document.getElementById('confirmationModal');
            const bsConfirmationModal = bootstrap.Modal.getInstance(confirmationModal);
            bsConfirmationModal.hide();

            // Show success modal
            const successModal = document.getElementById('successModal');
            const successModalBody = document.getElementById('successModalBody');
            successModalBody.textContent = selectedAction === 'confirm'
                ? 'Student account has been confirmed successfully!'
                : 'Student account has been archived successfully!';
            new bootstrap.Modal(successModal).show();

            // Refresh the student list
            await fetchStudents();

        } catch (error) {
            console.error('Error:', error);

            // Close confirmation modal
            const confirmationModal = document.getElementById('confirmationModal');
            const bsConfirmationModal = bootstrap.Modal.getInstance(confirmationModal);
            bsConfirmationModal.hide();

            // Show error modal
            const errorModal = document.getElementById('errorModal');
            const errorModalBody = document.getElementById('errorModalBody');
            errorModalBody.textContent = error.message || 'An error occurred while processing your request.';
            new bootstrap.Modal(errorModal).show();
        } finally {
            setIsProcessing(false);
            // Re-enable buttons
            const confirmBtn = document.getElementById('confirmActionBtn');
            const closeBtn = confirmBtn.previousElementSibling;
            confirmBtn.disabled = false;
            closeBtn.disabled = false;
        }
    };

    const registeredColumns = [
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: true,
            width: '12%',
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname?.firstname} ${row.fullname?.lastname}`,
            sortable: true,
            width: '25%',
        },
        {
            name: 'Gmail',
            selector: row => row.gmail,
            sortable: true,
            width: '25%',
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber || 'N/A',
            sortable: true,
            width: '10%',
        },
        {
            name: 'Verification Date',
            selector: row => row.accountStatus?.verificationDate || 'N/A',
            sortable: true,
            width: '15%',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end w-100">
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
                        onClick={() => handleArchive(row.studentid)}
                        title="Archive Student"
                    >
                        <i className="bi bi-archive-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '13%',
            right: true,
        },
    ];

    const unregisteredColumns = [
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: false,
            width: '12%',
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname.firstname} ${row.fullname.lastname}`,
            sortable: false,
            width: '25%',
        },
        {
            name: 'Gmail',
            selector: row => row.gmail,
            sortable: false,
            width: '25%',
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber ? row.roomnumber : 'N/A',
            sortable: false,
            width: '15%',
        },
        {
            name: 'Submission Date',
            selector: row => row.accountStatus?.submissionDate || 'N/A',
            sortable: false,
            width: '15%',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end w-100">
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
                        onClick={() => handleArchive(row.studentid)}
                        title="Archive Student"
                    >
                        <i className="bi bi-archive-fill text-white" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
            width: '8%',
            right: true,
        },
    ];

    // Add this useEffect to handle body overflow
    useEffect(() => {
        if (showModal || showEditModal || showDeleteConfirmModal || showConfirmRegistrationModal || showSaveConfirmModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal, showEditModal, showDeleteConfirmModal, showConfirmRegistrationModal, showSaveConfirmModal]);

    return (
        <>
            <AdminHeader />
            <div className="d-flex flex-column min-vh-100">
                <div style={{ height: '64px' }}></div> {/* Spacer div to compensate for fixed header */}
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
                                    <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6 text-start">Account Management</span>
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
                                    <Link to="/AdminMessage" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Message</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminGenerateReport" className="nav-link my-1 mx-2 d-flex align-items-center">
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
                                    <h2 className="mb-0 fw-bold">Account Management</h2>
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
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Total Students</h6>
                                                        <h3 className="mb-0">{getTotalActiveStudents()}</h3>
                                                    </div>
                                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-people text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Registered Students</h6>
                                                        <h3 className="mb-0">{getRegisteredStudents().length}</h3>
                                                    </div>
                                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-person-check text-success" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Pending Registrations</h6>
                                                        <h3 className="mb-0">{getUnregisteredStudents().length}</h3>
                                                    </div>
                                                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-person-plus text-warning" style={{ fontSize: '1.5rem' }}></i>
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
                                                    className={`nav-link ${activeTab === 'registered' ? 'active text-primary' : 'text-secondary'}`}
                                                    onClick={() => setActiveTab('registered')}
                                                    style={{
                                                        backgroundColor: activeTab === 'registered' ? '#e7f1ff' : ''
                                                    }}
                                                >
                                                    <i className="bi bi-person-check me-2"></i>
                                                    Registered Students
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${activeTab === 'unregistered' ? 'active text-primary' : 'text-secondary'}`}
                                                    onClick={() => setActiveTab('unregistered')}
                                                    style={{
                                                        backgroundColor: activeTab === 'unregistered' ? '#e7f1ff' : ''
                                                    }}
                                                >
                                                    <i className="bi bi-person-plus me-2"></i>
                                                    Registration Requests
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="card-body p-0">
                                        {/* Registered Students Table */}
                                        {activeTab === 'registered' && (
                                            <>
                                                {/* Filter Inputs */}
                                                <div className="p-4 border-bottom">
                                                    <div className="row g-3">
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Student ID"
                                                                name="studentid"
                                                                value={registeredInputs.studentid}
                                                                onChange={handleRegisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="First Name"
                                                                name="firstname"
                                                                value={registeredInputs.firstname}
                                                                onChange={handleRegisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                name="lastname"
                                                                value={registeredInputs.lastname}
                                                                onChange={handleRegisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Gmail"
                                                                name="gmail"
                                                                value={registeredInputs.gmail}
                                                                onChange={handleRegisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="date"
                                                                placeholder="Verification Date"
                                                                name="date"
                                                                value={registeredInputs.date}
                                                                onChange={handleRegisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-auto">
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => {
                                                                    setRegisteredInputs({
                                                                        studentid: '',
                                                                        firstname: '',
                                                                        lastname: '',
                                                                        gmail: '',
                                                                        date: ''
                                                                    });
                                                                    setActiveRegisteredFilters({
                                                                        studentid: '',
                                                                        firstname: '',
                                                                        lastname: '',
                                                                        gmail: '',
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
                                                    columns={registeredColumns}
                                                    data={getFilteredRegisteredStudents()}
                                                    customStyles={customTableStyles}
                                                    pagination
                                                    responsive
                                                    highlightOnHover
                                                    striped
                                                    progressPending={isLoading}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No registered students found"
                                                    dense={false}
                                                />
                                            </>
                                        )}

                                        {/* Unregistered Students Table */}
                                        {activeTab === 'unregistered' && (
                                            <>
                                                {/* Filter Inputs */}
                                                <div className="p-4 border-bottom">
                                                    <div className="row g-3">
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Student ID"
                                                                name="studentid"
                                                                value={unregisteredInputs.studentid}
                                                                onChange={handleUnregisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="First Name"
                                                                name="firstname"
                                                                value={unregisteredInputs.firstname}
                                                                onChange={handleUnregisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                name="lastname"
                                                                value={unregisteredInputs.lastname}
                                                                onChange={handleUnregisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Gmail"
                                                                name="gmail"
                                                                value={unregisteredInputs.gmail}
                                                                onChange={handleUnregisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                className="form-control"
                                                                type="date"
                                                                placeholder="Submission Date"
                                                                name="date"
                                                                value={unregisteredInputs.date}
                                                                onChange={handleUnregisteredInputChange}
                                                            />
                                                        </div>
                                                        <div className="col-auto">
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => {
                                                                    setUnregisteredInputs({
                                                                        studentid: '',
                                                                        firstname: '',
                                                                        lastname: '',
                                                                        gmail: '',
                                                                        date: ''
                                                                    });
                                                                    setActiveUnregisteredFilters({
                                                                        studentid: '',
                                                                        firstname: '',
                                                                        lastname: '',
                                                                        gmail: '',
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
                                                    columns={unregisteredColumns}
                                                    data={getFilteredUnregisteredStudents()}
                                                    customStyles={customTableStyles}
                                                    pagination
                                                    responsive
                                                    highlightOnHover
                                                    striped
                                                    progressPending={isLoading}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No unregistered students found"
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

            {showModal && selectedStudent && (
                <>
                    <div className={`modal fade show`}
                        style={{ display: 'block' }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="infoModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="infoModalLabel">Student Information</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <h6 className="fw-bold">Basic Information</h6>
                                            <p><strong>Student ID:</strong> {selectedStudent.studentid}</p>
                                            <p><strong>Name:</strong> {selectedStudent.fullname?.firstname} {selectedStudent.fullname?.lastname}</p>
                                            <p><strong>Gmail:</strong> {selectedStudent.gmail}</p>
                                            <p><strong>Room Number:</strong> {selectedStudent.roomnumber || 'Not assigned'}</p>
                                            <p><strong>Account Status:</strong> {selectedStudent.accountStatus?.isConfirmed ? 'Confirmed' : 'Pending'}</p>
                                            <p><strong>Submission Date:</strong> {selectedStudent.accountStatus?.submissionDate}</p>
                                            {selectedStudent.accountStatus?.isConfirmed && (
                                                <p><strong>Verification Date:</strong> {selectedStudent.accountStatus.verificationDate}</p>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="fw-bold">Contact Information</h6>
                                            <div className="mb-3">
                                                <p className="mb-1"><strong>Family Contact:</strong></p>
                                                <p className="mb-1">Number: {selectedStudent.contacts?.family?.contactNumber || 'N/A'}</p>
                                                <p>Email: {selectedStudent.contacts?.family?.gmail || 'N/A'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <p className="mb-1"><strong>Guardian Contact:</strong></p>
                                                <p className="mb-1">Number: {selectedStudent.contacts?.guardian?.contactNumber || 'N/A'}</p>
                                                <p>Email: {selectedStudent.contacts?.guardian?.gmail || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><strong>Friend Contact:</strong></p>
                                                <p className="mb-1">Number: {selectedStudent.contacts?.friend?.contactNumber || 'N/A'}</p>
                                                <p>Email: {selectedStudent.contacts?.friend?.gmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {showEditModal && editingStudent && (
                <>
                    <div className={`modal fade show`}
                        style={{
                            display: 'block',
                            zIndex: showSaveConfirmModal ? 1040 : 1050
                        }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="editModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editModalLabel">Edit Student Information</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowEditModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <h6 className="fw-bold">Basic Information</h6>
                                                <div className="mb-3">
                                                    <label className="form-label">Student ID</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="studentid"
                                                        value={editForm.studentid}
                                                        onChange={handleEditFormChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">First Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="firstname"
                                                        value={editForm.firstname}
                                                        onChange={handleEditFormChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Last Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="lastname"
                                                        value={editForm.lastname}
                                                        onChange={handleEditFormChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Gmail</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="gmail"
                                                        value={editForm.gmail}
                                                        onChange={handleEditFormChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Room Number</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="roomnumber"
                                                        value={editForm.roomnumber}
                                                        onChange={handleEditFormChange}
                                                        placeholder="Add a room number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="fw-bold">Contact Information</h6>
                                                <div className="mb-3">
                                                    <label className="form-label">Family Contact Number</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="contacts.family.contactNumber"
                                                        value={editForm['contacts.family.contactNumber']}
                                                        onChange={handleEditFormChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Family Contact Gmail</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="contacts.family.gmail"
                                                        value={editForm['contacts.family.gmail']}
                                                        onChange={handleEditFormChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Guardian Contact Number</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="contacts.guardian.contactNumber"
                                                        value={editForm['contacts.guardian.contactNumber']}
                                                        onChange={handleEditFormChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Guardian Contact Gmail</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="contacts.guardian.gmail"
                                                        value={editForm['contacts.guardian.gmail']}
                                                        onChange={handleEditFormChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Friend Contact Number</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="contacts.friend.contactNumber"
                                                        value={editForm['contacts.friend.contactNumber']}
                                                        onChange={handleEditFormChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Friend Contact Gmail</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="contacts.friend.gmail"
                                                        value={editForm['contacts.friend.gmail']}
                                                        onChange={handleEditFormChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        {!editingStudent.registeredaccount && (
                                            <button
                                                type="button"
                                                className="btn btn-success me-2"
                                                onClick={() => handleConfirmStudent(editingStudent)}>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Confirm Registration
                                            </button>
                                        )}
                                        <button type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowEditModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit"
                                            className="btn btn-primary">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1039 }}></div>
                </>
            )}

            {showDeleteConfirmModal && (
                <>
                    <div className={`modal fade show`}
                        style={{ display: 'block' }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="deleteConfirmModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="deleteConfirmModalLabel">Archive Student</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteConfirmModal(false)}
                                        disabled={isProcessing}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to archive this student? The student will no longer appear in the tables.
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteConfirmModal(false)}
                                        disabled={isProcessing}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-danger"
                                        onClick={confirmArchive}
                                        disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Archiving...
                                            </>
                                        ) : (
                                            'Archive'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {showConfirmRegistrationModal && (
                <>
                    <div className={`modal fade show`}
                        style={{ display: 'block' }}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby="confirmRegistrationModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="confirmRegistrationModalLabel">Confirm Registration</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowConfirmRegistrationModal(false)}
                                        disabled={isProcessing}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to confirm this student's registration?
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowConfirmRegistrationModal(false)}
                                        disabled={isProcessing}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-success"
                                        onClick={confirmRegistration}
                                        disabled={isProcessing}>
                                        {isProcessing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Confirming...
                                            </>
                                        ) : (
                                            'Confirm'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {showSaveConfirmModal && (
                <>
                    <div className={`modal fade show`}
                        style={{
                            display: 'block',
                            zIndex: 1060
                        }}
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
                                        disabled={isProcessing}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to save these changes?
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowSaveConfirmModal(false)}
                                        disabled={isProcessing}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-primary"
                                        onClick={handleSaveConfirm}
                                        disabled={isProcessing}>
                                        {isProcessing ? (
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
                    <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
                </>
            )}

            {/* Confirmation Modal */}
            <div className="modal fade admin-modal" id="confirmationModal" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmationModalTitle">Confirm Action</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-question-circle text-warning modal-icon" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3" id="confirmationModalBody">Are you sure you want to proceed?</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                id="confirmActionBtn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
                                <p className="mt-3" id="successModalBody">Operation completed successfully!</p>
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

export default AdminAccountManagement;
