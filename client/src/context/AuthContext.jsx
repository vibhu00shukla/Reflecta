import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Check if user is already logged in (optional: verify token with backend)
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Ideally call /auth/me here to get user data
                    // For now, we'll just assume token is valid or wait for a 401 to clear it
                    // const res = await axios.get('http://localhost:3000/auth/me');
                    // setUser(res.data.user);
                } catch (error) {
                    console.error("Auth init failed", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/auth/register', { name, email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
