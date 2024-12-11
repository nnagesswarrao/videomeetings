const express = require('express');
const router = express.Router();
const MeetingController = require('../controllers/meetingController');

// Meeting creation route
router.post('/create', MeetingController.createMeeting);

// Get meeting details
router.get('/:meetingId', MeetingController.getMeetingById);

// List all meetings
router.get('/', MeetingController.listMeetings);

// Update meeting status
router.patch('/:meetingId/status', MeetingController.updateMeetingStatus);

module.exports = router;
