import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SideNav.css';

const SideNav = () => {
  const location = useLocation();
  const [date, setDate] = React.useState(new Date());
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/calls', icon: '📞', label: 'Calls' },
    { path: '/create-meeting', icon: '➕', label: 'Create Meeting' },
    { path: '/join-meeting', icon: '➡️', label: 'Join Meeting' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`side-nav ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isExpanded ? '◀' : '▶'}
      </button>

      <div className="logo">
        <h2>{isExpanded ? 'Video Meeting' : 'VM'}</h2>
      </div>
      
      {isExpanded && (
        <div className="calendar-widget">
          <Calendar
            onChange={setDate}
            value={date}
            className="mini-calendar"
          />
        </div>
      )}

      <nav className="menu-items">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            title={!isExpanded ? item.label : ''}
          >
            <span className="icon">{item.icon}</span>
            {isExpanded && <span className="label">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default SideNav;
