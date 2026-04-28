const { db, admin } = require('../config/firebase');

// Activate premium for a user. If Firestore is available, update the user doc.
const activatePremium = async (req, res) => {
    try {
        const uid = req.user?.uid || req.headers['x-mock-uid'];
        if (!uid) return res.status(400).json({ error: 'Missing user id' });

        // Prepare update
        const update = {
            isPremium: true,
            unlimitedUsage: true,
            role: 'premium',
            premiumSince: admin && admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
        };

        if (db) {
            const userRef = db.collection('users').doc(uid);
            await userRef.set(update, { merge: true });
        } else {
            // DB not initialized; return success but note that persistence didn't happen
            console.warn('Firestore not initialized; premium status not persisted for', uid);
        }

        // Try to set custom claim if auth is available
        try {
            if (admin && admin.auth) {
                await admin.auth().setCustomUserClaims(uid, { premium: true });
            }
        } catch (e) {
            // Non-fatal
            console.warn('Could not set custom claims:', e.message);
        }

        return res.json({ success: true, message: 'Premium activated', persisted: !!db });
    } catch (error) {
        console.error('ActivatePremium Error:', error.message);
        return res.status(500).json({ error: 'Failed to activate premium' });
    }
};

module.exports = { activatePremium };
