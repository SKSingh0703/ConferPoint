import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Avatar,
  Fade,
  Slide,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VideocamOff as VideocamOffIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const PreMeetingScreen = ({ 
  onConnect, 
  localVideoRef, 
  videoAvailable, 
  audioAvailable, 
  onVideoToggle, 
  onAudioToggle 
}) => {
  const [username, setUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Use useCallback to prevent unnecessary re-renders
  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
  }, []);

  const handleConnect = useCallback(() => {
    if (username.trim()) {
      setIsConnecting(true);
      onConnect(username.trim());
    }
  }, [username, onConnect]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && username.trim()) {
      handleConnect();
    }
  }, [username, handleConnect]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Fade in={true} timeout={1000}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: '80vh',
              gap: 6,
            }}
          >
            {/* Left Content */}
            <Slide direction="right" in={true} timeout={1200}>
              <Box sx={{ flex: 1, color: 'white' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      background: 'linear-gradient(45deg, #FF6B6B, #ee5a24)',
                    }}
                  >
                    <VideocamIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'Poppins',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ConferPoint
                  </Typography>
                </Box>

                {/* Main Content */}
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    lineHeight: 1.2,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Ready to connect?
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Enter your display name to join the meeting and start collaborating
                </Typography>

                {/* Username Input */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: '#333',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <PersonIcon color="primary" />
                        Display Name
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#666', mb: 2 }}
                      >
                        This is how other participants will see you
                      </Typography>
                    </Box>
                    
                    <TextField
                      fullWidth
                      value={username}
                      onChange={handleUsernameChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your name"
                      variant="outlined"
                      disabled={isConnecting}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1.1rem',
                          py: 1,
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '1rem',
                        },
                      }}
                      inputProps={{
                        style: { textAlign: 'center', fontSize: '1.1rem' }
                      }}
                    />

                    <Button
                      variant="contained"
                      onClick={handleConnect}
                      disabled={!username.trim() || isConnecting}
                      size="large"
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #FF6B6B, #ee5a24)',
                        boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #ee5a24, #FF6B6B)',
                          boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isConnecting ? 'Connecting...' : 'Join Meeting'}
                    </Button>
                  </Stack>
                </Paper>

              </Box>
            </Slide>

            {/* Right Content - Video Preview */}
            <Slide direction="left" in={true} timeout={1400}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: '#000',
                      mb: 3,
                    }}
                  >
                    <Box
                      component="video"
                      ref={localVideoRef}
                      autoPlay
                      muted
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '400px',
                        display: 'block',
                        transform: 'scaleX(-1)', // Mirror the video
                        opacity: videoAvailable ? 1 : 0.3,
                        transition: 'opacity 0.3s ease',
                      }}
                    />

                    {/* Video Disabled Overlay - Only show when camera is actually disabled */}
                    {!videoAvailable && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                          pointerEvents: 'none', // Allow clicks to pass through
                        }}
                      >
                        <VideocamOffIcon 
                          sx={{ 
                            fontSize: 64, 
                            color: 'white',
                            mb: 2,
                            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                          }} 
                        />
                        
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'white',
                            fontWeight: 700,
                            textAlign: 'center',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          Camera Disabled
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.9)',
                            textAlign: 'center',
                            mt: 1,
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          Click the camera button to enable
                        </Typography>
                      </Box>
                    )}

                    {/* Audio Only Disabled Indicator - Small overlay in corner when only audio is disabled */}
                    {videoAvailable && !audioAvailable && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          background: 'rgba(255, 152, 0, 0.9)',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          zIndex: 5,
                          pointerEvents: 'none',
                          border: 'none', // Remove any borders
                        }}
                      >
                        <MicOffIcon sx={{ fontSize: 20, color: 'white' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          Audio Disabled
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Video Overlay Controls */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        gap: 1,
                        zIndex: 10, // Ensure buttons are above overlay
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log('🎥 BUTTON CLICKED - PreMeetingScreen');
                          onVideoToggle();
                        }}
                        disabled={false} // Explicitly ensure button is not disabled
                        sx={{
                          color: videoAvailable ? '#4CAF50' : '#f44336',
                          background: videoAvailable 
                            ? 'rgba(76, 175, 80, 0.9)' 
                            : 'rgba(244, 67, 54, 0.9)',
                          border: `2px solid ${videoAvailable ? '#4CAF50' : '#f44336'}`,
                          '&:hover': {
                            background: videoAvailable 
                              ? 'rgba(76, 175, 80, 1)' 
                              : 'rgba(244, 67, 54, 1)',
                            transform: 'scale(1.05)',
                          },
                          '&:disabled': {
                            background: 'rgba(128, 128, 128, 0.5)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                          transition: 'all 0.2s ease',
                          width: 40,
                          height: 40,
                          cursor: 'pointer',
                        }}
                      >
                        {videoAvailable ? (
                          <VideocamIcon sx={{ fontSize: 20, color: 'white' }} />
                        ) : (
                          <VideocamOffIcon sx={{ fontSize: 20, color: 'white' }} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log('🎤 BUTTON CLICKED - PreMeetingScreen');
                          onAudioToggle();
                        }}
                        disabled={false} // Explicitly ensure button is not disabled
                        sx={{
                          color: audioAvailable ? '#4CAF50' : '#f44336',
                          background: audioAvailable 
                            ? 'rgba(76, 175, 80, 0.9)' 
                            : 'rgba(244, 67, 54, 0.9)',
                          border: `2px solid ${audioAvailable ? '#4CAF50' : '#f44336'}`,
                          '&:hover': {
                            background: audioAvailable 
                              ? 'rgba(76, 175, 80, 1)' 
                              : 'rgba(244, 67, 54, 1)',
                            transform: 'scale(1.05)',
                          },
                          '&:disabled': {
                            background: 'rgba(128, 128, 128, 0.5)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                          transition: 'all 0.2s ease',
                          width: 40,
                          height: 40,
                          cursor: 'pointer',
                        }}
                      >
                        {audioAvailable ? (
                          <MicIcon sx={{ fontSize: 20, color: 'white' }} />
                        ) : (
                          <MicOffIcon sx={{ fontSize: 20, color: 'white' }} />
                        )}
                      </IconButton>
                    </Box>

                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Camera Preview
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      mb: 2,
                    }}
                  >
                    Check your camera and microphone settings before joining
                  </Typography>

                  <Stack direction="row" spacing={1} justifyContent="center">
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Ready to connect
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Slide>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

PreMeetingScreen.propTypes = {
  onConnect: PropTypes.func.isRequired,
  localVideoRef: PropTypes.object.isRequired,
  videoAvailable: PropTypes.bool.isRequired,
  audioAvailable: PropTypes.bool.isRequired,
  onVideoToggle: PropTypes.func.isRequired,
  onAudioToggle: PropTypes.func.isRequired,
};

export default PreMeetingScreen;
