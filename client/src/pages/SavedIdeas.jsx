import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Layers, ArrowRight, Eye, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SavedIdeas = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdeas = async () => {
            if (!currentUser) return;
            try {
                const token = await currentUser.getIdToken();
                const res = await axios.get('http://localhost:5000/api/generate/saved', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIdeas(res.data.ideas || []);
            } catch (err) {
                console.error('Failed to fetch saved ideas:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchIdeas();
    }, [currentUser]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`http://localhost:5000/api/generate/saved/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdeas(ideas.filter(i => i.id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '64px' }}>
                <div style={{
                    width: '48px', height: '48px',
                    border: '3px solid rgba(0,0,0,0.06)',
                    borderTop: '3px solid var(--color-accent)',
                    borderRadius: '50%',
                    animation: 'spin-slow 1s linear infinite',
                }} />
            </div>
        );
    }

    return (
        <div className="page-saved" style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="animate-fadeInUp">
                <h1 className="heading-serif" style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>Saved Blueprints</h1>
                <p style={{ color: '#999', fontSize: '15px', marginBottom: '36px' }}>
                    {ideas.length} blueprint{ideas.length !== 1 ? 's' : ''} in your library
                </p>

                {ideas.length === 0 ? (
                    <div className="glass-card" style={{
                        padding: '64px 32px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            background: 'rgba(212,114,122,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Layers size={28} style={{ color: 'var(--color-accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>No blueprints yet</h3>
                        <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>Generate your first project blueprint to get started.</p>
                        <Link to="/generate" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            Generate Idea <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {ideas.map((idea) => {
                            const bp = idea.blueprint;
                            return (
                                <div
                                    key={idea.id}
                                    className="glass-card saved-card"
                                    onClick={() => navigate(`/blueprint/${idea.id}`)}
                                    style={{
                                        padding: '24px 28px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,114,122,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}
                                >
                                    {/* Top row: title + actions */}
                                    <div className="saved-top" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                                                {bp?.title || 'Untitled Blueprint'}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                    background: 'rgba(212,114,122,0.08)', color: 'var(--color-accent-dark)',
                                                }}>
                                                    {idea.domain}
                                                </span>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                    background: 'rgba(139,92,138,0.06)', color: '#8B5C8A',
                                                }}>
                                                    {idea.skillLevel}
                                                </span>
                                                {bp?.market_potential_score && (
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                        background: 'rgba(34,197,94,0.06)', color: '#16a34a',
                                                    }}>
                                                        Score: {bp.market_potential_score}/10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <button
                                                onClick={(e) => handleDelete(e, idea.id)}
                                                style={{
                                                    background: 'none', border: 'none', color: '#ccc', cursor: 'pointer',
                                                    padding: '10px', borderRadius: '10px', transition: 'all 0.2s ease',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'none'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Problem statement preview */}
                                    {bp?.problem_statement && (
                                        <p style={{
                                            fontSize: '13px', color: '#888', lineHeight: 1.5, marginBottom: '14px',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {bp.problem_statement}
                                        </p>
                                    )}

                                    {/* Quick stats preview */}
                                    <div className="saved-bottom" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {bp?.recommended_tech_stack && (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {['frontend', 'backend', 'database'].map(key => (
                                                    bp.recommended_tech_stack[key] && (
                                                        <span key={key} style={{
                                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                                                            background: 'rgba(0,0,0,0.03)', color: '#999', fontWeight: 500,
                                                        }}>
                                                            {bp.recommended_tech_stack[key]}
                                                        </span>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent)', fontSize: '12px', fontWeight: 600 }}>
                                            View Full Plan <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedIdeas;
