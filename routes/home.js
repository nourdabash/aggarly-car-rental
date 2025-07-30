const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');
const fs = require('fs');
const path = require('path');

function readCars() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../bd/cars.json'), 'utf-8'));
}

function readTestimonials() {
  try {
    const testimonialsPath = path.join(__dirname, '../bd/testimonials.json');
    if (fs.existsSync(testimonialsPath)) {
      return JSON.parse(fs.readFileSync(testimonialsPath, 'utf-8'));
    }
    return [];
  } catch (error) {
    console.error('Error reading testimonials:', error);
    return [];
  }
}

router.get('/', (req, res) => {
  try {
    const cars = readCars();
    const testimonials = readTestimonials();
    res.render('home', { 
      title: 'Home', 
      active: 'home', 
      cars, 
      testimonials,
      user: req.session && req.session.user ? req.session.user : null 
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
});

module.exports = router; 