const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const eventRoutes = require('./Routes/EventRoute');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/eventDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/event', eventRoutes);  // Ensure the correct variable name 'eventRoutes' is used

// Start Server
app.listen(PORT, () => {
  console.log(`Event Service running on port ${PORT}`);
});
