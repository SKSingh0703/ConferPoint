
import './App.css'
import {Route,BrowserRouter as Router, Routes} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import ProtectedRoute from './utils/ProtectedRoute';
import PublicRoute from './utils/PublicRoute';
import theme from './theme/theme';

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className='App'>
        <Router>
          <AuthProvider>
          <Routes>
            <Route path='/' element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path='/auth' element={
              <PublicRoute>
                <Authentication />
              </PublicRoute>
            } />
            <Route path='/home' element={
              <ProtectedRoute>
                <HomeComponent />
              </ProtectedRoute>
            } />
            <Route path='/history' element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path='/:url' element={
              <ProtectedRoute>
                <VideoMeetComponent />
              </ProtectedRoute>
            } />
          </Routes>
          </AuthProvider>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
