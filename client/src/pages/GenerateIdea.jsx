import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, RefreshCw, ChevronRight, Check, ArrowLeft, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const GenerateIdea = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        domain: '',
        skillLevel: '',
        teamSize: 'Solo',
        purpose: 'Portfolio'
    });

    const [loading, setLoading] = useState(false);
    const [blueprint, setBlueprint] = useState(null);
    const [blueprintId, setBlueprintId] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const [relatedProjects, setRelatedProjects] = useState([]);
    const [searchingProjects, setSearchingProjects] = useState(false);

    const domains = ["AI/ML", "Web Development", "Mobile Development", "Cybersecurity", "Data Science", "Cloud Computing", "Blockchain", "DevOps"];
    const levels = ["Fresher", "Beginner", "Intermediate", "Advanced"];

    const normalizeDomain = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

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
        if (['cybersecurity'].includes(key)) {
            return { frontend: 'React', backend: 'Python', database: 'Elasticsearch', deployment: 'Docker' };
        }
        if (['datascience', 'dataanalytics'].includes(key)) {
            return { frontend: 'Streamlit', backend: 'Python', database: 'PostgreSQL', deployment: 'AWS' };
        }
        if (['cloudcomputing', 'cloud'].includes(key)) {
            return { frontend: 'React', backend: 'Node.js', database: 'DynamoDB', deployment: 'AWS' };
        }
        if (['blockchain'].includes(key)) {
            return { frontend: 'React', backend: 'Node.js', database: 'IPFS', deployment: 'Ethereum Testnet' };
        }
        if (['devops'].includes(key)) {
            return { frontend: 'React', backend: 'Node.js', database: 'PostgreSQL', deployment: 'Kubernetes' };
        }

        return { frontend: 'React', backend: 'Node.js', database: 'Firestore', deployment: 'Vercel' };
    };

    const pickTech = (techStack, keywords, fallback) => {
        const found = (techStack || []).find((tech) => {
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

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post(`${apiBaseUrl}/api/projects/search`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.projects && res.data.projects.length > 0) {
                const project = res.data.projects[0];

                // Use AI-generated blueprint from backend if available
                if (res.data.blueprint) {
                    setBlueprint(res.data.blueprint);
                    setBlueprintId(res.data.historyId);
                } else {
                    // Fallback to client-side mapping if backend doesn't provide blueprint
                    const mappedBlueprint = {
                        title: project.title || project.name || 'Project Idea',
                        problem_statement: project.problemStatement || project.description || `A ${formData.skillLevel} level project in ${formData.domain}.`,
                        core_features: {
                            must_have: project.features || [],
                            should_have: [],
                            future_scope: []
                        },
                        roadmap_4_weeks: project.implementationSteps ?
                            project.implementationSteps.reduce((acc, step, index) => {
                                acc[`week${index + 1}`] = step;
                                return acc;
                            }, {}) : {},
                        market_potential_score: parseInt(project.difficultyScore) || 5,
                        difficulty_score: parseInt(project.difficultyScore) || 5,
                        resume_impact_score: 8,
                        recommended_tech_stack: inferRecommendedStack(project, formData.domain),
                        what_is_new: "Focus on implementation details from the provided steps.",
                        existing_solutions: "Similar projects exist but this follows a structured path.",
                        educational_resources: {
                            learning_path: `Start with ${project.features?.[0] || 'basics'}.`,
                            key_concepts: ["Core Concepts", "Implementation", "Testing"]
                        }
                    };
                    setBlueprint(mappedBlueprint);
                }
                
                setStep(2);
            } else {
                setError('No projects available for these criteria in the database.');
            }

        } catch (err) {
            console.error(err);
            if (err.response?.status === 403 && err.response?.data?.limitReached) {
                setLimitReached(true);
                setDaysLeft(err.response.data.daysLeft || 1);
            } else {
                setError(err.response?.data?.error || 'Failed to fetch project from database');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            await axios.post(`${apiBaseUrl}/api/generate/save`, {
                blueprint,
                domain: formData.domain,
                skillLevel: formData.skillLevel,
                historyId: blueprintId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to save idea');
        } finally {
            setSaving(false);
        }
    };

    const handleChat = async () => {
        if (!chatInput.trim() || chatSending) return;
        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatSending(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post(`${apiBaseUrl}/api/generate/chat`, {
                blueprint,
                chatHistory: chatMessages,
                message: userMsg,
                blueprintId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ' + (err.response?.data?.error || 'Failed to get response. Please try again.') }]);
        } finally {
            setChatSending(false);
        }
    };

    // Markdown renderer for AI chat responses
    const renderMarkdown = (text) => {
        if (!text) return '';
        let html = text;

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
            return `<div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:14px 16px;margin:10px 0;overflow-x:auto;font-family:'Fira Code',monospace;font-size:13px;line-height:1.5;color:#333"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></div>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(212,114,122,0.08);color:#a0505a;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>');

        // Headers
        html = html.replace(/^### (.+)$/gm, '<h4 style="font-size:15px;font-weight:700;color:var(--color-accent-dark);margin:16px 0 8px;letter-spacing:-0.01em">$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:18px 0 8px;letter-spacing:-0.01em">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2 style="font-size:18px;font-weight:800;color:#1a1a1a;margin:20px 0 10px;letter-spacing:-0.01em">$1</h2>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1a1a1a;font-weight:600">$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em style="color:#666">$1</em>');

        // Numbered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#555">$1</li>');

        // Bullet lists
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#555;list-style-type:disc">$1</li>');

        // Wrap consecutive <li>
        html = html.replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="padding-left:20px;margin:8px 0">$1</ul>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:16px 0">');

        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p style="margin:8px 0;color:#555">');
        html = html.replace(/\n/g, '<br>');
        html = `<p style="margin:0;color:#555">${html}</p>`;
        html = html.replace(/<p[^>]*><\/p>/g, '');

        return html;
    };

    // ===== LIMIT REACHED VIEW =====
    if (limitReached) {
        return (
            <div className="page-generate-limit" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className="glass-card animate-fadeInUp" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(239,68,68,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <AlertTriangle size={32} style={{ color: '#EF4444' }} />
                    </div>
                    <h2 className="heading-serif" style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px' }}>
                        Free Limit Reached
                    </h2>
                    <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                        You've used all <strong style={{ color: 'var(--color-accent)' }}>5 free blueprints</strong> this week.
                        Your limit will reset in <strong style={{ color: '#16a34a' }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
                    </p>
                    <div style={{
                        padding: '16px 20px', borderRadius: '12px',
                        background: 'rgba(212,114,122,0.04)', border: '1px solid rgba(212,114,122,0.1)',
                        marginBottom: '28px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-accent-dark)', fontSize: '14px', fontWeight: 600 }}>
                            <Clock size={16} /> Come back in {daysLeft} day{daysLeft !== 1 ? 's' : ''} for 5 more!
                        </div>
                    </div>
                    
                    {/* Premium Upgrade Section */}
                    <div style={{
                        padding: '24px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,193,7,0.08))',
                        border: '1px solid rgba(255,215,0,0.25)',
                        marginBottom: '24px'
                    }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>👑</div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                            Want Unlimited Access?
                        </h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
                            Upgrade to Premium and generate unlimited blueprints with advanced AI insights
                        </p>
                        <Link 
                            to="/premium" 
                            className="btn-primary" 
                            style={{ 
                                textDecoration: 'none', 
                                padding: '12px 24px', 
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #D4A017, #FFD700)',
                                boxShadow: '0 4px 12px rgba(212,160,23,0.25)'
                            }}
                        >
                            <Sparkles size={16} /> Upgrade to Premium
                        </Link>
                    </div>
                    
                    <div className="stack-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}>
                            Dashboard
                        </Link>
                        <Link to="/saved" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}>
                            View Saved
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ===== FORM VIEW =====
    if (step === 1 && !loading) {
        return (
            <div className="page-generate" style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '620px', margin: '0 auto' }}>
                <div className="animate-fadeInUp">
                    <h1 className="heading-serif" style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>New Blueprint</h1>
                    <p style={{ color: '#999', fontSize: '15px', marginBottom: '36px' }}>Define your constraints, let AI architect the rest.</p>

                    {error && (
                        <div style={{
                            padding: '14px 18px', borderRadius: '12px',
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
                            color: '#dc2626', fontSize: '14px', marginBottom: '24px',
                        }}>{error}</div>
                    )}

                    <div className="glass-card" style={{ padding: '36px' }}>
                        {/* Domain */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '14px' }}>
                                Choose Domain
                            </label>
                            <div className="domain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {domains.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setFormData({ ...formData, domain: d })}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontFamily: "'Inter', sans-serif",
                                            border: formData.domain === d ? '1px solid var(--color-accent)' : '1px solid rgba(0,0,0,0.08)',
                                            background: formData.domain === d ? 'rgba(212,114,122,0.06)' : '#fff',
                                            color: formData.domain === d ? 'var(--color-accent-dark)' : '#888',
                                        }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Skill Level */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '14px' }}>
                                Skill Level
                            </label>
                            <div className="skill-grid" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.02)', padding: '4px', borderRadius: '12px' }}>
                                {levels.map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setFormData({ ...formData, skillLevel: l })}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            border: 'none',
                                            fontFamily: "'Inter', sans-serif",
                                            background: formData.skillLevel === l ? '#1a1a1a' : 'transparent',
                                            color: formData.skillLevel === l ? '#fff' : '#999',
                                        }}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Team & Purpose */}
                        <div className="dual-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '10px' }}>Team Size</label>
                                <select
                                    className="input-field"
                                    value={formData.teamSize}
                                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                                >
                                    <option value="Solo">Solo</option>
                                    <option value="Team of 2">Team of 2</option>
                                    <option value="Team of 3-4">Team of 3-4</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '10px' }}>Purpose</label>
                                <select
                                    className="input-field"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                >
                                    <option value="Portfolio">Portfolio</option>
                                    <option value="Hackathon">Hackathon</option>
                                    <option value="Startup MVP">Startup MVP</option>
                                    <option value="Learning">Learning</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!formData.domain || !formData.skillLevel}
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Sparkles size={18} /> Generate Blueprint <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== LOADING VIEW =====
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                <div style={{
                    width: '64px', height: '64px',
                    border: '3px solid rgba(0,0,0,0.06)',
                    borderTop: '3px solid var(--color-accent)',
                    borderRadius: '50%',
                    animation: 'spin-slow 1s linear infinite',
                }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 className="heading-serif" style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>Architecting your blueprint...</h2>
                    <p style={{ color: '#999', fontSize: '14px' }}>Analyzing {formData.domain} trends for {formData.skillLevel}s</p>
                </div>
            </div>
        );
    }

    // ===== BLUEPRINT RESULT VIEW =====
    return (
        <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}
            className="animate-fadeInUp page-generate-result"
        >
            {/* Header */}
            <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <button onClick={() => setStep(1)} style={{
                        background: 'none', border: 'none', color: '#999', cursor: 'pointer',
                        fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        <ArrowLeft size={14} /> Back to parameters
                    </button>
                    <div>
                        <h1 className="heading-serif" style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px' }}>
                            {blueprint.title}
                        </h1>
                        <p style={{ fontSize: '17px', color: '#666', maxWidth: '700px', lineHeight: 1.7, fontWeight: 400 }}>{blueprint.problem_statement}</p>
                    </div>
                </div>
                <div className="result-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleGenerate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px' }}>
                        <RefreshCw size={15} /> Regenerate
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px' }}>
                        {saving ? 'Saving...' : <><Save size={15} /> Save</>}
                    </button>
                </div>
            </div>

            {/* Reorganized Single Column Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Core Features */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h3 className="heading-serif" style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' }}>Core Features</h3>
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#16a34a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Check size={16} /> Must Have
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {blueprint.core_features?.must_have?.map((f, i) => (
                                <li key={i} style={{ fontSize: '15px', color: '#555', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.02)', lineHeight: 1.5 }}>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#3B82F6', marginBottom: '12px' }}>Should Have</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {blueprint.core_features?.should_have?.map((f, i) => (
                                    <li key={i} style={{ fontSize: '14px', color: '#666', marginBottom: '0', paddingLeft: '16px', position: 'relative', lineHeight: 1.6 }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#3B82F6' }}>•</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#8B5C8A', marginBottom: '12px' }}>Future Scope</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {blueprint.core_features?.future_scope?.map((f, i) => (
                                    <li key={i} style={{ fontSize: '14px', color: '#666', marginBottom: '0', paddingLeft: '16px', position: 'relative', lineHeight: 1.6 }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#8B5C8A' }}>•</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Two Column Grid for Stats and Tech Stack */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Market Potential & Tech Stack Combined */}
                    <div className="glass-card" style={{
                        padding: '28px',
                        background: 'linear-gradient(135deg, rgba(212,114,122,0.08) 0%, rgba(212,114,122,0.04) 100%)',
                        border: '1px solid rgba(212,114,122,0.2)',
                    }}>
                        <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: '20px' }}>Project Metrics</h3>
                        {[
                            { label: 'Market Demand', score: blueprint.market_potential_score, color: 'var(--color-accent)' },
                            { label: 'Difficulty Level', score: blueprint.difficulty_score, color: '#EF4444' },
                            { label: 'Resume Impact', score: blueprint.resume_impact_score, color: '#16a34a' },
                        ].map((s, i) => (
                            <div key={i} style={{ marginBottom: i < 2 ? '16px' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                    <span style={{ color: '#555', fontWeight: 600 }}>{s.label}</span>
                                    <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{s.score}/10</span>
                                </div>
                                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '3px', width: `${(s.score || 0) * 10}%`,
                                        background: s.color, transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack */}
                    <div className="glass-card" style={{ padding: '28px' }}>
                        <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '18px' }}>Recommended Tech Stack</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {blueprint.recommended_tech_stack && ['frontend', 'backend', 'database', 'deployment'].map(key => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                    <span style={{ fontSize: '14px', color: '#888', textTransform: 'capitalize', fontWeight: 500 }}>{key}</span>
                                    <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 700 }}>{blueprint.recommended_tech_stack[key]}</span>
                                </div>
                            ))}
                        </div>
                        {blueprint.recommended_tech_stack?.reasoning && (
                            <p style={{ fontSize: '12px', color: '#999', marginTop: '12px', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{blueprint.recommended_tech_stack.reasoning}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Roadmap */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h3 className="heading-serif" style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' }}>4-Week Execution Roadmap</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '2px solid rgba(0,0,0,0.06)', marginLeft: '12px', paddingLeft: '28px' }}>
                        {blueprint.roadmap_4_weeks && Object.entries(blueprint.roadmap_4_weeks).map(([week, task], i) => (
                            <div key={week} style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: '-39px', top: '2px',
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 800, color: '#fff',
                                }}>{i + 1}</div>
                                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px', textTransform: 'capitalize' }}>
                                    {week.replace('week', 'Week ')}
                                </h4>
                                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6 }}>{task}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Two Column for Innovation and Learning */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Innovation Angle */}
                    <div className="glass-card" style={{
                        padding: '28px',
                        background: 'linear-gradient(135deg, rgba(212,114,122,0.08) 0%, rgba(212,114,122,0.04) 100%)',
                        border: '1px solid rgba(212,114,122,0.2)',
                    }}>
                        <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: '12px' }}>Innovation Angle</h3>
                        <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7, marginBottom: '18px', fontWeight: 400 }}>{blueprint.what_is_new}</p>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>COMPETITORS</h4>
                        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>{blueprint.existing_solutions}</p>
                    </div>

                    {/* Learning Path */}
                    {blueprint.educational_resources && (
                        <div className="glass-card" style={{
                            padding: '28px',
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
                            border: '1px solid rgba(59,130,246,0.2)',
                        }}>
                            <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#3B82F6', marginBottom: '12px' }}>🎓 Learning Path</h3>
                            <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7, marginBottom: '18px', fontWeight: 400 }}>{blueprint.educational_resources.learning_path}</p>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>KEY CONCEPTS</h4>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: blueprint.educational_resources.recommended_resources?.length ? '16px' : 0 }}>
                                {blueprint.educational_resources.key_concepts?.map((c, i) => (
                                    <li key={i} style={{ fontSize: '14px', color: '#555', marginBottom: '6px', lineHeight: 1.5, paddingLeft: '16px', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#3B82F6' }}>•</span>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                            {blueprint.educational_resources.recommended_resources?.length > 0 && (
                                <>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>RESOURCES</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {blueprint.educational_resources.recommended_resources.map((r, i) => (
                                            <li key={i} style={{ fontSize: '14px', color: '#555', marginBottom: '6px', lineHeight: 1.5, paddingLeft: '16px', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: '#3B82F6' }}>📚</span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Technical Implementation Details */}
                {blueprint.technical_details && (
                    <>
                        {/* API Structure & Database Schema */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                            {/* API Structure */}
                            {blueprint.technical_details.api_structure?.length > 0 && (
                                <div className="glass-card" style={{
                                    padding: '28px',
                                    background: 'linear-gradient(135deg, rgba(139,92,138,0.08) 0%, rgba(139,92,138,0.04) 100%)',
                                    border: '1px solid rgba(139,92,138,0.2)',
                                }}>
                                    <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#8B5C8A', marginBottom: '18px' }}>🔌 API Structure</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {blueprint.technical_details.api_structure.map((api, i) => (
                                            <div key={i} style={{
                                                padding: '14px 16px',
                                                borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.7)',
                                                border: '1px solid rgba(139,92,138,0.1)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        background: api.method === 'GET' ? '#10b981' : api.method === 'POST' ? '#3b82f6' : api.method === 'PUT' ? '#f59e0b' : '#ef4444',
                                                        color: '#fff',
                                                    }}>{api.method}</span>
                                                    <code style={{ fontSize: '13px', color: '#666', fontFamily: 'monospace' }}>{api.endpoint}</code>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5, margin: 0 }}>{api.purpose}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Database Schema */}
                            {blueprint.technical_details.database_schema?.length > 0 && (
                                <div className="glass-card" style={{
                                    padding: '28px',
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)',
                                    border: '1px solid rgba(16,185,129,0.2)',
                                }}>
                                    <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#10b981', marginBottom: '18px' }}>🗄️ Database Schema</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {blueprint.technical_details.database_schema.map((schema, i) => (
                                            <div key={i} style={{
                                                padding: '14px 16px',
                                                borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.7)',
                                                border: '1px solid rgba(16,185,129,0.1)',
                                            }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>{schema.entity}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {schema.fields?.map((field, j) => (
                                                        <span key={j} style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            background: 'rgba(16,185,129,0.1)',
                                                            color: '#047857',
                                                            fontFamily: 'monospace',
                                                        }}>{field}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security & Testing */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                            {/* Security Considerations */}
                            {blueprint.technical_details.security_considerations?.length > 0 && (
                                <div className="glass-card" style={{
                                    padding: '28px',
                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                }}>
                                    <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', marginBottom: '18px' }}>🔒 Security Considerations</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {blueprint.technical_details.security_considerations.map((sec, i) => (
                                            <li key={i} style={{
                                                fontSize: '14px',
                                                color: '#555',
                                                lineHeight: 1.6,
                                                paddingLeft: '24px',
                                                position: 'relative',
                                                padding: '10px 10px 10px 28px',
                                                borderRadius: '8px',
                                                background: 'rgba(239,68,68,0.03)',
                                            }}>
                                                <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#ef4444', fontSize: '16px' }}>🛡️</span>
                                                {sec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Testing Strategy */}
                            {blueprint.technical_details.testing_strategy?.length > 0 && (
                                <div className="glass-card" style={{
                                    padding: '28px',
                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                }}>
                                    <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', marginBottom: '18px' }}>🧪 Testing Strategy</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {blueprint.technical_details.testing_strategy.map((test, i) => (
                                            <li key={i} style={{
                                                fontSize: '14px',
                                                color: '#555',
                                                lineHeight: 1.6,
                                                paddingLeft: '24px',
                                                position: 'relative',
                                                padding: '10px 10px 10px 28px',
                                                borderRadius: '8px',
                                                background: 'rgba(245,158,11,0.03)',
                                            }}>
                                                <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#f59e0b' }}>✓</span>
                                                {test}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Folder Structure & Common Pitfalls */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                            {/* Folder Structure */}
                            {blueprint.technical_details.folder_structure && (
                                <div className="glass-card" style={{ padding: '28px' }}>
                                    <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1', marginBottom: '18px' }}>📁 Project Structure</h3>
                                    <pre style={{
                                        fontSize: '13px',
                                        color: '#444',
                                        lineHeight: 1.8,
                                        fontFamily: 'monospace',
                                        background: 'rgba(99,102,241,0.05)',
                                        padding: '16px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(99,102,241,0.1)',
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        margin: 0,
                                    }}>{blueprint.technical_details.folder_structure}</pre>
                                </div>
                            )}

                            {/* Common Pitfalls */}
                            {blueprint.technical_details.common_pitfalls?.length > 0 && (
                                <div className="glass-card" style={{
                                    padding: '28px',
                                    background: 'linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0.04) 100%)',
                                    border: '1px solid rgba(236,72,153,0.2)',
                                }}>
                                    <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#ec4899', marginBottom: '18px' }}>⚠️ Common Pitfalls</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {blueprint.technical_details.common_pitfalls.map((pitfall, i) => (
                                            <li key={i} style={{
                                                fontSize: '14px',
                                                color: '#555',
                                                lineHeight: 1.6,
                                                paddingLeft: '24px',
                                                position: 'relative',
                                                padding: '10px 10px 10px 28px',
                                                borderRadius: '8px',
                                                background: 'rgba(236,72,153,0.03)',
                                            }}>
                                                <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#ec4899' }}>⚡</span>
                                                {pitfall}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>



            {/* Chat Section */}
            <div className="glass-card" style={{ marginTop: '32px', padding: '28px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={18} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Ask about this Blueprint</h3>
                        <p style={{ fontSize: '12px', color: '#999' }}>Get implementation help, code snippets, or advice</p>
                    </div>
                </div>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                    <div style={{
                        maxHeight: '500px', overflowY: 'auto', marginBottom: '16px',
                        display: 'flex', flexDirection: 'column', gap: '16px',
                        padding: '20px', borderRadius: '12px',
                        background: 'rgba(0,0,0,0.02)',
                    }}>
                        {chatMessages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                gap: '10px',
                                alignItems: 'flex-start',
                            }}>
                                {/* AI Avatar */}
                                {msg.role !== 'user' && (
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginTop: '2px',
                                    }}>
                                        <Sparkles size={14} color="#fff" />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: msg.role === 'user' ? '75%' : '90%',
                                    padding: msg.role === 'user' ? '10px 16px' : '16px 20px',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                                    background: msg.role === 'user'
                                        ? '#1a1a1a'
                                        : 'rgba(255,255,255,0.7)',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.06)',
                                    color: msg.role === 'user' ? '#fff' : '#333',
                                    fontSize: '14px',
                                    lineHeight: 1.7,
                                    fontWeight: msg.role === 'user' ? 600 : 400,
                                }}>
                                    {msg.role === 'user' ? msg.content : (
                                        <div className="chat-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                                    )}
                                </div>
                            </div>
                        ))}
                        {chatSending && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Sparkles size={14} color="#fff" />
                                </div>
                                <div style={{
                                    padding: '12px 20px', borderRadius: '4px 16px 16px 16px',
                                    background: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    display: 'flex', gap: '6px', alignItems: 'center',
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 1s infinite' }} />
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 1s infinite 0.2s' }} />
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 1s infinite 0.4s' }} />
                                    <span style={{ color: '#999', fontSize: '13px', marginLeft: '6px' }}>Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div className="chat-input-row" style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Ask anything about this project..."
                        className="input-field"
                        style={{ flex: 1, margin: 0 }}
                        disabled={chatSending}
                    />
                    <button
                        onClick={handleChat}
                        disabled={!chatInput.trim() || chatSending}
                        className="btn-primary"
                        style={{ padding: '12px 24px', fontSize: '13px', whiteSpace: 'nowrap' }}
                    >
                        {chatSending ? 'Thinking...' : 'Send'}
                    </button>
                </div>

                {/* Suggested Questions */}
                {chatMessages.length === 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                        {[
                            'How do I start building this?',
                            'What should I learn first?',
                            'Show me the folder structure',
                            'How to deploy this project?',
                        ].map((q, i) => (
                            <button
                                key={i}
                                onClick={() => { setChatInput(q); }}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                                    background: 'rgba(212,114,122,0.06)', border: '1px solid rgba(212,114,122,0.12)',
                                    color: 'var(--color-accent-dark)', cursor: 'pointer', fontWeight: 500,
                                    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,114,122,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,114,122,0.06)'; }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateIdea;
