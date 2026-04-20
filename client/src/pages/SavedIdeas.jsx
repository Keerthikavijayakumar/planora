import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Layers, ArrowRight, ChevronRight, Search, BookMarked, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const SavedIdeas = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchIdeas = async () => {
            if (!currentUser) return;
            try {
                const token = await currentUser.getIdToken();
                const res = await axios.get(`${apiBaseUrl}/api/generate/saved`, {
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
            await axios.delete(`${apiBaseUrl}/api/generate/saved/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdeas(ideas.filter(i => i.id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const filteredIdeas = ideas.filter(idea =>
        idea.blueprint?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-page)' }}>
                <div style={{ width: '44px', height: '44px', border: '3px solid var(--glass-border)', borderTop: '3px solid var(--sakura-deep)', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gradient-page)',
            backgroundAttachment: 'fixed',
            fontFamily: 'var(--font-sans)',
            padding: '120px 5% 80px',
            position: 'relative',
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .saved-card {
                    background: rgba(255,255,255,0.80);
                    border: 1.5px solid var(--glass-border);
                    border-radius: 26px;
                    padding: 32px;
                    cursor: pointer;
                    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    backdrop-filter: blur(16px);
                    box-shadow: var(--shadow-card);
                    font-family: var(--font-sans) !important;
                }
                .saved-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-hover);
                    border-color: var(--glass-border-strong);
                    background: rgba(255,255,255,0.95);
                }
                .saved-search {
                    width: 100%;
                    padding: 14px 20px 14px 52px;
                    border-radius: 18px;
                    border: 1.5px solid var(--glass-border);
                    background: rgba(255,255,255,0.8);
                    outline: none;
                    font-size: 15px;
                    font-family: var(--font-sans) !important;
                    color: var(--text-primary);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }
                .saved-search:focus {
                    border-color: var(--sakura-petal);
                    box-shadow: 0 0 0 4px rgba(244,167,185,0.15);
                    background: #fff;
                }
                .saved-search::placeholder { color: var(--text-placeholder); }
                .domain-tag {
                    font-size: 11px;
                    font-weight: 800;
                    background: var(--gradient-sakura);
                    color: #fff;
                    padding: 4px 14px;
                    border-radius: 100px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .level-tag {
                    font-size: 11px;
                    font-weight: 800;
                    background: var(--sakura-blush);
                    color: var(--sakura-deep);
                    padding: 4px 14px;
                    border-radius: 100px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    border: 1px solid var(--glass-border);
                }
                .delete-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }
                .delete-btn:hover {
                    color: #e05a6d;
                    background: rgba(224,90,109,0.12);
                }
            ` }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '28px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '42px', height: '42px', background: 'var(--sakura-blush)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--glass-border)' }}>
                                <BookMarked size={22} color="var(--sakura-deep)" />
                            </div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'var(--sakura-bark)', letterSpacing: '-0.02em' }}>
                                Your Library
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                            {ideas.length} technical blueprints architected by AI
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Find a blueprint..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="saved-search"
                        />
                    </motion.div>
                </div>

                {/* Empty State */}
                {ideas.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: 'center',
                            padding: '120px 40px',
                            background: 'rgba(255,255,255,0.78)',
                            borderRadius: '32px',
                            border: '1.5px solid var(--glass-border)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌸</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '12px', color: 'var(--sakura-bark)' }}>Library is quiet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '17px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Generate your first technical vision to see it blooms here.</p>
                        <Link to="/generate" className="btn-primary" style={{ textDecoration: 'none', padding: '18px 40px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={18} /> CREATE BLUEPRINT <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                ) : (
                    /* Cards Grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
                        <AnimatePresence>
                            {filteredIdeas.map((idea, idx) => (
                                <motion.div
                                    key={idea.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="saved-card"
                                    onClick={() => navigate(`/blueprint/${idea.id}`)}
                                >
                                    {/* Card Top */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                        <div style={{
                                            width: '48px', height: '48px',
                                            background: 'var(--sakura-blush)',
                                            borderRadius: '16px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1.5px solid var(--glass-border)',
                                        }}>
                                            <Layers size={22} color="var(--sakura-deep)" />
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, idea.id)}
                                            className="delete-btn"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {/* Title */}
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        marginBottom: '16px',
                                        height: '60px',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.4,
                                        fontFamily: 'var(--font-sans)',
                                    }}>
                                        {idea.blueprint?.title || 'Untitled Project'}
                                    </h3>

                                    {/* Tags */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                                        <span className="domain-tag">{idea.domain}</span>
                                        <span className="level-tag">{idea.skillLevel}</span>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(244,167,185,0.2)', paddingTop: '20px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '12px', color: 'var(--sakura-deep)', letterSpacing: '0.1em' }}>
                                            OPEN <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedIdeas;
