import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType, requireAuth = true }) => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const isStudentLoggedIn = localStorage.getItem('studentLoggedIn') === 'true';

    // For protected routes that require authentication
    if (requireAuth) {
        if (userType === 'admin' && !isAdminLoggedIn) {
            return <Navigate to="/admin/login" replace />;
        }
        if (userType === 'student' && !isStudentLoggedIn) {
            return <Navigate to="/student/login" replace />;
        }
    }
    // For login/signup routes that should be inaccessible when authenticated
    else {
        if (userType === 'admin' && isAdminLoggedIn) {
            return <Navigate to="/AdminDashboard" replace />;
        }
        if (userType === 'student' && isStudentLoggedIn) {
            return <Navigate to="/StudentDashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 