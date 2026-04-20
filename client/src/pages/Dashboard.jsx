import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Crown, ArrowRight, BookMarked } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [ideas, setIdeas] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                const token = await currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${token}` };
                const [statsRes, ideasRes, historyRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/user/stats`, { headers }),
                    axios.get(`${apiBaseUrl}/api/generate/saved`, { headers }),
                    axios.get(`${apiBaseUrl}/api/generate/history`, { headers }).catch(() => ({ data: { history: [] } })),
                ]);
                setStats(statsRes.data);
                setIdeas(ideasRes.data.ideas || []);
                setHistory(historyRes.data.history || []);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-page)' }}>
                <div style={{
                    width: '44px', height: '44px',
                    border: '3px solid var(--glass-border)',
                    borderTop: '3px solid var(--sakura-deep)',
                    borderRadius: '50%',
                    animation: 'spin-slow 1s linear infinite',
                }} />
            </div>
        );
    }

    const usage = stats?.weeklyUsageCount || 0;
    const maxUsage = 5;
    const usagePercent = (usage / maxUsage) * 100;

    const formatDate = (ts) => {
        if (!ts?._seconds) return '';
        return new Date(ts._seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const allBlueprints = [
        ...history.map(h => ({ ...h, type: 'history' })),
        ...ideas.filter(i => !history.some(h => h.blueprint?.title === i.blueprint?.title)).map(i => ({ ...i, type: 'saved' }))
    ].sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));

    const firstName = currentUser?.email?.split('@')[0] || 'there';

    return (
        <div style={{
            fontFamily: 'var(--font-sans)',
            background: 'var(--gradient-page)',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            padding: '120px 5% 80px',
            color: 'var(--text-primary)',
            position: 'relative',
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .dash-stat-card {
                    padding: 32px;
                    border-radius: 24px;
                    background: rgba(255,255,255,0.78);
                    border: 1.5px solid var(--glass-border);
                    backdrop-filter: blur(20px);
                    box-shadow: var(--shadow-card);
                    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
                    font-family: var(--font-sans) !important;
                }
                .dash-stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-hover);
                    border-color: var(--glass-border-strong);
                }
                .dash-quick-action {
                    background: var(--gradient-sakura);
                    color: #fff;
                    padding: 32px 40px;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 56px;
                    cursor: pointer;
                    transition: all 0.35s ease;
                    text-decoration: none;
                    box-shadow: var(--shadow-btn);
                    position: relative;
                    overflow: hidden;
                    font-family: var(--font-sans) !important;
                }
                .dash-quick-action::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .dash-quick-action:hover {
                    transform: translateY(-3px) scale(1.01);
                    box-shadow: 0 20px 50px rgba(192,87,107,0.40);
                }
                .dash-quick-action:hover::before { opacity: 1; }
                .dash-history-item {
                    display: flex;
                    align-items: center;
                    padding: 22px 24px;
                    border-bottom: 1px solid rgba(244,167,185,0.15);
                    transition: all 0.25s ease;
                    cursor: pointer;
                    text-decoration: none;
                    color: inherit;
                    border-left: 3px solid transparent;
                    font-family: var(--font-sans) !important;
                }
                .dash-history-item:hover {
                    background: var(--sakura-blush);
                    border-left-color: var(--sakura-petal);
                }
                .dash-badge-saved {
                    padding: 3px 10px;
                    background: var(--sakura-blush);
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--sakura-deep);
                    border: 1px solid var(--glass-border);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .dash-badge-domain {
                    padding: 3px 10px;
                    background: rgba(244,167,185,0.15);
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--sakura-bark);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .progress-track {
                    height: 10px;
                    background: var(--glass-border);
                    border-radius: 100px;
                    overflow: hidden;
                    margin: 20px 0;
                }
            ` }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                    style={{ marginBottom: '48px' }}
                >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌸</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em', color: 'var(--sakura-bark)' }}>
                        Welcome back, {firstName}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                        Your project studio is ready for new visions.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '56px' }}>
                    <motion.div className="dash-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>WEEKLY USAGE</span>
                            <div style={{ width: '38px', height: '38px', background: 'var(--sakura-blush)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={19} color="var(--sakura-deep)" />
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 700, lineHeight: 1, color: 'var(--sakura-bark)' }}>
                            {usage}<span style={{ color: 'var(--glass-border-strong)', fontSize: '32px' }}>/{maxUsage}</span>
                        </div>
                        <div className="progress-track">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercent}%` }}
                                transition={{ duration: 1.2, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                style={{ height: '100%', background: 'var(--gradient-sakura)', borderRadius: '100px' }}
                            />
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>Refreshes in 3 days</p>
                    </motion.div>

                    <motion.div className="dash-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>PLAN</span>
                            <div style={{ width: '38px', height: '38px', background: 'var(--sakura-blush)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Crown size={19} color="var(--sakura-deep)" />
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 700, color: 'var(--sakura-bark)' }}>
                            {stats?.role === 'premium' ? 'Premium 🌸' : 'Free Tier'}
                        </div>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '16px', fontWeight: 500 }}>
                            {stats?.role === 'premium' ? 'Unlimited blueprints enabled' : 'Upgrade to remove limits'}
                        </p>
                        {stats?.role !== 'premium' && (
                            <Link to="/premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', fontSize: '14px', fontWeight: 800, color: 'var(--sakura-deep)', textDecoration: 'none', background: 'var(--sakura-blush)', padding: '8px 18px', borderRadius: '100px', border: '1.5px solid var(--glass-border)' }}>
                                Crown Upgrade
                            </Link>
                        )}
                    </motion.div>

                    <motion.div className="dash-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>SAVED</span>
                            <div style={{ width: '38px', height: '38px', background: 'var(--sakura-blush)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookMarked size={19} color="var(--sakura-deep)" />
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', fontWeight: 700, lineHeight: 1, color: 'var(--sakura-bark)' }}>
                            {ideas.length}
                        </div>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '20px', fontWeight: 500 }}>Blueprints in your collection</p>
                    </motion.div>
                </div>

                {/* Quick Action */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Link to="/generate" className="dash-quick-action">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Sparkles size={28} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.01em' }}>New Project Blueprint</div>
                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Architect your next vision with AI</div>
                            </div>
                        </div>
                        <ArrowRight size={28} color="#fff" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }} />
                    </Link>
                </motion.div>

                {/* Recent Blueprints */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--sakura-bark)', letterSpacing: '-0.01em' }}>Recent Blueprints</h2>
                        <Link to="/saved" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--sakura-deep)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            VIEW ALL <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '28px', border: '1.5px solid var(--glass-border)', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)' }}>
                        {allBlueprints.length === 0 ? (
                            <div style={{ padding: '100px 40px', textAlign: 'center' }}>
                                <div style={{ fontSize: '52px', marginBottom: '20px' }}>🌸</div>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '18px', fontFamily: 'var(--font-sans)' }}>Your collection is currently empty.</p>
                                <Link to="/generate" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', marginTop: '32px', padding: '16px 36px', fontSize: '16px' }}>
                                    <Sparkles size={18} style={{ marginRight: '10px' }} /> CREATE BLUEPRINT
                                </Link>
                            </div>
                        ) : (
                            allBlueprints.slice(0, 5).map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.type === 'history' ? `/history/${item.id}` : `/blueprint/${item.id}`}
                                    className="dash-history-item"
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>{item.blueprint?.title || 'Untitled Project'}</span>
                                            {item.type === 'saved' && <span className="dash-badge-saved">Saved</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span className="dash-badge-domain">{item.domain}</span>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{formatDate(item.createdAt)}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} color="var(--sakura-petal)" style={{ flexShrink: 0, marginLeft: '16px' }} />
                                </Link>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
