// Lightweight REST client for Groq API using global fetch (Node 18+).
// Exports an object with `chat.completions.create(opts)` to keep compatibility
// with the SDK-based calls used elsewhere in the codebase.

const API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.ai/v1';
const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
    // Export a shim that throws when used so server can start but calls provide clear errors
    module.exports = {
        chat: {
            completions: {
                create: async () => {
                    throw new Error('GROQ_API_KEY not set in environment. Set GROQ_API_KEY to use Groq API.');
                }
            }
        }
    };
} else {
    const create = async (opts = {}) => {
        // Expected shape: { model, messages, max_tokens }
        const url = `${API_BASE}/chat/completions`;
        const body = {
            model: opts.model,
            messages: opts.messages || opts.messages || (opts.messages === undefined ? [] : opts.messages),
            max_tokens: opts.max_tokens || opts.maxTokens || undefined,
            // include any other options the caller may pass
            ...opts
        };

        let res;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(body),
            });
        } catch (err) {
            // If network/DNS fails, optionally return a mock response in development
            const useMock = process.env.GROQ_USE_MOCK === 'true' || process.env.NODE_ENV !== 'production';
            if (useMock) {
                const userPrompt = (body && (body.messages?.[0]?.content || body.messages || body.prompt)) || '';
                const mockText = buildMockResponse(userPrompt);
                return { choices: [{ message: { content: mockText } }] };
            }

            const e = new Error(`fetch failed: ${err.message}`);
            e.cause = err;
            throw e;
        }

        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            const msg = `Groq API error: ${res.status} ${res.statusText} ${txt}`;
            const err = new Error(msg);
            err.status = res.status;
            throw err;
        }

        const json = await res.json();
        return json;
    };

    module.exports = {
        chat: {
            completions: { create }
        }
    };
}

function buildMockResponse(prompt) {
    const p = String(prompt || '').toLowerCase();

    // Heuristic: if the prompt asks for JSON or contains structured keys, return JSON string
    const wantsJson = p.includes('strict json') || p.includes('output format') || p.includes('format as json') || p.includes('format as json:') || p.includes('format as json');
    if (wantsJson || p.includes('strict json') || p.includes('output format')) {
        const obj = {
            title: 'Demo Project Idea',
            problem_statement: 'A short demo problem statement generated as fallback.',
            domain: 'demo',
            core_features: {
                must_have: ['User authentication', 'Basic CRUD', 'Responsive UI'],
                should_have: ['Search', 'Pagination'],
                future_scope: ['Mobile app', 'Analytics dashboard']
            },
            recommended_tech_stack: { frontend: 'React', backend: 'Node.js', database: 'Firestore', deployment: 'Vercel' },
            roadmap_4_weeks: [],
            what_is_new: 'Demo fallback response',
            existing_solutions: 'Placeholder alternatives'
        };
        return JSON.stringify(obj);
    }

    // Default: conversational reply
    // If this looks like a blueprint/chat prompt, return a helpful acknowledgment and starter suggestions
    const titleMatch = /project title:\s*(.+)/i.exec(String(prompt || ''));
    const title = titleMatch ? titleMatch[1].trim() : null;

    if (p.includes('please acknowledge') || p.includes('i understand') || p.includes('ask about this blueprint') || p.includes('blueprint')) {
        const ack = title ? `I understand the "${title}" project blueprint.` : 'I understand this project blueprint.';
        const suggestions = [
            'Ask for implementation steps (APIs, DB schema, folder structure).',
            'Request code snippets for critical features (auth, CRUD, integrations).',
            'Ask for a 4-week roadmap or learning path.'
        ];
        return `${ack} How can I help? Here are some suggestions:\n- ${suggestions.join('\n- ')}`;
    }

    return 'Mock assistant: I could not reach the Groq API. This is a development fallback response. For a more realistic reply, enable network access or set GROQ_USE_MOCK=false.';
}
