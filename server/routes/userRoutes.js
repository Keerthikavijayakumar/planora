const express = require('express');
const router = express.Router();
const { getUserStats, syncUser } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, getUserStats);
router.post('/sync', verifyToken, syncUser);

module.exports = router;
