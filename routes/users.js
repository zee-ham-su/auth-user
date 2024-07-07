const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Organisation = require('../models/organisation');
const { verifyToken } = require('../auth');

router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId; // Get user ID from token

  try {
    // Use Sequelize's findByPk to fetch user by ID
    const user = await User.findByPk(id, {
      include: [{ model: Organisation }], // Include associated organisations
    });

    if (!user) {
      return res.status(404).json({
        status: 'Not found',
        message: 'User not found',
        statusCode: 404,
      });
    }

    // Check if the user is authorized to access this user
    if (userId !== id && !user.Organisations.some((org) => org.orgId === userId)) {
      return res.status(403).json({
        status: 'Forbidden',
        message: 'Unauthorized access',
        statusCode: 403,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Internal server error',
      message: 'Failed to retrieve user',
      statusCode: 500,
    });
  }
});


module.exports = router;