import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Check, Clock, Sparkles } from 'lucide-react';

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
                const res = await axios.get(`http://localhost:5000/api/generate/history/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setItem(res.data);

                // Load saved chat messages
                try {
                    const chatRes = await axios.get(`http://localhost:5000/api/generate/chat/${id}`, {
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
            await axios.post('http://localhost:5000/api/generate/save', {
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
            const res = await axios.post('http://localhost:5000/api/generate/chat', {
                blueprint: item.blueprint,
                chatHistory: chatMessages,
                message: userMsg,
                blueprintId: id,
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

    const renderMarkdown = (text) => {
        if (!text) return '';
        let html = text;

        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
            return `<div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:14px 16px;margin:10px 0;overflow-x:auto;font-family:'Fira Code',monospace;font-size:13px;line-height:1.5;color:#333"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></div>`;
        });
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(212,114,122,0.08);color:#a0505a;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>');
        html = html.replace(/^### (.+)$/gm, '<h4 style="font-size:15px;font-weight:700;color:var(--color-accent-dark);margin:16px 0 8px;letter-spacing:-0.01em">$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:18px 0 8px;letter-spacing:-0.01em">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2 style="font-size:18px;font-weight:800;color:#1a1a1a;margin:20px 0 10px;letter-spacing:-0.01em">$1</h2>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1a1a1a;font-weight:600">$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em style="color:#666">$1</em>');
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#555">$1</li>');
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#555;list-style-type:disc">$1</li>');
        html = html.replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="padding-left:20px;margin:8px 0">$1</ul>');
        html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:16px 0">');
        html = html.replace(/\n\n/g, '</p><p style="margin:8px 0;color:#555">');
        html = html.replace(/\n/g, '<br>');
        html = `<p style="margin:0;color:#555">${html}</p>`;
        html = html.replace(/<p[^>]*><\/p>/g, '');
        return html;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '48px', height: '48px',
                    border: '3px solid rgba(255,255,255,0.08)',
                    borderTop: '3px solid #8B5CF6',
                    borderRadius: '50%',
                    animation: 'spin-slow 1s linear infinite',
                }} />
            </div>
        );
    }

    if (error && !item) {
        return (
            <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '64px 32px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>Not found</h2>
                    <p style={{ color: '#888', marginBottom: '24px' }}>{error}</p>
                    <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const blueprint = item?.blueprint;
    if (!blueprint) return null;

    return (
        <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}
            className="animate-fadeInUp page-history"
        >
            {/* Header */}
            <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Link to="/dashboard" style={{
                        color: '#666', textDecoration: 'none', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
                    }}>
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{
                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                            background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', textTransform: 'uppercase',
                        }}>History</span>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
                        {blueprint.title}
                    </h1>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span style={{
                            padding: '4px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                        }}>{item.domain}</span>
                        <span style={{
                            padding: '4px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            background: 'rgba(139,92,246,0.1)', color: '#8B5CF6',
                        }}>{item.skillLevel}</span>
                    </div>
                    <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', lineHeight: 1.6 }}>{blueprint.problem_statement}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saved}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px',
                        fontWeight: 600, borderRadius: '12px', cursor: saved ? 'default' : 'pointer',
                        border: 'none',
                        background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                        color: saved ? '#22C55E' : '#000',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save Blueprint</>}
                </button>
            </div>

            <div className="blueprint-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Features */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' }}>Core Features</h3>
                        {blueprint.core_features?.must_have && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Check size={14} /> Must Have
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {blueprint.core_features.must_have.map((f, i) => (
                                        <li key={i} style={{ fontSize: '14px', color: '#555', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.02)' }}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="feature-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {blueprint.core_features?.should_have && (
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6', marginBottom: '10px' }}>Should Have</h4>
                                    {blueprint.core_features.should_have.map((f, i) => (
                                        <p key={i} style={{ fontSize: '13px', color: '#777', marginBottom: '6px' }}>• {f}</p>
                                    ))}
                                </div>
                            )}
                            {blueprint.core_features?.future_scope && (
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#8B5CF6', marginBottom: '10px' }}>Future Scope</h4>
                                    {blueprint.core_features.future_scope.map((f, i) => (
                                        <p key={i} style={{ fontSize: '13px', color: '#777', marginBottom: '6px' }}>• {f}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Roadmap */}
                    {blueprint.roadmap_4_weeks && (
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' }}>Execution Roadmap</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px solid rgba(0,0,0,0.06)', marginLeft: '12px', paddingLeft: '28px' }}>
                                {Object.entries(blueprint.roadmap_4_weeks).map(([week, task], i) => (
                                    <div key={week} style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', left: '-39px', top: '2px',
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 800, color: '#fff',
                                        }}>{i + 1}</div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px', textTransform: 'capitalize' }}>
                                            {week.replace('week', 'Week ')}
                                        </h4>
                                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{task}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Scores */}
                    <div style={{
                        padding: '28px', borderRadius: '16px',
                        background: 'linear-gradient(145deg, rgba(139,92,246,0.08), rgba(99,102,241,0.05))',
                        border: '1px solid rgba(139,92,246,0.15)',
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#8B5CF6', marginBottom: '20px' }}>Market Potential</h3>
                        {[
                            { label: 'Demand', score: blueprint.market_potential_score, color: '#F59E0B' },
                            { label: 'Difficulty', score: blueprint.difficulty_score, color: '#EF4444' },
                            { label: 'Resume Impact', score: blueprint.resume_impact_score, color: '#22C55E' },
                        ].map((s, i) => (
                            <div key={i} style={{ marginBottom: i < 2 ? '16px' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ color: '#666' }}>{s.label}</span>
                                    <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{s.score}/10</span>
                                </div>
                                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.06)' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '3px', width: `${(s.score || 0) * 10}%`,
                                        background: s.color, transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack */}
                    {blueprint.recommended_tech_stack && (
                        <div className="glass-card" style={{ padding: '28px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>Recommended Stack</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['frontend', 'backend', 'database', 'deployment'].map(key => (
                                    blueprint.recommended_tech_stack[key] && (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                            <span style={{ fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>{key}</span>
                                            <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>{blueprint.recommended_tech_stack[key]}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Innovation */}
                    {blueprint.what_is_new && (
                        <div style={{
                            padding: '28px', borderRadius: '16px',
                            background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)',
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#8B5CF6', marginBottom: '10px' }}>Innovation Angle</h3>
                            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7 }}>{blueprint.what_is_new}</p>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#444', fontSize: '12px', padding: '0 4px' }}>
                        <Clock size={14} />
                        Generated {item.createdAt?._seconds ? new Date(item.createdAt._seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}
                    </div>
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
                                        : 'rgba(255,255,255,0.7)',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.06)',
                                    color: msg.role === 'user' ? '#000' : '#333',
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
                                    background: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    display: 'flex', gap: '6px', alignItems: 'center',
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1s infinite' }} />
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1s infinite 0.2s' }} />
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1s infinite 0.4s' }} />
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

export default HistoryView;

