const express = require('express');
const router = express.Router();
const Organisation = require('../models/organisation');
const User = require('../models/user');
const { verifyToken } = require('../auth');
const { check, validationResult } = require('express-validator');

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.userId; // Get user ID from token

  try {
    // Use Sequelize's findAll to fetch organisations
    const organisations = await Organisation.findAll({
      include: [{ model: User, where: { userId } }], // Include associated users
    });

    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Internal server error',
      message: 'Failed to retrieve organisations',
      statusCode: 500,
    });
  }
});

router.get('/:orgId', verifyToken, async (req, res) => {
  const { orgId } = req.params;
  const userId = req.user.userId; // Get user ID from token

  try {
    // Use Sequelize's findByPk to fetch organisation by ID
    const organisation = await Organisation.findByPk(orgId, {
      include: [{ model: User }], // Include associated users
    });

    if (!organisation) {
      return res.status(404).json({
        status: 'Not found',
        message: 'Organisation not found',
        statusCode: 404,
      });
    }

    // Check if the user is authorized to access this organisation
    if (!organisation.Users.some((user) => user.userId === userId)) {
      return res.status(403).json({
        status: 'Forbidden',
        message: 'Unauthorized access',
        statusCode: 403,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: organisation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Internal server error',
      message: 'Failed to retrieve organisation',
      statusCode: 500,
    });
  }
});

router.post('/', verifyToken, [
  check('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  const userId = req.user.userId; // Get user ID from token

  try {
    // Use Sequelize's create to create a new organisation
    const organisation = await Organisation.create({
      name,
      description,
    });

    // Associate user with organisation
    await organisation.addUser(userId);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: organisation,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    });
  }
});

router.post('/:orgId/users', verifyToken, [
  check('userId').notEmpty().withMessage('User ID is required'),
], async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;
  const currentUserId = req.user.userId; // Get user ID from token

  try {
    // Use Sequelize's findByPk to fetch organisation by ID
    const organisation = await Organisation.findByPk(orgId);
    if (!organisation) {
      return res.status(404).json({
        status: 'Not found',
        message: 'Organisation not found',
        statusCode: 404,
      });
    }

    // Check if the user is authorized to add users to this organisation
    if (!organisation.Users.some((user) => user.userId === currentUserId)) {
      return res.status(403).json({
        status: 'Forbidden',
        message: 'Unauthorized access',
        statusCode: 403,
      });
    }

    // Use Sequelize's addUser method to add a user to the organisation
    await organisation.addUser(userId);

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Internal server error',
      message: 'Failed to add user to organisation',
      statusCode: 500,
    });
  }
});

module.exports = router;
