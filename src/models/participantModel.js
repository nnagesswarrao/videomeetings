const db = require('../utils/db');
const { getGroupLabel } = require('../utils/groupTypeUtils');

class ParticipantModel {
  static async getAllParticipants() {
    try {
      const rows = await db.query('SELECT * FROM prtcpnts_lst_t ORDER BY created_at DESC');
      return Array.isArray(rows) ? rows.map(row => ({
        ...row,
        group_type_label: getGroupLabel(row.group_id)
      })) : [];
    } catch (error) {
      console.error('Model Error: Getting all participants:', error);
      throw error;
    }
  }
  
  static async createParticipant(participantData) {
  try {
    const { name, phoneNumber, email, dateOfBirth, groupType } = participantData;
    const result = await db.query(
      `INSERT INTO prtcpnts_lst_t (hostId,username, phone_number, email, 
      date_of_birth, group_id,created_at)
         VALUES (1,'${name}','${phoneNumber}','${email}',
         '${dateOfBirth}',${groupType}, CURRENT_TIMESTAMP())`);
    return result.insertId;
  } catch (error) {
    console.error('Model Error: Creating participant:', error);
    throw error;
  }
}

  static async updateParticipant(id, participantData) {
  try {
    const { name, phoneNumber, email, dateOfBirth, groupType } = participantData;
    const result = await db.query(
      'UPDATE prtcpnts_lst_t SET username = ?, phone_number = ?, email = ?, date_of_birth = ?, group_id = ? WHERE id = ?',
      [name, phoneNumber, email, dateOfBirth, groupType, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Model Error: Updating participant:', error);
    throw error;
  }
}

  static async deleteParticipant(id) {
  try {
    const result = await db.query('DELETE FROM prtcpnts_lst_t WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Model Error: Deleting participant:', error);
    throw error;
  }
}

  static async getParticipantById(id) {
  try {
    const rows = await db.query('SELECT * FROM prtcpnts_lst_t WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Model Error: Getting participant by ID:', error);
    throw error;
  }
}
}

module.exports = ParticipantModel; 