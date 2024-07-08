// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Organisation = require('../models/organisation');
const { generateToken } = require('../auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

router.post('/register', [
  // Validation rules
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email format').custom(async (value) => {
    const existingUser = await User.findOne({ where: { email: value } });
    if (existingUser) {
      throw new Error('Email already exists');
    }
  }),
  check('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Use the hashed password
      phone,
    });

    // Create default organisation
    const organisation = await Organisation.create({
      name: `${firstName}'s Organisation`,
    });

    // Associate user with organisation
    await user.addOrganisation(organisation);

    const accessToken = generateToken(user);

    res.status(201).json({
      status: 'success',
      data: {
      message: 'Registration successful',
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'Bad request',
      message: 'Registration unsuccessful',
      statusCode: 400,
    });
  }
});

router.post('/login', [
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }

    const accessToken = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Internal server error',
      message: 'Login failed',
      statusCode: 500,
    });
  }
});


module.exports = router;