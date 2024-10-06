import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import "../styles/home.css";

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const token = localStorage.getItem("token");

    let handleJoinVideoCall = async () => {
        if (meetingCode.trim() === "") {
            alert("Please enter a valid meeting code.");
            return;
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <div className='containerOnVideo'>
            <div className="headerOnVideo">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h1>ConferPoint</h1>
                    <img src="/Logo.jpg" alt="Logo" />
                </div>

                <div className='Links'>
                    <IconButton className='LinksChildren' onClick={() => navigate("/history")}>
                        <RestoreIcon />
                        <h5>History</h5>
                    </IconButton>
                    <Button onClick={() => {
                        if (token) {
                            localStorage.removeItem("token");
                            
                        }
                        navigate("/auth");
                    }}>
                        {token ? "Logout" : "Sign-in"}
                    </Button>
                </div>
            </div>

            <div className="leftRightContainer">
                <div className="leftOnVideo">
                    <div className="">
                        <h1><b>Video Calls and meetings</b></h1>
                        <h1><b>for everyone</b></h1>
                    </div>
                    <div className="">
                        <h3>Connect, collaborate, and celebrate</h3>
                        <h3>from anywhere with ConferPoint</h3>
                    </div>

                    <div className='ButtonOnVideo'>
                        <TextField 
                            onChange={e => setMeetingCode(e.target.value)} 
                            id="outlined-basic" 
                            label="Meeting Code" 
                            variant="outlined" 
                        />
                        <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
                    </div>

                    <div className="lineVideo"></div>
                </div>

                <div className='rightOnVideo'>
                    <div className="connectPic">
                        <img src="/conference.jpg" alt="Conference" />
                    </div>

                    <div className="connectTextOnVideo">
                        <h3>Join or Create a Room</h3>
                        <p>Click <b>Join</b> to create a new room if none exists, or to join an existing one.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeComponent;
