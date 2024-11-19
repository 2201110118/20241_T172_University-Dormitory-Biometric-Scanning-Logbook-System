import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';

function AdminDashboard() {
    const [logs, setLogs] = useState([]);
    const [, setStudents] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [unregisteredStudents, setUnregisteredStudents] = useState([]);
    const [messages, setMessages] = useState([]);

    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/log/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
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

            const registered = data.filter(student => student.registeredaccount);
            const unregistered = data.filter(student => !student.registeredaccount);

            setRegisteredStudents(registered);
            setUnregisteredStudents(unregistered);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/message");
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMessages(sortedData);
        } catch (error) {
            console.error(`Error fetching logs: ${error}`);
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
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname[0].firstname} ${row.fullname[0].lastname}`,
            sortable: true,
        },
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber,
            sortable: true,
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
        },
    ];

    const messageColumns = [
        {
            name: 'Message ID',
            selector: row => row.messageid,
            sortable: true,
        },
        {
            name: 'Student ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname[0].firstname} ${row.fullname[0].lastname}`,
            sortable: true,
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber || "N/A",
            sortable: true,
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.confirmedRequest ? "Yes" : "No",
            sortable: true,
        },
    ];

    const registeredStudentColumns = [
        {
            name: 'ID',
            selector: row => row.studentid,
            sortable: true,
        },
        {
            name: 'Full Name',
            selector: row => `${row.fullname[0].firstname} ${row.fullname[0].lastname}`,
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
                paddingTop: '2px',
                paddingBottom: '2px',
                fontSize: '0.875rem',
            },
        },
        subHeader: {
            style: {
                padding: '0px',
                marginBottom: '8px',
            },
        },
    };

    return (
        <>
            <header className="navbar border-dark border-bottom shadow container-fluid sticky-top bg-white">
                <div className="container-fluid">
                    <Link to="/">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/8/86/Shield_logo_of_Bukidnon_State_University.png"
                            alt="Buksu Logo"
                            width="48"
                            height="48"
                        />
                    </Link>
                    <Link to="/" className="multiline-text ms-1 text-decoration-none fw-bold fs-5" style={{ lineHeight: "1.1rem" }}>
                        <span style={{ color: "#0056b3" }}>Buksu</span>
                        <br />
                        <span style={{ color: "#003366" }}>Mahogany Dormitory</span>
                    </Link>
                    <ul className="ms-auto navbar-nav flex-row">
                        <li className="nav-item">
                            <Link to="#" style={{ color: "inherit" }}>
                                <i className="bi bi-bell-fill me-4" style={{ fontSize: "1.56rem" }} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="#" style={{ color: "inherit" }}>
                                <i className="bi bi-info-circle-fill me-4" style={{ fontSize: "1.56rem" }} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="#" className="btn btn-outline-dark text-center border-2">
                                Sign out <i className="bi bi-door-open-fill" style={{ fontSize: "1rem" }} />
                            </Link>
                        </li>
                    </ul>
                </div>
            </header>

            <div className="container-fluid d-flex row">
                <nav className="sidebar bg-dark fixed-top" style={{ width: "250px", height: "100vh", marginTop: "64px" }}>
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
                            <Link to="#" className="nav-link my-1 mx-2 d-flex align-items-center">
                                <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                <span className="ms-2 fw-bold fs-6">Setting</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <main className="container-fluid px-4" style={{ flex: 1, marginLeft: "275px" }}>
                    <div className="col">
                        <h2 className="my-4">Dashboard</h2>
                        <div className="border-3 border-bottom border-black mt-2"></div>

                        <h4 className="mt-3 mb-2 fw-normal">Recent Logs</h4>
                        <DataTable
                            className="mb-5 border"
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

                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <h4 className="mb-2 mt-3 fw-normal">Recent Night Pass Request</h4>
                        <DataTable
                            className="mb-5 border"
                            columns={messageColumns}
                            data={messages.filter(message => !message.confirmedRequest).slice(0, 3)}
                            customStyles={customStyles}
                            pagination={false}
                            responsive
                            striped
                            highlightOnHover
                            noDataComponent="No unconfirmed message requests found"
                            dense
                        />

                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <h4 className="fw-normal mb-2 mt-3">Recent Registered Student</h4>
                        <DataTable
                            className="mb-5 border"
                            columns={registeredStudentColumns}
                            data={registeredStudents.slice(0, 3)}
                            customStyles={customStyles}
                            pagination={false}
                            responsive
                            striped
                            highlightOnHover
                            noDataComponent="No registered students found"
                            dense
                        />

                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <h4 className="mt-3 mb-2 fw-normal">Recent Registration Request</h4>
                        <DataTable
                            className="mb-5 border"
                            columns={registeredStudentColumns}
                            data={unregisteredStudents.slice(0, 3)}
                            customStyles={customStyles}
                            pagination={false}
                            responsive
                            striped
                            highlightOnHover
                            noDataComponent="No Registration Request found"
                            dense
                        />
                    </div>
                </main>
            </div >
        </>
    );
}

export default AdminDashboard;
