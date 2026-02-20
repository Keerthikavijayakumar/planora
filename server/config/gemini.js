const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Export as 'model' to maintain compatibility with the rest of the code
const model = {
    generateContent: async (request) => {
        const { contents, generationConfig } = request;
        
        // Convert from Gemini format to Groq format
        const messages = [];
        
        for (const content of contents) {
            const role = content.role === 'user' ? 'user' : 'assistant';
            const text = content.parts[0].text;
            messages.push({ role, content: text });
        }
        
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant', // Stable and fast model
            messages,
            temperature: 0.7,
            max_tokens: 2000,
        });
        
        return {
            response: {
                text: () => response.choices[0].message.content
            }
        };
    }
};

module.exports = { model };
