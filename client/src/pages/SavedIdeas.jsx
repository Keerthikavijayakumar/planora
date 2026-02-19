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
                    border: '3px solid rgba(255,255,255,0.08)',
                    borderTop: '3px solid #F59E0B',
                    borderRadius: '50%',
                    animation: 'spin-slow 1s linear infinite',
                }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="animate-fadeInUp">
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Saved Blueprints</h1>
                <p style={{ color: '#666', fontSize: '15px', marginBottom: '36px' }}>
                    {ideas.length} blueprint{ideas.length !== 1 ? 's' : ''} in your library
                </p>

                {ideas.length === 0 ? (
                    <div className="glass-card" style={{
                        padding: '64px 32px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            background: 'rgba(245,158,11,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Layers size={28} style={{ color: '#F59E0B' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>No blueprints yet</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Generate your first project blueprint to get started.</p>
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
                                    className="glass-card"
                                    onClick={() => navigate(`/blueprint/${idea.id}`)}
                                    style={{
                                        padding: '24px 28px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {/* Top row: title + actions */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                                                {bp?.title || 'Untitled Blueprint'}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                    background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                                                }}>
                                                    {idea.domain}
                                                </span>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                    background: 'rgba(139,92,246,0.1)', color: '#8B5CF6',
                                                }}>
                                                    {idea.skillLevel}
                                                </span>
                                                {bp?.market_potential_score && (
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                        background: 'rgba(34,197,94,0.1)', color: '#22C55E',
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
                                                    background: 'none', border: 'none', color: '#555', cursor: 'pointer',
                                                    padding: '10px', borderRadius: '10px', transition: 'all 0.2s ease',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'none'; }}
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
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {bp?.recommended_tech_stack && (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {['frontend', 'backend', 'database'].map(key => (
                                                    bp.recommended_tech_stack[key] && (
                                                        <span key={key} style={{
                                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                                                            background: 'rgba(255,255,255,0.04)', color: '#666', fontWeight: 500,
                                                        }}>
                                                            {bp.recommended_tech_stack[key]}
                                                        </span>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontSize: '12px', fontWeight: 600 }}>
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
