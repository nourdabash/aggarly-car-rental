const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/', requireLogin, bookingController.bookingForm);
router.post('/', requireLogin, bookingController.createBooking);
router.get('/confirm', bookingController.finalizePendingBooking);

module.exports = router; 