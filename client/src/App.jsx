import React from 'react';
import {
  ChakraProvider,
  extendTheme,
  ColorModeScript,
  Box
} from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import components with full path to ensure correct import
import SideNav from './components/SideNav.jsx';
import Header from './components/Header/Header.jsx';
import Footer from './components/Layout/Footer.jsx';

// Pages and Components
import HomePage from './pages/HomePage.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import MeetingsPage from './pages/MeetingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import MeetingRoom from './components/MeetingRoom.jsx';

// Additional Components
import Chat from './components/Chat/Chat.jsx';
import Calls from './components/Calls/Calls.jsx';
import Calendar from './components/Calendar/Calendar.jsx';
import CreateMeeting from './components/CreateMeeting.jsx';
import JoinMeeting from './components/JoinMeeting.jsx';
import CreateParticipent from './components/CreateParticepent/CreateParticipent.jsx';
// Custom theme configuration

// Custom theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      }
    }
  }
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth() || { isAuthenticated: false };

  React.useEffect(() => {
    if (!isAuthenticated) {
      // Redirect after component mounts
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Show loading or null while checking auth status
  if (!isAuthenticated) {
    return null;
  }

  return children;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              {/* Public Routes - Outside Layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />

              {/* Protected Routes - Inside Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/dashboard" element={<HomePage />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/calls" element={<Calls />} />
                        <Route path="/create-meeting" element={<CreateMeeting />} />
                        <Route path="/join-meeting" element={<JoinMeeting />} />
                        <Route path="/meetings" element={<MeetingsPage />} />
                        <Route path="/meeting/:roomId" element={<MeetingRoom />} />
                        <Route path="/create-participent" element={<CreateParticipent />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
