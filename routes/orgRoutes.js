const express = require('express');
const { Organisation, User } = require('../models');
const authenticateToken = require('../middleware/authToken');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`Request received for user ID: ${req.user.userId}`);
    const user = await User.findByPk(req.user.userId);
    console.log(`User retrieved: ${JSON.stringify(user)}`);
    
    const organisations = await user.getOrganisations();
    console.log(`Organisations retrieved: ${JSON.stringify(organisations)}`);

    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations: organisations.map(org => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.get('/:orgId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const organisation = await Organisation.findByPk(req.params.orgId);

    if (!organisation || !(await user.hasOrganisation(organisation))) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(422).json({
        errors: [{ field: 'name', message: 'Name is required' }],
      });
    }

    const organisation = await Organisation.create({ name, description });
    const user = await User.findByPk(req.user.userId);
    await user.addOrganisation(organisation);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    });
  }
});

router.post('/:orgId/users', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const organisation = await Organisation.findByPk(req.params.orgId);
    const user = await User.findByPk(userId);

    if (!organisation || !user) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation or user not found',
      });
    }

    await organisation.addUser(user);

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    console.error('Error adding user to organisation:', error);
    res.status(400).json({
      status: 'Bad Request',
      message: 'Failed to add user to organisation',
      error: error.message, 
    });
  }
});

module.exports = router;
