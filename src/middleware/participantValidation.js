const { isValidGroupType } = require('../utils/groupTypeUtils');
const GROUP_TYPES = require('../constants/groupTypes');

const validateParticipant = (req, res, next) => {
  const { name, email, phoneNumber, dateOfBirth, groupType } = req.body;

  if (!name || !email || !phoneNumber || !dateOfBirth || !groupType) {
    return res.status(400).json({ 
      error: 'Missing required fields' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  // Phone number validation
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ 
      error: 'Invalid phone number format' 
    });
  }

  // Date validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateOfBirth)) {
    return res.status(400).json({ 
      error: 'Invalid date format (YYYY-MM-DD)' 
    });
  }

  // Group type validation
  if (!groupType || !isValidGroupType(groupType)) {
    return res.status(400).json({
      error: `Invalid group type. Must be one of: ${Object.values(GROUP_TYPES)
        .map(g => g.label)
        .join(', ')}`
    });
  }

  next();
};

module.exports = {
  validateParticipant
}; 