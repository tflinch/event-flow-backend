const express = require('express');
const { Event } = require('../models');
const isLoggedIn = require('../middleware/isLoggedIn');
const router = express.Router();

router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { title, description, date, time, country, state, category, tags, rsvp } = req.body;
    const event = await Event.create({ 
      title, description, date, time, country, state, category, organizer: req.user._id, tags, rsvp 
    });
    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const events = await Event.find().populate('organizer tags rsvp');
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer tags rsvp');
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const { title, description, date, time, country, state, category, tags, rsvp } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id, 
      { title, description, date, time, country, state, category, tags, rsvp }, 
      { new: true }
    ).populate('organizer tags rsvp');
    res.status(200).json({ message: 'Event updated', event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get all events created by the authenticated user specfically
router.get('/myevents', isLoggedIn, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).populate('organizer tags rsvp');
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
