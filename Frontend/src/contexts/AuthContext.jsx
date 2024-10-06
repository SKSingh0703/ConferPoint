import { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users"
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null); // Initialize userData as null
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
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

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(request);
            

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                setUserData(request.data.user); 
                router("/home")
            }
        } catch (error) {
            console.log(error);
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

    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,getHistoryOfUser,addToUserHistory
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
