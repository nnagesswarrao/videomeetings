const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

class Meeting {
    // Create a new meeting
    static async create(meetingData) {
        const { 
            host_id,
            team_id = null,
            channel_id = null,
            title,
            description = '',
            meeting_type = 'instant',
            start_time = new Date(),
            end_time = null,
            recurrence_pattern = null,
            time_zone = 'UTC',
            status = 'scheduled',
            password = null,
            max_participants = 100,
            recording_enabled = false,
            transcription_enabled = false,
            chat_enabled = true
        } = meetingData;

        // Generate unique meeting_id
        const meeting_id = uuidv4();

        const sql = `
            INSERT INTO meetings (
                meeting_id, host_id, team_id, channel_id, title, 
                description, meeting_type, start_time, end_time, 
                recurrence_pattern, time_zone, status, password, 
                max_participants, recording_enabled, 
                transcription_enabled, chat_enabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;



        const params = [
            meeting_id, 
            host_id, 
            team_id, 
            channel_id, 
            title,
            description, 
            meeting_type, 
            start_time, 
            end_time, 
            recurrence_pattern, 
            time_zone, 
            status, 
            password, 
            max_participants, 
            recording_enabled, 
            transcription_enabled, 
            chat_enabled
        ];
        console.log(params, "===vcxvxv=")
        try {
            const result = await db.query(sql, params);
            return {
                id: result.insertId,
                meeting_id,
                title,
                start_time,
                status
            };
        } catch (error) {
            console.error('Failed to create meeting:', error);
            throw error;
        }
    }

    // Get meeting by ID
    static async findById(meetingId) {
        // console.log(meetingId, "=====")
        const sql = `
            SELECT * FROM meetings 
            WHERE  id = ?
        `;

        try {
            const [meeting] = await db.query(sql, [meetingId]);
            // console.log(meeting, "=====")
            return meeting;

        } catch (error) {
            console.error('Failed to find meeting:', error);
            throw error;
        }
    }

    // List meetings
    static async findAll(limit = 50, hostId = null) {
        let sql = `
            SELECT m.*, u.name as host_name, u.email as host_email
            FROM meetings m
            LEFT JOIN users u ON m.host_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (hostId) {
            sql += ` AND m.host_id = ?`;
            params.push(hostId);
        }

        sql += ` ORDER BY m.created_at DESC LIMIT ?`;
        params.push(limit);

        try {
            return await db.query(sql, params);
        } catch (error) {
            console.error('Failed to list meetings:', error);
            throw error;
        }
    }

    // Update meeting status
    static async updateStatus(meetingId, status) {
        const sql = `
            UPDATE meetings 
            SET status = ? 
            WHERE meeting_id = ? OR id = ?
        `;

        try {
            await db.query(sql, [status, meetingId, meetingId]);
            return { meetingId, status };
        } catch (error) {
            console.error('Failed to update meeting status:', error);
            throw error;
        }
    }
}

module.exports = Meeting;
