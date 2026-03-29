import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Layers, ArrowRight, ChevronRight, Search } from 'lucide-react';
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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Poppins', sans-serif", padding: '120px 5% 60px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.04em' }}>Library</h1>
                        <p style={{ color: '#6b7280', fontSize: '16px' }}>{ideas.length} blueprints architected by Planora AI</p>
                    </div>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input 
                            type="text" 
                            placeholder="Search blueprints..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', fontSize: '14px' }}
                        />
                    </div>
                </div>

                {ideas.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '100px 40px', background: '#f9fafb', borderRadius: '32px', border: '1px solid #f3f4f6' }}>
                        <Layers size={48} color="#9ca3af" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Your library is empty</h3>
                        <p style={{ color: '#6b7280', marginBottom: '32px' }}>Generate your first technical blueprint to see it here.</p>
                        <Link to="/generate" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 28px' }}>Create Blueprint <ArrowRight size={18} style={{ marginLeft: '8px' }} /></Link>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        <AnimatePresence>
                            {filteredIdeas.map((idea, idx) => (
                                <motion.div
                                    key={idea.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/blueprint/${idea.id}`)}
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #f3f4f6',
                                        borderRadius: '24px',
                                        padding: '24px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.borderColor = '#000';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.borderColor = '#f3f4f6';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '12px' }}>
                                            <Layers size={20} />
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(e, idea.id)}
                                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', height: '54px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {idea.blueprint?.title || 'Untitled Project'}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 800, background: '#000', color: '#fff', padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{idea.domain}</span>
                                        <span style={{ fontSize: '11px', fontWeight: 800, background: '#f3f4f6', color: '#111827', padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{idea.skillLevel}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: 'auto' }}>
                                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>{new Date(idea.createdAt).toLocaleDateString()}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '12px', color: '#000', letterSpacing: '0.05em' }}>
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
