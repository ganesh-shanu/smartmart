const mongoose = require('mongoose');

const RepairBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    deviceCategory: { type: String, required: true },
    deviceModel: { type: String, required: true },
    issueDescription: { type: String, required: true },
    serviceMode: { 
        type: String, 
        enum: ['Carry-in / Pick-up Service', 'On-Site Home Visit'], 
        required: true 
    },
    isHeavyItem: { type: Boolean, default: false },
    estimatedCost: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['REQUESTED', 'DIAGNOSED', 'TECHNICIAN_DISPATCHED', 'IN_REPAIR', 'COMPLETED'], 
        default: 'REQUESTED' 
    },
    serviceAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RepairBooking', RepairBookingSchema);