const { model } = require('../config/gemini');
const { buildPrompt } = require('../utils/promptBuilder');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateIdea = async (domain, skillLevel, teamSize, purpose) => {
    const prompt = buildPrompt(domain, skillLevel, teamSize, purpose);

    // Single retry to avoid compounding rate limits
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            console.log(`🧠 Generating idea (attempt ${attempt + 1}/2)...`);

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                },
            });

            const response = result.response;
            const text = response.text();

            try {
                const parsed = JSON.parse(text);
                console.log('✅ Idea generated successfully');
                return parsed;
            } catch (e) {
                const cleaned = text.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                console.log('✅ Idea generated (cleaned JSON)');
                return parsed;
            }
        } catch (error) {
            console.error(`❌ Attempt ${attempt + 1} failed:`, error.message?.substring(0, 200));

            const isRateLimit = error.status === 429 ||
                error.message?.includes('429') ||
                error.message?.includes('RESOURCE_EXHAUSTED');

            if (isRateLimit && attempt === 0) {
                console.log('⏳ Rate limited. Waiting 15s before retry...');
                await sleep(15000);
                continue;
            }

            if (isRateLimit) {
                throw new Error('API rate limit reached. Please wait 1-2 minutes and try again.');
            }

            throw new Error(error.message || 'Failed to generate project idea');
        }
    }
};

const chatAboutBlueprint = async (blueprint, chatHistory, userMessage) => {
    const systemContext = `You are an expert project mentor and technical advisor. The user has generated a project blueprint using an AI tool. Here is the blueprint they generated:

PROJECT TITLE: ${blueprint.title}
PROBLEM STATEMENT: ${blueprint.problem_statement || ''}
DOMAIN: ${blueprint.domain || ''}

CORE FEATURES:
- Must Have: ${blueprint.core_features?.must_have?.join(', ') || 'N/A'}
- Should Have: ${blueprint.core_features?.should_have?.join(', ') || 'N/A'}
- Future Scope: ${blueprint.core_features?.future_scope?.join(', ') || 'N/A'}

TECH STACK:
- Frontend: ${blueprint.recommended_tech_stack?.frontend || 'N/A'}
- Backend: ${blueprint.recommended_tech_stack?.backend || 'N/A'}
- Database: ${blueprint.recommended_tech_stack?.database || 'N/A'}
- Deployment: ${blueprint.recommended_tech_stack?.deployment || 'N/A'}

ROADMAP: ${blueprint.roadmap_4_weeks ? JSON.stringify(blueprint.roadmap_4_weeks) : 'N/A'}

WHAT IS NEW: ${blueprint.what_is_new || 'N/A'}
EXISTING SOLUTIONS: ${blueprint.existing_solutions || 'N/A'}

Instructions:
- Answer questions specifically about THIS project blueprint
- Give practical, actionable advice
- If asked about implementation, provide code snippets or step-by-step guidance
- Be concise but thorough
- Use markdown formatting for better readability
- If the question is unrelated to the project, politely redirect to the project context`;

    // Build conversation history for Gemini
    const contents = [];

    // System context as first user message
    contents.push({
        role: 'user',
        parts: [{ text: systemContext + '\n\nPlease acknowledge that you understand this project and are ready to help.' }]
    });
    contents.push({
        role: 'model',
        parts: [{ text: `I understand the "${blueprint.title}" project. I'm ready to help you with any questions about implementation, architecture, tech choices, or anything else related to this blueprint. What would you like to know?` }]
    });

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }
    }

    // Add current message
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    // Retry logic for rate limits
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            console.log(`💬 Chat about blueprint (attempt ${attempt + 1}/2)...`);
            const result = await model.generateContent({ contents });
            const response = result.response.text();
            console.log('✅ Chat response generated');
            return response;
        } catch (error) {
            console.error(`❌ Chat error (attempt ${attempt + 1}):`, error.message?.substring(0, 200));
            
            const isRateLimit = error.status === 429 ||
                error.message?.includes('429') ||
                error.message?.includes('RESOURCE_EXHAUSTED');

            if (isRateLimit && attempt === 0) {
                console.log('⏳ Rate limited. Waiting 10s before retry...');
                await sleep(10000);
                continue;
            }

            if (isRateLimit) {
                throw new Error('API rate limit reached. Please wait 1-2 minutes and try again.');
            }
            
            throw new Error(error.message || 'Failed to get chat response');
        }
    }
};

