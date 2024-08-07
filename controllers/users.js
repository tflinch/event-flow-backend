const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const isLoggedIn = require('../middleware/isLoggedIn');
const router = express.Router();

const SALT_LENGTH = 12;

router.post('/signup', async (req, res) => {
  try {
    console.log('Received signup request:', req.body);
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.status(400).json({ error: 'Username already taken.' });
    }
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH),
      name: req.body.firstName + ' ' + req.body.lastName,
      phoneNumber: req.body.phone,
      country: req.body.country,
      state: req.body.state,
      email: req.body.email
    });
    const token = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.JWT_SECRET
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = jwt.sign(
        { username: user.username, _id: user._id },
        process.env.JWT_SECRET
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid username or password.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { username, password, role, name, phoneNumber, country, state, email } = req.body;
    const hashedPassword = bcrypt.hashSync(password, SALT_LENGTH);
    const user = new User({ username, hashedPassword, role, name, phoneNumber, country, state, email });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const { username, password, role, name, phoneNumber, country, state, email } = req.body;
    const hashedPassword = bcrypt.hashSync(password, SALT_LENGTH);
    const user = await User.findByIdAndUpdate(req.params.id, { username, hashedPassword, role, name, phoneNumber, country, state, email }, { new: true });
    res.status(200).json({ message: 'User updated', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
