import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import wallpaper from '../assets/wallpaper.png';
import wallpaper2 from '../assets/wallpaper2.png';
import logo from '../assets/logo.png';
import logotitle from '../assets/logotitle.png';

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Attempting login with:', formData);

            const response = await fetch('http://localhost:5000/api/login/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store both login flag and admin ID
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminId', data.admin.id);

            // Login successful
            console.log('Login successful:', data);
            navigate('/AdminDashboard');

        } catch (error) {
            console.error('Login error:', error);
            setError('Unable to connect to the server. Please check your internet connection and try again.');
        }
    };

    return (
        <div
            className="min-vh-100 w-100 d-flex justify-content-center align-items-center"
            style={{
                backgroundImage: `url(${wallpaper})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="shadow-lg d-flex rounded overflow-hidden">
                <div
                    className="position-relative"
                    style={{
                        width: '400px',
                        height: '450px',
                        backgroundImage: `url(${wallpaper2})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div
                        className="position-absolute top-50 start-50 translate-middle bg-white rounded d-flex flex-column justify-content-center align-items-center"
                        style={{
                            width: '240px',
                            height: '280px'
                        }}
                    >
                        <img
                            src={logotitle}
                            alt="Logo Title"
                            style={{
                                maxWidth: '200px',
                                height: 'auto',
                            }}
                        />
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                maxWidth: '160px',
                                height: 'auto'
                            }}
                        />
                    </div>
                </div>
                <div
                    className="bg-white d-flex flex-column justify-content-center align-items-center p-5"
                    style={{
                        width: '400px',
                        height: '450px',
                        padding: '30px'
                    }}
                >
                    <i className="bi bi-person-circle mb-3" style={{ fontSize: '3rem' }}></i>
                    <h4 className="mb-4">Admin Login</h4>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <form className="w-100" onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-center">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '150px' }}
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;

