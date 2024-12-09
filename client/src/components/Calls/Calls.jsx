import React, { useState } from 'react';
import './Calls.css';

const Calls = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('personal');
  const [view, setView] = useState('all');

  const callHistory = [
    {
      id: 1,
      name: 'Rajesh Muramalla',
      type: 'incoming',
      duration: '5m 23s',
      date: 'Thursday',
      avatar: '👤'
    },
    {
      id: 2,
      name: 'Ramya Sri Machana',
      type: 'outgoing',
      duration: '35s',
      date: 'Tuesday',
      avatar: 'RM'
    },
    {
      id: 3,
      name: 'Pradeep Kumar Ravi',
      type: 'missed',
      date: 'Monday',
      avatar: 'PR'
    }
  ];

  const contacts = [
    {
      id: 1,
      name: 'Rajesh Muramalla',
      status: 'Available',
      avatar: '👤'
    },
    {
      id: 2,
      name: 'Ramya Sri Machana',
      status: 'Busy',
      avatar: 'RM'
    },
    {
      id: 3,
      name: 'Pradeep Kumar Ravi',
      status: 'Away',
      avatar: 'PR'
    }
  ];

  const handleCall = (contact) => {
    console.log('Calling:', contact.name);
  };

  const handleVideoCall = (contact) => {
    console.log('Video calling:', contact.name);
  };

  return (
    <div className="calls-container">
      <div className="calls-header">
        <div className="calls-title">
          <h2>Calls</h2>
        </div>
        <div className="calls-tabs">
          <button 
            className={`tab ${selectedTab === 'personal' ? 'active' : ''}`}
            onClick={() => setSelectedTab('personal')}
          >
            Personal
          </button>
          <button 
            className={`tab ${selectedTab === 'missed' ? 'active' : ''}`}
            onClick={() => setSelectedTab('missed')}
          >
            Missed
          </button>
        </div>
        <button className="view-contacts-btn">
          View contacts
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Type a name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="calls-content">
        <div className="calls-section">
          <div className="section-header">
            <h3>History</h3>
            <select 
              value={view} 
              onChange={(e) => setView(e.target.value)}
            >
              <option value="all">All</option>
              <option value="missed">Missed</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>

          <div className="call-history">
            {callHistory.map((call) => (
              <div key={call.id} className="call-item">
                <div className="avatar">{call.avatar}</div>
                <div className="call-info">
                  <div className="name">{call.name}</div>
                  <div className="call-details">
                    <span className={`call-type ${call.type}`}>
                      {call.type === 'incoming' ? '↙️' : call.type === 'outgoing' ? '↗️' : '❌'}
                    </span>
                    {call.duration && <span className="duration">{call.duration}</span>}
                    <span className="date">{call.date}</span>
                  </div>
                </div>
                <div className="call-actions">
                  <button onClick={() => handleVideoCall(call)}>📹</button>
                  <button onClick={() => handleCall(call)}>📞</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="speed-dial">
          <h3>Speed dial</h3>
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div key={contact.id} className="contact-item">
                <div className="avatar">{contact.avatar}</div>
                <div className="contact-info">
                  <div className="name">{contact.name}</div>
                  <div className="status">{contact.status}</div>
                </div>
                <div className="contact-actions">
                  <button onClick={() => handleVideoCall(contact)}>📹</button>
                  <button onClick={() => handleCall(contact)}>📞</button>
                </div>
              </div>
            ))}
          </div>
          <button className="add-speed-dial">
            Add people to speed dial for quick access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calls;
