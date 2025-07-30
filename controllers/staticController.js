const fs = require('fs');
const path = require('path');
const faqPath = path.join(__dirname, '../bd/faq.json');
function readFAQ() { return JSON.parse(fs.readFileSync(faqPath, 'utf-8')); }

const testimonialsPath = path.join(__dirname, '../bd/testimonials.json');
function readTestimonials() { return JSON.parse(fs.readFileSync(testimonialsPath, 'utf-8')); }

const partnersPath = path.join(__dirname, '../bd/partners.json');
function readPartners() { return JSON.parse(fs.readFileSync(partnersPath, 'utf-8')); }

exports.about = (req, res) => {
  try {
    const faq = readFAQ();
    const testimonials = readTestimonials();
    const partners = readPartners();
    res.render('about', {
      title: 'About Us',
      active: 'about',
      faq,
      testimonials,
      partners,
      user: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error('Error in about:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.contact = (req, res) => {
  try {
    res.render('contact', {
      title: 'Contact Us',
      active: 'contact',
      success: null,
      user: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error('Error in contact:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.contactSubmit = (req, res) => {
  try {
    res.render('contact', {
      title: 'Contact Us',
      active: 'contact',
      success: 'Your message has been sent! We will get back to you soon.',
      user: req.session && req.session.user ? req.session.user : null
    });
  } catch (error) {
    console.error('Error in contactSubmit:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
}; 