import React, { useState, useEffect } from 'react';
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
  Navigate, 
  useNavigate 
} from 'react-router-dom';

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

// Additional Components
import Chat from './components/Chat/Chat.jsx';
import Calls from './components/Calls/Calls.jsx';
import Calendar from './components/Calendar/Calendar.jsx';
import CreateMeeting from './components/CreateMeeting.jsx';
import JoinMeeting from './components/JoinMeeting.jsx';

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

// Authentication Context
const AuthContext = React.createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = React.useContext(AuthContext);
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const authContext = {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContext}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Router>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            {/* Header */}
            {authContext.isAuthenticated && (
              <Header 
                title="Teams Meeting" 
                user={user}
                onLogout={logout}
              />
            )}

            {/* Main Content Area */}
            <Box display="flex" flex={1}>
              {/* Side Navigation */}
              {authContext.isAuthenticated && <SideNav />}

              {/* Routes */}
              <Box 
                className="main-content"
                ml={authContext.isAuthenticated ? "280px" : "0"}
                mt="4rem"
                flex={1} 
                p={6} 
                bg="gray.50"
              >
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Signup />} />

                  {/* Protected Routes */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/calendar" 
                    element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/calls" 
                    element={
                      <ProtectedRoute>
                        <Calls />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/create-meeting" 
                    element={
                      <ProtectedRoute>
                        <CreateMeeting />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/join-meeting" 
                    element={
                      <ProtectedRoute>
                        <JoinMeeting />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/meetings" 
                    element={
                      <ProtectedRoute>
                        <MeetingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404 Route */}
                  <Route 
                    path="*" 
                    element={
                      <ProtectedRoute>
                        <NotFoundPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Box>
            </Box>

            {/* Footer */}
            {authContext.isAuthenticated && <Footer />}
          </Box>
        </Router>
      </ChakraProvider>
    </AuthContext.Provider>
  );
}

export { AuthContext };
export default App;
