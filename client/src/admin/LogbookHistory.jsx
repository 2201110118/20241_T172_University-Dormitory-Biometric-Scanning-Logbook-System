import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import TableLoader from '../components/TableLoader';
import customTableStyles from '../components/TableStyles';
import AdminHeader from '../components/AdminHeader';

function AdminLogbookHistory() {
    const [logs, setLogs] = useState([]);
    const [filterFirstName, setFilterFirstName] = useState('');
    const [filterLastName, setFilterLastName] = useState('');
    const [filterStudentId, setFilterStudentId] = useState('');
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/log/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setLogs(sortedData);
        } catch (error) {
            console.error(`Error fetching logs: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const openDeleteModal = (logid) => {
        console.log('Opening delete modal for log ID:', logid);
        setLogToDelete(logid);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        console.log('Attempting to archive log ID:', logToDelete);
        try {
            const response = await fetch(`http://localhost:5000/api/log/${logToDelete}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archive: true })
            });

            if (!response.ok) {
                console.error('Archive response not OK:', response);
                throw new Error('Failed to archive log');
            }

            console.log('Log successfully archived, fetching updated logs...');
            await fetchLogs();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error in handleArchive:', error);
        }
    };

    const columns = [
        {
            name: 'Log ID',
            selector: row => row.logid,
            sortable: true,
            width: '8%',
        },
        {
            name: 'Student ID',
            selector: row => row.student?.studentid || 'N/A',
            sortable: true,
            width: '12%',
        },
        {
            name: 'Full Name',
            selector: row => {
                const student = row.student;
                return student ? `${student.fullname.firstname} ${student.fullname.lastname}` : 'N/A';
            },
            sortable: true,
            width: '20%',
        },
        {
            name: 'Room Number',
            selector: row => row.student?.roomnumber || 'N/A',
            sortable: true,
            width: '12%',
        },
        {
            name: 'Log Type',
            selector: row => row.logType,
            sortable: true,
            width: '12%',
        },
        {
            name: 'Date',
            selector: row => row.timestamp?.date || 'N/A',
            sortable: true,
            width: '12%',
        },
        {
            name: 'Time',
            selector: row => row.timestamp?.time || 'N/A',
            sortable: true,
            width: '12%',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end">
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openDeleteModal(row.logid)}
                    >
                        <i className="bi bi-archive-fill" />
                    </button>
                </div>
            ),
            width: '12%',
            right: true,
        }
    ];

    const filteredData = logs.filter(item => {
        const studentFirstName = item.student?.fullname?.firstname?.toLowerCase() || '';
        const studentLastName = item.student?.fullname?.lastname?.toLowerCase() || '';
        const studentId = item.student?.studentid?.toString() || '';

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

        const matchesName =
            (filterFirstName === '' || studentFirstName.includes(filterFirstName.toLowerCase())) &&
            (filterLastName === '' || studentLastName.includes(filterLastName.toLowerCase()));
        const matchesStudentId = !filterStudentId || studentId.includes(filterStudentId);
        const matchesDate = !filterDate || logDate === filterDate;

        return matchesName && matchesStudentId && matchesDate;
    });

    useEffect(() => {
        if (showDeleteModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDeleteModal]);

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
                                    <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
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
                                    <h2 className="mb-0 fw-bold">Logbook History</h2>
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
                                    {/* Total Logs */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Total Logs</h6>
                                                        <h3 className="mb-0">{logs.length}</h3>
                                                    </div>
                                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-journal-text text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Today's Logs */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Today's Logs</h6>
                                                        <h3 className="mb-0">
                                                            {logs.filter(log => {
                                                                const today = new Date().toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit'
                                                                });
                                                                return today === log.timestamp?.date;
                                                            }).length}
                                                        </h3>
                                                    </div>
                                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                                        <i className="bi bi-calendar-check text-success" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Logs */}
                                    <div className="col-xl-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="text-muted mb-2">Recent Logs</h6>
                                                        <h3 className="mb-0">
                                                            {logs.filter(log => {
                                                                const lastWeek = new Date();
                                                                lastWeek.setDate(lastWeek.getDate() - 7);
                                                                const lastWeekStr = lastWeek.toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit'
                                                                });
                                                                return log.timestamp?.date >= lastWeekStr;
                                                            }).length}
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
                                                        placeholder="First Name"
                                                        value={filterFirstName}
                                                        onChange={e => setFilterFirstName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Last Name"
                                                        value={filterLastName}
                                                        onChange={e => setFilterLastName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Student ID"
                                                        value={filterStudentId}
                                                        onChange={e => setFilterStudentId(e.target.value)}
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
                                                        type="button"
                                                        onClick={() => {
                                                            setFilterFirstName('');
                                                            setFilterLastName('');
                                                            setFilterStudentId('');
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
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
                                    <h5 className="modal-title" id="deleteModalLabel">Confirm Archive</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to archive this log? The log will no longer appear in the tables.
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-primary"
                                        onClick={handleDelete}>
                                        Archive
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </>
    );
}

export default AdminLogbookHistory;
