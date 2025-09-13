import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  Stack,
  Chip,
  Divider,
  Paper,
  Grid,
  Avatar,
  Button
} from '@mui/material';
import { 
  Home as HomeIcon,
  VideoCall as VideoCallIcon,
  AccessTime as TimeIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
        setLoading(true);
                const history = await getHistoryOfUser();
        setMeetings(history || []);
            } catch(e) {
        console.log('Error fetching history:', e);
        setMeetings([]);
      } finally {
        setLoading(false);
            }
        }

        fetchHistory();
  }, []);

  const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could add a snackbar here for feedback
  };

  const joinMeeting = (code) => {
    routeTo(`/${code}`);
  };

    return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse',
        }}
      />

      {/* Header */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          p: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton 
              onClick={() => routeTo("/home")}
              sx={{ 
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <VideoCallIcon sx={{ color: 'white', fontSize: 32 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                fontWeight: 700,
                fontFamily: 'Poppins',
                letterSpacing: '-0.02em'
              }}
            >
              Meeting History
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: 'white', opacity: 0.8 }}>
              Loading your meeting history...
            </Typography>
          </Box>
        ) : meetings.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
            }}
          >
            <VideoCallIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              No Meeting History
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4 }}>
              You haven't joined any meetings yet. Start your first meeting to see it here!
            </Typography>
            <Button
              variant="contained"
              onClick={() => routeTo("/home")}
              sx={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                color: '#1e3c72',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFA500, #FFD700)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Create New Meeting
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {meetings.map((meeting, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <VideoCallIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          Meeting #{index + 1}
                        </Typography>
                        <Chip
                          label="Completed"
                          size="small"
                          sx={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            color: '#4CAF50',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                          }}
                        />
                      </Box>
                    </Stack>

                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }} />

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                          Meeting Code
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              letterSpacing: '0.1em'
                            }}
                          >
                            {meeting.meetingCode}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(meeting.meetingCode)}
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': { color: 'white' }
                            }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                          Date & Time
                                    </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TimeIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
                          <Typography variant="body1" sx={{ color: 'white' }}>
                            {formatDate(meeting.date)} at {formatTime(meeting.date)}
                                    </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={{ mt: 3, pt: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => joinMeeting(meeting.meetingCode)}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        Join Again
                      </Button>
                    </Box>
                                </CardContent>
                            </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* CSS Animations */}
      <Box
        sx={{
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(5deg)' },
          },
        }}
      />
    </Box>
  );
}