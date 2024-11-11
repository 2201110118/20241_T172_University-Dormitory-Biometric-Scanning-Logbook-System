import React, { useEffect, useState } from "react";

function StudentManagement() {
    const [students, setStudents] = useState([]);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/student/');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (studentid) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this student?");
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/student/student/${studentid}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete student');
            }

            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    return (
        <>
            <div>
                <header className="navbar border-dark border-bottom shadow container-fluid sticky-top bg-white">
                    <div className="container-fluid">
                        <a href="">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/en/8/86/Shield_logo_of_Bukidnon_State_University.png"
                                alt="Buksu Logo"
                                width="48"
                                height="48"
                            />
                        </a>
                        <a href="#" className="multiline-text ms-1 text-decoration-none fw-bold fs-5" style={{ lineHeight: "1.1rem" }}>
                            <span style={{ color: "#0056b3" }}>Buksu</span>
                            <br />
                            <span style={{ color: "#003366" }}>Mahogany Dormitory</span>
                        </a>
                        <ul className="ms-auto navbar-nav flex-row">
                            <li className="nav-item">
                                <a href="#" style={{ color: "inherit" }}>
                                    <i className="bi bi-bell-fill me-4" style={{ fontSize: "1.56rem" }} />
                                </a>
                            </li>
                            <li className="nav-item">
                                <a href="#" style={{ color: "inherit" }}>
                                    <i className="bi bi-info-circle-fill me-4" style={{ fontSize: "1.56rem" }} />
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="btn btn-outline-dark" href="#">
                                    Login <i className="bi bi-door-open-fill" style={{ fontSize: "1rem" }} />
                                </a>
                            </li>
                        </ul>
                    </div>
                </header>

                <div className="container-fluid d-flex row">
                    <nav className="sidebar bg-dark" style={{ width: "250px", height: "100vh" }}>
                        <ul className="flex-column text-white text-decoration-none navbar-nav">
                            <li className="nav-item border-bottom bordor-white">
                                <a className="nav-link my-1 mx-2 d-flex align-items-center" href="#">
                                    <i className="bi bi-speedometer" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6">Dashboard</span>
                                </a>
                            </li>
                            <li className="nav-item border-bottom bordor-white">
                                <a className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center" href="#">
                                    <i className="bi bi-kanban-fill" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6 text-start">Account Management</span>
                                </a>
                            </li>
                            <li className="nav-item border-bottom bordor-white">
                                <a className="nav-link my-1 mx-2 d-flex align-items-center" href="#">
                                    <i className="bi bi-chat-left-dots-fill" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6">Message Request</span>
                                </a>
                            </li>
                            <li className="nav-item border-bottom bordor-white">
                                <a className="nav-link my-1 mx-2 d-flex align-items-center" href="#">
                                    <i className="bi bi-clipboard-fill" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6">Report Logs</span>
                                </a>
                            </li>
                            <li className="nav-item border-bottom bordor-white">
                                <a className="nav-link my-1 mx-2 d-flex align-items-center" href="#">
                                    <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                    <span className="ms-2 fw-bold fs-6">Setting</span>
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <main className="container-fluid px-4" style={{ flex: 1 }}>
                        <h2 className="my-4">Student Account Management</h2>
                        <div className="table-responsive">
                            {students.length === 0 ? (
                                <p>No data found</p>
                            ) : (
                                <table className="table table-striped table-bordered">
                                    <thead className="text-center">
                                        <tr>
                                            <th>ID</th>
                                            <th>Full Name</th>
                                            <th>Gmail Account</th>
                                            <th>Room Number</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
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
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(student.studentid)}
                                                    >
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
        </>
    );
}

export default StudentManagement;
