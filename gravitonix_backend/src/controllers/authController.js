const { usersStore, bookingsStore } = require('../models/storage');
const { hashPassword, generateToken, authenticate } = require('../middleware/authMiddleware');

const authController = {
  register(req, res, body) {
    if (!body || !body.username || !body.email || !body.password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Required fields: username, email, password'
      }));
    }

    const users = usersStore.read();
    if (users.find(u => u.email.toLowerCase() === body.email.toLowerCase())) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User with this email already registered' }));
    }
    if (users.find(u => u.username.toLowerCase() === body.username.toLowerCase())) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Username already taken' }));
    }

    const newUser = {
      id: 'USR-' + Date.now().toString(36).toUpperCase(),
      username: body.username,
      name: body.name || body.username,
      email: body.email.toLowerCase(),
      role: body.role || 'RESEARCHER',
      clearanceLevel: body.clearanceLevel || 'LEVEL_1_CITIZEN',
      passwordHash: hashPassword(body.password),
      division: body.division || 'Graviton Mechanics Study Group',
      createdAt: new Date().toISOString()
    };

    usersStore.insert(newUser);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      clearanceLevel: newUser.clearanceLevel,
      role: newUser.role
    });

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Researcher credential account created successfully',
      token: token,
      user: safeUser
    }));
  },

  login(req, res, body) {
    if (!body || (!body.email && !body.username) || !body.password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Must provide identifier (email or username) and password'
      }));
    }

    const users = usersStore.read();
    const identifier = (body.email || body.username).toLowerCase();
    const user = users.find(u =>
      u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
    );

    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid lab credentials' }));
    }

    const hashedInput = hashPassword(body.password);
    if (user.passwordHash !== hashedInput) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid lab credentials' }));
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      clearanceLevel: user.clearanceLevel,
      role: user.role
    });

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Welcome back, ${user.name}. Clearance ${user.clearanceLevel} verified.`,
      token: token,
      user: safeUser
    }));
  },

  getProfile(req, res) {
    const authUser = authenticate(req);
    if (!authUser) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Unauthorized: Valid Bearer token or X-Gravitonix-Clearance header required' }));
    }

    const users = usersStore.read();
    const user = users.find(u => u.id === authUser.userId);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User profile not found' }));
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    // Attach user bookings
    const bookingsData = bookingsStore.read();
    const userBookings = (bookingsData.reservations || []).filter(b => b.email === user.email);
    safeUser.activePasses = userBookings;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, user: safeUser }));
  }
};

module.exports = authController;
