const fs = require('fs');
const path = require('path');
const bookingsPath = path.join(__dirname, '../bd/bookings.json');
const carsPath = path.join(__dirname, '../bd/cars.json');

function readBookings() {
  return JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
}
function writeBookings(bookings) {
  fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
}
function readCars() {
  return JSON.parse(fs.readFileSync(carsPath, 'utf-8'));
}
function writeCars(cars) {
  fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2));
}

exports.bookingForm = (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      // Preserve car selection in next param
      const next = req.query.car ? `/booking?car=${req.query.car}` : '/booking';
      return res.redirect(`/auth/login?next=${encodeURIComponent(next)}`);
    }
    
    // Prevent admin users from booking cars
    if (req.session.user.role === 'admin') {
      return res.status(403).render('error', { 
        title: 'Access Denied', 
        active: '',
        error: {
          status: 403,
          message: 'Admin users cannot book cars. Please use a customer account to make reservations.',
          details: 'Administrators are restricted from booking vehicles as they are responsible for managing the system, not using it as customers.'
        }
      });
    }
    
    console.log('Booking form accessed by user:', req.session.user);
    
    const cars = readCars();
    const selectedCarId = req.query.car || null;
    res.render('booking', { title: 'Book a Car', active: 'reservation', cars, user: req.session.user, error: null, selectedCarId });
  } catch (error) {
    console.error('Error in bookingForm:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.createBooking = (req, res) => {
  try {
    console.log('Booking attempt by user:', req.session.user);
    console.log('Booking data:', req.body);
    
    // Prevent admin users from booking cars
    if (req.session.user.role === 'admin') {
      return res.status(403).render('error', { 
        title: 'Access Denied', 
        active: '',
        error: {
          status: 403,
          message: 'Admin users cannot book cars. Please use a customer account to make reservations.',
          details: 'Administrators are restricted from booking vehicles as they are responsible for managing the system, not using it as customers.'
        }
      });
    }
    
    const { carId, pickupDate, dropoffDate, location } = req.body;
    const cars = readCars();
    const car = cars.find(c => c.id == carId);
    
    console.log('Selected car:', car);
    
    // Prevent booking if car is sold out
    if (!car || car.currentStock === 0) {
      console.log('Car is sold out or not found');
      return res.status(400).render('booking', { title: 'Book a Car', active: 'reservation', cars, user: req.session.user, error: 'This car is sold out and cannot be reserved.' });
    }
    
    // Date validation
    const today = new Date();
    today.setHours(0,0,0,0);
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    
    if (!carId || !pickupDate || !dropoffDate || !location) {
      console.log('Missing required fields');
      return res.status(400).render('booking', { title: 'Book a Car', active: 'reservation', cars, error: 'All fields are required.', user: req.session.user });
    }
    
    if (pickup < today) {
      console.log('Pickup date in past');
      return res.status(400).render('booking', { title: 'Book a Car', active: 'reservation', cars, error: 'Pick-up date cannot be in the past.', user: req.session.user });
    }
    
    if (dropoff <= pickup) {
      console.log('Invalid date range');
      return res.status(400).render('booking', { title: 'Book a Car', active: 'reservation', cars, error: 'Drop-off date must be after pick-up date.', user: req.session.user });
    }
    
    console.log('All validations passed, creating booking...');
    
    // Decrement currentStock and save
    car.currentStock = Math.max(0, (car.currentStock || 1) - 1);
    writeCars(cars);
    
    const bookings = readBookings();
    const newBooking = {
      id: Date.now().toString(),
      carId,
      pickupDate,
      dropoffDate,
      location,
      userId: req.session && req.session.user ? req.session.user.id : null,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    console.log('New booking created:', newBooking);
    
    bookings.push(newBooking);
    writeBookings(bookings);
    req.session.bookingEmailSent = true;
    
    console.log('Booking successful, redirecting to confirmation');
    res.redirect('/booking/confirm');
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

// Also update finalizePendingBooking for login-after-reserve flow
exports.finalizePendingBooking = (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/booking');
    }
    
    // Prevent admin users from finalizing bookings
    if (req.session.user.role === 'admin') {
      return res.status(403).render('error', { 
        title: 'Access Denied', 
        active: '',
        error: {
          status: 403,
          message: 'Admin users cannot book cars. Please use a customer account to make reservations.',
          details: 'Administrators are restricted from booking vehicles as they are responsible for managing the system, not using it as customers.'
        }
      });
    }
    
    // If there is a pending booking (user just logged in after booking attempt)
    if (req.session.pendingBooking) {
      const bookings = readBookings();
      const cars = readCars();
      const booking = req.session.pendingBooking;
      const car = cars.find(c => c.id == booking.carId);
      // Prevent booking if car is sold out
      if (!car || car.currentStock === 0) {
        delete req.session.pendingBooking;
        return res.render('booking-confirm', { title: 'Booking Confirmed', active: 'reservation', car: null, booking: null, user: req.session.user, error: 'This car is sold out and cannot be reserved.' });
      }
      booking.userId = req.session.user.id;
      // Decrement currentStock and save
      car.currentStock = Math.max(0, (car.currentStock || 1) - 1);
      writeCars(cars);
      bookings.push(booking);
      writeBookings(bookings);
      delete req.session.pendingBooking;
      return res.render('booking-confirm', { title: 'Booking Confirmed', active: 'reservation', car, booking, user: req.session.user });
    }
    // If user just visits /booking/confirm directly
    return res.render('booking-confirm', { title: 'Booking Confirmed', active: 'reservation', car: null, booking: null, user: req.session.user });
  } catch (error) {
    console.error('Error in finalizePendingBooking:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
}; 