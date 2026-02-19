const { db } = require('../config/firebase');

exports.getUserStats = async (req, res) => {
    try {
        const uid = req.user.uid;
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.json({ weeklyUsageCount: 0, isPremium: false });
        }

        const data = userDoc.data();
        res.json({
            weeklyUsageCount: data.weeklyUsageCount || 0,
            isPremium: data.role === 'premium',
            lastResetDate: data.lastResetDate
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

exports.syncUser = async (req, res) => {
    // Optional: Explicit sync on login if desired, 
    // but the createIdea controller handles lazy creation.
    // We can add it here if the frontend wants to ensure user exists immediately.
    try {
        const uid = req.user.uid;
        const { email } = req.user;
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                email,
                weeklyUsageCount: 0,
                lastResetDate: new Date().toISOString(),
                role: 'free',
                createdAt: new Date().toISOString()
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Sync failed' });
    }
}
