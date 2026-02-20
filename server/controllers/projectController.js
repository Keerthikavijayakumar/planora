const { db, admin } = require('../config/firebase');
const { generateInnovationAngle, generateAdditionalFeatures, generateProjectDescription, generateLearningPath, generateTechnicalDetails } = require('../services/geminiService');
const fs = require('fs');
const path = require('path');

// Load projects from JSON file
const projectsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../scripts/projects.json'), 'utf8')
);

const normalizeDomain = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const DOMAIN_ALIASES = {
    aiml: ['AIML', 'AI/ML', 'AI ML', 'Artificial Intelligence', 'Machine Learning'],
    webdevelopment: ['Web Development', 'Web Dev', 'WebDev', 'Web'],
    mobiledevelopment: ['Mobile Development', 'Mobile Dev', 'MobileDev', 'Mobile Application', 'Mobile App', 'App Development'],
    cybersecurity: ['Cybersecurity', 'Cyber Security'],
    datascience: ['Data Science', 'DataScience', 'Data Analytics'],
    cloudcomputing: ['Cloud Computing', 'CloudComputing', 'Cloud'],
    blockchain: ['Blockchain', 'Block Chain'],
    devops: ['DevOps', 'Dev Ops']
};

const getDomainAliases = (domain) => {
    const key = normalizeDomain(domain);
    const aliases = DOMAIN_ALIASES[key] || [domain];
    return Array.from(new Set(aliases.filter(Boolean)));
};

const normalizeLevel = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const LEVEL_ALIASES = {
    fresher: ['Fresher', 'Freshers'],
    beginner: ['Beginner'],
    intermediate: ['Intermediate'],
    advanced: ['Advanced', 'Hard']
};

const getLevelAliases = (level) => {
    const key = normalizeLevel(level);
    const aliases = LEVEL_ALIASES[key] || [level];
    return Array.from(new Set(aliases.filter(Boolean)));
};

const resolveDomainDefaults = (domain) => {
    const key = normalizeDomain(domain);

    if (['aiml', 'aimachinelearning', 'artificialintelligence', 'machinelearning'].includes(key)) {
        return { frontend: 'Streamlit', backend: 'Python', database: 'PostgreSQL', deployment: 'Docker' };
    }
    if (['webdevelopment', 'webdev', 'web'].includes(key)) {
        return { frontend: 'React', backend: 'Node.js', database: 'MongoDB', deployment: 'Vercel' };
    }
    if (['mobiledevelopment', 'mobiledev', 'mobileapplication', 'mobileapp', 'appdevelopment'].includes(key)) {
        return { frontend: 'Flutter', backend: 'Node.js', database: 'Firebase', deployment: 'Play Store / App Store' };
    }
    if (['cybersecurity', 'cybersecurity'].includes(key)) {
        return { frontend: 'React', backend: 'Python', database: 'Elasticsearch', deployment: 'Docker' };
    }
    if (['datascience', 'dataanalytics'].includes(key)) {
        return { frontend: 'Streamlit', backend: 'Python', database: 'PostgreSQL', deployment: 'AWS' };
    }
    if (['cloudcomputing', 'cloud'].includes(key)) {
        return { frontend: 'React', backend: 'Node.js', database: 'DynamoDB', deployment: 'AWS' };
    }
    if (['blockchain', 'blockchain'].includes(key)) {
        return { frontend: 'React', backend: 'Node.js', database: 'IPFS', deployment: 'Ethereum Testnet' };
    }
    if (['devops', 'devops'].includes(key)) {
        return { frontend: 'React', backend: 'Node.js', database: 'PostgreSQL', deployment: 'Kubernetes' };
    }

    return { frontend: 'React', backend: 'Node.js', database: 'Firestore', deployment: 'Vercel' };
};

const pickTech = (techStack, keywords, fallback) => {
    const found = techStack.find((tech) => {
        const normalized = (tech || '').toLowerCase();
        return keywords.some((word) => normalized.includes(word));
    });
    return found || fallback;
};

