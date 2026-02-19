const { db, admin } = require('../config/firebase');
const { analyzeInnovation, explainTechStack } = require('../services/geminiService');

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

        // Map frontend domains to Firestore domains
        const domainMap = {
            'AI/ML': 'AIML',
            'Web Development': 'WebDev',
            'Mobile Development': 'MobileDev',
            'Cybersecurity': 'Cybersecurity',
            'Data Science': 'DataScience',
            'Cloud Computing': 'CloudComputing',
            'Blockchain': 'Blockchain',
            'DevOps': 'DevOps'
        };
        const searchDomain = domainMap[domain] || domain;

        console.log(`Searching for project with domain: ${searchDomain}, level: ${skillLevel}`);

        const projectsRef = db.collection('project');
        const snapshot = await projectsRef
            .where('domain', '==', searchDomain)
            .where('level', '==', skillLevel)
            .get();

        if (snapshot.empty) {
            // Fallback: try domain-only search if no exact match
            const fallbackSnapshot = await projectsRef
                .where('domain', '==', searchDomain)
                .limit(1)
                .get();
            if (fallbackSnapshot.empty) {
                console.log("No matching projects found.");
                return res.json({ projects: [] });
            }
            const projects = [];
            fallbackSnapshot.forEach(doc => {
                projects.push({ id: doc.id, ...doc.data() });
            });
            // Continue with fallback project
            var selectedProject = projects[Math.floor(Math.random() * projects.length)];
        } else {
            const projects = [];
            snapshot.forEach(doc => {
                projects.push({ id: doc.id, ...doc.data() });
            });
            // Pick a random project from matches
            var selectedProject = projects[Math.floor(Math.random() * projects.length)];
        }

        // 3. Increment usage only for a new project generation
        if (!isDuplicateGeneration) {
            await userRef.update({
                weeklyUsageCount: admin.firestore.FieldValue.increment(1)
            });
        }

        // 3. AI-powered innovation analysis
        const projectTitle = selectedProject.title || selectedProject.name || 'Project Idea';
        const projectFeatures = selectedProject.features || [];
        const innovationData = await analyzeInnovation(projectTitle, domain, projectFeatures);

        // 3b. For Freshers, generate tech stack explanations
        let techExplanations = null;
        if (skillLevel === 'Fresher') {
            techExplanations = await explainTechStack(selectedProject.techStack, projectTitle, domain);
        }

        // 4. Save to generation history
        // Build tech stack from project data
        const techStack = selectedProject.techStack || [];
        const blueprint = {
            title: projectTitle,
            problem_statement: selectedProject.problemStatement || selectedProject.description || `A ${domain} project for ${skillLevel} developers.`,
            core_features: {
                must_have: projectFeatures,
                should_have: [],
                future_scope: []
            },
            roadmap_4_weeks: selectedProject.implementationSteps ?
                selectedProject.implementationSteps.reduce((acc, step, index) => {
                    acc[`week${index + 1}`] = step;
                    return acc;
                }, {}) : {},
            market_potential_score: parseInt(selectedProject.marketPotential) || 7,
            difficulty_score: parseInt(selectedProject.difficultyScore) || 5,
            resume_impact_score: parseInt(selectedProject.resumeImpact) || 8,
            recommended_tech_stack: {
                frontend: techStack[0] || 'React',
                backend: techStack[1] || 'Node.js',
                database: techStack[2] || 'Firebase',
                deployment: techStack[3] || 'Vercel',
                reasoning: `Using ${techStack.join(', ')} for this ${domain} project.`
            },
            what_is_new: innovationData.what_is_new,
            existing_solutions: innovationData.existing_solutions,
            ...(techExplanations ? { tech_explanations: techExplanations } : {}),
            educational_resources: {
                learning_path: `Start with ${projectFeatures[0] || 'basics'}.`,
                key_concepts: techStack.length > 0 ? techStack : ['Core Concepts']
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

        res.json({ projects: [selectedProject], blueprint });

    } catch (error) {
        console.error('Search Projects Error:', error);
        res.status(500).json({ error: 'Failed to search projects' });
    }
};
