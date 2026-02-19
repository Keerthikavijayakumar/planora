const express = require('express');
const router = express.Router();
const { createIdea, saveIdea, getSavedIdeas, deleteIdea, getIdeaById, getHistory, getHistoryById, chatBlueprint, getChatMessages } = require('../controllers/ideaController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, createIdea);
router.post('/save', verifyToken, saveIdea);
router.post('/chat', verifyToken, chatBlueprint);
router.get('/chat/:blueprintId', verifyToken, getChatMessages);
router.get('/saved', verifyToken, getSavedIdeas);
router.get('/saved/:id', verifyToken, getIdeaById);
router.delete('/saved/:id', verifyToken, deleteIdea);
router.get('/history', verifyToken, getHistory);
router.get('/history/:id', verifyToken, getHistoryById);


module.exports = router;

