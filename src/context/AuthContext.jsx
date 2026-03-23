import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken) {
                setToken(storedToken);
            }

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.warn('Failed to restore auth session', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } finally {
            setIsInitializing(false);
        }
    }, []);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // The role refers to accountType ('JobSeeker' or 'Recruiter' usually)
    // Mapping 'JobSeeker' -> 'employee', 'Recruiter' -> 'hr' for frontend routes
    const getRole = () => {
        if (!user) return null;
        const type = user.accountType || user.role; // API might return accountType or role
        if (type?.toLowerCase() === 'jobseeker') return 'employee';
        if (type?.toLowerCase() === 'recruiter') return 'hr';
        return type?.toLowerCase();
    };

    return (
        <AuthContext.Provider value={{ user, token, role: getRole(), login, logout, isInitializing }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
