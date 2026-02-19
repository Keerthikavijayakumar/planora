const { generateIdea, chatAboutBlueprint } = require('../services/geminiService');
const { db, admin } = require('../config/firebase');

exports.createIdea = async (req, res) => {
    const { domain, skillLevel, teamSize, purpose } = req.body;
    const uid = req.user.uid;

    if (!domain || !skillLevel) {
        return res.status(400).json({ error: 'Domain and Skill Level are required' });
    }

    try {
        // 1. Check Usage Limit (Freemium: 5/week)
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user if not exists (should be handled in auth but safe check)
            await userRef.set({
                email: req.user.email,
                weeklyUsageCount: 0,
                lastResetDate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
        }

        const userData = userDoc.data() || { weeklyUsageCount: 0 };

        // Check reset date
        const lastReset = new Date(userData.lastResetDate);
        const now = new Date();
        const diffTime = Math.abs(now - lastReset);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 7) {
            await userRef.update({ weeklyUsageCount: 0, lastResetDate: now.toISOString() });
            userData.weeklyUsageCount = 0;
        }

        if (userData.weeklyUsageCount >= 5) {
            const resetDate = new Date(userData.lastResetDate);
            resetDate.setDate(resetDate.getDate() + 7);
            const daysLeft = Math.max(1, Math.ceil((resetDate - new Date()) / (1000 * 60 * 60 * 24)));
            return res.status(403).json({
                error: 'Weekly free limit reached! You can generate again in ' + daysLeft + ' day(s).',
                limitReached: true,
                resetDate: resetDate.toISOString(),
                daysLeft
            });
        }

        // 2. Generate Idea
        const blueprint = await generateIdea(domain, skillLevel, teamSize, purpose);

        // 3. Update Usage
        await userRef.update({
            weeklyUsageCount: admin.firestore.FieldValue.increment(1)
        });

        // 4. Save to generation history (auto-save every generation)
        const historyEntry = {
            userId: uid,
            domain,
            skillLevel,
            teamSize: teamSize || 'Solo',
            purpose: purpose || 'Portfolio',
            blueprint,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const historyRef = await db.collection('generationHistory').add(historyEntry);

        res.json({ success: true, blueprint, historyId: historyRef.id });

    } catch (error) {
        console.error('Controller Error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to generate idea' });
    }
};

exports.saveIdea = async (req, res) => {
    try {
        const { blueprint, domain, skillLevel, historyId } = req.body;
        const uid = req.user.uid;

        if (!blueprint) return res.status(400).json({ error: 'Blueprint is required' });

        const savedIdea = {
            userId: uid,
            domain: domain || 'Unknown',
            skillLevel: skillLevel || 'Unknown',
            blueprint,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            title: blueprint.title || 'Untitled Project'
        };

        const docRef = await db.collection('savedIdeas').add(savedIdea);

        // If historyId is provided, copy chat history to the new saved idea
        if (historyId) {
            const historyChatRef = db.collection('blueprintChats').doc(`${uid}_${historyId}`);
            const historyChatDoc = await historyChatRef.get();

            if (historyChatDoc.exists) {
                const chatData = historyChatDoc.data();
                const newChatRef = db.collection('blueprintChats').doc(`${uid}_${docRef.id}`);
                await newChatRef.set({
                    ...chatData,
                    blueprintId: docRef.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        res.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("Save Error", error);
        res.status(500).json({ error: 'Failed to save idea' });
    }
};

exports.getSavedIdeas = async (req, res) => {
    try {
        const uid = req.user.uid;
        const snapshot = await db.collection('savedIdeas')
            .where('userId', '==', uid)
            .get();

        const ideas = [];
        snapshot.forEach(doc => ideas.push({ id: doc.id, ...doc.data() }));

        // Sort by createdAt client-side to avoid needing a Firestore composite index
        ideas.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return bTime - aTime;
        });

        res.json({ ideas });
    } catch (error) {
        console.error("Get Ideas Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
};

exports.deleteIdea = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;

        const docRef = db.collection('savedIdeas').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ error: 'Idea not found' });
        if (doc.data().userId !== uid) return res.status(403).json({ error: 'Unauthorized' });

        await docRef.delete();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete idea' });
    }
};

exports.getIdeaById = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;

        const docRef = db.collection('savedIdeas').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ error: 'Blueprint not found' });
        if (doc.data().userId !== uid) return res.status(403).json({ error: 'Unauthorized' });

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Get Idea Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch blueprint' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const uid = req.user.uid;
        const snapshot = await db.collection('generationHistory')
            .where('userId', '==', uid)
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        // Sort by createdAt descending
        history.sort((a, b) => {
            const aTime = a.createdAt?._seconds || 0;
            const bTime = b.createdAt?._seconds || 0;
            return bTime - aTime;
        });

        res.json({ history });
    } catch (error) {
        console.error('Get History Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.getHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;

        const docRef = db.collection('generationHistory').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ error: 'History item not found' });
        if (doc.data().userId !== uid) return res.status(403).json({ error: 'Unauthorized' });

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Get History Item Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch history item' });
    }
};

exports.chatBlueprint = async (req, res) => {
    try {
        const { blueprint, chatHistory, message, blueprintId } = req.body;
        const uid = req.user.uid;

        if (!blueprint || !message) {
            return res.status(400).json({ error: 'Blueprint and message are required' });
        }

        const response = await chatAboutBlueprint(blueprint, chatHistory || [], message);

        // Auto-save chat messages if blueprintId is provided
        if (blueprintId) {
            const chatRef = db.collection('blueprintChats').doc(`${uid}_${blueprintId}`);
            const allMessages = [
                ...(chatHistory || []),
                { role: 'user', content: message, timestamp: new Date().toISOString() },
                { role: 'assistant', content: response, timestamp: new Date().toISOString() },
            ];
            await chatRef.set({
                userId: uid,
                blueprintId,
                messages: allMessages,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }

        res.json({ success: true, response });
    } catch (error) {
        console.error('Chat Error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to get chat response' });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const { blueprintId } = req.params;
        const uid = req.user.uid;

        const chatRef = db.collection('blueprintChats').doc(`${uid}_${blueprintId}`);
        const doc = await chatRef.get();

        if (!doc.exists) {
            return res.json({ messages: [] });
        }

        const data = doc.data();
        if (data.userId !== uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json({ messages: data.messages || [] });
    } catch (error) {
        console.error('Get Chat Messages Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
};
