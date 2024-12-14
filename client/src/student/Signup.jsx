import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Modal } from 'bootstrap';
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import BuksuLogo from '../components/BuksuLogo';
import './StudentAuth.css';

const StudentSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const googleData = location.state?.googleData;
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [formData, setFormData] = useState({
        fullname: {
            firstname: googleData?.firstname || '',
            lastname: googleData?.lastname || ''
        },
        studentid: '',
        gmail: googleData?.gmail || '',
        contacts: {
            family: {
                contactNumber: '',
                gmail: ''
            },
            guardian: {
                contactNumber: '',
                gmail: ''
            },
            friend: {
                contactNumber: '',
                gmail: ''
            }
        },
        password: '',
        confirmPassword: '',
        googleId: googleData?.googleId || null
    });

    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const modal = new Modal(document.getElementById('errorModal'));
        setErrorModal(modal);
        return () => {
            setIsVisible(false);
            if (errorModal) {
                errorModal.dispose();
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else if (name.includes('_')) {
            const [contact, field] = name.split('_');
            setFormData(prev => ({
                ...prev,
                contacts: {
                    ...prev.contacts,
                    [contact]: {
                        ...prev.contacts[contact],
                        [field]: value
                    }
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate form fields
        if (!formData.fullname.firstname || !formData.fullname.lastname || !formData.studentid || !formData.gmail || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Validate student ID format
        if (!/^\d{10}$/.test(formData.studentid)) {
            setError('Student ID must be exactly 10 digits');
            setIsLoading(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.gmail)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        // Only proceed if on the final step
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
            setIsLoading(false);
            return;
        }

        const { confirmPassword, ...dataToSend } = formData;

        try {
            // Check if email already exists
            const checkResponse = await fetch('http://localhost:5000/api/student/check-google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gmail: formData.gmail
                })
            });

            const checkData = await checkResponse.json();

            if (checkData.exists) {
                setError('An account with this email already exists. Please login instead.');
                setIsLoading(false);
                return;
            }

            // Proceed with registration
            const response = await fetch('http://localhost:5000/api/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...dataToSend,
                    registeredaccount: false,
                    accountStatus: {
                        isConfirmed: false
                    }
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Registration failed');
            }

            // Show success message and redirect
            document.getElementById('errorModalTitle').textContent = 'Registration Successful';
            document.getElementById('errorModalBody').textContent = 'Your account has been created successfully. Please wait for admin approval.';
            setIsLoading(false);
            errorModal.show();

            // Add event listener for modal close
            const modalElement = document.getElementById('errorModal');
            modalElement.addEventListener('hidden.bs.modal', () => {
                navigate('/student/login');
            }, { once: true });

        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    const renderFormStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <h5 className="mb-3">Personal Information</h5>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="First Name"
                                name="fullname.firstname"
                                value={formData.fullname.firstname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Last Name"
                                name="fullname.lastname"
                                value={formData.fullname.lastname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Student ID"
                                name="studentid"
                                value={formData.studentid}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                name="gmail"
                                value={formData.gmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <h5 className="mb-3">Emergency Contacts (Optional)</h5>
                        <div className="mb-3">
                            <h6 className="text-muted mb-2">Family Contact</h6>
                            <div className="row g-2">
                                <div className="col-6">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Contact Number"
                                        name="family_contactNumber"
                                        value={formData.contacts.family.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Email"
                                        name="family_gmail"
                                        value={formData.contacts.family.gmail}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-muted mb-2">Guardian Contact</h6>
                            <div className="row g-2">
                                <div className="col-6">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Contact Number"
                                        name="guardian_contactNumber"
                                        value={formData.contacts.guardian.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Email"
                                        name="guardian_gmail"
                                        value={formData.contacts.guardian.gmail}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-muted mb-2">Friend Contact</h6>
                            <div className="row g-2">
                                <div className="col-6">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Contact Number"
                                        name="friend_contactNumber"
                                        value={formData.contacts.friend.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Email"
                                        name="friend_gmail"
                                        value={formData.contacts.friend.gmail}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <h5 className="mb-3">Account Setup</h5>
                        {currentStep === 3 && (
                            <>
                                <div className="mb-3 position-relative">
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onMouseDown={() => setShowPassword(true)}
                                            onMouseUp={() => setShowPassword(false)}
                                            onMouseLeave={() => setShowPassword(false)}
                                            onTouchStart={() => setShowPassword(true)}
                                            onTouchEnd={() => setShowPassword(false)}
                                            tabIndex="-1"
                                        >
                                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}-fill`}></i>
                                        </button>
                                    </div>
                                    <small className="text-muted">
                                        Password must be at least 6 characters
                                    </small>
                                </div>
                                <div className="mb-4 position-relative">
                                    <div className="input-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Confirm Password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onMouseDown={() => setShowConfirmPassword(true)}
                                            onMouseUp={() => setShowConfirmPassword(false)}
                                            onMouseLeave={() => setShowConfirmPassword(false)}
                                            onTouchStart={() => setShowConfirmPassword(true)}
                                            onTouchEnd={() => setShowConfirmPassword(false)}
                                            tabIndex="-1"
                                        >
                                            <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}-fill`}></i>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Error Modal */}
            <div className="modal fade" id="errorModal" tabIndex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="errorModalTitle">Error</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3" id="errorModalBody">Error message here</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner-container">
                        <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 text-dark">Creating your account...</div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div
                className={`login-page min-vh-100 w-100 d-flex justify-content-center align-items-center ${isVisible ? 'visible' : ''}`}
                style={{
                    backgroundImage: `url(${wallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className={`login-container ${isVisible ? 'visible' : ''}`}>
                    {/* Left Side - Image */}
                    <div
                        style={{
                            backgroundImage: `url(${wallpaper2})`,
                            position: 'relative'
                        }}
                    >
                        <BuksuLogo />
                        <Link
                            to="/"
                            className="btn btn-light position-absolute bottom-0 start-0 m-4 d-flex align-items-center"
                            style={{
                                backgroundColor: '#ffffff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                color: '#6c757d',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}
                        >
                            <i className="bi bi-house-door"></i>
                            <span>Return to Homepage</span>
                        </Link>
                    </div>

                    <div
                        className="bg-white d-flex flex-column justify-content-center align-items-center p-5"
                        style={{
                            width: '600px',
                            height: '700px',
                            padding: '30px'
                        }}
                    >
                        <i className="bi bi-person-plus-fill mb-3" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mb-4">Student Registration</h4>
                        {error && (
                            <div
                                className="alert alert-danger py-1 px-2 d-flex align-items-center"
                                style={{
                                    fontSize: '0.875rem',
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    maxWidth: '90%',
                                    zIndex: 1000,
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <i className="bi bi-exclamation-circle-fill me-2"></i>
                                {error}
                            </div>
                        )}

                        {/* Progress Steps */}
                        <div className="d-flex justify-content-center mb-4">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="d-flex align-items-center">
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center ${step === currentStep
                                            ? 'bg-primary text-white'
                                            : step < currentStep
                                                ? 'bg-success text-white'
                                                : 'bg-light'
                                            }`}
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            cursor: step <= Math.max(currentStep, 1) ? 'pointer' : 'default',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => step <= Math.max(currentStep, 1) && setCurrentStep(step)}
                                    >
                                        {step < currentStep ? (
                                            <i className="bi bi-check" style={{ transition: 'all 0.3s ease' }}></i>
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`mx-2 ${step < currentStep ? 'bg-success' : 'bg-light'}`}
                                            style={{
                                                height: '2px',
                                                width: '30px',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        ></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form className="w-100" onSubmit={handleSubmit}>
                            {renderFormStep()}

                            <div className="d-flex justify-content-between mt-4">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                    >
                                        Previous
                                    </button>
                                )}
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        className="btn btn-primary ms-auto"
                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn-primary ms-auto"
                                    >
                                        Register
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="text-center mt-3">
                            <span className="text-muted">Already have an account? </span>
                            <Link to="/student/login" className="text-primary text-decoration-none">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentSignup; 