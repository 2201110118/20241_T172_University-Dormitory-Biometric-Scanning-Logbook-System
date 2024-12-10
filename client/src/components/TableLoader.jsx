import React from 'react';

const TableLoader = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center p-2">
            <div className="spinner-border text-dark" style={{ width: '2rem', height: '2rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small mb-0">Loading data...</p>
        </div>
    );
};

export default TableLoader; 