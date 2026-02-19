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

    try {
        console.log('💬 Chat about blueprint...');
        const result = await model.generateContent({ contents });
        const response = result.response.text();
        console.log('✅ Chat response generated');
        return response;
    } catch (error) {
        console.error('❌ Chat error:', error.message?.substring(0, 200));
        const isRateLimit = error.status === 429 ||
            error.message?.includes('429') ||
            error.message?.includes('RESOURCE_EXHAUSTED');
        if (isRateLimit) {
            throw new Error('API rate limit reached. Please wait a moment and try again.');
        }
        throw new Error(error.message || 'Failed to get chat response');
    }
};

const analyzeInnovation = async (projectTitle, domain, features) => {
    const prompt = `You are a tech industry analyst. Analyze the following project idea and provide a competitive landscape analysis.

PROJECT: "${projectTitle}"
DOMAIN: ${domain}
KEY FEATURES: ${(features || []).join(', ') || 'General features'}

Respond in this exact JSON format:
{
  "what_is_new": "A 2-3 sentence explanation of what makes this project unique and innovative compared to existing solutions. Be specific about the innovation angle.",
  "existing_solutions": "Name 2-3 real, well-known competing products or projects in this space. For each, briefly mention what they do and how this project differs. Format: 'ProductName - brief description. ProductName2 - brief description.'"
}

Rules:
- Reference REAL existing products/tools (e.g., GitHub, Vercel, Firebase, Notion, Figma, etc.)
- Be specific and insightful, not generic
- Focus on what genuinely differentiates this project
- Keep each field to 2-3 sentences max`;

    try {
        console.log('🔍 Analyzing innovation angle...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const text = result.response.text();
        try {
            const parsed = JSON.parse(text);
            console.log('✅ Innovation analysis complete');
            return parsed;
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleaned);
        }
    } catch (error) {
        console.error('❌ Innovation analysis failed:', error.message?.substring(0, 200));
        // Return fallback — don't block the main flow
        return {
            what_is_new: `A ${domain} project focused on ${projectTitle.toLowerCase()} with a unique approach to solving common challenges in this space.`,
            existing_solutions: 'Various open-source and commercial solutions exist in this domain.'
        };
    }
};

const explainTechStack = async (techStack, projectTitle, domain) => {
    const techList = (techStack || []).join(', ') || 'React, Node.js';
    const prompt = `You are a friendly coding mentor explaining technologies to a complete beginner who has never coded before.

PROJECT: "${projectTitle}"
DOMAIN: ${domain}
TECH STACK: ${techList}

For each technology in the tech stack, provide a simple, jargon-free explanation. Respond in this exact JSON format:
{
  "explanations": [
    {
      "name": "TechnologyName",
      "what": "A 1-2 sentence explanation of what this technology is, like you're explaining to a friend who has never coded.",
      "why": "A 1 sentence explanation of why this specific technology is used in this project."
    }
  ]
}

Rules:
- Use simple, everyday language — no jargon
- Use analogies where helpful (e.g. "Think of it like a recipe book for your app")
- Each explanation should be 1-2 sentences max
- Cover ALL technologies in the tech stack`;

    try {
        console.log('📚 Generating tech stack explanations for fresher...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const text = result.response.text();
        try {
            const parsed = JSON.parse(text);
            console.log('✅ Tech explanations generated');
            return parsed.explanations || [];
        } catch (e) {
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return parsed.explanations || [];
        }
    } catch (error) {
        console.error('❌ Tech explanation failed:', error.message?.substring(0, 200));
        // Return basic fallback explanations
        return (techStack || []).map(tech => ({
            name: tech,
            what: `${tech} is a popular tool used in ${domain} development.`,
            why: `It's used in this project to help build key features.`
        }));
    }
};

module.exports = { generateIdea, chatAboutBlueprint, analyzeInnovation, explainTechStack };

