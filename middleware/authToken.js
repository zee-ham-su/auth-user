const { verifyToken } = require('../auth');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    const user = verifyToken(token);
    if (!user) {
        return res.status(403).json({ message: 'Token is invalid or expired' });
    }

    req.user = user;
    next();
};

module.exports = authenticateToken;
