import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminMessageRequest() {
    const [messages, setMessages] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState('');

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

    return (
        <>
            <div>
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

                    <main className="container-fluid px-4" style={{ flex: 1 }}>
                        <h2 className="my-4">Message Request</h2>
                        <div className="border-3 border-bottom border-black mb-4"></div>
                        <h3 className="my-4 fw-normal">Confirmed Student Message Requests</h3>
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
                            {confirmedYesMessages.length === 0 ? (
                                <p>No confirmed 'Yes' messages found</p>
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="align-middle">
                                        {confirmedYesMessages.map((message) => (
                                            <tr key={message._id}>
                                                <td>{message.messageid}</td>
                                                <td>{message.studentid}</td>
                                                <td>{`${message.fullname[0]?.firstname} ${message.fullname[0]?.lastname}`}</td>
                                                <td>{message.roomnumber || "N/A"}</td>
                                                <td>{message.date}</td>
                                                <td>{message.confirmedRequest ? "Yes" : "No"}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-success me-2">
                                                        <i className="bi bi-check-square-fill" style={{ fontSize: "1rem" }} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger me-2"
                                                        onClick={() => handleDelete(message.messageid)}
                                                    >
                                                        <i className="bi bi-x-square-fill" style={{ fontSize: "1rem" }} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="border-3 border-bottom border-black mt-3"></div>
                        <h3 className="my-4 fw-normal">Student Night Pass Requests</h3>
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
                        </div>
                        <div className="table-responsive">
                            {confirmedNoMessages.length === 0 ? (
                                <p>No confirmed 'No' messages found</p>
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="align-middle">
                                        {confirmedNoMessages.map((message) => (
                                            <tr key={message._id}>
                                                <td>{message.messageid}</td>
                                                <td>{message.studentid}</td>
                                                <td>{`${message.fullname[0]?.firstname} ${message.fullname[0]?.lastname}`}</td>
                                                <td>{message.roomnumber || "N/A"}</td>
                                                <td>{message.date}</td>
                                                <td>{message.confirmedRequest ? "Yes" : "No"}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-success me-2">
                                                        <i className="bi bi-check-square-fill" style={{ fontSize: "1rem" }} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger me-2"
                                                        onClick={() => handleDelete(message.messageid)}
                                                    >
                                                        <i className="bi bi-x-square-fill" style={{ fontSize: "1rem" }} />
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
        </>
    );
}

export default AdminMessageRequest;
