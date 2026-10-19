const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const RepairBooking = require('../models/RepairBooking');

// Sign Up
router.post('/auth/signup', async (req, res) => {
    try {
        const { fullName, email, mobileNumber, password, address } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

        const newUser = new User({ fullName, email, mobileNumber, password, address });
        await newUser.save();
        res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create Repair Booking (Auto-flags Heavy Items)
router.post('/bookings/create', async (req, res) => {
    try {
        const { userId, deviceCategory, deviceModel, issueDescription, estimatedCost, serviceAddress } = req.body;
        
        // Heavy item rule: TV, Refrigerator, Washing Machine, and large Home Appliances require Home Visit
        const heavyCategories = ['TV', 'Refrigerator', 'Washing Machine', 'Home Appliances'];
        const isHeavyItem = heavyCategories.includes(deviceCategory);
        const serviceMode = isHeavyItem ? 'On-Site Home Visit' : 'Carry-in / Pick-up Service';

        const booking = new RepairBooking({
            userId,
            deviceCategory,
            deviceModel,
            issueDescription,
            serviceMode,
            isHeavyItem,
            estimatedCost: estimatedCost || 1499,
            serviceAddress: serviceAddress || 'Registered Home Address'
        });

        await booking.save();
        res.status(201).json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get User Repair Bookings
router.get('/bookings/user/:userId', async (req, res) => {
    try {
        const bookings = await RepairBooking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;