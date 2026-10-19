const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { 
        type: String, 
        enum: [
            'Mobiles & Tablets', 
            'Laptops & Computers', 
            'Electronics', 
            'Clothing', 
            'Footwear', 
            'Grocery', 
            'Home Appliances', 
            'Books & Stationery', 
            'Beauty Products', 
            'Accessories'
        ], 
        required: true 
    },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    stockCount: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);