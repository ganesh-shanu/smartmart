const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update User Profile
router.put('/profile/:userId', async (req, res) => {
    try {
        const { fullName, mobileNumber, address } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { fullName, mobileNumber, address } },
            { new: true }
        );
        res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;