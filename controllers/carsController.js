const fs = require('fs');
const path = require('path');
const carsPath = path.join(__dirname, '../bd/cars.json');
const reviewsPath = path.join(__dirname, '../bd/reviews.json');
const categoriesPath = path.join(__dirname, '../bd/categories.json');
const availabilityPath = path.join(__dirname, '../bd/availability.json');

function readCars() {
  return JSON.parse(fs.readFileSync(carsPath, 'utf-8'));
}

function readReviews() { return JSON.parse(fs.readFileSync(reviewsPath, 'utf-8')); }
function readCategories() { return JSON.parse(fs.readFileSync(categoriesPath, 'utf-8')); }
function readAvailability() { return JSON.parse(fs.readFileSync(availabilityPath, 'utf-8')); }

function getSoonestAvailableDate(carId, bookings) {
  const now = new Date();
  const futureBookings = bookings.filter(b => b.carId === carId && b.status === 'confirmed' && new Date(b.dropoffDate) >= now);
  if (!futureBookings.length) return null;
  const soonest = futureBookings.reduce((min, b) => new Date(b.dropoffDate) < new Date(min.dropoffDate) ? b : min, futureBookings[0]);
  return soonest.dropoffDate;
}

exports.listCars = (req, res) => {
  try {
    let cars = readCars();
    const reviews = readReviews();
    const categories = readCategories();
    const availability = readAvailability();
    const bookings = JSON.parse(fs.readFileSync(path.join(__dirname, '../bd/bookings.json'), 'utf-8'));
    const { type, priceMin, priceMax, brand, year, fuel, transmission, location, q, sort, category, date } = req.query;
    if (type) cars = cars.filter(car => car.type === type);
    if (brand) cars = cars.filter(car => car.brand === brand);
    if (year) cars = cars.filter(car => String(car.year) === String(year));
    if (fuel) cars = cars.filter(car => car.fuel === fuel);
    if (transmission) cars = cars.filter(car => car.transmission === transmission);
    if (location) cars = cars.filter(car => car.location === location);
    if (category) cars = cars.filter(car => car.category === category);
    if (priceMin) cars = cars.filter(car => car.pricePerDay >= Number(priceMin));
    if (priceMax) cars = cars.filter(car => car.pricePerDay <= Number(priceMax));
    if (q) cars = cars.filter(car => car.model.toLowerCase().includes(q.toLowerCase()) || car.brand.toLowerCase().includes(q.toLowerCase()));
    cars = cars.map(car => {
      const carReviews = reviews.filter(r => r.carId === car.id);
      const avgRating = carReviews.length ? (carReviews.reduce((a, b) => a + b.rating, 0) / carReviews.length).toFixed(1) : null;
      let isAvailable = car.currentStock > 0;
      let notAvailableUntilDays = null;
      if (!isAvailable) {
        const soonest = getSoonestAvailableDate(car.id, bookings);
        if (soonest) {
          const days = Math.ceil((new Date(soonest) - new Date()) / (1000*60*60*24));
          notAvailableUntilDays = days > 0 ? days : 0;
        }
      }
      return { ...car, avgRating, reviewCount: carReviews.length, isAvailable, notAvailableUntilDays };
    });
    if (sort === 'price-asc') cars.sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === 'price-desc') cars.sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sort === 'year-desc') cars.sort((a, b) => b.year - a.year);
    if (sort === 'year-asc') cars.sort((a, b) => a.year - b.year);
    if (sort === 'popularity') cars.sort((a, b) => b.reviewCount - a.reviewCount);
    const featured = cars.slice(0, 2);
    res.render('cars', { t: res.locals.t, lang: res.locals.lang, title: 'Car Listings', active: 'cars', cars, filters: req.query, categories, featured });
  } catch (error) {
    console.error('Error in listCars:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.carDetail = (req, res) => {
  try {
    const cars = readCars();
    const reviews = readReviews();
    const availability = readAvailability();
    const bookings = JSON.parse(fs.readFileSync(path.join(__dirname, '../bd/bookings.json'), 'utf-8'));
    const car = cars.find(c => c.id === req.params.id);
    if (!car) return res.status(404).render('404', { title: 'Car Not Found', active: '' });
    const carReviews = reviews.filter(r => r.carId === car.id);
    const avgRating = carReviews.length ? (carReviews.reduce((a, b) => a + b.rating, 0) / carReviews.length).toFixed(1) : null;
    const today = new Date().toISOString().slice(0, 10);
    const avail = availability.find(a => a.carId === car.id && a.date === today);
    const isAvailable = car.currentStock > 0;
    let notAvailableUntilDays = null;
    if (!isAvailable) {
      const soonest = getSoonestAvailableDate(car.id, bookings);
      if (soonest) {
        const days = Math.ceil((new Date(soonest) - new Date()) / (1000*60*60*24));
        notAvailableUntilDays = days > 0 ? days : 0;
      }
    }
    res.render('car-detail', { t: res.locals.t, lang: res.locals.lang, title: car.brand + ' ' + car.model, active: '', car: { ...car, isAvailable, notAvailableUntilDays }, reviews: carReviews, avgRating, isAvailable });
  } catch (error) {
    console.error('Error in carDetail:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
};

exports.submitReview = (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/auth/login');
    const { rating, comment } = req.body;
    const carId = req.params.id;
    if (!rating || !comment) return res.redirect('/cars/' + carId);
    const reviews = readReviews();
    reviews.push({
      id: Date.now().toString(),
      carId,
      userId: req.session.user.id,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
    res.redirect('/cars/' + carId);
  } catch (error) {
    console.error('Error in submitReview:', error);
    res.status(500).render('500', { title: 'Server Error', active: '' });
  }
}; 