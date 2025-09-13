import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";
import server from "../environment";
import PropTypes from 'prop-types';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null); // Initialize userData as null
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const router = useNavigate();

    // Check for existing token on app startup
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("token");
        
        if (token) {
            try {
                // Validate token with backend
                const response = await client.post("/validate-token", { token });
                
                if (response.data.valid) {
                    // Token is valid, set user data
                    setUserData(response.data.user);
                } else {
                    // Token is invalid, clear it
                    localStorage.removeItem("token");
                    setUserData(null);
                }
            } catch (error) {
                // Token validation failed, clear it
                console.log("Token validation error:", error);
                localStorage.removeItem("token");
                setUserData(null);
            }
        }
        
        setIsLoading(false);
    };

    const handleRegister = async (name, email, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                email: email,
                username: username,
                password: password
            });

            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const handleLogin = async (email, password) => {
        try {
            console.log("AuthContext: Attempting login with:", { email, passwordLength: password.length });
            
            let request = await client.post("/login", {
                email: email,
                password: password
            });

            console.log("Login response:", request);
            

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                setUserData(request.data.user); 
                router("/home")
            }
        } catch (error) {
            console.log("Login error:", error);
            throw error;
        }
    };

    const getHistoryOfUser= async () => {
        try {
            let request= await client.get('/get_all_activity',{
                params:{
                    token:localStorage.getItem("token")
                }
            });
            return request.data;
        } catch (error) {
            console.log(error);
            throw error
            
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post('/add_to_activity',{
                token:localStorage.getItem("token"),
                meeting_code:meetingCode
            })
            return request;
        } catch (error) {
            console.log(error);
            throw error;
            
        }
    }

    const validateMeetingCode = async (meetingCode) => {
        try {
            let request = await client.post('/validate-meeting', {
                meetingCode: meetingCode
            });
            return request.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            
            if (token) {
                // Call logout endpoint to clear token on server
                await client.post("/logout", { token });
            }
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            // Clear local storage and user data regardless of server response
            localStorage.removeItem("token");
            setUserData(null);
            router("/auth");
        }
    };

    const deleteMeeting = async (meetingCode) => {
        try {
            let request = await client.post('/delete-meeting', {
                meetingCode: meetingCode
            });
            return request.data;
        } catch (error) {
            console.log("Delete meeting error:", error);
            throw error;
        }
    };

    const data = {
        userData,
        setUserData,
        isLoading,
        handleRegister,
        handleLogin,
        handleLogout,
        getHistoryOfUser,
        addToUserHistory,
        validateMeetingCode,
        checkAuthStatus,
        deleteMeeting
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
