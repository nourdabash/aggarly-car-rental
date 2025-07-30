const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const usersPath = path.join(__dirname, '../bd/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}
function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

exports.loginForm = (req, res) => {
  const message = req.query.next === '/booking/confirm' ? 'Please log in or sign up to complete your reservation.' : null;
  res.render('login', { title: 'Login', active: '', error: null, message });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.render('login', { title: 'Login', active: '', error: 'Invalid email or password.', message: null });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.render('login', { title: 'Login', active: '', error: 'Invalid email or password.', message: null });
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  if (req.session.pendingBooking) {
    return res.redirect('/booking/confirm');
  }
  // Redirect to intended page if provided
  if (req.query.next) {
    return res.redirect(req.query.next);
  }
  res.redirect(user.role === 'admin' ? '/admin' : '/');
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register', active: '', error: null });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.render('register', { title: 'Register', active: '', error: 'Email already registered.' });
  }
  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hash,
    role: 'customer',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeUsers(users);
  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  if (req.session.pendingBooking) {
    return res.redirect('/booking/confirm');
  }
  // Redirect to intended page if provided
  if (req.query.next) {
    return res.redirect(req.query.next);
  }
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
}; 