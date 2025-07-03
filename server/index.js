// Minimal Express server for MongoDB trades
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const { connectToDb, getDb } = require('./db');

const allowedOrigins = [
  'http://localhost:5173',
  'https://mytradingjournal.vercel.app'
];
require('dotenv').config();

const app = express();

// Ensure MongoDB is connected before starting the server
connectToDb().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// MongoDB setup
function getCollection() {
  return getDb().collection('trades');
}

// User model functions
function getUserCollection() {
  return getDb().collection('users');
}

// Middleware to authenticate JWT and set req.user
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

// Get all trades for the logged-in user
app.get('/api/trades', authenticateJWT, async (req, res) => {
  const col = await getCollection();
  const trades = await col.find({ userId: req.user.userId }).sort({ date: -1 }).toArray();
  res.json(trades);
});

// Add a trade for the logged-in user
app.post('/api/trades', authenticateJWT, async (req, res) => {
  const col = await getCollection();
  const trade = req.body;
  trade.date = new Date(trade.date || Date.now());
  trade.userId = req.user.userId;
  // Ensure target is always a string
  if (typeof trade.target !== 'string') trade.target = '';
  const result = await col.insertOne(trade);
  res.json({ ...trade, _id: result.insertedId });
});

// Delete a trade (only if it belongs to the user)
app.delete('/api/trades/:id', authenticateJWT, async (req, res) => {
  const col = await getCollection();
  await col.deleteOne({ _id: new ObjectId(req.params.id), userId: req.user.userId });
  res.json({ success: true });
});

// Edit a trade (only if it belongs to the user)
app.put('/api/trades/:id', authenticateJWT, async (req, res) => {
  const col = await getCollection();
  const { id } = req.params;
  const update = req.body;
  if (update.date) update.date = new Date(update.date);
  await col.updateOne({ _id: new ObjectId(id), userId: req.user.userId }, { $set: update });
  const updated = await col.findOne({ _id: new ObjectId(id), userId: req.user.userId });
  res.json(updated);
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email, name } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const users = await getUserCollection();
    
    // Check if username exists
    const existingUsername = await users.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await users.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ 
      username, 
      passwordHash,
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const token = jwt.sign(
      { userId: result.insertedId, username, email, name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({ token, username, email, name });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = await getUserCollection();
  const user = await users.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id, username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token, username });
});

// Update user profile
app.put('/api/settings/profile', authenticateJWT, async (req, res) => {
  try {
    const { name, email } = req.body;
    const users = await getUserCollection();
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await users.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    await users.updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: { name, email } }
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update password
app.put('/api/settings/password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const users = await getUserCollection();
    
    const user = await users.findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: { passwordHash: newPasswordHash } }
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete user account and all trades
app.delete('/api/delete-account', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(400).json({ error: 'User not found' });
    const users = await getUserCollection();
    const trades = await getCollection();
    // Delete all trades for this user
    await trades.deleteMany({ userId });
    // Delete the user
    await users.deleteOne({ _id: new ObjectId(userId) });
    res.json({ message: 'Account and all trades deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server running on port', port));
