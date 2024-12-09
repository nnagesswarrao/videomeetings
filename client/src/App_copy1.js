import React from 'react';
import { 
  ChakraProvider, 
  extendTheme,
  ColorModeScript 
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';

// Pages and Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MeetingsPage from './pages/MeetingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Additional Components
import Chat from './components/Chat/Chat';
import Calls from './components/Calls/Calls';
import Calendar from './components/Calendar/Calendar';
import CreateMeeting from './components/Meetings/CreateMeeting';
import JoinMeeting from './components/Meetings/JoinMeeting';

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

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Layout>
                <HomePage />
              </Layout>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/dashboard" 
            element={
              <Layout>
                <HomePage />
              </Layout>
            } 
          />
          
          <Route 
            path="/chat" 
            element={
              <Layout>
                <Chat />
              </Layout>
            } 
          />
          
          <Route 
            path="/calendar" 
            element={
              <Layout>
                <Calendar />
              </Layout>
            } 
          />
          
          <Route 
            path="/calls" 
            element={
              <Layout>
                <Calls />
              </Layout>
            } 
          />
          
          <Route 
            path="/create-meeting" 
            element={
              <Layout>
                <CreateMeeting />
              </Layout>
            } 
          />
          
          <Route 
            path="/join-meeting" 
            element={
              <Layout>
                <JoinMeeting />
              </Layout>
            } 
          />
          
          <Route 
            path="/meetings" 
            element={
              <Layout>
                <MeetingsPage />
              </Layout>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <Layout>
                <ProfilePage />
              </Layout>
            } 
          />
          
          <Route 
            path="*" 
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            } 
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
