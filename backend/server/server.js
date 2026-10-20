
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

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is missing from environment variables.');
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
    });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartMart API is running!'
  });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password, address } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required.'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered.'
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
      message: 'Account created successfully.',
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
      error: 'Unable to create account.'
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
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email });

    // This comparison assumes your existing model stores plain-text
    // passwords. Replace it with bcrypt verification before production.
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
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
      error: 'Unable to log in.'
    });
  }
});

// Get products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Products error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to fetch products.'
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

    if (!userId || !deviceCategory || !deviceModel || !issueDescription) {
      return res.status(400).json({
        success: false,
        error: 'User, device category, device model, and issue description are required.'
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
      message: 'Repair booking created successfully.',
      booking
    });
  } catch (err) {
    console.error('Booking error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to create repair booking.'
    });
  }
});

// Get bookings for a user
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await RepairBooking.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (err) {
    console.error('Fetch bookings error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Unable to fetch bookings.'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('SmartMart Backend is Live!');
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartMart server running on port ${PORT}`);
});
