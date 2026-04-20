import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, ChevronRight, Check, ArrowLeft, Sparkles, Clock, AlertTriangle, MessageSquare, Layout, Cpu, Globe, Shield, Database, Cloud, Code2, Smartphone, TrendingUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const DOMAIN_ICONS = {
    'AI/ML': <Cpu size={18} />,
    'Web Development': <Globe size={18} />,
    'Mobile Development': <Smartphone size={18} />,
    'Cybersecurity': <Shield size={18} />,
    'Data Science': <TrendingUp size={18} />,
    'Cloud Computing': <Cloud size={18} />,
    'Blockchain': <Code2 size={18} />,
    'DevOps': <Database size={18} />,
};

const GenerateIdea = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ domain: '', skillLevel: '', teamSize: 'Solo', purpose: 'Portfolio' });
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

    const domains = ['AI/ML', 'Web Development', 'Mobile Development', 'Cybersecurity', 'Data Science', 'Cloud Computing', 'Blockchain', 'DevOps'];
    const levels = ['Fresher', 'Beginner', 'Intermediate', 'Advanced'];

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post(`${apiBaseUrl}/api/projects/search`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.blueprint) {
                setBlueprint(res.data.blueprint);
                setBlueprintId(res.data.historyId);
                setStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError('No blueprint returned. Please try again.');
            }
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.limitReached) {
                setLimitReached(true);
                setDaysLeft(err.response.data.daysLeft || 1);
            } else {
                setError(err.response?.data?.error || 'Failed to generate blueprint');
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
                blueprint, domain: formData.domain, skillLevel: formData.skillLevel, historyId: blueprintId
            }, { headers: { Authorization: `Bearer ${token}` } });
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
                blueprint, chatHistory: chatMessages, message: userMsg, blueprintId,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: ' + (err.response?.data?.error || 'Request failed.') }]);
        } finally {
            setChatSending(false);
        }
    };

    const renderMarkdown = (text) => {
        if (!text) return '';
        return text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');
    };

    const containerStyle = {
        fontFamily: 'var(--font-sans)',
        background: 'var(--gradient-page)',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        color: 'var(--text-primary)',
        padding: '120px 5% 80px',
        position: 'relative',
    };

    /* ─── Limit Reached ─── */
    if (limitReached) {
        return (
            <div style={containerStyle}>
                <div style={{
                    maxWidth: '580px', margin: '0 auto', textAlign: 'center',
                    padding: '80px 48px',
                    background: 'rgba(255,255,255,0.78)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-card)',
                }}>
                    <div style={{ background: 'var(--sakura-blush)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '1px solid var(--glass-border)' }}>
                        <AlertTriangle size={36} color="var(--sakura-deep)" />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 600, marginBottom: '16px', color: 'var(--sakura-bark)' }}>Limit Reached</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.65 }}>
                        You've used all 5 free blueprints this week.<br />
                        Resets in <span style={{ color: 'var(--sakura-deep)', fontWeight: 800 }}>{daysLeft} days</span>.
                    </p>
                    <Link to="/premium" className="btn-primary" style={{ textDecoration: 'none', padding: '16px 40px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        Upgrade for Unlimited <Sparkles size={17} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                .form-card {
                    background: rgba(255,255,255,0.80);
                    backdrop-filter: blur(24px);
                    border: 1px solid var(--glass-border);
                    border-radius: 32px;
                    padding: 48px;
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    box-shadow: var(--shadow-card);
                    font-family: var(--font-sans) !important;
                }
                .option-btn {
                    padding: 18px 12px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.7);
                    border: 1.5px solid var(--glass-border);
                    font-weight: 700;
                    font-size: 14px;
                    font-family: var(--font-sans) !important;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    color: var(--text-secondary);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    backdrop-filter: blur(10px);
                }
                .option-btn:hover {
                    border-color: var(--sakura-petal);
                    background: var(--sakura-blush);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(192,87,107,0.10);
                    color: var(--sakura-deep);
                }
                .option-btn.active {
                    background: var(--gradient-sakura);
                    color: #fff;
                    border-color: var(--sakura-deep);
                    box-shadow: 0 10px 28px rgba(192,87,107,0.30);
                    transform: translateY(-2px);
                }
                .option-btn.active svg { color: #fff; }
                .option-btn-sm {
                    padding: 11px 8px;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.7);
                    border: 1.5px solid var(--glass-border);
                    font-weight: 700;
                    font-size: 13px;
                    font-family: var(--font-sans) !important;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--text-secondary);
                    text-align: center;
                }
                .option-btn-sm:hover {
                    border-color: var(--sakura-petal);
                    background: var(--sakura-blush);
                    color: var(--sakura-deep);
                    transform: translateY(-1px);
                }
                .option-btn-sm.active {
                    background: var(--gradient-sakura);
                    color: #fff;
                    border-color: var(--sakura-deep);
                    box-shadow: 0 6px 18px rgba(192,87,107,0.25);
                }
                .blueprint-card {
                    background: rgba(255,255,255,0.80);
                    backdrop-filter: blur(16px);
                    border: 1px solid var(--glass-border);
                    border-radius: 22px;
                    padding: 28px;
                    margin-bottom: 22px;
                    box-shadow: var(--shadow-card);
                    font-family: var(--font-sans) !important;
                }
                .code-block {
                    background: var(--sakura-bark);
                    color: var(--sakura-petal);
                    padding: 20px 24px;
                    border-radius: 14px;
                    overflow-x: auto;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    margin: 16px 0;
                    border: 1px solid rgba(244,167,185,0.15);
                }
                .inline-code {
                    background: rgba(244,167,185,0.12);
                    color: var(--sakura-deep);
                    padding: 2px 6px;
                    border-radius: 5px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                }
                .chat-msg {
                    padding: 14px 18px;
                    border-radius: 18px;
                    max-width: 86%;
                    margin-bottom: 10px;
                    line-height: 1.6;
                    font-size: 14px;
                    font-family: var(--font-sans) !important;
                }
                .chat-user {
                    background: var(--gradient-sakura);
                    color: #fff;
                    align-self: flex-end;
                    box-shadow: 0 4px 14px rgba(192,87,107,0.25);
                }
                .chat-ai {
                    background: rgba(255,255,255,0.85);
                    color: var(--text-primary);
                    align-self: flex-start;
                    border: 1px solid var(--glass-border);
                }
                .form-label {
                    font-weight: 800;
                    font-size: 11px;
                    color: var(--text-muted);
                    display: block;
                    margin-bottom: 14px;
                    letter-spacing: 0.14em;
                    font-family: var(--font-sans) !important;
                }
            ` }} />

            <AnimatePresence mode="wait">
                {/* ─── Step 1: Form ─── */}
                {step === 1 && !loading ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="form-card"
                    >
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌸</div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: 'var(--sakura-bark)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                                Build Your Blueprint
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Tell us what you're working on and we'll architect the perfect plan</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(260px, 1fr)', gap: '44px', marginBottom: '40px', alignItems: 'start' }}>
                            {/* Left: Domain */}
                            <div>
                                <label className="form-label">CHOOSE DOMAIN</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                    {domains.map(d => (
                                        <button
                                            key={d}
                                            className={`option-btn ${formData.domain === d ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, domain: d })}
                                        >
                                            <span style={{ color: formData.domain === d ? '#fff' : 'var(--sakura-petal)' }}>{DOMAIN_ICONS[d]}</span>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Config */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                <div>
                                    <label className="form-label">EXPERIENCE LEVEL</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                        {levels.map(l => (
                                            <button key={l} className={`option-btn-sm ${formData.skillLevel === l ? 'active' : ''}`} onClick={() => setFormData({ ...formData, skillLevel: l })}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">TEAM SIZE</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {['Solo', 'Small', 'Startup'].map(s => (
                                            <button key={s} className={`option-btn-sm ${formData.teamSize === s ? 'active' : ''}`} onClick={() => setFormData({ ...formData, teamSize: s })}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">PROJECT GOAL</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {['Portfolio', 'SaaS', 'Learning'].map(p => (
                                            <button key={p} className={`option-btn-sm ${formData.purpose === p ? 'active' : ''}`} onClick={() => setFormData({ ...formData, purpose: p })}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <p style={{ color: '#e05a6d', fontWeight: 600, textAlign: 'center', marginBottom: '20px', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>⚠️ {error}</p>}

                        <button
                            className="btn-primary"
                            onClick={handleGenerate}
                            disabled={!formData.domain || !formData.skillLevel}
                            style={{ width: '100%', padding: '20px', fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '20px' }}
                        >
                            <Sparkles size={20} /> Generate Tech Blueprint
                        </button>
                    </motion.div>

                ) : loading ? (
                    /* ─── Loading ─── */
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '120px 0' }}>
                        <div style={{ fontSize: '52px', marginBottom: '24px', animation: 'float 3s ease-in-out infinite' }}>🌸</div>
                        <div style={{ width: '48px', height: '48px', border: '4px solid var(--glass-border)', borderTop: '4px solid var(--sakura-deep)', borderRadius: '50%', animation: 'spin-slow 1s linear infinite', margin: '0 auto 28px' }} />
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color: 'var(--sakura-bark)', marginBottom: '8px' }}>Architecting...</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Crafting your {formData.domain} roadmap</p>
                    </motion.div>

                ) : (
                    /* ─── Step 2: Result ─── */
                    <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        {/* Actions Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', letterSpacing: '0.08em', fontFamily: 'var(--font-sans)' }}>
                                    <ArrowLeft size={15} /> RESET
                                </button>
                                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--sakura-bark)' }}>
                                    {blueprint.title}
                                </h1>
                                <p style={{ fontSize: '17px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '14px', maxWidth: '680px', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>
                                    {blueprint.problem_statement}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                                <button onClick={handleGenerate} className="option-btn-sm" style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', borderRadius: '14px' }} title="Regenerate">
                                    <RefreshCw size={17} />
                                </button>
                                <button onClick={handleSave} className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
                                    {saving ? 'Saving...' : '🌸 Save Blueprint'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '28px' }}>
                            {/* Left Column */}
                            <div>
                                <div className="blueprint-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                                        <div style={{ width: '36px', height: '36px', background: 'var(--sakura-blush)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                            <Layout size={18} color="var(--sakura-deep)" />
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Core Strategy</h3>
                                    </div>
                                    <div style={{ marginBottom: '28px' }}>
                                        <div style={{ color: 'var(--sakura-deep)', fontWeight: 800, fontSize: '12px', marginBottom: '14px', letterSpacing: '0.1em' }}>MUST HAVE FEATURES</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(blueprint.core_features?.must_have || []).map((f, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '12px', background: 'var(--sakura-blush)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(244,167,185,0.2)' }}>
                                                    <Check size={17} color="var(--sakura-deep)" style={{ flexShrink: 0, marginTop: '1px' }} />
                                                    <span style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.4, fontFamily: 'var(--font-sans)' }}>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="blueprint-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                                        <div style={{ width: '36px', height: '36px', background: 'var(--sakura-blush)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                            <Clock size={18} color="var(--sakura-deep)" />
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>4-Week Roadmap</h3>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                        {Object.entries(blueprint.roadmap_4_weeks || {}).map(([week, task], i) => (
                                            <div key={week} style={{ padding: '18px', background: i % 2 === 0 ? 'var(--sakura-blush)' : 'rgba(255,255,255,0.7)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ fontWeight: 800, fontSize: '11px', color: 'var(--sakura-deep)', marginBottom: '6px', letterSpacing: '0.1em' }}>WEEK {i + 1}</div>
                                                <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{task}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                                {/* Market Metrics */}
                                <div className="blueprint-card" style={{ background: 'var(--gradient-sakura)', border: 'none' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '22px', color: '#fff' }}>Market Metrics</h3>
                                    {[
                                        { label: 'Demand', score: blueprint.market_potential_score, color: 'rgba(255,255,255,0.9)' },
                                        { label: 'Complexity', score: blueprint.difficulty_score, color: 'rgba(255,220,130,0.9)' },
                                        { label: 'Career Value', score: blueprint.resume_impact_score, color: 'rgba(180,255,200,0.9)' }
                                    ].map((m, i) => (
                                        <div key={i} style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginBottom: '7px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>
                                                <span>{m.label.toUpperCase()}</span>
                                                <span>{m.score}/10</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px' }}>
                                                <div style={{ width: `${(m.score || 0) * 10}%`, height: '100%', background: m.color, borderRadius: '100px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Innovation */}
                                <div className="blueprint-card" style={{ background: 'var(--sakura-blush)', borderColor: 'rgba(244,167,185,0.35)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                        <Sparkles size={17} color="var(--sakura-deep)" />
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sakura-bark)' }}>Innovation Angle</h3>
                                    </div>
                                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.65, fontFamily: 'var(--font-sans)' }}>
                                        {blueprint.what_is_new || 'This project implements a unique automated approach to problem-solving in this domain.'}
                                    </p>
                                </div>

                                {/* Tech Stack */}
                                <div className="blueprint-card">
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Tech Stack</h3>
                                    {blueprint.recommended_tech_stack && Object.entries(blueprint.recommended_tech_stack).filter(([k]) => k !== 'reasoning').map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(244,167,185,0.15)', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{key}</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '55%', fontFamily: 'var(--font-sans)' }}>{val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Ask Architect Chat */}
                                <div className="blueprint-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                                        <div style={{ width: '34px', height: '34px', background: 'var(--sakura-blush)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                            <MessageSquare size={17} color="var(--sakura-deep)" />
                                        </div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Ask Architect</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '14px', padding: '4px 0' }}>
                                        {chatMessages.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                                                🌸 Ask anything about this blueprint
                                            </div>
                                        )}
                                        {chatMessages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`chat-msg ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                            />
                                        ))}
                                        {chatSending && (
                                            <div className="chat-msg chat-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                {[0, 1, 2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--sakura-petal)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleChat()}
                                            placeholder="Ask a question..."
                                            style={{
                                                flex: 1, padding: '11px 14px', borderRadius: '12px',
                                                border: '1.5px solid var(--glass-border)', outline: 'none',
                                                background: 'rgba(255,255,255,0.8)', fontSize: '14px',
                                                fontFamily: 'var(--font-sans) !important', color: 'var(--text-primary)',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onFocus={e => e.target.style.borderColor = 'var(--sakura-petal)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                        />
                                        <button
                                            onClick={handleChat}
                                            disabled={chatSending}
                                            style={{ padding: '11px 14px', background: 'var(--gradient-sakura)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(192,87,107,0.3)', transition: 'all 0.2s' }}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <p style={{ color: '#e05a6d', fontWeight: 600, textAlign: 'center', marginTop: '24px', fontSize: '15px', fontFamily: 'var(--font-sans)' }}>⚠️ {error}</p>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GenerateIdea;
