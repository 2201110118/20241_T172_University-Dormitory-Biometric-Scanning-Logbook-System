import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

function AdminLogbookHistory() {
    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState('');

    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/log/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error(`Error fetching logs: ${error}`);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleDelete = async (logid) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this log?");
        if (!isConfirmed) return;
        try {
            const response = await fetch(`http://localhost:5000/api/log/${logid}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete log');
            fetchLogs();
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    return (
        <div>
            <header className="navbar border-dark border-bottom shadow container-fluid sticky-top bg-white">
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
                <nav className="sidebar bg-dark" style={{ width: "250px", height: "100vh", position: "sticky", top: 0 }}>
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
                            <Link to="/AdminLogbookHistory" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
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
                <main className="col ms-sm-auto px-4">
                    <h2 className="mt-4 mb-3">Logbook History</h2>
                    <div className="row">
                        <div className="col mb-3">
                            <input className="form-control" type="text" placeholder="Full Name" />
                        </div>
                        <div className="col mb-3">
                            <input className="form-control" type="text" placeholder="Student ID" />
                        </div>
                        <div className="col mb-3">
                            <input
                                className="form-control"
                                type="date"
                                placeholder="Date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="col mb-3">
                            <input
                                className="form-control"
                                type="time"
                                placeholder="Time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary col-sm-1 mb-3" type="button">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
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
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.logid}>
                                            <td>{log.logid}</td>
                                            <td>{log.fullname}</td>
                                            <td>{log.studentid}</td>
                                            <td>{log.roomnumber}</td>
                                            <td>{new Date(log.date).toLocaleString()}</td>
                                            <td className="text-center">
                                                <button className="btn btn-danger me-2" onClick={() => handleDelete(log.logid)}>
                                                    <i className="bi bi-trash2-fill text-white" style={{ fontSize: "1rem" }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLogbookHistory;
