const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { activatePremium } = require('../controllers/premiumController');

// POST /api/premium/activate - mock activation endpoint
router.post('/activate', verifyToken, activatePremium);

module.exports = router;
