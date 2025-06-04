const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    const extractedToken = token.split(' ')[1];

    try {
        const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!decoded.is_admin) {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Invalid Token:", err);
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticateAdmin;