const inferRecommendedStack = (project, domain) => {
    const techStack = Array.isArray(project?.techStack) ? project.techStack : [];
    const defaults = resolveDomainDefaults(domain || project?.domain);

    const frontend = pickTech(techStack, ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'flutter', 'react native', 'swift', 'kotlin', 'html', 'css', 'javascript', 'canvas', 'streamlit'], defaults.frontend);
    const backend = pickTech(techStack, ['node', 'express', 'nestjs', 'flask', 'django', 'fastapi', 'spring', 'laravel', 'asp.net', 'dotnet', 'go', 'gin', 'ruby', 'rails', 'php', 'python'], defaults.backend);
    const database = pickTech(techStack, ['mongodb', 'postgres', 'mysql', 'firestore', 'firebase', 'dynamodb', 'supabase', 'sqlite', 'redis', 'elasticsearch', 'ipfs'], defaults.database);
    const deployment = pickTech(techStack, ['vercel', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'heroku', 'netlify', 'render', 'cloud run', 'lambda'], defaults.deployment);

    return {
        frontend,
        backend,
        database,
        deployment,
        reasoning: techStack.length
            ? `Derived from project stack: ${techStack.join(', ')}.`
            : 'Derived from domain best practices.'
    };
};

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

        const domainAliases = getDomainAliases(domain);
        const levelAliases = getLevelAliases(skillLevel);
        console.log(`Searching for project with domain aliases: ${domainAliases.join(', ')}`);

        // Filter projects from JSON file
        const normalizedDomainAliases = domainAliases.map(normalizeDomain);
        const allMatchedProjects = projectsData
            .map((project, index) => ({ id: `project_${index}`, ...project }))
            .filter((project) => {
                const projectDomain = normalizeDomain(project.domain);
                return normalizedDomainAliases.includes(projectDomain);
            });

        if (!allMatchedProjects.length) {
            console.log("No matching projects found.");
            return res.json({ projects: [] });
        }

        let candidateProjects = allMatchedProjects;
        const normalizedLevelAliases = levelAliases.map(normalizeLevel);
        const levelMatchedProjects = allMatchedProjects.filter((project) => normalizedLevelAliases.includes(normalizeLevel(project.level)));
        if (levelMatchedProjects.length) {
            candidateProjects = levelMatchedProjects;
        }

        // 2. Check if this exact project was already generated by this user
        const existingHistorySnapshot = await db.collection('generationHistory')
            .where('userId', '==', uid)
            .get();

        let mostRecentMatchingProjectId = null;
        let mostRecentTimestamp = 0;
        let existingHistoryId = null;
        existingHistorySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAtSeconds = data?.createdAt?._seconds || 0;

            if (data?.isProject && data?.domain === domain && data?.skillLevel === skillLevel && createdAtSeconds >= mostRecentTimestamp) {
                mostRecentTimestamp = createdAtSeconds;
                mostRecentMatchingProjectId = data?.projectId || null;
            }
        });

        if (candidateProjects.length > 1 && mostRecentMatchingProjectId) {
            const nonRepeatingCandidates = candidateProjects.filter((project) => project.id !== mostRecentMatchingProjectId);
            if (nonRepeatingCandidates.length) {
                candidateProjects = nonRepeatingCandidates;
            }
        }

        const selectedProject = candidateProjects[Math.floor(Math.random() * candidateProjects.length)];

        existingHistorySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!existingHistoryId && data?.projectId === selectedProject.id) {
                existingHistoryId = doc.id;
            }
        });

        const isDuplicateGeneration = Boolean(existingHistoryId);

        // 3. Increment usage only for a new project generation
        if (!isDuplicateGeneration) {
            await userRef.update({
                weeklyUsageCount: admin.firestore.FieldValue.increment(1)
            });
        }

        // 4. Save to generation history only for first-time generation
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
            recommended_tech_stack: inferRecommendedStack(selectedProject, domain),
            what_is_new: "Community sourced project.",
            existing_solutions: "Standard implementation.",
            educational_resources: {
                learning_path: `Start with ${selectedProject.features?.[0] || 'basics'}.`,
                key_concepts: ["Core Concepts"]
            }
        };

        let historyId = existingHistoryId;
        if (!isDuplicateGeneration) {
            // Generate AI-powered innovation angle and competitor analysis
            let innovationData = {
                innovation_angle: "Focus on user experience and modern implementation patterns.",
                competitors: "Similar projects exist but this follows a structured development path."
            };
            
            let additionalFeatures = {
                should_have: [],
                future_scope: []
            };
            
            let aiDescription = null;
            let learningPathData = null;
            let technicalDetailsData = null;
            
            try {
                // Generate all AI content in parallel for efficiency
                const [innovation, features, description, learningPath, technicalDetails] = await Promise.all([
                    generateInnovationAngle(
                        selectedProject.title,
                        domain,
                        selectedProject.features,
                        selectedProject.techStack
                    ),
                    generateAdditionalFeatures(
                        selectedProject.title,
                        selectedProject.features,
                        domain
                    ),
                    generateProjectDescription(
                        selectedProject.title,
                        domain,
                        selectedProject.features
                    ),
                    generateLearningPath(
                        selectedProject.title,
                        domain,
                        selectedProject.features,
                        selectedProject.techStack
                    ),
                    generateTechnicalDetails(
                        selectedProject.title,
                        domain,
                        selectedProject.features,
                        blueprint.recommended_tech_stack
                    )
                ]);
                
                innovationData = innovation;
                additionalFeatures = features;
                aiDescription = description;
                learningPathData = learningPath;
                technicalDetailsData = technicalDetails;
            } catch (err) {
                console.warn('⚠️ Failed to generate AI insights, using fallback:', err.message);
            }

            // Update blueprint with AI-generated insights
            blueprint.what_is_new = innovationData.innovation_angle;
            blueprint.existing_solutions = innovationData.competitors;
            blueprint.core_features.should_have = additionalFeatures.should_have || [];
            blueprint.core_features.future_scope = additionalFeatures.future_scope || [];
            
            // Use AI description if available
            if (aiDescription) {
                blueprint.problem_statement = aiDescription;
            }
            
            // Use AI learning path if available
            if (learningPathData) {
                blueprint.educational_resources = {
                    learning_path: learningPathData.learning_path,
                    key_concepts: learningPathData.key_concepts,
                    recommended_resources: learningPathData.recommended_resources || []
                };
            }
            
            // Add technical implementation details
            if (technicalDetailsData) {
                blueprint.technical_details = {
                    api_structure: technicalDetailsData.api_structure || [],
                    database_schema: technicalDetailsData.database_schema || [],
                    security_considerations: technicalDetailsData.security_considerations || [],
                    testing_strategy: technicalDetailsData.testing_strategy || [],
                    common_pitfalls: technicalDetailsData.common_pitfalls || [],
                    folder_structure: technicalDetailsData.folder_structure || ''
                };
            }

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
            const historyRef = await db.collection('generationHistory').add(historyEntry);
            historyId = historyRef.id;
        } else {
            // For duplicate generations, also generate AI insights
            try {
                const [innovationData, additionalFeatures, description, learningPath, technicalDetails] = await Promise.all([
                    generateInnovationAngle(
                        selectedProject.title,
                        domain,
                        selectedProject.features,
                        selectedProject.techStack
                    ),
                    generateAdditionalFeatures(
                        selectedProject.title,
                        selectedProject.features,
                        domain
                    ),
                    generateProjectDescription(
                        selectedProject.title,
                        domain,
                        selectedProject.features
                    ),
                    generateLearningPath(
                        selectedProject.title,
                        domain,
                        selectedProject.features,
                        selectedProject.techStack
                    ),
                    generateTechnicalDetails(
                        selectedProject.title,
                        domain,
                        selectedProject.features,
                        blueprint.recommended_tech_stack
                    )
                ]);
                
                blueprint.what_is_new = innovationData.innovation_angle;
                blueprint.existing_solutions = innovationData.competitors;
                blueprint.core_features.should_have = additionalFeatures.should_have || [];
                blueprint.core_features.future_scope = additionalFeatures.future_scope || [];
                
                if (description) {
                    blueprint.problem_statement = description;
                }
                
                if (learningPath) {
                    blueprint.educational_resources = {
                        learning_path: learningPath.learning_path,
                        key_concepts: learningPath.key_concepts,
                        recommended_resources: learningPath.recommended_resources || []
                    };
                }
                
                if (technicalDetails) {
                    blueprint.technical_details = {
                        api_structure: technicalDetails.api_structure || [],
                        database_schema: technicalDetails.database_schema || [],
                        security_considerations: technicalDetails.security_considerations || [],
                        testing_strategy: technicalDetails.testing_strategy || [],
                        common_pitfalls: technicalDetails.common_pitfalls || [],
                        folder_structure: technicalDetails.folder_structure || ''
                    };
                }
            } catch (err) {
                console.warn('⚠️ Failed to generate AI insights for duplicate:', err.message);
            }
        }

        res.json({ projects: [selectedProject], blueprint, historyId, isDuplicateGeneration });

    } catch (error) {
        console.error('Search Projects Error:', error);
        res.status(500).json({ error: 'Failed to search projects' });
    }
};
