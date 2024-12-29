const express = require('express');
const participantsRtr = express.Router();
const ParticipantController = require('../controllers/participantController');
const { validateParticipant } = require('../middleware/participantValidation');

// Get all participants
participantsRtr.get('/all', ParticipantController.getAllParticipants);

// Get participant by ID
participantsRtr.get('participant/:id', ParticipantController.getParticipantById);

// Create new participant
participantsRtr.post('/create', validateParticipant, ParticipantController.createParticipant);

// Update participant
participantsRtr.put('/update/:id', validateParticipant, ParticipantController.updateParticipant);

// Delete participant
participantsRtr.delete('/:id', ParticipantController.deleteParticipant);

module.exports = participantsRtr; 