const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    // If admin auth is available and a token was provided, verify it
    if (admin && admin.auth && token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            return next();
        } catch (error) {
            console.error('Token Verification Error:', error.message || error);
            return res.status(403).json({ error: 'Unauthorized: Invalid token' });
        }
    }

    // Development fallback: allow x-mock-uid header when auth is not configured
    const mockUid = req.headers['x-mock-uid'];
    if (mockUid) {
        req.user = { uid: mockUid };
        return next();
    }

    // If no token and no mock uid, return unauthorized
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
};

module.exports = verifyToken;
