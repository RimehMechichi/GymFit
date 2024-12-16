const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../src/Routes/AuthRoute.js'); 

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit if the database connection fails
  });

// API Routes
app.use('/auth', authRoutes);
app.use('/user', authRoutes);
// Default Route for Testing
app.get('/', (req, res) => {
  res.send('Auth Service is running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
