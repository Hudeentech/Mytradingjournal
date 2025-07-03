
// Route and library imports
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { connectToDb, getDb } = require('./db');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const targetRoutes = require('./routes/target');
const userRoutes = require('./routes/users');
require('dotenv').config();
require('./config/passport');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://mytradingjournal.vercel.app'
];



// Ensure MongoDB is connected before starting the server
connectToDb()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
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

// MongoDB collection helpers
function getCollection() {
  return getDb().collection('trades');
}
function getUserCollection() {
  return getDb().collection('users');
}

const authenticateJWT = require('./middleware/authenticateJWT');

// Mount routes
app.use('/api/health', healthRoutes(getDb));
app.use('/api', authRoutes(getUserCollection));
app.use('/api/trades', tradeRoutes(getCollection, authenticateJWT));
app.use('/api/settings/target', targetRoutes(getUserCollection, authenticateJWT));
app.use('/api', userRoutes(getUserCollection, authenticateJWT));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
