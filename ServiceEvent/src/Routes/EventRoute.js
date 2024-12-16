const express = require('express'); // Add this line
const { addEvents, getEvents, updateEvent, deleteEvent } = require('../Controllers/EventController.js');

const router = express.Router();

// Define routes
router.post('/addEvent', addEvents);
router.get('/getEvents', getEvents);
router.put('/updateEvent/:id', updateEvent);
router.delete('/deleteEvent/:id', deleteEvent);

module.exports = router;
