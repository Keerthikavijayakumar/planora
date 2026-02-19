const { db, admin } = require('../config/firebase');

exports.searchProjects = async (req, res) => {
    try {
        const { domain, skillLevel } = req.body;
        const uid = req.user.uid;

        if (!domain || !skillLevel) {
            return res.status(400).json({ error: 'Domain and Skill Level are required for search' });
        }

        // 1. Check Usage Limit (Freemium: 5/week)
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user if not exists
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

        // Map frontend domains to Firestore domains if necessary
        let searchDomain = domain;
        if (domain === 'AI/ML') searchDomain = 'AIML';
        // Add other mappings as needed

        console.log(`Searching for project with domain: ${searchDomain}`);

        const projectsRef = db.collection('project');
        const snapshot = await projectsRef
            .where('domain', '==', searchDomain)
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log("No matching projects found.");
            return res.json({ projects: [] });
        }

        const projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        const selectedProject = projects[0];

        // 2. Increment Usage
        await userRef.update({
            weeklyUsageCount: admin.firestore.FieldValue.increment(1)
        });

        // 3. Save to generation history
        // Map project data to blueprint format for history
        const blueprint = {
            title: selectedProject.title || selectedProject.name || 'Project Idea',
            problem_statement: selectedProject.problemStatement || selectedProject.description || `A ${domain} project for ${skillLevel} developers.`,
            core_features: {
                must_have: selectedProject.features || [],
                should_have: [],
                future_scope: []
            },
            roadmap_4_weeks: selectedProject.implementationSteps ?
                selectedProject.implementationSteps.reduce((acc, step, index) => {
                    acc[`week${index + 1}`] = step;
                    return acc;
                }, {}) : {},
            market_potential_score: parseInt(selectedProject.difficultyScore) || 5,
            difficulty_score: parseInt(selectedProject.difficultyScore) || 5,
            resume_impact_score: 8,
            recommended_tech_stack: {
                frontend: "React",
                backend: "Node.js",
                database: "Firestore",
                deployment: "Vercel",
                reasoning: "Standard stack."
            },
            what_is_new: "Community sourced project.",
            existing_solutions: "Standard implementation.",
            educational_resources: {
                learning_path: `Start with ${selectedProject.features?.[0] || 'basics'}.`,
                key_concepts: ["Core Concepts"]
            }
        };

        const historyEntry = {
            userId: uid,
            domain,
            skillLevel,
            teamSize: 'Solo',
            purpose: 'Portfolio',
            blueprint,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isProject: true,
            projectId: selectedProject.id
        };
        await db.collection('generationHistory').add(historyEntry);

        res.json({ projects });

    } catch (error) {
        console.error('Search Projects Error:', error);
        res.status(500).json({ error: 'Failed to search projects' });
    }
};
