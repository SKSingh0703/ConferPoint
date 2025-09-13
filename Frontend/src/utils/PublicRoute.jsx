import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PublicRoute = ({ children }) => {
    const { userData, isLoading } = useContext(AuthContext);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <CircularProgress size={60} sx={{ color: 'white' }} />
            </Box>
        );
    }

    // If user is authenticated, redirect to home
    if (userData) {
        return <Navigate to="/home" replace />;
    }

    // If user is not authenticated, render the public component
    return children;
};

export default PublicRoute;
