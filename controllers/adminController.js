const fs = require('fs');
const path = require('path');
const carsPath = path.join(__dirname, '../bd/cars.json');
const bookingsPath = path.join(__dirname, '../bd/bookings.json');
const usersPath = path.join(__dirname, '../bd/users.json');
const locationsPath = path.join(__dirname, '../bd/locations.json');

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
function write(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

function isAdmin(req) { return req.session.user && req.session.user.role === 'admin'; }

const dashboard = (req, res) => {
  try {
    const cars = read(carsPath);
    const bookings = read(bookingsPath);
    const users = read(usersPath);
    
    // Calculate statistics
    const totalBookings = bookings.length;
    const totalUsers = users.length;
    const totalCars = cars.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    // Get recent bookings (last 5)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(booking => {
        const user = users.find(u => u.id === booking.userId);
        const car = cars.find(c => c.id === booking.carId);
        return {
          ...booking,
          userName: user ? user.name : 'Unknown User',
          carBrand: car ? car.brand : 'Unknown Car',
          carModel: car ? car.model : ''
        };
      });
    
    res.render('admin', { 
      title: 'Admin Dashboard', 
      active: 'admin',
      totalBookings,
      totalUsers,
      totalCars,
      totalRevenue,
      recentBookings
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.dashboard = (req, res) => {
  try {
    const cars = read(carsPath);
    const bookings = read(bookingsPath);
    const users = read(usersPath);
    const totalBookings = bookings.length;
    const totalUsers = users.length;
    const totalCars = cars.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(booking => {
        const user = users.find(u => u.id === booking.userId);
        const car = cars.find(c => c.id === booking.carId);
        return {
          ...booking,
          userName: user ? user.name : 'Unknown User',
          carBrand: car ? car.brand : 'Unknown Car',
          carModel: car ? car.model : ''
        };
      });
    res.render('admin', {
      title: 'Admin Dashboard',
      active: 'admin',
      totalBookings,
      totalUsers,
      totalCars,
      totalRevenue,
      recentBookings
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.cars = (req, res) => {
  try {
    if (!isAdmin(req)) return res.redirect('/auth/login');
    const cars = read(carsPath);
    res.render('admin-cars', { t: res.locals.t, lang: res.locals.lang, title: 'Manage Cars', active: 'admin', cars });
  } catch (error) {
    console.error('Error in admin cars:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.addOrEditCar = (req, res) => {
  try {
    if (!isAdmin(req)) return res.redirect('/auth/login');
    let cars = read(carsPath);
    const { id, brand, model, year, type, fuel, transmission, location, pricePerDay, image, description } = req.body;
    if (id) {
      const car = cars.find(c => c.id === id);
      if (car) Object.assign(car, { brand, model, year, type, fuel, transmission, location, pricePerDay: Number(pricePerDay), image, description });
    } else {
      cars.push({ id: Date.now().toString(), brand, model, year, type, fuel, transmission, location, pricePerDay: Number(pricePerDay), image, description, images: [image] });
    }
    write(carsPath, cars);
    res.redirect('/admin/cars');
  } catch (error) {
    console.error('Error in addOrEditCar:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.deleteCar = (req, res) => {
  try {
    if (!isAdmin(req)) return res.redirect('/auth/login');
    let cars = read(carsPath);
    cars = cars.filter(c => c.id !== req.body.id);
    write(carsPath, cars);
    res.redirect('/admin/cars');
  } catch (error) {
    console.error('Error in deleteCar:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.bookings = (req, res) => {
  try {
    if (!isAdmin(req)) return res.redirect('/auth/login');
    const bookings = read(bookingsPath);
    const cars = read(carsPath);
    const users = read(usersPath);
    const bookingsWithDetails = bookings.map(b => ({ ...b, car: cars.find(c => c.id === b.carId), user: users.find(u => u.id === b.userId) }));
    res.render('admin-bookings', { t: res.locals.t, lang: res.locals.lang, title: 'Manage Bookings', active: 'admin', bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Error in admin bookings:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.users = (req, res) => {
  try {
    if (!isAdmin(req)) return res.redirect('/auth/login');
    const users = read(usersPath);
    res.render('admin-users', { t: res.locals.t, lang: res.locals.lang, title: 'Manage Users', active: 'admin', users });
  } catch (error) {
    console.error('Error in admin users:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.locations = (req, res) => {
  if (!isAdmin(req)) return res.redirect('/auth/login');
  const locations = read(locationsPath);
  res.render('admin-locations', { t: res.locals.t, lang: res.locals.lang, title: 'Manage Locations', active: 'admin', locations });
};

exports.addOrEditLocation = (req, res) => {
  if (!isAdmin(req)) return res.redirect('/auth/login');
  let locations = read(locationsPath);
  const { id, name } = req.body;
  if (id) {
    const loc = locations.find(l => l.id === id);
    if (loc) loc.name = name;
  } else {
    locations.push({ id: Date.now().toString(), name });
  }
  write(locationsPath, locations);
  res.redirect('/admin/locations');
};

exports.deleteLocation = (req, res) => {
  if (!isAdmin(req)) return res.redirect('/auth/login');
  let locations = read(locationsPath);
  locations = locations.filter(l => l.id !== req.body.id);
  write(locationsPath, locations);
  res.redirect('/admin/locations');
};

exports.dashboard = dashboard; 