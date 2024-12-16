const mongoose = require('mongoose');

// Define the schema for the Event model
const EventSchema = new mongoose.Schema({
  id_event: {
    type: Number,
    required: true,
    unique: true
  },
  typeEvent: {
    type: String,
    required: true
  },
  Nom_event: {
    type: String,
    required: true
  },
  Date_event: {
    type: Date,
    required: true
  },
  Tarif: {
    type: Number,
    required: true
  },
  nbr_participants: {
    type: Number,
    default: 0
  },
  id_User: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Create the Event model
const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
