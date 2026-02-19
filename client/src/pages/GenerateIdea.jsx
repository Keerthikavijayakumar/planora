import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, RefreshCw, ChevronRight, Check, ArrowLeft, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);

    const domains = ["AI/ML", "Web Development", "Mobile Development", "Cybersecurity", "Data Science", "Cloud Computing", "Blockchain", "DevOps"];
    const levels = ["Fresher", "Beginner", "Intermediate", "Advanced"];

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post('http://localhost:5000/api/generate', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlueprint(res.data.blueprint);
            setStep(2);
        } catch (err) {
            if (err.response?.data?.limitReached) {
                setLimitReached(true);
                setDaysLeft(err.response.data.daysLeft || 7);
            } else {
                setError(err.response?.data?.error || 'Failed to generate idea');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            await axios.post('http://localhost:5000/api/generate/save', {
                blueprint,
                domain: formData.domain,
                skillLevel: formData.skillLevel
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
            const res = await axios.post('http://localhost:5000/api/generate/chat', {
                blueprint,
                chatHistory: chatMessages,
                message: userMsg,
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

        // Code blocks (```...```)
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
            return `<div style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;margin:10px 0;overflow-x:auto;font-family:'Fira Code',monospace;font-size:13px;line-height:1.5;color:#e2e8f0"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></div>`;
        });

        // Inline code (`...`)
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(139,92,246,0.15);color:#c4b5fd;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>');

        // Headers
        html = html.replace(/^### (.+)$/gm, '<h4 style="font-size:15px;font-weight:700;color:#F59E0B;margin:16px 0 8px;letter-spacing:-0.01em">$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;color:#fff;margin:18px 0 8px;letter-spacing:-0.01em">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2 style="font-size:18px;font-weight:800;color:#fff;margin:20px 0 10px;letter-spacing:-0.01em">$1</h2>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em style="color:#bbb">$1</em>');

        // Numbered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#ccc">$1</li>');

        // Bullet lists (- or *)
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#ccc;list-style-type:disc">$1</li>');

        // Wrap consecutive <li> in <ul>
        html = html.replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="padding-left:20px;margin:8px 0">$1</ul>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:16px 0">');

        // Paragraphs (double newlines)
        html = html.replace(/\n\n/g, '</p><p style="margin:8px 0;color:#ccc">');

        // Single newlines that aren't inside tags
        html = html.replace(/\n/g, '<br>');

        // Wrap in initial paragraph
        html = `<p style="margin:0;color:#ccc">${html}</p>`;

        // Clean up empty paragraphs
        html = html.replace(/<p[^>]*><\/p>/g, '');

        return html;
    };

    // ===== LIMIT REACHED VIEW =====
    if (limitReached) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className="glass-card animate-fadeInUp" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <AlertTriangle size={32} style={{ color: '#EF4444' }} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                        Free Limit Reached
                    </h2>
                    <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                        You've used all <strong style={{ color: '#F59E0B' }}>5 free blueprints</strong> this week.
                        Your limit will reset in <strong style={{ color: '#22C55E' }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
                    </p>
                    <div style={{
                        padding: '16px 20px', borderRadius: '12px',
                        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                        marginBottom: '28px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#F59E0B', fontSize: '14px', fontWeight: 600 }}>
                            <Clock size={16} /> Come back in {daysLeft} day{daysLeft !== 1 ? 's' : ''} for 5 more!
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}>
                            Dashboard
                        </Link>
                        <Link to="/saved" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}>
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
            <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '620px', margin: '0 auto' }}>
                <div className="animate-fadeInUp">
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>New Blueprint</h1>
                    <p style={{ color: '#666', fontSize: '15px', marginBottom: '36px' }}>Define your constraints, let AI architect the rest.</p>

                    {error && (
                        <div style={{
                            padding: '14px 18px', borderRadius: '12px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#EF4444', fontSize: '14px', marginBottom: '24px',
                        }}>{error}</div>
                    )}

                    <div className="glass-card" style={{ padding: '36px' }}>
                        {/* Domain */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ccc', marginBottom: '14px' }}>
                                Choose Domain
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
                                            fontFamily: 'Inter, sans-serif',
                                            border: formData.domain === d ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.08)',
                                            background: formData.domain === d ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                                            color: formData.domain === d ? '#F59E0B' : '#999',
                                        }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Skill Level */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ccc', marginBottom: '14px' }}>
                                Skill Level
                            </label>
                            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px' }}>
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
                                            fontFamily: 'Inter, sans-serif',
                                            background: formData.skillLevel === l ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            color: formData.skillLevel === l ? '#fff' : '#666',
                                        }}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Team & Purpose */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ccc', marginBottom: '10px' }}>Team Size</label>
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
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#ccc', marginBottom: '10px' }}>Purpose</label>
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
                    border: '3px solid rgba(255,255,255,0.06)',
                    borderTop: '3px solid #F59E0B',
                    borderRadius: '50%',
                    animation: 'spin-slow 1s linear infinite',
                }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Architecting your blueprint...</h2>
                    <p style={{ color: '#666', fontSize: '14px' }}>Analyzing {formData.domain} trends for {formData.skillLevel}s</p>
                </div>
            </div>
        );
    }

    // ===== BLUEPRINT RESULT VIEW =====
    return (
        <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}
            className="animate-fadeInUp"
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <button onClick={() => setStep(1)} style={{
                        background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                        fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
                        fontFamily: 'Inter, sans-serif',
                    }}>
                        <ArrowLeft size={14} /> Back to parameters
                    </button>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                        {blueprint.title}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', lineHeight: 1.6 }}>{blueprint.problem_statement}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleGenerate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px' }}>
                        <RefreshCw size={15} /> Regenerate
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px' }}>
                        {saving ? 'Saving...' : <><Save size={15} /> Save</>}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Features */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Core Features</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Check size={14} /> Must Have
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {blueprint.core_features?.must_have?.map((f, i) => (
                                    <li key={i} style={{ fontSize: '14px', color: '#ccc', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6', marginBottom: '10px' }}>Should Have</h4>
                                {blueprint.core_features?.should_have?.map((f, i) => (
                                    <p key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>• {f}</p>
                                ))}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#8B5CF6', marginBottom: '10px' }}>Future Scope</h4>
                                {blueprint.core_features?.future_scope?.map((f, i) => (
                                    <p key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>• {f}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Roadmap */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Execution Roadmap</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px solid rgba(255,255,255,0.06)', marginLeft: '12px', paddingLeft: '28px' }}>
                            {blueprint.roadmap_4_weeks && Object.entries(blueprint.roadmap_4_weeks).map(([week, task], i) => (
                                <div key={week} style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '-39px', top: '2px',
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 800, color: '#000',
                                    }}>{i + 1}</div>
                                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px', textTransform: 'capitalize' }}>
                                        {week.replace('week', 'Week ')}
                                    </h4>
                                    <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{task}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Scores */}
                    <div style={{
                        padding: '28px',
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(139,92,246,0.05))',
                        border: '1px solid rgba(245,158,11,0.15)',
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F59E0B', marginBottom: '20px' }}>Market Potential</h3>
                        {[
                            { label: 'Demand', score: blueprint.market_potential_score, color: '#F59E0B' },
                            { label: 'Difficulty', score: blueprint.difficulty_score, color: '#EF4444' },
                            { label: 'Resume Impact', score: blueprint.resume_impact_score, color: '#22C55E' },
                        ].map((s, i) => (
                            <div key={i} style={{ marginBottom: i < 2 ? '16px' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ color: '#ccc' }}>{s.label}</span>
                                    <span style={{ color: '#fff', fontWeight: 700 }}>{s.score}/10</span>
                                </div>
                                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
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
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Recommended Stack</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {blueprint.recommended_tech_stack && ['frontend', 'backend', 'database', 'deployment'].map(key => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>{key}</span>
                                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{blueprint.recommended_tech_stack[key]}</span>
                                </div>
                            ))}
                        </div>
                        {blueprint.recommended_tech_stack?.reasoning && (
                            <p style={{ fontSize: '12px', color: '#555', marginTop: '12px', fontStyle: 'italic' }}>
                                "{blueprint.recommended_tech_stack.reasoning}"
                            </p>
                        )}
                    </div>

                    {/* Differentiation */}
                    <div style={{
                        padding: '28px', borderRadius: '16px',
                        background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)',
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F59E0B', marginBottom: '10px' }}>Innovation Angle</h3>
                        <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.7, marginBottom: '16px' }}>{blueprint.what_is_new}</p>
                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitors</h4>
                        <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{blueprint.existing_solutions}</p>
                    </div>

                    {/* Education (Fresher Only) */}
                    {blueprint.educational_resources && (
                        <div style={{
                            padding: '28px', borderRadius: '16px',
                            background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)',
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#3B82F6', marginBottom: '10px' }}>🎓 Learning Path</h3>
                            <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.7, marginBottom: '16px' }}>{blueprint.educational_resources.learning_path}</p>
                            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Key Concepts</h4>
                            <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                {blueprint.educational_resources.key_concepts?.map((c, i) => (
                                    <li key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{c}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Section */}
            <div className="glass-card" style={{ marginTop: '32px', padding: '28px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={18} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Ask about this Blueprint</h3>
                        <p style={{ fontSize: '12px', color: '#666' }}>Get implementation help, code snippets, or advice</p>
                    </div>
                </div>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                    <div style={{
                        maxHeight: '500px', overflowY: 'auto', marginBottom: '16px',
                        display: 'flex', flexDirection: 'column', gap: '16px',
                        padding: '20px', borderRadius: '12px',
                        background: 'rgba(0,0,0,0.2)',
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
                                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
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
                                        ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                                        : 'rgba(255,255,255,0.04)',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                    color: msg.role === 'user' ? '#000' : '#ddd',
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
                                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Sparkles size={14} color="#fff" />
                                </div>
                                <div style={{
                                    padding: '12px 20px', borderRadius: '4px 16px 16px 16px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', gap: '6px', alignItems: 'center',
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1s infinite' }} />
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1s infinite 0.2s' }} />
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1s infinite 0.4s' }} />
                                    <span style={{ color: '#888', fontSize: '13px', marginLeft: '6px' }}>Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div style={{ display: 'flex', gap: '10px' }}>
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
                                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                                    color: '#8B5CF6', cursor: 'pointer', fontWeight: 500,
                                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
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
