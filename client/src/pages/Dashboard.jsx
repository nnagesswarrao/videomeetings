import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { label: 'Total Meetings', value: '24', icon: '📊' },
    { label: 'Active Meetings', value: '3', icon: '🟢' },
    { label: 'Scheduled Today', value: '5', icon: '📅' },
    { label: 'Participants', value: '42', icon: '👥' },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="upcoming-meetings">
        <h2>Upcoming Meetings</h2>
        <div className="meeting-list">
          {/* Add your meeting list items here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
