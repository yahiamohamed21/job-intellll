import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ name: "Test User", accountType: "JobSeeker" });
    const [token, setToken] = useState("dummy_token_123");
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        // --- TEMPORARILY DISABLED LOGIN CHECK FOR TESTING DASHBOARD ---
        // const initAuth = async () => { ... }
        // initAuth();
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
