const express = require('express');
const router = express.Router();
const { searchProjects } = require('../controllers/projectController');
const verifyToken = require('../middleware/authMiddleware');

// Protect the route if you want only authenticated users to search
router.post('/search', verifyToken, searchProjects);

module.exports = router;
