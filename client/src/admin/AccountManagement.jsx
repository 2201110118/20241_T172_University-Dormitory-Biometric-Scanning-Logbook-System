import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';

function AdminAccountManagement() {
    const [, setStudents] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [unregisteredStudents, setUnregisteredStudents] = useState([]);

    const [registeredInputs, setRegisteredInputs] = useState({
        studentid: '',
        firstname: '',
        lastname: '',
        gmail: '',
        roomnumber: ''
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
        roomnumber: ''
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
        firstname: '',
        lastname: '',
        gmail: '',
        roomnumber: '',
        familycontactnumber: '',
        familycontactgmail: '',
        guardiancontactnumber: '',
        guardiancontactgmail: '',
        friendcontactnumber: '',
        friendcontactgmail: ''
    });

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/student/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setStudents(data);

            const registered = data.filter(student => student.registeredaccount);
            const unregistered = data.filter(student => !student.registeredaccount);

            setRegisteredStudents(registered);
            setUnregisteredStudents(unregistered);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (studentid) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this student?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/student/${studentid}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete student');
            fetchStudents();
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
            const firstname = student.fullname[0]?.firstname.toLowerCase() || '';
            const lastname = student.fullname[0]?.lastname.toLowerCase() || '';
            const gmail = student.gmail.toLowerCase();
            const roomnumber = student.roomnumber?.toString() || '';

            return studentid.includes(activeRegisteredFilters.studentid.toLowerCase()) &&
                firstname.includes(activeRegisteredFilters.firstname.toLowerCase()) &&
                lastname.includes(activeRegisteredFilters.lastname.toLowerCase()) &&
                gmail.includes(activeRegisteredFilters.gmail.toLowerCase()) &&
                roomnumber.includes(activeRegisteredFilters.roomnumber.toLowerCase());
        });
    };

    const getFilteredUnregisteredStudents = () => {
        return unregisteredStudents.filter(student => {
            const studentid = student.studentid?.toString() || '';
            const firstname = student.fullname[0]?.firstname.toLowerCase() || '';
            const lastname = student.fullname[0]?.lastname.toLowerCase() || '';
            const gmail = student.gmail.toLowerCase();

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
        setEditingStudent(student);
        setEditForm({
            firstname: student.fullname[0]?.firstname || '',
            lastname: student.fullname[0]?.lastname || '',
            gmail: student.gmail || '',
            roomnumber: student.roomnumber || '',
            familycontactnumber: student.contactNumbers[0]?.familycontactnumber || '',
            familycontactgmail: student.contactNumbers[0]?.familycontactgmail || '',
            guardiancontactnumber: student.contactNumbers[0]?.guardiancontactnumber || '',
            guardiancontactgmail: student.contactNumbers[0]?.guardiancontactgmail || '',
            friendcontactnumber: student.contactNumbers[0]?.friendcontactnumber || '',
            friendcontactgmail: student.contactNumbers[0]?.friendcontactgmail || ''
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

        try {
            const updatedData = {
                fullname: [{
                    firstname: editForm.firstname,
                    lastname: editForm.lastname
                }],
                gmail: editForm.gmail,
                roomnumber: editForm.roomnumber || null,
                contactNumbers: [{
                    familycontactnumber: editForm.familycontactnumber || null,
                    familycontactgmail: editForm.familycontactgmail || '',
                    guardiancontactnumber: editForm.guardiancontactnumber || null,
                    guardiancontactgmail: editForm.guardiancontactgmail || '',
                    friendcontactnumber: editForm.friendcontactnumber || null,
                    friendcontactgmail: editForm.friendcontactgmail || ''
                }]
            };

            const response = await fetch(`http://localhost:5000/api/student/${editingStudent._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Failed to update student');

            await fetchStudents(); // Refresh the table
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Failed to update student');
        }
    };

    const registeredColumns = [
        {
            name: 'ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname[0]?.firstname} ${row.fullname[0]?.lastname}`,
            sortable: true,
        },
        {
            name: 'Gmail Account',
            selector: row => row.gmail,
            sortable: true,
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <>
                    <button
                        className="btn btn-info btn-sm me-2"
                        title="View student full details"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-white" />
                    </button>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        title="Edit student details"
                        onClick={() => handleEditClick(row)}
                    >
                        <i className="bi bi-pencil-square text-white" />
                    </button>
                    <button className="btn btn-danger btn-sm" title="Delete student account"
                        onClick={() => handleDelete(row.studentid)}>
                        <i className="bi bi-trash2-fill text-white" />
                    </button>
                </>
            ),
        },
    ];

    const unregisteredColumns = [
        {
            name: "ID",
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname[0]?.firstname} ${row.fullname[0]?.lastname}`,
            sortable: true,
        },
        {
            name: 'Gmail Account',
            selector: row => row.gmail,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <>
                    <button
                        className="btn btn-info btn-sm me-2"
                        title="View student full details"
                        onClick={() => handleInfoClick(row)}
                    >
                        <i className="bi bi-info-circle-fill text-white" />
                    </button>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        title="Edit student details"
                        onClick={() => handleEditClick(row)}
                    >
                        <i className="bi bi-pencil-square text-white" />
                    </button>
                    <button className="btn btn-danger btn-sm" title="Delete student account"
                        onClick={() => handleDelete(row.studentid)}>
                        <i className="bi bi-trash2-fill text-white" />
                    </button>
                </>
            ),
        },
    ];

    return (
        <>
            <header className="navbar border-dark border-bottom shadow container-fluid sticky-top bg-white">
                <div className="container-fluid">
                    <Link href="">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/8/86/Shield_logo_of_Bukidnon_State_University.png"
                            alt="Buksu Logo"
                            width="48"
                            height="48"
                        />
                    </Link>
                    <Link href="#" className="multiline-text ms-1 text-decoration-none fw-bold fs-5" style={{ lineHeight: "1.1rem" }}>
                        <span style={{ color: "#0056b3" }}>Buksu</span>
                        <br />
                        <span style={{ color: "#003366" }}>Mahogany Dormitory</span>
                    </Link>
                    <ul className="ms-auto navbar-nav flex-row">
                        <li className="nav-item">
                            <Link href="#" style={{ color: "inherit" }}>
                                <i className="bi bi-bell-fill me-4" style={{ fontSize: "1.56rem" }} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="#" style={{ color: "inherit" }}>
                                <i className="bi bi-info-circle-fill me-4" style={{ fontSize: "1.56rem" }} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="btn btn-outline-dark text-center border-2">
                                Sign out <i className="bi bi-door-open-fill" style={{ fontSize: "1rem" }} />
                            </Link>
                        </li>
                    </ul>
                </div>
            </header>

            <div className="container-fluid d-flex row">
                <nav className="sidebar bg-dark fixed-top" style={{ width: "250px", height: "100vh", marginTop: "64px" }}>
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
                            <Link to="#" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Setting</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <main className="container-fluid px-4" style={{ flex: 1, marginLeft: "275px" }}>
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
                        <div className="col-auto">
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    setRegisteredInputs({
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        gmail: '',
                                        roomnumber: ''
                                    });
                                    setActiveRegisteredFilters({
                                        studentid: '',
                                        firstname: '',
                                        lastname: '',
                                        gmail: '',
                                        roomnumber: ''
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
                        className="border"
                        columns={unregisteredColumns}
                        data={getFilteredUnregisteredStudents()}
                        pagination
                        responsive
                        highlightOnHover
                        striped
                        noDataComponent="No unregistered students found"
                    />
                </main>
            </div>

            {showModal && selectedStudent && (
                <>
                    <div
                        className="modal show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                    >
                        <div className="modal-dialog modal-lg" style={{ zIndex: 1055 }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Student Information</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <h6 className="fw-bold">Basic Information</h6>
                                            <p><strong>Student ID:</strong> {selectedStudent.studentid}</p>
                                            <p><strong>Name:</strong> {selectedStudent.fullname[0]?.firstname} {selectedStudent.fullname[0]?.lastname}</p>
                                            <p><strong>Gmail:</strong> {selectedStudent.gmail}</p>
                                            <p><strong>Room Number:</strong> {selectedStudent.roomnumber || 'Not assigned'}</p>
                                            <p><strong>Registration Status:</strong> {selectedStudent.registeredaccount ? 'Registered' : 'Unregistered'}</p>
                                            <p><strong>Registration Date:</strong> {selectedStudent.date}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="fw-bold">Contact Information</h6>
                                            <div className="mb-3">
                                                <p className="mb-1"><strong>Family Contact:</strong></p>
                                                <p className="mb-1">Number: {selectedStudent.contactNumbers[0]?.familycontactnumber || 'N/A'}</p>
                                                <p>Email: {selectedStudent.contactNumbers[0]?.familycontactgmail || 'N/A'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <p className="mb-1"><strong>Guardian Contact:</strong></p>
                                                <p className="mb-1">Number: {selectedStudent.contactNumbers[0]?.guardiancontactnumber || 'N/A'}</p>
                                                <p>Email: {selectedStudent.contactNumbers[0]?.guardiancontactgmail || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><strong>Friend Contact:</strong></p>
                                                <p className="mb-1">Number: {selectedStudent.contactNumbers[0]?.friendcontactnumber || 'N/A'}</p>
                                                <p>Email: {selectedStudent.contactNumbers[0]?.friendcontactgmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showEditModal && editingStudent && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                >
                    <div className="modal-dialog modal-lg" style={{ zIndex: 1055 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Student Information</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                />
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <h6 className="fw-bold">Basic Information</h6>
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
                                                    name="familycontactnumber"
                                                    value={editForm.familycontactnumber}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Family Contact Gmail</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="familycontactgmail"
                                                    value={editForm.familycontactgmail}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Guardian Contact Number</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="guardiancontactnumber"
                                                    value={editForm.guardiancontactnumber}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Guardian Contact Gmail</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="guardiancontactgmail"
                                                    value={editForm.guardiancontactgmail}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Friend Contact Number</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="friendcontactnumber"
                                                    value={editForm.friendcontactnumber}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Friend Contact Gmail</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="friendcontactgmail"
                                                    value={editForm.friendcontactgmail}
                                                    onChange={handleEditFormChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminAccountManagement;
