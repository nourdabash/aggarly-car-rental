const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.dashboard);
router.get('/bookings', dashboardController.bookings);
router.post('/cancel', dashboardController.cancelBooking);

module.exports = router; 