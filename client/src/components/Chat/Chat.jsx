import React, { useState } from 'react';
import './Chat.css';

const Chat = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const meetings = [
    {
      id: 1,
      title: 'Daily Status Meetings',
      date: 'Wednesday 10:13 AM',
      duration: '46m 12s',
      status: 'ended',
      participants: ['Murali Krishna Oleti', 'Harsha', 'Sathi babu'],
      messages: [
        {
          id: 1,
          sender: 'Harsha',
          content: '1 hr late join',
          time: 'Thursday 8:19 AM',
          avatar: '👤'
        },
        {
          id: 2,
          sender: 'Sathi babu',
          content: '30 min late join',
          time: 'Thursday 8:25 AM',
          avatar: 'SB'
        }
      ]
    },
    {
      id: 2,
      title: 'Review Meeting On Supplementary',
      date: 'Friday 10:47 AM',
      duration: '1h 17m 34s',
      status: 'ended',
      participants: ['Rajesh', 'Nageswarao'],
      messages: [
        {
          id: 1,
          sender: 'Rajesh',
          content: 'I have internet issues',
          time: 'Friday 10:50 AM',
          avatar: 'RJ'
        }
      ]
    },
    {
      id: 3,
      title: 'Demo on Windsurf',
      date: 'Friday 12:02 PM',
      duration: '9s',
      status: 'ended',
      participants: [],
      messages: [],
      recording: 'Recording is ready'
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Add message handling logic here
    setMessageInput('');
  };

  const renderMeetingList = () => (
    <div className="meeting-list">
      <div className="meeting-list-header">
        <h2>Chat</h2>
      </div>
      <div className="filter-section">
        <div className="filter-tabs">
          <button className="tab active">Pinned</button>
          <button className="tab">Recent</button>
        </div>
      </div>
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className={`meeting-item ${selectedMeeting?.id === meeting.id ? 'active' : ''}`}
          onClick={() => setSelectedMeeting(meeting)}
        >
          <div className="meeting-icon">📅</div>
          <div className="meeting-info">
            <div className="meeting-title">{meeting.title}</div>
            <div className="meeting-meta">
              {meeting.recording ? (
                <span className="recording-badge">🎥 {meeting.recording}</span>
              ) : (
                <span className="meeting-time">{meeting.date}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChatView = () => (
    <div className="chat-view">
      {selectedMeeting ? (
        <>
          <div className="chat-header">
            <div className="chat-title">
              <h2>{selectedMeeting.title}</h2>
              <div className="meeting-details">
                <span>Meeting {selectedMeeting.status}</span>
                <span>•</span>
                <span>{selectedMeeting.duration}</span>
              </div>
            </div>
            <div className="chat-actions">
              <button className="action-btn">Join</button>
              <button className="action-btn">⚙️</button>
            </div>
          </div>
          
          <div className="chat-messages">
            <div className="meeting-status-message">
              Meeting started on {selectedMeeting.date}
            </div>
            {selectedMeeting.messages.map((message) => (
              <div key={message.id} className="message">
                <div className="message-avatar">{message.avatar}</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.sender}</span>
                    <span className="message-time">{message.time}</span>
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <div className="input-container">
              <button type="button" className="format-btn">📎</button>
              <input
                type="text"
                placeholder="Type a message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="button" className="format-btn">😊</button>
              <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
                ▶️
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="no-chat-selected">
          <h3>Select a meeting to view the chat</h3>
        </div>
      )}
    </div>
  );

  return (
    <div className="chat-container">
      {renderMeetingList()}
      {renderChatView()}
    </div>
  );
};

export default Chat;
