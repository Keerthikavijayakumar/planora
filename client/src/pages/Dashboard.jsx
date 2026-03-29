import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Crown, ArrowRight, History, Heart, Share2 } from 'lucide-react';

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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #000',
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

    const allBlueprints = [...history.map(h => ({ ...h, type: 'history' })), ...ideas.filter(i => !history.some(h => h.blueprint?.title === i.blueprint?.title)).map(i => ({ ...i, type: 'saved' }))].sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));

    return (
        <div className="modern-dashboard" style={{ 
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: '#ffffff',
            minHeight: '100vh',
            padding: '120px 5% 60px',
            color: '#111827'
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .stat-card {
                    padding: 32px;
                    border-radius: 24px;
                    background: #f9fafb;
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                }
                .quick-action-bar {
                    background: #000;
                    color: #fff;
                    padding: 32px 40px;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 60px;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                    text-decoration: none;
                }
                .quick-action-bar:hover {
                    transform: scale(1.01);
                }
                .history-item {
                    display: flex;
                    align-items: center;
                    padding: 24px;
                    border-bottom: 1px solid #f3f4f6;
                    transition: background 0.2s ease;
                    cursor: pointer;
                    text-decoration: none;
                    color: inherit;
                }
                .history-item:hover {
                    background: #fdfdfd;
                }
                .badge-neutral {
                    padding: 4px 12px;
                    background: #f3f4f6;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 800;
                    color: #111827;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .badge-success {
                    padding: 4px 12px;
                    background: #d1fae5;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #065f46;
                    text-transform: uppercase;
                }
                .progress-container {
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 100px;
                    overflow: hidden;
                    margin: 16px 0;
                }
            ` }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '48px' }}
                >
                    <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.04em' }}>Dashboard</h1>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>Managing projects for {currentUser?.email}</p>
                </motion.div>

                {/* Main Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                    <motion.div className="stat-card" whileHover={{ y: -5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>WEEKLY USAGE</span>
                            <Clock size={18} color="#9ca3af" />
                        </div>
                        <div style={{ fontSize: '48px', fontWeight: 800 }}>{usage}<span style={{ color: '#e5e7eb', fontSize: '24px' }}>/{maxUsage}</span></div>
                        <div className="progress-container">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercent}%` }}
                                style={{ height: '100%', backgroundColor: '#000' }} 
                            />
                        </div>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>Reset in 3 days</p>
                    </motion.div>

                    <motion.div className="stat-card" whileHover={{ y: -5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>CREDITS</span>
                            <Crown size={18} color="#9ca3af" />
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats?.role === 'premium' ? 'Premium' : 'Free Tier'}</div>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>{stats?.role === 'premium' ? 'Unlimited access enabled' : 'UPGRADE TO REMOVE LIMITS'}</p>
                    </motion.div>
                </div>

                {/* Quick Action */}
                <Link to="/generate" className="quick-action-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>New Project Blueprint</div>
                            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Generate technical architecture in seconds</div>
                        </div>
                    </div>
                    <ArrowRight size={24} />
                </Link>

                {/* History Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Recent Blueprints</h2>
                        <Link to="/saved" style={{ fontSize: '14px', fontWeight: 700, color: '#000', textDecoration: 'none' }}>View All</Link>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                        {allBlueprints.length === 0 ? (
                            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                <History size={48} color="#e5e7eb" style={{ marginBottom: '24px' }} />
                                <p style={{ color: '#9ca3af', fontWeight: 500 }}>No project history yet.</p>
                            </div>
                        ) : (
                            allBlueprints.slice(0, 5).map((item, i) => (
                                <Link 
                                    key={item.id} 
                                    to={item.type === 'history' ? `/history/${item.id}` : `/blueprint/${item.id}`}
                                    className="history-item"
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: 700 }}>{item.blueprint?.title || 'Untitled Project'}</span>
                                            {item.type === 'saved' && <span className="badge-success">Saved</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span className="badge-neutral">{item.domain}</span>
                                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>{formatDate(item.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div style={{ color: '#000' }}><ArrowRight size={20} /></div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
