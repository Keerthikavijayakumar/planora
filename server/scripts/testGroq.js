// Load environment variables from server/.env for local testing
require('dotenv').config({ path: __dirname + '/../.env' });
const { generateIdea } = require('../services/geminiService');

(async () => {
  try {
    console.log('Starting Groq test...');
    const idea = await generateIdea('e-commerce', 'beginner', 1, 'portfolio');
    console.log('Generated idea:');
    console.log(JSON.stringify(idea, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
})();
