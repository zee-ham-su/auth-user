const express = require('express');
const router = express.Router();
const { User, Organisation } = require('../models');
const authenticateToken = require('../middleware/authToken');

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    console.log('Request received for user ID:', id);
    console.log('Authenticated user ID:', userId);

    try {
        const user = await User.findByPk(id, {
            include: [{ model: Organisation }],
        });

        console.log('Database response:', user);

        if (!user) {
            console.log('User not found.');
            return res.status(404).json({
                status: 'Not found',
                message: 'User not found',
                statusCode: 404,
            });
        }

        if (userId !== id && !user.Organisations.some((org) => org.orgId === userId)) {
            console.log('Unauthorized access.');
            return res.status(403).json({
                status: 'Forbidden',
                message: 'Unauthorized access',
                statusCode: 403,
            });
        }

        console.log('User retrieved successfully.');
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
        console.error('Error occurred:', error);
        res.status(500).json({
            status: 'Internal server error',
            message: 'Failed to retrieve user',
            statusCode: 500,
        });
    }
});

module.exports = router;
