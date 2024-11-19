import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';

function AdminMessageRequest() {
    const [messages, setMessages] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState('');
    const [filterText, setFilterText] = useState('');
    const [filterTextNo, setFilterTextNo] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [studentIdFilter, setStudentIdFilter] = useState('');
    const [studentIdFilterNo, setStudentIdFilterNo] = useState('');
    const [firstNameFilter, setFirstNameFilter] = useState('');
    const [lastNameFilter, setLastNameFilter] = useState('');
    const [firstNameFilterNo, setFirstNameFilterNo] = useState('');
    const [lastNameFilterNo, setLastNameFilterNo] = useState('');

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
        fetchMessages();
    }, []);

    const confirmedYesMessages = messages.filter((message) => message.confirmedRequest);
    const confirmedNoMessages = messages.filter((message) => !message.confirmedRequest);

    const handleDelete = async (messageid) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this message?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/message/${messageid}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete message');

            const updatedMessages = await fetch("http://localhost:5000/api/message")
                .then((response) => response.json())
                .catch((error) => console.error("Error fetching updated messages:", error));

            setMessages(updatedMessages);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleAccept = async (messageid) => {
        const isConfirmed = window.confirm("Are you sure you want to confirm this request?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/message/${messageid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmedRequest: true })
            });

            if (!response.ok) throw new Error('Failed to update message status');

            fetchMessages();
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    };

    const columns = [
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
            selector: row => `${row.fullname[0]?.firstname} ${row.fullname[0]?.lastname}`,
            sortable: true,
        },
        {
            name: 'Room Number',
            selector: row => row.roomnumber || 'N/A',
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
        {
            name: 'Actions',
            cell: row => (
                <div>
                    {!row.confirmedRequest && (
                        <button
                            className="btn btn-success btn-sm me-1"
                            onClick={() => handleAccept(row.messageid)}
                        >
                            <i className="bi bi-check-square-fill" style={{ fontSize: "0.875rem" }} />
                        </button>
                    )}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(row.messageid)}
                    >
                        <i className="bi bi-trash2-fill" style={{ fontSize: "0.875rem" }} />
                    </button>
                </div>
            ),
        },
    ];

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

    const filteredConfirmedYes = confirmedYesMessages.filter(
        item => {
            return (
                (studentIdFilter === '' || item.studentid?.toString().toLowerCase().includes(studentIdFilter.toLowerCase())) &&
                (firstNameFilter === '' || item.fullname[0]?.firstname.toLowerCase().includes(firstNameFilter.toLowerCase())) &&
                (lastNameFilter === '' || item.fullname[0]?.lastname.toLowerCase().includes(lastNameFilter.toLowerCase())) &&
                (selectedDate === '' || item.date?.includes(selectedDate))
            );
        }
    );

    const filteredConfirmedNo = confirmedNoMessages.filter(
        item => {
            return (
                (studentIdFilterNo === '' || item.studentid?.toString().toLowerCase().includes(studentIdFilterNo.toLowerCase())) &&
                (firstNameFilterNo === '' || item.fullname[0]?.firstname.toLowerCase().includes(firstNameFilterNo.toLowerCase())) &&
                (lastNameFilterNo === '' || item.fullname[0]?.lastname.toLowerCase().includes(lastNameFilterNo.toLowerCase())) &&
                (selectedDate === '' || item.date?.includes(selectedDate))
            );
        }
    );

    const createSubHeaderComponent = (
        idFilter,
        setIdFilter,
        firstNameFilter,
        setFirstNameFilter,
        lastNameFilter,
        setLastNameFilter
    ) => (
        <div className="container-fluid px-0">
            <div className="row g-3">
                <div className="col-md-2">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Student ID"
                        value={idFilter}
                        onChange={e => setIdFilter(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="First Name"
                        value={firstNameFilter}
                        onChange={e => setFirstNameFilter(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Last Name"
                        value={lastNameFilter}
                        onChange={e => setLastNameFilter(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        className="form-control"
                        type="date"
                        placeholder="Date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        className="form-control"
                        type="time"
                        placeholder="Time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                    />
                </div>
                <div className="col">
                    <button
                        className="btn btn-danger w-100"
                        type="button"
                        onClick={() => setResetPaginationToggle(!resetPaginationToggle)}
                    >
                        <i className="bi bi-trash2-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div>
                <header className="navbar border-dark border-bottom shadow container-fluid sticky-top bg-white">
                    <div className="container-fluid">
                        <Link href="#">
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
                                <Link to="/AdminAccountManagement" className="nav-link my-1 mx-2 d-flex align-items-center">
                                    <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6">Account Management</span>
                                </Link>
                            </li>
                            <li className="nav-item border-bottom bordor-white">
                                <Link to="/AdminMessageRequest" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                    <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6 text-start">Message Request</span>
                                </Link>
                            </li>
                            <li className="nav-item border-bottom bordor-white">
                                <Link to="/AdminLogbookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
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
                        <h2 className="my-4">Message Request</h2>
                        <div className="border-3 border-bottom border-black mb-4"></div>

                        <h3 className="my-4 fw-normal">Confirmed Student Message Requests</h3>
                        <DataTable
                            className="border"
                            columns={columns}
                            data={filteredConfirmedYes}
                            pagination
                            paginationResetDefaultPage={resetPaginationToggle}
                            subHeader
                            subHeaderComponent={createSubHeaderComponent(
                                studentIdFilter,
                                setStudentIdFilter,
                                firstNameFilter,
                                setFirstNameFilter,
                                lastNameFilter,
                                setLastNameFilter
                            )}
                            persistTableHead
                            customStyles={customStyles}
                            striped
                            highlightOnHover
                        />

                        <div className="border-3 border-bottom border-black mt-3"></div>

                        <h3 className="my-4 fw-normal">Student Night Pass Requests</h3>
                        <DataTable
                            className="border mb-5"
                            columns={columns}
                            data={filteredConfirmedNo}
                            pagination
                            paginationResetDefaultPage={resetPaginationToggle}
                            subHeader
                            subHeaderComponent={createSubHeaderComponent(
                                studentIdFilterNo,
                                setStudentIdFilterNo,
                                firstNameFilterNo,
                                setFirstNameFilterNo,
                                lastNameFilterNo,
                                setLastNameFilterNo
                            )}
                            persistTableHead
                            customStyles={customStyles}
                            striped
                            highlightOnHover
                        />
                    </main>
                </div>
            </div>
        </>
    );
}

export default AdminMessageRequest;
