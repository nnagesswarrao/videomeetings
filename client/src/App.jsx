import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MeetingPage from './pages/MeetingPage';
import CreateMeeting from './components/CreateMeeting';
import JoinMeeting from './components/JoinMeeting';
import Dashboard from './pages/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Calls from './components/Calls/Calls';
import Chat from './components/Chat/Chat';
import SideNav from './components/SideNav';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Profile/Profile';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = localStorage.getItem('user');

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <SideNav />}
        <div className={`main-content ${isAuthenticated ? 'with-nav' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/calendar" element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            } />
            <Route path="/calls" element={
              <PrivateRoute>
                <Calls />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } />
            <Route path="/create-meeting" element={
              <PrivateRoute>
                <CreateMeeting />
              </PrivateRoute>
            } />
            <Route path="/join-meeting" element={
              <PrivateRoute>
                <JoinMeeting />
              </PrivateRoute>
            } />
            <Route path="/meeting/:roomId" element={
              <PrivateRoute>
                <MeetingPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
