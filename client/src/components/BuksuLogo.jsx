import React from 'react';
import logotitle from '../assets/logotitle.png';
import logo from '../assets/logo.png';

const BuksuLogo = () => {
    return (
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
                    height: 'auto'
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
    );
};

export default BuksuLogo; 