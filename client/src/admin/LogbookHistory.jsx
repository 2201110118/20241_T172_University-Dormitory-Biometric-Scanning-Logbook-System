import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';

function AdminLogbookHistory() {
    const [logs, setLogs] = useState([]);
    const [filterFirstName, setFilterFirstName] = useState('');
    const [filterLastName, setFilterLastName] = useState('');
    const [filterStudentId, setFilterStudentId] = useState('');
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);

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

    useEffect(() => {
        fetchLogs();
    }, []);

    const openDeleteModal = (logid) => {
        console.log('Opening delete modal for log ID:', logid);
        setLogToDelete(logid);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        console.log('Attempting to delete log ID:', logToDelete);
        try {
            const response = await fetch(`http://localhost:5000/api/log/${logToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                console.error('Delete response not OK:', response);
                throw new Error('Failed to delete log');
            }

            console.log('Log successfully deleted, fetching updated logs...');
            await fetchLogs();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error in handleDelete:', error);
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
                return student ?
                    `${student.fullname.firstname} ${student.fullname.lastname}` :
                    'N/A';
            },
            sortable: true,
            width: '25%',
        },
        {
            name: 'Room Number',
            selector: row => row.student?.roomnumber || 'N/A',
            sortable: true,
            width: '15%',
        },
        {
            name: 'Log Type',
            selector: row => row.logType,
            sortable: true,
            width: '15%',
        },
        {
            name: 'Timestamp',
            selector: row => row.timestamp,
            sortable: true,
            width: '17%',
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex justify-content-end w-100">
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openDeleteModal(row.logid)}
                    >
                        <i className="bi bi-trash2-fill" />
                    </button>
                </div>
            ),
            width: '8%',
            right: true,
        }
    ];

    const filteredData = logs.filter(item => {
        const studentFirstName = item.student?.fullname?.firstname?.toLowerCase() || '';
        const studentLastName = item.student?.fullname?.lastname?.toLowerCase() || '';
        const studentId = item.student?.studentid?.toString() || '';

        const matchesName =
            (filterFirstName === '' || studentFirstName.includes(filterFirstName.toLowerCase())) &&
            (filterLastName === '' || studentLastName.includes(filterLastName.toLowerCase()));
        const matchesStudentId = !filterStudentId || studentId.includes(filterStudentId);
        const matchesDate = !selectedDate || item.timestamp.includes(selectedDate);
        const matchesTime = !selectedTime || item.timestamp.includes(selectedTime);

        return matchesName && matchesStudentId && matchesDate && matchesTime;
    });

    const customStyles = {
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
                borderTop: '1px solid #dee2e6',
            },
        },
        cells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '2px',
                paddingBottom: '2px',
            },
        },
        subHeader: {
            style: {
                padding: '0px',
                marginBottom: '8px',
            },
        },
    };

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
                    <h2 className="mt-4 mb-3">Logbook History</h2>
                    <div className="border-3 border-bottom border-black mb-4"></div>
                    <div className="row">
                        <div className="col mb-3">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="First Name"
                                value={filterFirstName}
                                onChange={e => setFilterFirstName(e.target.value)}
                            />
                        </div>
                        <div className="col mb-3">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Last Name"
                                value={filterLastName}
                                onChange={e => setFilterLastName(e.target.value)}
                            />
                        </div>
                        <div className="col mb-3">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Student ID"
                                value={filterStudentId}
                                onChange={e => setFilterStudentId(e.target.value)}
                            />
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
                        <button
                            className="btn btn-danger col-sm-1 mb-3 me-3"
                            type="button"
                            onClick={() => {
                                setFilterFirstName('');
                                setFilterLastName('');
                                setFilterStudentId('');
                                setSelectedDate('');
                                setSelectedTime('');
                            }}
                        >
                            <i className="bi bi-trash2-fill"></i>
                        </button>
                    </div>

                    <DataTable
                        className="border"
                        columns={columns}
                        data={filteredData}
                        pagination
                        responsive
                        highlightOnHover
                        striped
                        noDataComponent="No logs found"
                        customStyles={customStyles}
                        dense
                    />
                </main>
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
                                    <h5 className="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                                    <button type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                        aria-label="Close">
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to delete this log? This action cannot be undone.
                                </div>
                                <div className="modal-footer">
                                    <button type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button"
                                        className="btn btn-danger"
                                        onClick={handleDelete}>
                                        Delete
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
