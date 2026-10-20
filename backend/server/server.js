
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const RepairBooking = require('../models/RepairBooking');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSaver API is running!'
  });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      address
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const newUser = new User({
      fullName,
      email,
      mobileNumber,
      password,
      address
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        address: newUser.address
      }
    });
  } catch (err) {
    console.error('Signup error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to create account'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });

    // This comparison only works with existing plain-text passwords.
    // Use bcrypt hashing before using real accounts in production.
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        address: user.address
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to log in'
    });
  }
});

// Get products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Products error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to fetch products'
    });
  }
});

// Create repair booking
app.post('/api/bookings/create', async (req, res) => {
  try {
    const {
      userId,
      deviceCategory,
      deviceModel,
      issueDescription,
      estimatedCost,
      serviceAddress
    } = req.body;

    if (
      !userId ||
      !deviceCategory ||
      !deviceModel ||
      !issueDescription
    ) {
      return res.status(400).json({
        success: false,
        error: 'Required booking details are missing'
      });
    }

    const heavyCategories = [
      'TV',
      'Refrigerator',
      'Washing Machine',
      'Home Appliances'
    ];

    const isHeavyItem = heavyCategories.includes(deviceCategory);

    const booking = new RepairBooking({
      userId,
      deviceCategory,
      deviceModel,
      issueDescription,
      serviceMode: isHeavyItem
        ? 'On-Site Home Visit'
        : 'Carry-in / Pick-up Service',
      isHeavyItem,
      estimatedCost: estimatedCost ?? 1499,
      serviceAddress: serviceAddress || 'Registered Home Address'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      booking
    });
  } catch (err) {
    console.error('Booking error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to create repair booking'
    });
  }
});

// Get repair bookings for a user
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await RepairBooking.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (err) {
    console.error('Fetch bookings error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to fetch repair bookings'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('SmartSaver Backend is Live!');
});

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        'MONGO_URI is missing from environment variables'
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SmartSaver server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const RepairBooking = require('../models/RepairBooking');