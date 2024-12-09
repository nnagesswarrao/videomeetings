import React, { useState } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('work-week');

  // Generate week days
  const generateWeekDays = () => {
    const days = [];
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday

    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date: date.getDate(),
        day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date),
      });
    }
    return days;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 7; i <= 23; i++) {
      slots.push(`${i}:00`);
    }
    return slots;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>Calendar</h2>
        </div>
        <div className="calendar-actions">
          <button className="join-id-btn">Join with an ID</button>
          <button className="meet-now-btn">Meet now</button>
          <button className="new-meeting-btn">+ New meeting</button>
        </div>
      </div>

      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <button onClick={() => setCurrentDate(new Date())}>Today</button>
          <button onClick={handlePrevWeek}>&lt;</button>
          <button onClick={handleNextWeek}>&gt;</button>
          <span className="current-month">
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
          </span>
        </div>
        <div className="view-options">
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="work-week">Work week</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="time-column">
          {generateTimeSlots().map((time) => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>
        
        <div className="days-grid">
          <div className="days-header">
            {generateWeekDays().map((day) => (
              <div key={day.date} className="day-column-header">
                <div className="day-name">{day.day}</div>
                <div className="day-date">{day.date}</div>
              </div>
            ))}
          </div>
          
          <div className="time-slots-grid">
            {generateWeekDays().map((day) => (
              <div key={day.date} className="day-column">
                {generateTimeSlots().map((time) => (
                  <div key={`${day.date}-${time}`} className="grid-cell"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
