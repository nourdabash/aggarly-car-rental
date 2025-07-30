const express = require('express');
const router = express.Router();
const staticController = require('../controllers/staticController');

// Removed root route to avoid conflict with home.js

router.get('/about', (req, res, next) => { console.log('About route hit!'); next(); }, staticController.about);
router.get('/contact', (req, res, next) => { console.log('Contact route hit!'); next(); }, staticController.contact);
router.post('/contact', staticController.contactSubmit);
router.get('/team/:name', (req, res) => {
  const profiles = {
    nour: {
      name: 'Nour',
      title: 'Founder & CEO',
      img: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Nour is the visionary founder of Aggarly, passionate about mobility and customer experience. With 10+ years in tech startups, Nour leads the team with energy and innovation.',
      email: 'nour@example.com',
      linkedin: 'https://linkedin.com/in/nourhalim'
    },
    alex: {
      name: 'Alex',
      title: 'CTO',
      img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Alex is the tech brain behind Aggarly, building robust systems and scalable platforms. Loves coding, coffee, and electric cars.',
      email: 'alex@example.com',
      linkedin: 'https://linkedin.com/in/alexsmith'
    },
    sam: {
      name: 'Sam',
      title: 'Customer Success',
      img: 'https://images.unsplash.com/photo-1519340333755-c6e2a6a1b49a?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Sam ensures every customer has a smooth ride. Expert in support, always ready to help, and a travel enthusiast.',
      email: 'sam@example.com',
      linkedin: 'https://linkedin.com/in/samjones'
    },
    jana: {
      name: 'Jana Halim',
      title: 'Cofounder',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Jana brings creativity and business acumen to Aggarly. A cofounder with a love for design, branding, and partnerships.',
      email: 'jana@example.com',
      linkedin: 'https://linkedin.com/in/janahalim'
    },
    michael: {
      name: 'Michael Chen',
      title: 'Head of Operations',
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Michael oversees all operational aspects of Aggarly, ensuring smooth fleet management and customer satisfaction. Expert in logistics and process optimization.',
      email: 'michael@example.com',
      linkedin: 'https://linkedin.com/in/michaelchen'
    },
    sarah: {
      name: 'Sarah Johnson',
      title: 'Marketing Director',
      img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Sarah leads our marketing efforts with creativity and data-driven strategies. Passionate about brand building and customer engagement.',
      email: 'sarah@example.com',
      linkedin: 'https://linkedin.com/in/sarahjohnson'
    },
    david: {
      name: 'David Wilson',
      title: 'Lead Developer',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'David is our technical lead, architecting scalable solutions and mentoring the development team. Loves clean code and innovative technologies.',
      email: 'david@example.com',
      linkedin: 'https://linkedin.com/in/davidwilson'
    },
    emily: {
      name: 'Emily Rodriguez',
      title: 'UX Designer',
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Emily creates intuitive and beautiful user experiences. Focuses on accessibility and user-centered design principles.',
      email: 'emily@example.com',
      linkedin: 'https://linkedin.com/in/emilyrodriguez'
    },
    robert: {
      name: 'Robert Thompson',
      title: 'Fleet Manager',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=96&h=96&q=80',
      bio: 'Robert manages our vehicle fleet, ensuring quality maintenance and optimal availability. Expert in automotive industry and customer service.',
      email: 'robert@example.com',
      linkedin: 'https://linkedin.com/in/robertthompson'
    }
  };
  const member = profiles[req.params.name.toLowerCase()];
  if (!member) return res.status(404).render('404', { title: 'Not Found', active: '' });
  res.render('team-profile', { title: member.name, active: '', member });
});

module.exports = router; 