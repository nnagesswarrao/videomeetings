const ParticipantModel = require('../models/participantModel');

class ParticipantController {
  static async getAllParticipants(req, res) {
    try {
      const participants = await ParticipantModel.getAllParticipants();
      res.json(participants);
    } catch (error) {
      console.error('Controller Error: Getting all participants:', error);
      res.status(500).json({ error: 'Error fetching participants' });
    }
  }

  static async createParticipant(req, res) {
    try {
      console.log(res.body)
      const participantId = await ParticipantModel.createParticipant(req.body);
      res.status(201).json({ 
        id: participantId,
        message: 'Participant created successfully' 
      });
    } catch (error) {
      console.error('Controller Error: Creating participant:', error);
      res.status(500).json({ error: 'Error creating participant' });
    }
  }

  static async updateParticipant(req, res) {
    try {
      const { id } = req.params;
      const success = await ParticipantModel.updateParticipant(id, req.body);
      
      if (success) {
        res.json({ message: 'Participant updated successfully' });
      } else {
        res.status(404).json({ error: 'Participant not found' });
      }
    } catch (error) {
      console.error('Controller Error: Updating participant:', error);
      res.status(500).json({ error: 'Error updating participant' });
    }
  }

  static async deleteParticipant(req, res) {
    try {
      const { id } = req.params;
      const success = await ParticipantModel.deleteParticipant(id);
      
      if (success) {
        res.json({ message: 'Participant deleted successfully' });
      } else {
        res.status(404).json({ error: 'Participant not found' });
      }
    } catch (error) {
      console.error('Controller Error: Deleting participant:', error);
      res.status(500).json({ error: 'Error deleting participant' });
    }
  }

  static async getParticipantById(req, res) {
    try {
      const { id } = req.params;
      const participant = await ParticipantModel.getParticipantById(id);
      
      if (participant) {
        res.json(participant);
      } else {
        res.status(404).json({ error: 'Participant not found' });
      }
    } catch (error) {
      console.error('Controller Error: Getting participant by ID:', error);
      res.status(500).json({ error: 'Error fetching participant' });
    }
  }
}

module.exports = ParticipantController; 