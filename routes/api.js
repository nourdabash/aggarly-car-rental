const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const availabilityPath = path.join(__dirname, '../bd/availability.json');

router.get('/availability', (req, res) => {
  const { carId, date } = req.query;
  if (!carId || !date) return res.json({ available: true });
  const availability = JSON.parse(fs.readFileSync(availabilityPath, 'utf-8'));
  const avail = availability.find(a => a.carId === carId && a.date === date);
  res.json({ available: avail ? avail.available : true });
});

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }]
    }, {
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json'
      }
    });
    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ reply: 'Sorry, AI is currently unavailable.' });
  }
});

module.exports = router; 