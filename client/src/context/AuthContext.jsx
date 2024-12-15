import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        userType: null,
        user: null,
        isLoading: true
    });

    const checkSession = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/check-session', {
                credentials: 'include'
            });
            const data = await response.json();

            setAuthState({
                isAuthenticated: data.isAuthenticated,
                userType: data.userType,
                user: data.user,
                isLoading: false
            });
        } catch (error) {
            console.error('Session check failed:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    };

    // Check session when the app loads
    useEffect(() => {
        checkSession();
    }, []);

    // Listen for storage events to sync auth state across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'authStateChange') {
                checkSession();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (credentials, userType) => {
        try {
            const response = await fetch(`http://localhost:5000/api/login/${userType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            await checkSession();
            // Notify other tabs
            localStorage.setItem('authStateChange', Date.now().toString());
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            setAuthState({
                isAuthenticated: false,
                userType: null,
                user: null,
                isLoading: false
            });

            // Notify other tabs
            localStorage.setItem('authStateChange', Date.now().toString());
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 