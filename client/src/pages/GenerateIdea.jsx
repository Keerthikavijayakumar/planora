import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, ChevronRight, Check, ArrowLeft, Sparkles, Clock, AlertTriangle, MessageSquare, Layout } from 'lucide-react';
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

    const domains = ["AI/ML", "Web Development", "Mobile Development", "Cybersecurity", "Data Science", "Cloud Computing", "Blockchain", "DevOps"];
    const levels = ["Fresher", "Beginner", "Intermediate", "Advanced"];

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
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        color: '#111827',
        padding: '120px 5% 60px'
    };

    if (limitReached) {
        return (
            <div style={containerStyle}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '100px 40px', background: '#f9fafb', borderRadius: '40px', border: '1px solid #f3f4f6', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                    <div style={{ background: '#fef2f2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                        <AlertTriangle size={40} color="#ef4444" />
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.04em' }}>Limit Reached</h2>
                    <p style={{ color: '#4b5563', fontSize: '17px', marginBottom: '40px', lineHeight: 1.6, fontWeight: 500 }}>
                        You've used all 5 free blueprints this week.<br/>
                        Your limit resets in <span style={{ color: '#000', fontWeight: 800 }}>{daysLeft} days</span>.
                    </p>
                    <Link to="/premium" className="btn-primary" style={{ textDecoration: 'none', padding: '18px 48px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        Upgrade for Unlimited <Sparkles size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-blueprint-page" style={containerStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                .form-card {
                    background: #fff;
                    border: 1px solid #f3f4f6;
                    border-radius: 40px;
                    padding: 48px;
                    width: 100%;
                    max-width: 850px;
                    margin: 0 auto;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.03);
                }
                 .option-btn {
                    padding: 20px;
                    border-radius: 20px;
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.2, 1, 0.2, 1);
                    color: #4b5563;
                    text-align: center;
                }
                .option-btn:hover {
                    border-color: #000;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .option-btn.active {
                    background: #000;
                    color: #fff;
                    border-color: #000;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
                }
                .blueprint-card {
                    background: #fff;
                    border: 1px solid #f3f4f6;
                    border-radius: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .code-block {
                    background: #111827;
                    color: #d1d5db;
                    padding: 24px;
                    border-radius: 16px;
                    overflow-x: auto;
                    font-family: 'Fira Code', monospace;
                    font-size: 14px;
                    margin: 20px 0;
                }
                .inline-code {
                    background: #f3f4f6;
                    color: #1f2937;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                .chat-msg {
                    padding: 16px 20px;
                    border-radius: 20px;
                    max-width: 85%;
                    margin-bottom: 12px;
                    line-height: 1.6;
                }
                .chat-user { background: #000; color: #fff; align-self: flex-end; }
                .chat-ai { background: #f3f4f6; color: #111827; align-self: flex-start; }
            ` }} />

            <AnimatePresence mode="wait">
                {step === 1 && !loading ? (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="form-card"
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) minmax(280px, 1fr)', gap: '48px', marginBottom: '40px', alignItems: 'start' }}>
                            {/* Left Column: Domain */}
                            <div>
                                <label style={{ fontWeight: 800, fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '20px', letterSpacing: '0.12em' }}>CHOOSE DOMAIN</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                    {domains.map(d => (
                                        <button key={d} className={`option-btn ${formData.domain === d ? 'active' : ''}`} style={{ padding: '16px 12px', fontSize: '13px' }} onClick={() => setFormData({ ...formData, domain: d })}>{d}</button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Right Column: Other Configs */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '16px', letterSpacing: '0.12em' }}>EXPERIENCE LEVEL</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                        {levels.map(l => (
                                            <button key={l} className={`option-btn ${formData.skillLevel === l ? 'active' : ''}`} style={{ padding: '12px 0', fontSize: '12px' }} onClick={() => setFormData({ ...formData, skillLevel: l })}>{l}</button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '16px', letterSpacing: '0.12em' }}>TEAM SIZE</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {['Solo', 'Small', 'Startup'].map(s => (
                                            <button key={s} className={`option-btn ${formData.teamSize === s ? 'active' : ''}`} style={{ padding: '12px 0', fontSize: '12px' }} onClick={() => setFormData({ ...formData, teamSize: s })}>{s}</button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '16px', letterSpacing: '0.12em' }}>PROJECT GOAL</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {['Portfolio', 'SaaS', 'Learning'].map(p => (
                                            <button key={p} className={`option-btn ${formData.purpose === p ? 'active' : ''}`} style={{ padding: '12px 0', fontSize: '12px' }} onClick={() => setFormData({ ...formData, purpose: p })}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={handleGenerate} disabled={!formData.domain || !formData.skillLevel} style={{ width: '100%', padding: '22px', fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '24px' }}>
                            Generate Tech Stack <Sparkles size={20} />
                        </button>
                    </motion.div>
                ) : loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ width: '48px', height: '48px', border: '4px solid #f3f4f6', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin-slow 1s linear infinite', margin: '0 auto 32px' }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Architecting...</h2>
                        <p style={{ color: '#6b7280' }}>Building your {formData.domain} roadmap</p>
                    </motion.div>
                ) : (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                            <div>
                            <div>
                                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', letterSpacing: '0.05em' }}><ArrowLeft size={16}/> RESET</button>
                                <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>{blueprint.title}</h1>
                                <p style={{ fontSize: '18px', color: '#4b5563', fontWeight: 500, marginTop: '16px', maxWidth: '700px' }}>{blueprint.problem_statement}</p>
                            </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button onClick={handleGenerate} className="option-btn" style={{ padding: '12px 16px', borderRadius: '12px' }} title="Regenerate"><RefreshCw size={18}/></button>
                                <button onClick={handleSave} className="btn-primary" style={{ padding: '12px 32px', fontSize: '14px', fontWeight: 700 }}>{saving ? 'Saving...' : 'Save Blueprint'}</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
                            <div>
                                <div className="blueprint-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <Layout size={20} color="#000" />
                                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Core Strategy</h3>
                                    </div>
                                    <div style={{ marginBottom: '32px' }}>
                                        <div style={{ color: '#10b981', fontWeight: 700, fontSize: '12px', marginBottom: '16px' }}>MUST HAVE FEATURES</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(blueprint.core_features?.must_have || []).map((f, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
                                                    <Check size={18} color="#10b981" style={{ flexShrink: 0 }} />
                                                    <span style={{ fontSize: '15px', fontWeight: 500 }}>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="blueprint-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <Clock size={20} color="#000" />
                                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Roadmap</h3>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {Object.entries(blueprint.roadmap_4_weeks || {}).map(([week, task], i) => (
                                            <div key={week} style={{ padding: '20px', background: '#f9fafb', borderRadius: '16px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>WEEK {i+1}</div>
                                                <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>{task}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div className="blueprint-card" style={{ background: '#000', color: '#fff' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Market Metrics</h3>
                                    {[
                                        { label: 'Demand', score: blueprint.market_potential_score, color: '#10b981' },
                                        { label: 'Complexity', score: blueprint.difficulty_score, color: '#f59e0b' },
                                        { label: 'Career Value', score: blueprint.resume_impact_score, color: '#8b5cf6' }
                                    ].map((m, i) => (
                                        <div key={i} style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                                                <span>{m.label.toUpperCase()}</span>
                                                <span>{m.score}/10</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px' }}>
                                                <div style={{ width: `${(m.score || 0)*10}%`, height: '100%', background: m.color, borderRadius: '100px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="blueprint-card" style={{ background: '#f5f3ff', borderColor: '#e0e7ff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <Sparkles size={18} color="#7c3aed" />
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e1b4b' }}>Innovation Angle</h3>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#4338ca', fontWeight: 500, lineHeight: 1.6 }}>{blueprint.what_is_new || "This project implements a unique automated approach to problem-solving in this domain."}</p>
                                </div>

                                <div className="blueprint-card">
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Tech Stack</h3>
                                    {blueprint.recommended_tech_stack && Object.entries(blueprint.recommended_tech_stack).filter(([k]) => k !== 'reasoning').map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{val}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="blueprint-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <MessageSquare size={18} />
                                        <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Ask Architect</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            value={chatInput} 
                                            onChange={e => setChatInput(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && handleChat()}
                                            placeholder="Ask a question..."
                                            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none' }}
                                        />
                                        <button onClick={handleChat} disabled={chatSending} style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><ChevronRight size={18}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GenerateIdea;
