import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import AdminHeader from '../components/AdminHeader';

function AdminDashboard() {
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const response = await fetch('http://localhost:5000/api/log/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.timestamp.date) - new Date(a.timestamp.date));
            setLogs(sortedData);
        } catch (error) {
            console.error(`Error fetching logs: ${error}`);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const fetchStudents = async () => {
        setIsLoadingStudents(true);
        try {
            const response = await fetch('http://localhost:5000/api/student/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
            const response = await fetch("http://localhost:5000/api/message");
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Fetched messages:', data); // Debug log
            const sortedData = data.sort((a, b) => new Date(b.requestStatus.requestDate) - new Date(a.requestStatus.requestDate));
            setMessages(sortedData);
        } catch (error) {
            console.error(`Error fetching messages: ${error}`);
        } finally {
            setIsLoadingMessages(false);
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
            sortable: false,
            width: '100px',
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: false,
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
            sortable: false,
            width: '200px',
        },
        {
            name: 'Room Number',
            selector: row => row.student?.roomnumber || 'N/A',
            sortable: false,
            width: '120px',
        },
        {
            name: 'Log Type',
            selector: row => row.logType,
            sortable: false,
            width: '120px',
        },
        {
            name: 'Date',
            selector: row => row.timestamp?.date || 'N/A',
            sortable: false,
            width: '120px',
        },
        {
            name: 'Time',
            selector: row => row.timestamp?.time || 'N/A',
            sortable: false,
            width: '120px',
        }
    ];

    const messageColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: false,
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid,
            sortable: false,
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ?
                    `${student.fullname.firstname} ${student.fullname.lastname}` :
                    'N/A';
            },
            sortable: false,
        },
        {
            name: 'Room Number',
            selector: row => row.student?.roomnumber || 'N/A',
            sortable: false,
        },
        {
            name: 'Request Date',
            selector: row => {
                if (!row.requestStatus.requestDate) return 'N/A';

                // Split the MM/DD/YYYY string
                const [month, day, year] = row.requestStatus.requestDate.split('/');

                // Create date object with explicit values (using local time)
                const date = new Date(year, month - 1, day);  // month is 0-based in JS

                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC'  // Force UTC to prevent timezone shifts
                });
            },
            sortable: false,
        },
        {
            name: 'Status',
            selector: row => row.requestStatus.isConfirmed ? "Confirmed" : "Pending",
            sortable: false,
        },
    ];

    // Columns for registered students
    const registeredStudentColumns = [
        {
            name: 'ID',
            selector: row => row.studentid,
            sortable: false,
            width: '80px',
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname.firstname} ${row.fullname.lastname}`,
            sortable: false,
            width: '200px',
        },
        {
            name: 'Gmail Account',
            selector: row => row.gmail,
            sortable: false,
            width: '250px',
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber ? row.roomnumber : 'Not assigned',
            sortable: false,
            width: '120px',
        },
        {
            name: 'Verification Date',
            selector: row => row.accountStatus?.verificationDate || 'N/A',
            sortable: false,
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
            sortable: false,
            width: '80px',
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname.firstname} ${row.fullname.lastname}`,
            sortable: false,
            width: '200px',
        },
        {
            name: 'Gmail Account',
            selector: row => row.gmail,
            sortable: false,
            width: '250px',
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber ? row.roomnumber : 'Not assigned',
            sortable: false,
            width: '120px',
        },
        {
            name: 'Submission Date',
            selector: row => row.accountStatus?.submissionDate || 'N/A',
            sortable: false,
            width: '200px',
            wrap: true,
            style: {
                whiteSpace: 'pre-wrap'
            }
        }
    ];

    // Fix the filter functions for students
    const getRegisteredStudents = () => {
        return students.filter(student => student.registeredaccount && !student.archive);
    };

    const getUnregisteredStudents = () => {
        return students.filter(student => !student.registeredaccount && !student.archive);
    };

    const getTotalActiveStudents = () => {
        return students.filter(student => !student.archive).length;
    };

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
                                    <Link to="/AdminDashboard" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
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
                                    {/* Total Students Card */}
                                    <div className="col-xl-3 col-md-6">
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

                                    {/* Registered Students Card */}
                                    <div className="col-xl-3 col-md-6">
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

                                    {/* Pending Registrations Card */}
                                    <div className="col-xl-3 col-md-6">
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

                                    {/* Pending Night Passes Card */}
                                    <div className="col-xl-3 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Pending Night Passes</h6>
                                                        <h3 className="mb-0">
                                                            {messages.filter(message => !message.requestStatus.isConfirmed).length}
                                                        </h3>
                                                    </div>
                                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-clock-history text-info" style={{ fontSize: '1.5rem' }}></i>
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
                                                <Link to="/AdminLogBookHistory" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center">
                                                    <i className="bi bi-clock-history me-2"></i>
                                                    <span>View Logbook History</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                <DataTable
                                                    columns={logColumns}
                                                    data={logs.slice(0, 5)}
                                                    customStyles={customTableStyles}
                                                    pagination={false}
                                                    responsive
                                                    striped
                                                    highlightOnHover
                                                    progressPending={isLoadingLogs}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No logs found"
                                                    dense
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Night Pass Requests */}
                                    <div className="col-12 col-xl-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Night Pass Requests</h5>
                                                <Link to="/AdminNightPass" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center">
                                                    <i className="bi bi-chat-left-dots me-2"></i>
                                                    <span>View Night Pass</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                <DataTable
                                                    columns={messageColumns}
                                                    data={messages.filter(message => !message.requestStatus.isConfirmed).slice(0, 3)}
                                                    customStyles={customTableStyles}
                                                    pagination={false}
                                                    responsive
                                                    striped
                                                    highlightOnHover
                                                    progressPending={isLoadingMessages}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No pending requests"
                                                    dense
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Registered Students */}
                                    <div className="col-12 col-xl-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Recent Registered Students</h5>
                                                <Link to="/AdminAccountManagement" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center">
                                                    <i className="bi bi-person-lines-fill me-2"></i>
                                                    <span>View Account Management</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                <DataTable
                                                    columns={registeredStudentColumns}
                                                    data={getRegisteredStudents().slice(0, 3)}
                                                    customStyles={customTableStyles}
                                                    pagination={false}
                                                    responsive
                                                    striped
                                                    highlightOnHover
                                                    progressPending={isLoadingStudents}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No registered students found"
                                                    dense
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Registration Requests */}
                                    <div className="col-12 col-xl-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Recent Registration Requests</h5>
                                                <Link
                                                    to="/AdminAccountManagement?tab=unregistered"
                                                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                >
                                                    <i className="bi bi-person-plus me-2"></i>
                                                    <span>View Registration Requests</span>
                                                </Link>
                                            </div>
                                            <div className="card-body p-0">
                                                <DataTable
                                                    columns={unregisteredStudentColumns}
                                                    data={getUnregisteredStudents().slice(0, 3)}
                                                    customStyles={customTableStyles}
                                                    pagination={false}
                                                    responsive
                                                    striped
                                                    highlightOnHover
                                                    progressPending={isLoadingStudents}
                                                    progressComponent={<TableLoader />}
                                                    noDataComponent="No Registration Request found"
                                                    dense
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

export default AdminDashboard;
