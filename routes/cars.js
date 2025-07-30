const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');

router.get('/', carsController.listCars);
router.get('/:id', carsController.carDetail);
router.post('/:id/review', carsController.submitReview);

module.exports = router; 