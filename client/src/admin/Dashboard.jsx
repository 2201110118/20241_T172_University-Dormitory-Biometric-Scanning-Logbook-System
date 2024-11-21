import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';

function AdminDashboard() {
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState([]);
    const [messages, setMessages] = useState([]);

    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/log/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setLogs(sortedData);
        } catch (error) {
            console.error(`Error fetching logs: ${error}`);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/student/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/message");
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Fetched messages:', data); // Debug log
            const sortedData = data.sort((a, b) => new Date(b.requestStatus.requestDate) - new Date(a.requestStatus.requestDate));
            setMessages(sortedData);
        } catch (error) {
            console.error(`Error fetching messages: ${error}`);
        }
    }

    useEffect(() => {
        fetchLogs();
        fetchStudents();
        fetchMessages();
    }, []);

    // Define columns for each table
    const logColumns = [
        {
            name: 'Log ID',
            selector: row => row.logid,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: true,
            width: '120px',
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ?
                    `${student.fullname.firstname} ${student.fullname.lastname}` :
                    'N/A';
            },
            sortable: true,
            width: '200px',
        },
        {
            name: 'Room Number',
            selector: row => row.student?.roomnumber || 'N/A',
            sortable: true,
            width: '120px',
        },
        {
            name: 'Log Type',
            selector: row => row.logType,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Timestamp',
            selector: row => row.timestamp,
            sortable: true,
            width: '200px',
        }
    ];

    const messageColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid,
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ?
                    `${student.fullname.firstname} ${student.fullname.lastname}` :
                    'N/A';
            },
            sortable: true,
        },
        {
            name: 'Room Number',
            selector: row => row.student?.roomnumber || 'N/A',
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
    ];

    // Columns for registered students
    const registeredStudentColumns = [
        {
            name: 'ID',
            selector: row => row.studentid,
            sortable: true,
            width: '80px',
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname.firstname} ${row.fullname.lastname}`,
            sortable: true,
            width: '200px',
        },
        {
            name: 'Gmail Account',
            selector: row => row.gmail,
            sortable: true,
            width: '250px',
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber ? row.roomnumber : 'Not assigned',
            sortable: true,
            width: '120px',
        },
        {
            name: 'Verification Date',
            selector: row => {
                const date = row.accountStatus?.verificationDate;
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },
            sortable: true,
            width: '200px',
            wrap: true,
            style: {
                whiteSpace: 'pre-wrap'
            }
        }
    ];

    // Columns for unregistered students
    const unregisteredStudentColumns = [
        {
            name: 'ID',
            selector: row => row.studentid,
            sortable: true,
            width: '80px',
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname.firstname} ${row.fullname.lastname}`,
            sortable: true,
            width: '200px',
        },
        {
            name: 'Gmail Account',
            selector: row => row.gmail,
            sortable: true,
            width: '250px',
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber ? row.roomnumber : 'Not assigned',
            sortable: true,
            width: '120px',
        },
        {
            name: 'Submission Date',
            selector: row => {
                const date = row.accountStatus?.submissionDate;
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },
            sortable: true,
            width: '200px',
            wrap: true,
            style: {
                whiteSpace: 'pre-wrap'
            }
        }
    ];

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'white',
            },
        },
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
                fontSize: '0.9rem',
            },
        },
        cells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '4px',
                paddingBottom: '4px',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap'
            },
        },
        subHeader: {
            style: {
                padding: '0px',
                marginBottom: '8px',
            },
        },
    };

    // Fix the filter functions for students
    const getRegisteredStudents = () => {
        return students.filter(student => student.registeredaccount);
    };

    const getUnregisteredStudents = () => {
        return students.filter(student => !student.registeredaccount);
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
                                to="/"
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
                        <li className="nav-item border-bottom border-white">
                            <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Dashboard</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom border-white">
                            <Link to="/AdminAccountManagement" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6 text-start">Account Management</span>
                            </Link>
                        </li>
                        <li className="nav-item border-bottom border-white">
                            <Link to="/AdminMessageRequest" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Message Request</span>
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
                                <span className="ms-2 fw-bold fs-6">Report Logs</span>
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

                <main className="container-fluid px-4"
                    style={{
                        flex: 1,
                        marginLeft: "275px",
                        marginTop: "20px"
                    }}>
                    <div className="col">
                        <h2 className="my-4">Dashboard</h2>

                        {/* First Row - Recent Logs and Night Pass Request */}
                        <div className="row mb-4">
                            {/* Recent Logs */}
                            <div className="col-6">
                                <div className="border-3 border-bottom border-black mt-2"></div>
                                <h4 className="mt-3 mb-2 fw-normal">Recent Logs</h4>
                                <DataTable
                                    className="mb-3 border"
                                    columns={logColumns}
                                    data={logs.slice(0, 5)}
                                    customStyles={customStyles}
                                    pagination={false}
                                    responsive
                                    striped
                                    highlightOnHover
                                    noDataComponent="No logs found"
                                    dense
                                />
                            </div>

                            {/* Recent Night Pass Request */}
                            <div className="col-6">
                                <div className="border-3 border-bottom border-black mt-2"></div>
                                <h4 className="mt-3 mb-2 fw-normal">Recent Night Pass Request</h4>
                                <DataTable
                                    className="mb-3 border"
                                    columns={messageColumns}
                                    data={messages.filter(message => !message.requestStatus.isConfirmed).slice(0, 3)}
                                    customStyles={customStyles}
                                    pagination={false}
                                    responsive
                                    striped
                                    highlightOnHover
                                    noDataComponent="No unconfirmed message requests found"
                                    dense
                                />
                            </div>
                        </div>

                        {/* Second Row - Recent Registered and Registration Requests */}
                        <div className="row mb-4">
                            {/* Recent Registered Students */}
                            <div className="col-6">
                                <div className="border-3 border-bottom border-black mt-2"></div>
                                <h4 className="mt-3 mb-2 fw-normal">Recent Registered Students</h4>
                                <DataTable
                                    className="mb-3 border"
                                    columns={registeredStudentColumns}
                                    data={getRegisteredStudents().slice(0, 3)}
                                    customStyles={customStyles}
                                    pagination={false}
                                    responsive
                                    striped
                                    highlightOnHover
                                    noDataComponent="No registered students found"
                                    dense
                                />
                            </div>

                            {/* Recent Registration Requests */}
                            <div className="col-6">
                                <div className="border-3 border-bottom border-black mt-2"></div>
                                <h4 className="mt-3 mb-2 fw-normal">Recent Registration Requests</h4>
                                <DataTable
                                    className="mb-3 border"
                                    columns={unregisteredStudentColumns}
                                    data={getUnregisteredStudents().slice(0, 3)}
                                    customStyles={customStyles}
                                    pagination={false}
                                    responsive
                                    striped
                                    highlightOnHover
                                    noDataComponent="No Registration Request found"
                                    dense
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default AdminDashboard;
