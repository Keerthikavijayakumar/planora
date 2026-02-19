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

module.exports = { generateIdea, chatAboutBlueprint };

