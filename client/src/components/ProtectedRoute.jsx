import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, userType, requireAuth = true }) => {
    const { isAuthenticated, userType: currentUserType, isLoading } = useAuth();

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    // For protected routes that require authentication
    if (requireAuth) {
        if (!isAuthenticated || currentUserType !== userType) {
            return <Navigate to={`/${userType}/login`} replace />;
        }
    }
    // For login/signup routes that should be inaccessible when authenticated
    else {
        if (isAuthenticated && currentUserType === userType) {
            return <Navigate to={`/${userType === 'admin' ? 'Admin' : 'Student'}Dashboard`} replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 