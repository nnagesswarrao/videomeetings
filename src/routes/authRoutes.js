const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/signup', UserController.register);
router.post('/login', UserController.login);

// Protected Routes (require authentication)
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.put('/change-password', authMiddleware, UserController.changePassword);

// User Status Routes
router.get('/status', authMiddleware, UserController.getUserStatus);
router.put('/status', authMiddleware, UserController.updateUserStatus);

module.exports = router;
