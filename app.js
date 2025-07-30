const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const engine = require('ejs-mate');
const fs = require('fs');

const app = express();

// View engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'agarly_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash());

// Set default locals for all views (move before routes)
app.use((req, res, next) => {
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Register static routes FIRST
app.use('/', require('./routes/static'));
app.get('/reservation', (req, res) => res.redirect('/booking'));

// Routes
app.use('/', require('./routes/home'));
app.use('/cars', require('./routes/cars'));
app.use('/booking', require('./routes/booking'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// Footer pages routes
app.get('/help-center', (req, res) => {
  res.render('help-center', { title: 'Help Center', active: '' });
});

app.get('/faq', (req, res) => {
  res.render('faq', { title: 'FAQ', active: '' });
});

app.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', { title: 'Terms of Service', active: '' });
});

app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { title: 'Privacy Policy', active: '' });
});

// Admin analytics route
app.get('/admin/analytics', (req, res) => {
  // Check if user is admin
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }

  // Mock data for analytics (in a real app, this would come from database)
  const analyticsData = {
    totalBookings: 156,
    totalRevenue: 45230,
    activeRentals: 23,
    totalUsers: 89,
    confirmedBookings: 142,
    pendingBookings: 8,
    cancelledBookings: 4,
    completedBookings: 2,
    popularCars: [
      { brand: 'BMW', model: 'X5', bookings: 45, revenue: 25 },
      { brand: 'Mercedes-Benz', model: 'C-Class', bookings: 38, revenue: 20 },
      { brand: 'Audi', model: 'A4', bookings: 32, revenue: 18 },
      { brand: 'Toyota', model: 'Camry', bookings: 28, revenue: 15 }
    ],
    recentActivity: [
      { user: 'John Doe', action: 'New Booking', car: 'BMW X5', amount: 120, date: new Date(), status: 'confirmed' },
      { user: 'Jane Smith', action: 'Cancelled', car: 'Audi A4', amount: 90, date: new Date(Date.now() - 86400000), status: 'cancelled' },
      { user: 'Mike Johnson', action: 'Completed', car: 'Toyota Camry', amount: 65, date: new Date(Date.now() - 172800000), status: 'completed' },
      { user: 'Sarah Wilson', action: 'New Booking', car: 'Mercedes C-Class', amount: 95, date: new Date(Date.now() - 259200000), status: 'pending' }
    ]
  };

  res.render('admin-analytics', { 
    title: 'Analytics Dashboard', 
    active: 'analytics',
    ...analyticsData
  });
});

// Admin reports route
app.get('/admin/reports', (req, res) => {
  // Check if user is admin
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }

  // Mock data for reports (in a real app, this would come from database)
  const reportsData = {
    totalBookings: 156,
    totalRevenue: 45230,
    activeVehicles: 8,
    totalUsers: 89,
    reportData: [
      { id: 'BK001', customer: 'John Doe', vehicle: 'BMW X5', location: 'London', duration: 3, amount: 360, status: 'confirmed', date: new Date() },
      { id: 'BK002', customer: 'Jane Smith', vehicle: 'Audi A4', location: 'Manchester', duration: 2, amount: 180, status: 'confirmed', date: new Date(Date.now() - 86400000) },
      { id: 'BK003', customer: 'Mike Johnson', vehicle: 'Toyota Camry', location: 'Birmingham', duration: 5, amount: 325, status: 'completed', date: new Date(Date.now() - 172800000) },
      { id: 'BK004', customer: 'Sarah Wilson', vehicle: 'Mercedes C-Class', location: 'Liverpool', duration: 1, amount: 95, status: 'pending', date: new Date(Date.now() - 259200000) },
      { id: 'BK005', customer: 'David Brown', vehicle: 'Honda CR-V', location: 'London', duration: 4, amount: 300, status: 'cancelled', date: new Date(Date.now() - 345600000) }
    ]
  };

  res.render('admin-reports', { 
    title: 'Reports & Analytics', 
    active: 'reports',
    ...reportsData
  });
});

// Error page route
app.get('/error', (req, res) => {
  const error = req.query.error || {
    status: 500,
    message: 'An unexpected error occurred',
    details: 'Please try again later or contact support if the problem persists.'
  };
  res.render('error', { title: 'Error', active: '', error });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: '404 Not Found', 
    active: '',
    error: {
      status: 404,
      message: 'The page you are looking for does not exist.',
      details: 'The URL you entered may be incorrect or the page may have been moved or deleted.'
    }
  });
});

// Global error handler (should be after all routes)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).render('500', { title: 'Server Error', active: '' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Agarly server running on http://localhost:${PORT}`);
}); 