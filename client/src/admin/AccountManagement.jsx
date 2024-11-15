import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

function AdminAccountManagement() {
    const [, setStudents] = useState([]);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [unregisteredStudents, setUnregisteredStudents] = useState([]);

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

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (studentid) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this student?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/student/${studentid}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete student');
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    return (
        <>
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
                            <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
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
                            <Link to="/AdminLogBookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
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
                    <h2 className="my-4">Account Management</h2>
                    <div className="border-3 border-bottom border-black mb-4"></div>
                    <h3 className="my-4 fw-normal">Registered Student Accounts</h3>
                    <div className="row">
                        <div className="col">
                            <input className="form-control" type="text" placeholder="First Name" />
                        </div>
                        <div className="col">
                            <input className="form-control" type="text" placeholder="Last Name" />
                        </div>
                        <div className="col">
                            <input className="form-control" type="text" placeholder="Gmail" />
                        </div>
                        <div className="col">
                            <input className="form-control" type="text" placeholder="Room Number" />
                        </div>
                        <button className="btn btn-primary col-sm-1 mb-3" type="button">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>

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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="align-middle">
                                    {registeredStudents.map((student) => (
                                        <tr key={student.studentid}>
                                            <td>{student.studentid}</td>
                                            <td>{`${student.fullname[0]?.firstname} ${student.fullname[0]?.lastname}`}</td>
                                            <td>{student.gmail}</td>
                                            <td>{student.roomnumber}</td>
                                            <td className="text-center">
                                                <button className="btn btn-info me-2">
                                                    <i className="bi bi-info-circle-fill text-white" style={{ fontSize: "1rem" }} />
                                                </button>
                                                <button className="btn btn-warning me-2">
                                                    <i className="bi bi-pencil-square text-white" style={{ fontSize: "1rem" }} />
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(student.studentid)}>
                                                    <i className="bi bi-trash2-fill text-white" style={{ fontSize: "1rem" }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="border-bottom border-3 border-black mt-3" />
                    <h3 className="my-4 fw-normal">Unregistered Student Accounts</h3>
                    <div className="row">
                        <div className="col">
                            <input className="form-control" type="text" placeholder="First Name" />
                        </div>
                        <div className="col">
                            <input className="form-control" type="text" placeholder="Last Name" />
                        </div>
                        <div className="col">
                            <input className="form-control" type="text" placeholder="Gmail" />
                        </div>
                        <button className="btn btn-primary col-sm-1 mb-3" type="button">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                    <div className="table-responsive">
                        {unregisteredStudents.length === 0 ? (
                            <p>No unregistered students found</p>
                        ) : (
                            <table className="table table-striped table-bordered">
                                <thead className="text-center border-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Full Name</th>
                                        <th>Gmail Account</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="align-middle">
                                    {unregisteredStudents.map((student) => (
                                        <tr key={student.studentid}>
                                            <td>{student.studentid}</td>
                                            <td>{`${student.fullname[0]?.firstname} ${student.fullname[0]?.lastname}`}</td>
                                            <td>{student.gmail}</td>
                                            <td className="text-center">
                                                <button className="btn btn-info me-2">
                                                    <i className="bi bi-info-circle-fill text-white" style={{ fontSize: "1rem" }} />
                                                </button>
                                                <button className="btn btn-warning me-2">
                                                    <i className="bi bi-pencil-square text-white" style={{ fontSize: "1rem" }} />
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(student.studentid)}>
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
        </>
    );
}

export default AdminAccountManagement;
