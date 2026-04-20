import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Check, Clock, Sparkles, MessageSquare, Layout } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const HistoryView = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            if (!currentUser) return;
            try {
                const token = await currentUser.getIdToken();
                const res = await axios.get(`${apiBaseUrl}/api/generate/history/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setItem(res.data);

                // Load saved chat messages
                try {
                    const chatRes = await axios.get(`${apiBaseUrl}/api/generate/chat/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (chatRes.data.messages?.length > 0) {
                        setChatMessages(chatRes.data.messages);
                    }
                } catch (chatErr) {
                    console.log('No saved chat found');
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load history item');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, currentUser]);

    const handleSave = async () => {
        if (saving || saved) return;
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            await axios.post(`${apiBaseUrl}/api/generate/save`, {
                blueprint: item.blueprint,
                domain: item.domain,
                skillLevel: item.skillLevel,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
        } catch (err) {
            setError('Failed to save blueprint');
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
                blueprint: item.blueprint,
                chatHistory: chatMessages,
                message: userMsg,
                blueprintId: id,
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
        padding: '120px 5% 60px',
        position: 'relative'
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }} />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div style={containerStyle}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '80px 40px', background: '#f9fafb', borderRadius: '32px', border: '1px solid #f3f4f6' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Not Found</h2>
                    <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px' }}>{error || 'History item not found'}</p>
                    <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '16px 32px' }}>Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const blueprint = item.blueprint;

    return (
        <div style={containerStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                .blueprint-card {
                    background: #fff;
                    border: 1px solid #f3f4f6;
                    border-radius: 24px;
                    padding: 32px;
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
                    font-size: 14px;
                }
                .chat-user { background: #000; color: #fff; align-self: flex-end; }
                .chat-ai { background: #f3f4f6; color: #111827; align-self: flex-start; }
            ` }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                    <div>
                        <Link to="/dashboard" style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', textDecoration: 'none', letterSpacing: '0.05em' }}><ArrowLeft size={16}/> Back to Dashboard</Link>
                        <div style={{ display: 'inline-flex', padding: '4px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '11px', fontWeight: 800, color: '#6b7280', marginBottom: '16px', letterSpacing: '0.05em' }}>HISTORY</div>
                        <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.1 }}>{blueprint.title}</h1>
                        <p style={{ fontSize: '18px', color: '#4b5563', fontWeight: 500, marginTop: '16px', maxWidth: '750px', lineHeight: 1.6 }}>{blueprint.problem_statement}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={handleSave} 
                            disabled={saved || saving}
                            className={saved ? "" : "btn-primary"}
                            style={{ 
                                padding: '12px 32px', 
                                fontSize: '14px',
                                background: saved ? '#f3f4f6' : '#000',
                                color: saved ? '#10b981' : '#fff',
                                border: 'none',
                                borderRadius: '100px',
                                fontWeight: 700,
                                cursor: saved ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {saved ? <><Check size={18}/> Saved</> : saving ? 'Saving...' : <><Save size={18}/> Save Blueprint</>}
                        </button>
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
                                        <div key={i} style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                                            <Check size={18} color="#10b981" style={{ flexShrink: 0 }} />
                                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{f}</span>
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
                                    <div key={week} style={{ padding: '20px', background: '#f9fafb', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                                        <div style={{ fontWeight: 800, fontSize: '12px', color: '#6b7280', marginBottom: '10px', letterSpacing: '0.05em' }}>WEEK {i+1}</div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.5 }}>{task}</p>
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

                        <div className="blueprint-card" style={{ background: '#f3f4f6', border: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Sparkles size={18} color="#000" />
                                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Innovation Angle</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500, lineHeight: 1.6 }}>{blueprint.what_is_new || "This architecture leverages automated scaling and predictive analysis to reduce operational overhead compared to traditional implementations."}</p>
                        </div>

                        <div className="blueprint-card">
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Recommended Stack</h3>
                            {blueprint.recommended_tech_stack && Object.entries(blueprint.recommended_tech_stack).filter(([k]) => k !== 'reasoning').map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="blueprint-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <MessageSquare size={18} />
                                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>History Chat</h3>
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
                                    placeholder="Ask about this session..."
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                                <button onClick={handleChat} disabled={chatSending} style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Sparkles size={18}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HistoryView;
