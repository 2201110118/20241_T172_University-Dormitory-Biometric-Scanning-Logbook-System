import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

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
                <nav className="sidebar bg-dark" style={{ width: "250px", height: "100vh", position: "sticky", top: 0 }}>
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
                <main className="container-fluid px-4" style={{ flex: 1 }}>
                    <div className="col">
                        <h2 className="my-4">Dashboard</h2>
                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <h4 className="mt-3 mb-2 fw-normal">Recent Logs</h4>
                        <div className="table-responsive">
                            {logs.length === 0 ? (
                                <p>No logs found</p>
                            ) : (
                                <table className="table table-striped table-bordered">
                                    <thead className="text-center border-dark">
                                        <tr>
                                            <th scope="col">Log ID</th>
                                            <th scope="col">Full Name</th>
                                            <th scope="col">Student ID</th>
                                            <th scope="col">Room Number</th>
                                            <th scope="col">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.slice(0, 5).map((log) => (
                                            <tr key={log.logid}>
                                                <td>{log.logid}</td>
                                                <td>{log.fullname}</td>
                                                <td>{log.studentid}</td>
                                                <td>{log.roomnumber}</td>
                                                <td>{new Date(log.date).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <div className="col">
                            <h4 className="mb-2 mt-3 fw-normal">Recent Night Pass Request</h4>
                            <div className="table-responsive">
                                {messages.filter((message) => !message.confirmedRequest).slice(0, 3).length === 0 ? (
                                    <p>No unconfirmed message requests found</p>
                                ) : (
                                    <table className="table table-striped table-bordered">
                                        <thead className="text-center border-dark">
                                            <tr>
                                                <th>Message ID</th>
                                                <th>Student ID</th>
                                                <th>Full Name</th>
                                                <th>Room Number</th>
                                                <th>Date</th>
                                                <th>Confirmed Request</th>
                                            </tr>
                                        </thead>
                                        <tbody className="align-middle">
                                            {messages
                                                .filter((message) => !message.confirmedRequest)
                                                .slice(0, 5)
                                                .map((message) => (
                                                    <tr key={message._id}>
                                                        <td>{message.messageid}</td>
                                                        <td>{message.studentid}</td>
                                                        <td>{`${message.fullname[0]?.firstname} ${message.fullname[0]?.lastname}`}</td>
                                                        <td>{message.roomnumber || "N/A"}</td>
                                                        <td>{message.date}</td>
                                                        <td>{message.confirmedRequest ? "Yes" : "No"}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <h4 className="fw-normal mb-2 mt-3">Recent Registered Student</h4>
                        <div className="col">
                            <div className="table-responsive">
                                {registeredStudents.length === 0 ? (
                                    <p>No registered students found</p>
                                ) : (
                                    <table className="table table-striped table-bordered">
                                        <thead className="text-center border-dark">
                                            <tr>
                                                <th>ID</th>
                                                <th>Full Name</th>
                                                <th>Gmail Account</th>
                                                <th>Room Number</th>
                                            </tr>
                                        </thead>
                                        <tbody className="align-middle">
                                            {registeredStudents.slice(0, 3).map((student) => (
                                                <tr key={student.studentid}>
                                                    <td>{student.studentid}</td>
                                                    <td>{`${student.fullname[0]?.firstname} ${student.fullname[0]?.lastname}`}</td>
                                                    <td>{student.gmail}</td>
                                                    <td>{student.roomnumber}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                        <div className="border-3 border-bottom border-black mt-2"></div>
                        <div className="col">
                            <h4 className="mt-3 mb-2 fw-normal">Recent Registration Request</h4>
                            <div className="table-responsive">
                                {unregisteredStudents.length === 0 ? (
                                    <p>No Registration Request found</p>
                                ) : (
                                    <table className="table table-striped table-bordered">
                                        <thead className="text-center border-dark">
                                            <tr>
                                                <th>ID</th>
                                                <th>Full Name</th>
                                                <th>Gmail Account</th>
                                            </tr>
                                        </thead>
                                        <tbody className="align-middle">
                                            {unregisteredStudents.slice(0, 3).map((student) => (
                                                <tr key={student.studentid}>
                                                    <td>{student.studentid}</td>
                                                    <td>{`${student.fullname[0]?.firstname} ${student.fullname[0]?.lastname}`}</td>
                                                    <td>{student.gmail}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default AdminDashboard;
