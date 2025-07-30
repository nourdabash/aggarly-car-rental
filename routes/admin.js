const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

router.get('/', adminController.dashboard);
router.get('/cars', adminController.cars);
router.post('/cars', adminController.addOrEditCar);
router.post('/cars/delete', adminController.deleteCar);
router.get('/bookings', adminController.bookings);
router.get('/users', adminController.users);
router.get('/locations', adminController.locations);
router.post('/locations', adminController.addOrEditLocation);
router.post('/locations/delete', adminController.deleteLocation);

module.exports = router; 