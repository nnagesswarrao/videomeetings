const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

const onToConvertdateToTimeFormat = (date_time) => {
    const endTime = new Date(date_time);
    // Convert to MySQL DATETIME format (local time)
    const mysqlDateTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
    console.log(mysqlDateTime, "=====")
    return mysqlDateTime;
}


class Meeting {
    // Create a new meeting
    static async create(data) {
        const sql = `INSERT INTO meetings(title,room_id,description,
                   agenda,meeting_link,host_id,meeting_type,password,
                   max_participants,start_time,end_time,is_recording_enabled,is_chat_enabled,
                   is_screen_share_enabled,status,created_at)VALUES (
                   '${data?.title || null}', '${uuidv4()}',
                    '${data?.description}',
                   ${data?.agenda || null},'${data?.meeting_link || null}',
                   ${data?.host_id || null},
                   ${data.is_online_meeting ? 1 : 0},
                   ${data?.password || null},${data?.max_participants || null},
                   '${onToConvertdateToTimeFormat(data?.start_time)}',
                   '${onToConvertdateToTimeFormat(data?.end_time)}',
                   ${data.record_meeting ? 1 : 0},${data?.is_chat_enabled ? 1 : 0},
                   ${data?.is_screen_share_enabled ? 1 : 0},
                   'scheduled', CURRENT_TIMESTAMP())`;
        try {
            const result = await db.query(sql);
console.log(result, "=====")
            return {
                id: result.insertId,
                title: data?.title,
                start_time: data?.start_time,
                status: data?.status
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
