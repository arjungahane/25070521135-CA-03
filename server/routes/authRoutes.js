const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const DAY_IN_SECONDS = 24 * 60 * 60;

function getPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone
  };
}

function setSessionCookie(res, user, expiresIn, persistent) {
  const token = jwt.sign(
    { id: String(user._id) },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn * DAY_IN_SECONDS }
  );
  const maxAge = persistent ? `; Max-Age=${expiresIn * DAY_IN_SECONDS}` : '';
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `session=${token}; Path=/; HttpOnly; SameSite=Lax${maxAge}${secure}`
  );
}

router.post('/signup', async (req, res) => {
  const { name, email, password, phone = '' } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const strongPassword = typeof password === 'string'
    && password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password);

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ message: 'Enter a name between 2 and 100 characters.' });
  }
  if (!validEmail || cleanEmail.length > 254) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (!strongPassword) {
    return res.status(400).json({
      message: 'Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.'
    });
  }
  if (cleanPhone && !/^\+?[0-9\s()-]{7,20}$/.test(cleanPhone)) {
    return res.status(400).json({ message: 'Enter a valid phone number.' });
  }

  try {
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: await bcrypt.hash(password, 12),
      phone: cleanPhone
    });

    setSessionCookie(res, user, 7, true);
    return res.status(201).json({
      message: 'Your account is ready.',
      user: getPublicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Signup failed:', error.message);
    return res.status(500).json({ message: 'We could not create your account. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, rememberMe = false } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Enter a valid email address and password.' });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const persistent = rememberMe === true;
    setSessionCookie(res, user, persistent ? 30 : 1, persistent);
    return res.json({ message: 'Welcome back.', user: getPublicUser(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'We could not sign you in. Please try again.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email phone');
    if (!user) {
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      res.setHeader('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
      return res.status(401).json({ message: 'Your account could not be found. Please sign in again.' });
    }
    return res.json({ user: getPublicUser(user) });
  } catch (error) {
    console.error('Session lookup failed:', error.message);
    return res.status(500).json({ message: 'We could not verify your session.' });
  }
});

router.post('/logout', (req, res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  return res.json({ message: 'You have been signed out.' });
});

module.exports = router;
