import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

import "../styles/authComponent.css"

const theme = createTheme();

export default function Authentication() {
  
    const [username,setUsername]=React.useState();
    const [password,setPassword]=React.useState();
    const [name,setName]=React.useState();
    const [error,setError]=React.useState();
    const [message,setMessage]=React.useState();

      const [loggingIn ,setLoggingIn] =React.useState(false);
    const [formState,setFormState]=React.useState(0);

    const [open,setOpen]=React.useState(false);
    const {handleRegister,handleLogin} =React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                setLoggingIn(true);
                setTimeout(() => setLoggingIn(false), 10000);
                let result = await handleLogin(username,password);
                
            }
            if (formState === 1) {
                let result = await handleRegister(name,username,password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
                
            }
        } catch (error) {
            console.log(error);
            
            let message = (error.response.data.message);
            setError(message);
        }
    }
  return (
    <div className="authContainer">
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          // backgroundImage: 'url("public/background.png")', // Replace with your background image path
          // backgroundSize: 'cover',
          // backgroundPosition: 'center',
          // minHeight: '100vh',
          // display: 'flex',
          // justifyContent: 'center',
          // alignItems: 'center',
        }}
      >
        <CssBaseline />
        <div className="authBox">
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            p: 4,
            marginTop:7,
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          <div
            style={{
            marginTop: '20px',  // Margin from the top
             marginBottom: '20px', // Margin from the bottom
            }}
        >
        <Button
            variant={formState === 0 ? "contained" : ""}
            onClick={() => setFormState(0)}
            sx={{
                color: 'white', // White text when contained, otherwise black
                marginRight: '10px', // Add space between buttons
              }}
            >
              Sign In
        </Button>
        <Button
            variant={formState === 1 ? "contained" : ""}
            onClick={() => setFormState(1)}
            sx={{
              color: 'white', // White text when contained, otherwise black
            }}
            >
         Sign Up
        </Button>
      </div>


          <Box component="form" noValidate sx={{ mt: 1 }}>
          {formState===1 ? 
          <TextField
              margin="normal"
              required
              fullWidth
              id="fullname"
              label="Full name"
              name="fullname"
              autoComplete="fullname"
              autoFocus
              value={name}
              InputLabelProps={{ style: { color: 'white' } }} // White label color
              InputProps={{
                style: { color: 'white', borderColor: 'blue' }, // White input text and custom border
              }}
              onChange={(e)=>setName(e.target.value)}
            />
            :<></>
            }
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              InputLabelProps={{ style: { color: 'white' } }} // White label color
              InputProps={{
                style: { color: 'white', borderColor: 'blue' }, // White input text and custom border
              }}
              onChange={(e)=>setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              InputLabelProps={{ style: { color: 'white' } }} // White label color
              InputProps={{
                style: { color: 'white' }, // White input text
              }}
              onChange={(e)=>setPassword(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  sx={{
                    border: '3px solid white', // Blue border
                    borderRadius: '5px', // Make it rounded if needed
                    width: '16px', // Set custom width
                    height: '16px', // Set custom height
                    padding: '2px', // Adjust padding to make it smaller
                    transform: 'scale(0.8)',
                    marginRight: '1px',
                    marginLeft: '10px', // Scale the checkbox down to make it smaller
                  }}
                />
              }
              label="Remember me"
              sx={{ color: 'white' }} // White checkbox label
            />
            <p style={{color:"red"}}  > *{error}</p>
            <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleAuth}>
              {formState === 0? (loggingIn ?"Logging in..." : "Login") :"Register"} 
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" sx={{ color: 'white' }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2" sx={{ color: 'white' }}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        </div>
        <div className="authPic">
        <Box
          sx={{
            // position: 'absolute',
            // top: '10px',
            // right: '100px',
            // width: 'auto', 
            // height: '100vh',
            // borderRadius: '5%', 
            // overflow: 'hidden',
          }}
        >
          <img
            src="/auth.jpg" 
            alt="Corner Image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        </div>
      </Container>
      <Snackbar 
      open={open} autoHideDuration={4000} message={message}
      />
    </div>
  );
}
