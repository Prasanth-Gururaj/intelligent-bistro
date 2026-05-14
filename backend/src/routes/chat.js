const express = require('express');
const claudeService = require('../services/claudeService');
const router = express.Router();
router.post('/', async (req, res) => {
  try {
    const { message, cart, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const result = await claudeService.processMessage(message, cart || [], history || []);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to process your request. Please try again.' });
  }
});
module.exports = router;
