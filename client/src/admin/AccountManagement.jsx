import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';

function AdminAccountManagement() {
    const [students, setStudents] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [unregisteredStudents, setUnregisteredStudents] = useState([]);

    const [registeredInputs, setRegisteredInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        roomnumber: '',
        verificationDate: ''
    });

    const [unregisteredInputs, setUnregisteredInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: ''
    });

    const [activeRegisteredFilters, setActiveRegisteredFilters] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        roomnumber: '',
        verificationDate: ''
    });

    const [activeUnregisteredFilters, setActiveUnregisteredFilters] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: ''
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

    const fetchStudents = async () => {
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

    const handleDelete = async (studentid) => {
        setStudentToDelete(studentid);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/student/${studentToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete student');

            const result = await response.json();
            console.log(`Student deleted successfully! Related records deleted: Messages: ${result.deletedRecords.messages}, Logs: ${result.deletedRecords.logs}`);

            fetchStudents();
            setShowDeleteConfirmModal(false);
        } catch (error) {
            console.error('Error deleting student:', error);
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

    const getFilteredRegisteredStudents = () => {
        return registeredStudents.filter(student => {
            const studentid = student.studentid?.toString() || '';
            const firstname = student.fullname?.firstname?.toLowerCase() || '';
            const lastname = student.fullname?.lastname?.toLowerCase() || '';
            const gmail = student.gmail?.toLowerCase() || '';
            const roomnumber = student.roomnumber?.toString() || '';
            const verificationDate = student.accountStatus?.verificationDate || '';

            return studentid.includes(activeRegisteredFilters.studentid.toLowerCase()) &&
                firstname.includes(activeRegisteredFilters.firstname.toLowerCase()) &&
                lastname.includes(activeRegisteredFilters.lastname.toLowerCase()) &&
                gmail.includes(activeRegisteredFilters.gmail.toLowerCase()) &&
                roomnumber.includes(activeRegisteredFilters.roomnumber.toLowerCase()) &&
                verificationDate.toLowerCase().includes(activeRegisteredFilters.verificationDate.toLowerCase());
        });
    };

    const getFilteredUnregisteredStudents = () => {
        return unregisteredStudents.filter(student => {
            const studentid = student.studentid?.toString() || '';
            const firstname = student.fullname?.firstname?.toLowerCase() || '';
            const lastname = student.fullname?.lastname?.toLowerCase() || '';
            const gmail = student.gmail?.toLowerCase() || '';

            return studentid.includes(activeUnregisteredFilters.studentid.toLowerCase()) &&
                firstname.includes(activeUnregisteredFilters.firstname.toLowerCase()) &&
                lastname.includes(activeUnregisteredFilters.lastname.toLowerCase()) &&
                gmail.includes(activeUnregisteredFilters.gmail.toLowerCase());
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
        } catch (error) {
            console.error('Error updating student:', error);
        }
    };

    const handleConfirmStudent = async (student) => {
        setStudentToConfirm(student);
        setShowConfirmRegistrationModal(true);
    };

    const confirmRegistration = async () => {
        try {
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
                // Add confirmation data
                registeredaccount: true,
                accountStatus: {
                    isConfirmed: true,
                    verificationDate: currentDate
                }
            };

            // Remove any undefined values
            const cleanedData = JSON.parse(JSON.stringify(updatedData));

            const response = await fetch(`http://localhost:5000/api/student/${studentToConfirm.studentid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData)
            });

            if (!response.ok) {
                throw new Error('Failed to confirm student');
            }

            await fetchStudents();
            setShowEditModal(false);
            setShowConfirmRegistrationModal(false);
            console.log('Student registration has been confirmed successfully!');
        } catch (error) {
            console.error('Error confirming student:', error);
        }
    };

    const registeredColumns = [
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'First Name',
            selector: row => row.fullname?.firstname,
            sortable: true,
        },
        {
            name: 'Last Name',
            selector: row => row.fullname?.lastname,
            sortable: true,
        },
        {
            name: 'Gmail',
            selector: row => row.gmail,
            sortable: true,
        },
        {
            name: 'Room',
            selector: row => row.roomnumber || 'N/A',
            sortable: true,
        },
        {
            name: 'Verification Date',
            selector: row => row.accountStatus?.verificationDate || 'N/A',
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-white" />
                    </button>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEditClick(row)}
                    >
                        <i className="bi bi-pencil-fill text-white" />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(row.studentid)}
                    >
                        <i className="bi bi-trash3-fill" />
                    </button>
                </div>
            ),
            width: '150px',
            allowOverflow: true,
        },
    ];

    const unregisteredColumns = [
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'First Name',
            selector: row => row.fullname?.firstname,
            sortable: true,
        },
        {
            name: 'Last Name',
            selector: row => row.fullname?.lastname,
            sortable: true,
        },
        {
            name: 'Gmail',
            selector: row => row.gmail,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-white" />
                    </button>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEditClick(row)}
                    >
                        <i className="bi bi-pencil-fill text-white" />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(row.studentid)}
                    >
                        <i className="bi bi-trash3-fill" />
                    </button>
                </div>
            ),
            width: '150px',
            allowOverflow: true,
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
                            <Link className="btn btn-outline-dark text-center border-2">
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
                            <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6 text-start">Account Management</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminMessageRequest" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Message Request</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom bordor-white">
                            <Link to="/AdminLogBookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
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
                    <h2 className="my-4">Account Management</h2>
                    <div className="border-3 border-bottom border-black mb-4"></div>
                    <h3 className="my-4 fw-normal">Registered Student Accounts</h3>
                    <div className="row mb-3">
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
                                type="text"
                                placeholder="Room Number"
                                name="roomnumber"
                                value={registeredInputs.roomnumber}
                                onChange={handleRegisteredInputChange}
                            />
                        </div>
                        <div className="col">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Verification Date"
                                name="verificationDate"
                                value={registeredInputs.verificationDate}
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
                                        roomnumber: '',
                                        verificationDate: ''
                                    });
                                    setActiveRegisteredFilters({
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        gmail: '',
                                        roomnumber: '',
                                        verificationDate: ''
                                    });
                                }}
                            >
                                <i className="bi bi-trash2-fill"></i> Clear
                            </button>
                        </div>
                    </div>
                    <DataTable
                        className="border"
                        columns={registeredColumns}
                        data={getFilteredRegisteredStudents()}
                        pagination
                        responsive
                        highlightOnHover
                        striped
                        noDataComponent="No registered students found"
                        dense={false}
                    />

                    <div className="border-bottom border-3 border-black mt-3" />
                    <h3 className="my-4 fw-normal">Unregistered Student Accounts</h3>
                    <div className="row mb-3">
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
                        <div className="col-auto">
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    setUnregisteredInputs({
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        gmail: ''
                                    });
                                    setActiveUnregisteredFilters({
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        gmail: ''
                                    });
                                }}
                            >
                                <i className="bi bi-trash2-fill"></i> Clear
                            </button>
                        </div>
                    </div>
                    <DataTable
                        className="border mb-4"
                        columns={unregisteredColumns}
                        data={getFilteredUnregisteredStudents()}
                        pagination
                        responsive
                        highlightOnHover
                        striped
                        noDataComponent="No unregistered students found"
                        dense={false}
                    />
                </main>
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
                                            {selectedStudent.accountStatus?.verificationDate && (
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
                        aria-labelledby="deleteModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteConfirmModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to delete this student? This action cannot be undone.
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteConfirmModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-danger"
                                        onClick={confirmDelete}>
                                        Delete
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
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to confirm this student's registration?
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowConfirmRegistrationModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-success"
                                        onClick={confirmRegistration}>
                                        Confirm
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
                    <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
                </>
            )}
        </>
    );
}

export default AdminAccountManagement;
