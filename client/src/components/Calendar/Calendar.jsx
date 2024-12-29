import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';

const locales = {
    'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

const Calendar = ({ meetings, onSelectEvent }) => {
    const events = meetings.map(meeting => ({
        title: meeting.title,
        start: new Date(meeting.start_time),
        end: new Date(meeting.end_time),
        resource: meeting
    }));

    const eventPropGetter = (event) => {
        const meeting = event.resource;
        const now = new Date();
        let backgroundColor = '#3182CE'; // blue.500 for upcoming
        
        if (new Date(meeting.end_time) < now) {
            backgroundColor = '#718096'; // gray.500 for completed
        } else if (new Date(meeting.start_time) <= now && new Date(meeting.end_time) >= now) {
            backgroundColor = '#38A169'; // green.500 for in progress
        }
        
        return {
            style: {
                backgroundColor,
                borderRadius: '4px'
            }
        };
    };

    return (
        <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
        />
    );
};

export default Calendar;
