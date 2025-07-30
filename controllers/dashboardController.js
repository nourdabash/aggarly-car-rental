const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '../bd/users.json');
const bookingsPath = path.join(__dirname, '../bd/bookings.json');
const carsPath = path.join(__dirname, '../bd/cars.json');

function readUsers() { return JSON.parse(fs.readFileSync(usersPath, 'utf-8')); }
function writeUsers(users) { fs.writeFileSync(usersPath, JSON.stringify(users, null, 2)); }
function readBookings() { return JSON.parse(fs.readFileSync(bookingsPath, 'utf-8')); }
function writeBookings(bookings) { fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2)); }
function readCars() { return JSON.parse(fs.readFileSync(carsPath, 'utf-8')); }
function writeCars(cars) { fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2)); }

exports.dashboard = (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');
    const users = readUsers();
    const user = users.find(u => u.id === req.session.user.id);
    const bookings = readBookings();
    const cars = readCars();
    let updated = false;
    const now = new Date();
    bookings.forEach(b => {
      if (b.userId === user.id && b.status === 'confirmed' && new Date(b.dropoffDate) < now) {
        b.status = 'completed';
        const car = cars.find(c => c.id === b.carId);
        if (car && typeof car.currentStock === 'number' && car.currentStock < (car.stock || 2)) {
          car.currentStock++;
          updated = true;
        }
      }
    });
    if (updated) {
      writeBookings(bookings);
      writeCars(cars);
    }
    const userBookings = bookings.filter(b => b.userId === user.id);
    const bookingsWithCars = userBookings.map(b => ({ ...b, car: cars.find(c => c.id === b.carId) }));
    const reservationSuccess = req.query.reservation === 'success';
    const cancelSuccess = req.query.cancel === 'success';
    const cancelFail = req.query.cancel === 'fail';
    const cancelReason = req.query.reason;
    const bookingEmailSent = req.session.bookingEmailSent;
    if (bookingEmailSent) req.session.bookingEmailSent = false;
    res.render('dashboard', {
      title: 'Dashboard',
      active: 'dashboard',
      bookings: bookingsWithCars,
      user,
      reservationSuccess,
      cancelSuccess,
      cancelFail,
      cancelReason,
      bookingEmailSent
    });
  } catch (error) {
    console.error('Error in dashboard:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.bookings = (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');
    const bookings = readBookings().filter(b => b.userId === req.session.user.id);
    const cars = readCars();
    const bookingsWithCars = bookings.map(b => ({ ...b, car: cars.find(c => c.id === b.carId) }));
    res.render('dashboard-bookings', { title: 'My Bookings', active: 'dashboard', bookings: bookingsWithCars, user: req.session.user });
  } catch (error) {
    console.error('Error in dashboard bookings:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.updateProfile = (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');
    const { name, email } = req.body;
    const users = readUsers();
    const user = users.find(u => u.id === req.session.user.id);
    if (user) {
      user.name = name;
      user.email = email;
      writeUsers(users);
      req.session.user.name = name;
      req.session.user.email = email;
    }
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.cancelBooking = (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');
    const { bookingId } = req.body;
    const bookings = readBookings();
    const booking = bookings.find(b => b.id === bookingId && b.userId === req.session.user.id);
    if (!booking) {
      return res.redirect('/dashboard?cancel=fail&reason=not_found');
    }
    const now = new Date();
    const pickupDate = new Date(booking.pickupDate);
    const dropoffDate = new Date(booking.dropoffDate);
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.redirect('/dashboard?cancel=fail&reason=already_processed');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pickupDate.setHours(0, 0, 0, 0);
    if (pickupDate < today) {
      return res.redirect('/dashboard?cancel=fail&reason=already_started');
    }
    booking.status = 'cancelled';
    writeBookings(bookings);
    const cars = readCars();
    const car = cars.find(c => c.id === booking.carId);
    if (car && typeof car.currentStock === 'number') {
      car.currentStock = Math.min(car.currentStock + 1, car.stock || 2);
      writeCars(cars);
    }
    res.redirect('/dashboard?cancel=success');
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
}; 