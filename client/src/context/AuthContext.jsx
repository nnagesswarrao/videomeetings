import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error parsing stored user:', error);
            return null;
        }
    });

    const login = (userData) => {
        try {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const logout = () => {
        try {
            setUser(null);
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
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

export default AuthContext; 