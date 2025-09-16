import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Snackbar, Paper, Fade, Slide } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { AuthContext } from '../contexts/AuthContext';

import "../styles/authComponent.css"

export default function Authentication() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [loggingIn, setLoggingIn] = React.useState(false);
    const [formState, setFormState] = React.useState(0); // 0: Login, 1: Register
    const [open, setOpen] = React.useState(false);
    
    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    // Function to clear form data
    const clearForm = () => {
        setEmail("");
        setPassword("");
        setName("");
        setUsername("");
        setError("");
        setMessage("");
    };

    // Clear form when component mounts (after logout)
    React.useEffect(() => {
        clearForm();
    }, []);

    let handleAuth = async () => {
        try {
            // Clear any previous errors
            setError("");
            
            // Prevent multiple rapid clicks while a request is in-flight
            if (loggingIn) {
                return;
            }
            
            if (formState === 0) {
                // Validate login form
                if (!email.trim()) {
                    setError("Please provide your email address");
                    return;
                }
                if (!password.trim()) {
                    setError("Please provide your password");
                    return;
                }
                
                setLoggingIn(true);
                console.log("Attempting login with:", { email: email.trim(), passwordLength: password.trim().length });
                await handleLogin(email.trim(), password.trim());
                setLoggingIn(false); // Reset on success
            }
            
            if (formState === 1) {
                // Validate registration form
                if (!name.trim()) {
                    setError("Please provide your full name");
                    return;
                }
                if (!email.trim()) {
                    setError("Please provide your email address");
                    return;
                }
                if (!username.trim()) {
                    setError("Please provide a username");
                    return;
                }
                if (!password.trim()) {
                    setError("Please provide a password");
                    return;
                }
                
                setLoggingIn(true);
                let result = await handleRegister(name, email, username, password);
                console.log(result);
                setEmail("");
                setUsername("");
                setName("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
                setLoggingIn(false);
            }
        } catch (error) {
            console.log("Authentication error:", error);
            setLoggingIn(false); // Reset loading state on error
            
            // Handle different error response formats
            let message = "An error occurred. Please try again.";
            
            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }
            
            setError(message);
        }
    }
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <CssBaseline />
      
      {/* Main Container */}
      <Container maxWidth="xs">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 3,
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '20px',
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1))',
                }
              }}
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 1.5,
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <VideoCallIcon sx={{ fontSize: 32 }} />
              </Avatar>
              
              <Typography variant="h5" component="h1" fontWeight="600" gutterBottom>
                ConferPoint
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 1, 
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                Connect, Collaborate, Celebrate
              </Typography>
            </Box>

            {/* Tab Navigation */}
            <Box sx={{ display: 'flex', background: 'rgba(248, 249, 250, 0.8)' }}>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setFormState(0);
                  clearForm();
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 0,
                  fontWeight: formState === 0 ? '600' : '400',
                  fontSize: '0.95rem',
                  color: formState === 0 ? '#667eea' : '#6c757d',
                  background: formState === 0 ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  borderBottom: formState === 0 ? '3px solid #667eea' : '3px solid transparent',
                  '&:hover': {
                    background: formState === 0 ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.05)',
                    color: '#667eea',
                  }
                }}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setFormState(1);
                  clearForm();
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 0,
                  fontWeight: formState === 1 ? '600' : '400',
                  fontSize: '0.95rem',
                  color: formState === 1 ? '#667eea' : '#6c757d',
                  background: formState === 1 ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  borderBottom: formState === 1 ? '3px solid #667eea' : '3px solid transparent',
                  '&:hover': {
                    background: formState === 1 ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.05)',
                    color: '#667eea',
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>

            {/* Form Section */}
            <Box sx={{ p: 3 }}>
              <Slide direction="up" in={true} timeout={600}>
                <Box component="form" noValidate>
                  {formState === 1 && (
                    <TextField
                      margin="dense"
                      required
                      fullWidth
                      id="fullname"
                      label="Full Name"
                      name="fullname"
                      autoComplete="name"
                      autoFocus={formState === 1}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                  )}

                  {formState === 1 && (
                    <TextField
                      margin="dense"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                  )}
                  
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus={formState === 0}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                  
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete={formState === 0 ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem',
                      },
                    }}
                  />

                  {/* Error Message */}
                  {error && (
                    <Fade in={!!error}>
                      <Box
                        sx={{
                          mb: 2,
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(255, 107, 107, 0.1)',
                          border: '1px solid rgba(255, 107, 107, 0.3)',
                          color: '#d63384',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                        }}
                      >
                        {error}
                      </Box>
                    </Fade>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    onClick={handleAuth}
                    disabled={loggingIn}
                    sx={{
                      mt: 1,
                      mb: 2,
                      py: 1.2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                      },
                      '&:disabled': {
                        background: 'rgba(108, 117, 125, 0.3)',
                        transform: 'none',
                        boxShadow: 'none',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {loggingIn ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                          }}
                        />
                        {formState === 0 ? 'Signing In...' : 'Creating Account...'}
                      </Box>
                    ) : (
                      formState === 0 ? 'Sign In' : 'Create Account'
                    )}
                  </Button>

                  {/* Switch Mode Text */}
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {formState === 0 ? "Don't have an account?" : "Already have an account?"}
                      <Button
                        variant="text"
                        onClick={() => {
                          setFormState(formState === 0 ? 1 : 0);
                          clearForm();
                        }}
                        sx={{
                          color: '#667eea',
                          fontWeight: '600',
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          ml: 0.5,
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.08)',
                          },
                        }}
                      >
                        {formState === 0 ? 'Sign Up' : 'Sign In'}
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </Slide>
            </Box>
          </Paper>
        </Fade>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