const generateInnovationAngle = async (projectTitle, domain, features, techStack) => {
    const prompt = `Analyze this project and provide a detailed innovation angle and competitive analysis:

PROJECT: ${projectTitle}
DOMAIN: ${domain}
FEATURES: ${Array.isArray(features) ? features.join(', ') : features}
TECH STACK: ${techStack ? JSON.stringify(techStack) : 'Standard web stack'}

Provide:
1. INNOVATION ANGLE: What makes this project unique? What creative twist or special approach can differentiate it from typical implementations? Focus on specific features, UX improvements, or technical innovations. Be specific and actionable (2-3 sentences).

2. COMPETITORS: Identify 2-3 existing similar solutions or tools in the market. Explain what they do and how this project can be positioned differently. Be specific with examples (3-4 sentences).

Format as JSON:
{
  "innovation_angle": "Specific innovation description here",
  "competitors": "Competitor analysis here"
}`;

    try {
        console.log('💡 Generating innovation angle...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            console.log('✅ Innovation angle generated');
            return parsed;
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log('✅ Innovation angle generated (cleaned JSON)');
            return parsed;
        }
    } catch (error) {
        console.error('❌ Innovation angle generation failed:', error.message?.substring(0, 200));
        // Return fallback instead of throwing to not break the main flow
        return {
            innovation_angle: "Focus on user experience and modern design patterns to create an intuitive, efficient solution that emphasizes ease of use and practical implementation.",
            competitors: "While similar projects exist in this domain, this implementation follows a structured development path with clear milestones and best practices, making it ideal for learning and portfolio building."
        };
    }
};

const generateAdditionalFeatures = async (projectTitle, mustHaveFeatures, domain) => {
    const prompt = `Based on this project, generate additional feature ideas:

PROJECT: ${projectTitle}
DOMAIN: ${domain}
CORE FEATURES: ${Array.isArray(mustHaveFeatures) ? mustHaveFeatures.join(', ') : mustHaveFeatures}

Generate:
1. SHOULD HAVE: 3-4 features that would enhance the project but aren't critical for MVP. These should add value and improve user experience.
2. FUTURE SCOPE: 3-4 advanced features for future versions. These should be innovative, scalable additions that take the project to the next level.

Format as JSON:
{
  "should_have": ["Feature 1", "Feature 2", "Feature 3"],
  "future_scope": ["Advanced feature 1", "Advanced feature 2", "Advanced feature 3"]
}`;

    try {
        console.log('🎯 Generating additional features...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            console.log('✅ Additional features generated');
            return parsed;
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log('✅ Additional features generated (cleaned JSON)');
            return parsed;
        }
    } catch (error) {
        console.error('❌ Additional features generation failed:', error.message?.substring(0, 200));
        // Return fallback
        return {
            should_have: ["Enhanced user interface", "Performance optimization", "Additional customization options"],
            future_scope: ["Mobile app version", "Advanced analytics", "Third-party integrations", "AI-powered features"]
        };
    }
};

const generateProjectDescription = async (projectTitle, domain, features) => {
    const prompt = `Create a compelling project description for this idea:

PROJECT: ${projectTitle}
DOMAIN: ${domain}
CORE FEATURES: ${Array.isArray(features) ? features.join(', ') : features}

Write a concise, engaging description (2-3 sentences) that:
- Explains what the project does and who it's for
- Highlights the main problem it solves
- Makes it sound professional and portfolio-worthy
- Avoids generic phrases

Format as JSON:
{
  "description": "The compelling project description here"
}`;

    try {
        console.log('📝 Generating project description...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            console.log('✅ Project description generated');
            return parsed.description;
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log('✅ Project description generated (cleaned JSON)');
            return parsed.description;
        }
    } catch (error) {
        console.error('❌ Description generation failed:', error.message?.substring(0, 200));
        // Return fallback
        return `A ${domain} project designed for developers to build practical skills while creating a portfolio-worthy application.`;
    }
};

