const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');

class MeetingController {
    // Create a new meeting
    static async getAllMeeting(req, res) {
        try {
            const allMeetings = await Meeting.getAllMeeting();
            console.log(allMeetings,"===========Tesing=========")
            res.json(allMeetings);
        } catch (error) {
            console.error('Meeting creation error:', error);
            res.status(500).json({
                error: 'Failed to create meeting',
                details: error.message
            });
        }
    }


    // Create a new meeting
    static async createMeeting(req, res) {
        console.log(req.body, "=====");
        try {
            const reqBody = req.body;
            // Validate required fields
            if (!reqBody.title) {
                return res.status(400).json({
                    error: 'Meeting name is required'
                });
            }

            // TODO: Get authenticated user's ID
            const host_id = req.user ? req.user.id : 1; // Default to 1 for testing
            reqBody.host_id = host_id;
            reqBody.meeting_link = req.headers.origin + '/join/' + uuidv4();
            // Create meeting
            const newMeeting = await Meeting.create(reqBody);

            res.status(201).json({
                message: 'Meeting created successfully',
                meeting: newMeeting
            });
        } catch (error) {
            console.error('Meeting creation error:', error);
            res.status(500).json({
                error: 'Failed to create meeting',
                details: error.message
            });
        }
    }

    // Get meeting details
    static async getMeetingById(req, res) {
        try {
            const { meetingId } = req.params;
            const meeting = await Meeting.findById(meetingId);

            if (!meeting) {
                return res.status(404).json({
                    error: 'Meeting not found'
                });
            }

            res.json(meeting);
        } catch (error) {
            res.status(500).json({
                error: 'Failed to retrieve meeting',
                details: error.message
            });
        }
    }

    // List meetings
    static async listMeetings(req, res) {
        try {
            // Optional filtering by host
            const { hostId } = req.query;
            const meetings = await Meeting.findAll(50, hostId);
            res.json(meetings);
        } catch (error) {
            res.status(500).json({
                error: 'Failed to list meetings',
                details: error.message
            });
        }
    }

    // Update meeting status
    static async updateMeetingStatus(req, res) {
        try {
            const { meetingId } = req.params;
            const { status } = req.body;

            const result = await Meeting.updateStatus(meetingId, status);

            res.json({
                message: 'Meeting status updated',
                meeting: result
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to update meeting',
                details: error.message
            });
        }
    }
}

module.exports = MeetingController;
