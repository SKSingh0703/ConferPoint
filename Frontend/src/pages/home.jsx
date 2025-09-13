import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Button, 
    TextField, 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Container,
    Fade,
    Slide,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    GroupAdd as GroupAddIcon,
    History as HistoryIcon,
    Logout as LogoutIcon,
    Add as AddIcon,
    MeetingRoom as MeetingRoomIcon,
    Speed as SpeedIcon,
    Videocam as VideocamIcon,
    Help as HelpIcon,
    CheckCircle as CheckCircleIcon,
    VideoCall as VideoCallIcon,
    Group as GroupIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import "../styles/home.css";

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const { addToUserHistory, validateMeetingCode, handleLogout } = useContext(AuthContext);

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleCreateRoom = async () => {
        try {
            let newCode;
            let attempts = 0;
            const maxAttempts = 5;
            
            // Try to generate a unique code
            do {
                newCode = generateRandomCode();
                attempts++;
                
                // Check if code already exists
                try {
                    const validation = await validateMeetingCode(newCode);
                    if (!validation.valid) {
                        // Code doesn't exist, we can use it
                        console.log(`Generated unique code: ${newCode}`);
                        break;
                    } else {
                        console.log(`Code ${newCode} already exists, generating new one...`);
                    }
                } catch (error) {
                    // If validation fails, assume code is available
                    console.log("Validation error, using generated code:", error);
                    break;
                }
            } while (attempts < maxAttempts);
            
            // Create meeting record in database
            try {
                await addToUserHistory(newCode);
                console.log(`Meeting record created for code: ${newCode}`);
            } catch (error) {
                console.error("Error creating meeting record:", error);
                // Continue anyway - the room can still be used
            }
            
            // Navigate to the room
            navigate(`/${newCode}`);
        } catch (error) {
            console.error("Error creating room:", error);
            // Fallback: still navigate with a random code
            const newCode = generateRandomCode();
            navigate(`/${newCode}`);
        }
    };

    const handleJoinRoom = () => {
        setMeetingCode("");
        setValidationError("");
        setShowJoinForm(true);
    };

    const handleJoinVideoCall = async () => {
        // Clear previous errors
        setValidationError("");
        
        if (meetingCode.trim() === "") {
            setValidationError("Please enter a meeting code.");
            return;
        }

        // Check if meeting code is exactly 8 characters
        if (meetingCode.trim().length !== 8) {
            setValidationError("Meeting code must be exactly 8 characters long.");
            return;
        }

        setIsValidating(true);
        
        try {
            // Validate meeting code with backend
            const validationResult = await validateMeetingCode(meetingCode.trim());
            
            if (validationResult.valid) {
                // Meeting exists, just join it (don't create a new record)
                console.log("Joining existing meeting:", meetingCode.trim());
                navigate(`/${meetingCode.trim()}`);
            } else {
                setValidationError(validationResult.message || "Invalid meeting code.");
            }
        } catch (error) {
            console.error("Validation error:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data,
                code: error.code
            });
            
            // Handle different types of errors
            if (error.response?.status === 404) {
                setValidationError("No meeting found with this code. Please check the code and try again.");
            } else if (error.response?.status === 400) {
                setValidationError(error.response.data.message || "Invalid meeting code format.");
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                setValidationError("Failed to connect to server. Please check your internet connection and try again.");
            } else if (error.message?.includes('Network Error')) {
                setValidationError("Network error. Please check your connection and try again.");
            } else {
                setValidationError("Failed to validate meeting code. Please try again.");
            }
        } finally {
            setIsValidating(false);
        }
    };

    const handleShowHelp = () => {
        setShowHelpModal(true);
    };

    const handleCloseJoinModal = () => {
        setShowJoinForm(false);
        setMeetingCode("");
        setValidationError("");
        setIsValidating(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("/back.png") center/cover',
                    opacity: 0.1,
                    zIndex: 0,
                }
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 60,
                            height: 60,
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                        }}
                    >
                        <VideocamIcon sx={{ fontSize: 35 }} />
                    </Avatar>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        ConferPoint
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        onClick={() => navigate("/history")}
                        variant="outlined"
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                background: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        startIcon={<HistoryIcon />}
                    >
                        History
                    </Button>
                    <Button
                        onClick={handleLogout}
                        variant="outlined"
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                background: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
                <Fade in={true} timeout={1000}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 2,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            Welcome to ConferPoint
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 300,
                                mb: 4,
                            }}
                        >
                            Connect, collaborate, and celebrate from anywhere
                        </Typography>
                    </Box>
                </Fade>

                {/* Action Cards */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                    {/* Create Room Card */}
                    <Slide direction="up" in={true} timeout={800}>
                        <Card
                            sx={{
                                maxWidth: 280,
                                minWidth: 250,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 3,
                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                                }
                            }}
                            onClick={handleCreateRoom}
                        >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        mx: 'auto',
                                        mb: 2,
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: '#333' }}>
                                    Create Room
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 2.5, lineHeight: 1.5 }}>
                                    Start a new meeting and invite others to join
                                </Typography>
                                <Chip
                                    label="Instant Start"
                                    color="primary"
                                    size="small"
                                    icon={<SpeedIcon />}
                                />
                            </CardContent>
                        </Card>
                    </Slide>

                    {/* Join Room Card */}
                    <Slide direction="up" in={true} timeout={1000}>
                        <Card
                            sx={{
                                maxWidth: 280,
                                minWidth: 250,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 3,
                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                                }
                            }}
                            onClick={handleJoinRoom}
                        >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        mx: 'auto',
                                        mb: 2,
                                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                                    }}
                                >
                                    <GroupAddIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: '#333' }}>
                                    Join Room
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 2.5, lineHeight: 1.5 }}>
                                    Enter a meeting code to join an existing room
                                </Typography>
                                <Chip
                                    label="Enter Code"
                                    color="success"
                                    size="small"
                                    icon={<MeetingRoomIcon />}
                                />
                            </CardContent>
                        </Card>
                    </Slide>

                    {/* Help & Guide Card */}
                    <Slide direction="up" in={true} timeout={1200}>
                        <Card
                            sx={{
                                maxWidth: 280,
                                minWidth: 250,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 3,
                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                                }
                            }}
                            onClick={handleShowHelp}
                        >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        mx: 'auto',
                                        mb: 2,
                                        background: 'linear-gradient(45deg, #FF6B6B, #ee5a24)',
                                    }}
                                >
                                    <HelpIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5, color: '#333' }}>
                                    Help & Guide
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 2.5, lineHeight: 1.5 }}>
                                    Learn how to use ConferPoint features
                                </Typography>
                                <Chip
                                    label="Get Started"
                                    sx={{ 
                                        background: 'linear-gradient(45deg, #FF6B6B, #ee5a24)',
                                        color: 'white'
                                    }}
                                    size="small"
                                    icon={<HelpIcon />}
                                />
                            </CardContent>
                        </Card>
                    </Slide>
                </Box>

                {/* Join Form Modal */}
                {showJoinForm && (
                    <Fade in={showJoinForm}>
                        <Box
                            sx={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                p: 2,
                            }}
                            onClick={handleCloseJoinModal}
                        >
                            <Card
                                sx={{
                                    maxWidth: 500,
                                    width: '100%',
                                    p: 6,
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 4,
                                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            mb: 3,
                                            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                                        }}
                                    >
                                        <GroupAddIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                                        Join Meeting
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#666' }}>
                                        Enter the meeting code to join an existing room
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ mb: 4 }}>
                        <TextField 
                                        fullWidth
                            label="Meeting Code" 
                                        value={meetingCode}
                                        onChange={(e) => {
                                            setMeetingCode(e.target.value);
                                            if (validationError) setValidationError(""); // Clear error when user types
                                        }}
                            variant="outlined" 
                                        placeholder="Enter 8-character meeting code"
                                        error={!!validationError}
                                        helperText={validationError}
                                        disabled={isValidating}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                fontSize: '1.1rem',
                                                py: 1,
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: '1rem',
                                            },
                                            '& .MuiFormHelperText-root': {
                                                fontSize: '0.9rem',
                                                textAlign: 'center',
                                                mt: 1,
                                            },
                                        }}
                                        inputProps={{
                                            style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' },
                                            maxLength: 8
                                        }}
                                    />
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCloseJoinModal}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleJoinVideoCall}
                                        disabled={isValidating}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                                            },
                                            '&:disabled': {
                                                background: 'rgba(0, 0, 0, 0.12)',
                                                color: 'rgba(0, 0, 0, 0.26)',
                                            }
                                        }}
                                    >
                                        {isValidating ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={20} sx={{ color: 'white' }} />
                                                Validating...
                                            </Box>
                                        ) : (
                                            'Join Meeting'
                                        )}
                                    </Button>
                                </Box>
                            </Card>
                        </Box>
                    </Fade>
                )}

                {/* Help Modal */}
                {showHelpModal && (
                    <Fade in={showHelpModal}>
                        <Box
                            sx={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                p: 2,
                            }}
                            onClick={() => setShowHelpModal(false)}
                        >
                            <Card
                                sx={{
                                    maxWidth: 600,
                                    width: '100%',
                                    maxHeight: '80vh',
                                    overflow: 'auto',
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 4,
                                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Box sx={{ p: 4 }}>
                                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 3,
                                                background: 'linear-gradient(45deg, #FF6B6B, #ee5a24)',
                                            }}
                                        >
                                            <HelpIcon sx={{ fontSize: 40 }} />
                                        </Avatar>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                                            ConferPoint Guide
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#666' }}>
                                            Everything you need to know about using ConferPoint
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 4 }} />

                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <VideoCallIcon color="primary" />
                                            Getting Started
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Create a Room" 
                                                    secondary="Click 'Create Room' to instantly start a new meeting with a unique code"
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Join a Room" 
                                                    secondary="Click 'Join Room' and enter the meeting code to join an existing meeting"
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Share Meeting Code" 
                                                    secondary="Share the 8-character code with others to invite them to your meeting"
                                                />
                                            </ListItem>
                                        </List>
                                    </Box>

                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GroupIcon color="primary" />
                                            Meeting Features
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Video & Audio" 
                                                    secondary="Toggle your camera and microphone on/off during the meeting"
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Screen Sharing" 
                                                    secondary="Share your screen with other participants for presentations"
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Real-time Chat" 
                                                    secondary="Send messages to all participants during the meeting"
                                                />
                                            </ListItem>
                                        </List>
                                    </Box>

                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SecurityIcon color="primary" />
                                            Security & Privacy
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Secure Connections" 
                                                    secondary="All meetings use WebRTC for secure peer-to-peer connections"
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Meeting History" 
                                                    secondary="View your past meetings in the History section"
                                                />
                                            </ListItem>
                                        </List>
                                    </Box>

                                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => setShowHelpModal(false)}
                                            sx={{
                                                px: 4,
                                                py: 1.5,
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                borderRadius: 2,
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                                                }
                                            }}
                                        >
                                            Got it!
                                        </Button>
                                    </Box>
                                </Box>
                            </Card>
                        </Box>
                    </Fade>
                )}
            </Container>
        </Box>
    );
}

export default HomeComponent;
