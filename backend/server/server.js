const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to local MongoDB Database
mongoose.connect('mongodb://localhost:27017/smartserver')
  .then(() => console.log('✅ MongoDB Connected Successfully to "smartserver"'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/user');

app.use('/api', apiRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('SmartServer Backend API is live and running!');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 SmartServer Backend running on http://localhost:${PORT}`);
});