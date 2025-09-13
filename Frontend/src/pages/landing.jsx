import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  AppBar,
  Toolbar,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  VideoCall as VideoCallIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  HighQuality as QualityIcon
} from '@mui/icons-material';
import "../App.css";

export default function LandingPage() {
  const router = useNavigate();
  
  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Secure & Private",
      description: "End-to-end encryption ensures your conversations stay private and secure."
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Lightning Fast",
      description: "Optimized for speed with minimal latency for crystal-clear conversations."
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Group Meetings",
      description: "Host meetings with multiple participants with advanced screen sharing."
    },
    {
      icon: <QualityIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "HD Quality",
      description: "High-definition video and audio quality for professional meetings."
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite',
        }}
      />

      {/* Navigation */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VideoCallIcon sx={{ color: 'white', fontSize: 36 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                fontWeight: 700,
                fontFamily: 'Poppins',
                letterSpacing: '-0.02em'
              }}
            >
              ConferPoint
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => router("/auth")}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                },
                fontWeight: 500,
                transition: 'all 0.3s ease',
              }}
            >
              Register
            </Button>
            <Button
              variant="contained"
              onClick={() => router("/auth")}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              Login
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '70vh',
            justifyContent: 'center',
          }}
        >
          {/* Hero Section */}
          <Box sx={{ mb: 8, color: 'white' }}>
            <Chip
              label="🚀 Now Available"
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                mb: 3,
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            />
            
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                fontSize: { xs: '3rem', md: '4.5rem' },
              }}
            >
              Connect{' '}
              <Box component="span" sx={{ 
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}>
                Seamlessly
              </Box>
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Experience the future of video conferencing with ConferPoint - 
              where distance becomes irrelevant and connections become effortless.
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Button
                component={Link}
                to="/auth"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  color: '#1e3c72',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FFA500, #FFD700)',
                    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.5)',
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Free Meeting
              </Button>
            </Box>
          </Box>

          {/* Features Section */}
          <Grid container spacing={4} sx={{ mt: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        mb: 2,
                        fontFamily: 'Poppins',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
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
  )
}
