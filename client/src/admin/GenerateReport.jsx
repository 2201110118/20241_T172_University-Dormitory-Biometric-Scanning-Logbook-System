import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { Modal } from 'bootstrap';

function GenerateReport() {
    const [reportType, setReportType] = useState('students');
    const [filters, setFilters] = useState({
        status: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (reportType === 'students' && filters.status) {
                queryParams.append('status', filters.status);
            }

            // Generate report
            const response = await fetch(`http://localhost:5000/api/report/${reportType}?${queryParams}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const data = await response.json();

            // Trigger file download with Save As dialog
            if (data.fileName) {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                iframe.src = `http://localhost:5000/api/report/download/${data.fileName}`;
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 2000);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            setError(error.message || 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <AdminHeader />
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
                                    <Link to="/AdminLogBookHistory" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-clock-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Logbook History</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminMessage" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Message</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="#" className="btn btn-primary my-2 mx-1 me-2 d-flex align-items-center">
                                        <i className="bi bi-clipboard-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Generate Report</span>
                                    </Link>
                                </li>
                                <li className="nav-item border-bottom border-white">
                                    <Link to="/AdminSettings" className="nav-link my-1 mx-2 d-flex align-items-center">
                                        <i className="bi bi-gear-fill" style={{ fontSize: '1.5rem' }} />
                                        <span className="ms-2 fw-bold fs-6">Settings</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
                            <div className="container-fluid p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="mb-0 fw-bold">Generate Report</h2>
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

                                <div className="card">
                                    <div className="card-body">
                                        <div className="mb-4">
                                            <label className="form-label">Report Type</label>
                                            <select
                                                className="form-select"
                                                value={reportType}
                                                onChange={(e) => setReportType(e.target.value)}
                                            >
                                                <option value="students">Student Report</option>
                                                <option value="logbook">Logbook Report</option>
                                            </select>
                                        </div>

                                        {reportType === 'students' ? (
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Status</label>
                                                    <select
                                                        className="form-select"
                                                        name="status"
                                                        value={filters.status}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value="">All Students</option>
                                                        <option value="active">Active Students</option>
                                                        <option value="inactive">Inactive Students</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : null}

                                        {error && (
                                            <div className="alert alert-danger mt-3" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleGenerateReport}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-file-earmark-pdf me-2"></i>
                                                        Generate PDF Report
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GenerateReport; 