const generateLearningPath = async (projectTitle, domain, features, techStack) => {
    const prompt = `Create a comprehensive learning path for this project:

PROJECT: ${projectTitle}
DOMAIN: ${domain}
FEATURES: ${Array.isArray(features) ? features.join(', ') : features}
TECH STACK: ${techStack ? JSON.stringify(techStack) : 'Standard stack'}

Generate a detailed, actionable learning path that includes:
1. LEARNING_PATH: A clear, step-by-step guide (3-4 sentences) explaining the learning journey from beginner concepts to advanced implementation. Be specific about what to learn and in what order.

2. KEY_CONCEPTS: List 5-6 essential technical concepts, frameworks, or skills that are critical for this project. Be specific and relevant to the actual tech stack.

3. RECOMMENDED_RESOURCES: Suggest 3-4 specific learning resources (online courses, documentation sites, or tutorial platforms) that would help. Be practical and current.

Format as JSON:
{
  "learning_path": "Detailed learning journey description",
  "key_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
  "recommended_resources": ["Resource 1", "Resource 2", "Resource 3"]
}`;

    try {
        console.log('🎓 Generating comprehensive learning path...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            console.log('✅ Learning path generated');
            return parsed;
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log('✅ Learning path generated (cleaned JSON)');
            return parsed;
        }
    } catch (error) {
        console.error('❌ Learning path generation failed:', error.message?.substring(0, 200));
        // Return fallback
        return {
            learning_path: `Start by mastering the fundamentals of ${domain}, then build small projects to practice core concepts. Gradually increase complexity by implementing the features listed, and finish by deploying your application.`,
            key_concepts: ["Core Fundamentals", "API Development", "Database Design", "Authentication", "Deployment Practices"],
            recommended_resources: ["Official Documentation", "YouTube Tutorials", "Interactive Coding Platforms"]
        };
    }
};

const generateTechnicalDetails = async (projectTitle, domain, features, techStack) => {
    const prompt = `Generate comprehensive technical implementation details for this project:

PROJECT: ${projectTitle}
DOMAIN: ${domain}
FEATURES: ${Array.isArray(features) ? features.join(', ') : features}
TECH STACK: ${techStack ? JSON.stringify(techStack) : 'Standard stack'}

Provide detailed technical guidance covering:

1. API_STRUCTURE: Describe 4-5 key API endpoints this project needs. Format as array of objects with method, endpoint, and purpose.
Example: [{"method": "POST", "endpoint": "/api/users/register", "purpose": "Create new user account"}]

2. DATABASE_SCHEMA: Describe 3-4 main database entities/collections with their key fields. Format as array of objects.
Example: [{"entity": "User", "fields": ["id", "email", "password_hash", "created_at"]}]

3. SECURITY_CONSIDERATIONS: List 4-5 critical security measures needed (authentication, validation, encryption, etc.). Be specific to this project.

4. TESTING_STRATEGY: Provide 3-4 testing recommendations (unit tests, integration tests, E2E tests) with specific examples.

5. COMMON_PITFALLS: List 3-4 common mistakes or challenges developers face when building this type of project.

6. FOLDER_STRUCTURE: Suggest a clean project folder structure as a string representation.

Format as JSON:
{
  "api_structure": [{"method": "GET/POST/PUT/DELETE", "endpoint": "/path", "purpose": "description"}],
  "database_schema": [{"entity": "EntityName", "fields": ["field1", "field2", "field3"]}],
  "security_considerations": ["Security measure 1", "Security measure 2", "Security measure 3", "Security measure 4"],
  "testing_strategy": ["Test approach 1", "Test approach 2", "Test approach 3"],
  "common_pitfalls": ["Pitfall 1", "Pitfall 2", "Pitfall 3"],
  "folder_structure": "Folder structure description"
}`;

    try {
        console.log('🔧 Generating technical implementation details...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            console.log('✅ Technical details generated');
            return parsed;
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log('✅ Technical details generated (cleaned JSON)');
            return parsed;
        }
    } catch (error) {
        console.error('❌ Technical details generation failed:', error.message?.substring(0, 200));
        // Return fallback
        return {
            api_structure: [
                { method: "GET", endpoint: "/api/data", purpose: "Fetch data" },
                { method: "POST", endpoint: "/api/data", purpose: "Create new entry" },
                { method: "PUT", endpoint: "/api/data/:id", purpose: "Update entry" },
                { method: "DELETE", endpoint: "/api/data/:id", purpose: "Delete entry" }
            ],
            database_schema: [
                { entity: "User", fields: ["id", "email", "created_at"] },
                { entity: "Data", fields: ["id", "user_id", "content", "created_at"] }
            ],
            security_considerations: [
                "Implement JWT-based authentication",
                "Validate all user inputs",
                "Use HTTPS for all communications",
                "Hash passwords with bcrypt"
            ],
            testing_strategy: [
                "Unit test all API endpoints",
                "Integration test database operations",
                "E2E test critical user flows"
            ],
            common_pitfalls: [
                "Not handling edge cases in validation",
                "Ignoring error handling",
                "Poor database query optimization"
            ],
            folder_structure: "Organize by features: /src/components, /src/services, /src/utils, /src/styles"
        };
    }
};

module.exports = { generateIdea, chatAboutBlueprint, generateInnovationAngle, generateAdditionalFeatures, generateProjectDescription, generateLearningPath, generateTechnicalDetails };

