import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import StudentHeader from '../components/StudentHeader';

function StudentLogbookHistory() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [filterLogType, setFilterLogType] = useState('');
    const [showNewLogModal, setShowNewLogModal] = useState(false);
    const [newLog, setNewLog] = useState({
        logType: 'login'
    });
    const [studentId, setStudentId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            // First get the student's ID from the session
            const sessionResponse = await fetch("http://localhost:5000/api/auth/check-session", {
                credentials: 'include'
            });
            const sessionData = await sessionResponse.json();

            if (sessionData.isAuthenticated && sessionData.user) {
                // Then fetch all logs
                const response = await fetch('http://localhost:5000/api/log/');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                // Filter logs for the current student
                const studentLogs = data.filter(log => 
                    log.student?.studentid === sessionData.user.studentid && !log.archive
                );

                const sortedData = studentLogs.sort((a, b) => 
                    new Date(b.timestamp.date) - new Date(a.timestamp.date)
                );
                setLogs(sortedData);
            }
        } catch (error) {
            console.error(`Error fetching logs: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Get student info from session
        fetch('http://localhost:5000/api/auth/check-session', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.isAuthenticated && data.user) {
                    setStudentId(data.user.studentid);
                }
            })
            .catch(error => {
                console.error('Error fetching student info:', error);
            });

        fetchLogs();
    }, []);

    const handleNewLog = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/log/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student: studentId,
                    logType: newLog.logType
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create log');
            }

            await fetchLogs();
            setShowNewLogModal(false);
            setNewLog({ logType: 'login' });
        } catch (error) {
            console.error('Error creating log:', error);
            alert('Failed to create log. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            name: 'Log ID',
            selector: row => row.logid,
            sortable: true,
            width: '20%',
        },
        {
            name: 'Log Type',
            selector: row => row.logType,
            sortable: true,
            width: '20%',
        },
        {
            name: 'Date',
            selector: row => row.timestamp?.date || 'N/A',
            sortable: true,
            width: '20%',
        },
        {
            name: 'Time',
            selector: row => row.timestamp?.time || 'N/A',
            sortable: true,
            width: '20%',
            right: true,
        }
    ];

    const filteredData = logs.filter(item => {
        let logDate = '';
        if (item.timestamp?.date) {
            try {
                const parts = item.timestamp.date.split('/');
                if (parts.length === 3) {
                    const [month, day, year] = parts;
                    logDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
            } catch (error) {
                console.error('Date parsing error:', error);
            }
        }

        const matchesDate = !filterDate || logDate === filterDate;
        const matchesLogType = !filterLogType || item.logType.toLowerCase().includes(filterLogType.toLowerCase());

        return matchesDate && matchesLogType;
    });

    return (
        <>
            <StudentHeader />
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
                                    <Link to="/StudentDashboard" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentNightPass" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Night Pass</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">My Logbook History</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/StudentSettings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Settings</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">My Logbook History</h2>
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-primary me-4"
                                            onClick={() => setShowNewLogModal(true)}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            New Log
                                        </button>
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
                                </div>

                                {/* Logs Table Card */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-transparent border-0 py-3">
                                        <h5 className="mb-0 fw-bold">All Logs</h5>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="p-4 border-bottom">
                                            <div className="row g-3">
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Search by log type..."
                                                        value={filterLogType}
                                                        onChange={e => setFilterLogType(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="date"
                                                        placeholder="Date"
                                                        value={filterDate}
                                                        onChange={(e) => setFilterDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-auto">
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => {
                                                            setFilterLogType('');
                                                            setFilterDate('');
                                                        }}
                                                    >
                                                        <i className="bi bi-trash2-fill"></i> Clear
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <DataTable
                                            columns={columns}
                                            data={filteredData}
                                            pagination
                                            responsive
                                            highlightOnHover
                                            striped
                                            progressPending={isLoading}
                                            progressComponent={<TableLoader />}
                                            noDataComponent="No logs found"
                                            customStyles={customTableStyles}
                                            dense
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Log Modal */}
            {showNewLogModal && (
                <>
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Create New Log</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowNewLogModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Log Type</label>
                                        <select
                                            className="form-select"
                                            value={newLog.logType}
                                            onChange={(e) => setNewLog({ ...newLog, logType: e.target.value })}
                                        >
                                            <option value="login">Login</option>
                                            <option value="logout">Logout</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer flex-column">
                                    <div className="d-flex w-100 justify-content-end mb-3">
                                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowNewLogModal(false)}>Cancel</button>
                                        <button
                                            type="button"
                                            className="btn btn-primary d-flex align-items-center"
                                            onClick={handleNewLog}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Log'
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-muted small w-100 text-center">
                                        <i className="bi bi-info-circle me-1"></i>
                                        This is a temporary feature for testing purposes
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}
        </>
    );
}

export default StudentLogbookHistory;