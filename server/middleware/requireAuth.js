const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const sessionCookie = (req.headers.cookie || '')
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('session='));
  const token = sessionCookie?.slice('session='.length);

  if (!token) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload.id !== 'string') {
      return res.status(401).json({ message: 'Your session is invalid. Please sign in again.' });
    }

    req.userId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = requireAuth;
