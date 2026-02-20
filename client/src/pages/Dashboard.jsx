import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Clock, Crown, ArrowRight, History } from 'lucide-react';

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
                    axios.get('http://localhost:5000/api/user/stats', { headers }),
                    axios.get('http://localhost:5000/api/generate/saved', { headers }),
                    axios.get('http://localhost:5000/api/generate/history', { headers }).catch(() => ({ data: { history: [] } })),
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

    const usage = stats?.weeklyUsageCount || 0;
    const maxUsage = 5;
    const usagePercent = (usage / maxUsage) * 100;

    const formatDate = (ts) => {
        if (!ts?._seconds) return '';
        return new Date(ts._seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const allBlueprints = [];

    history.forEach(item => {
        allBlueprints.push({
            ...item,
            type: 'history',
            sortTime: item.createdAt?._seconds || 0,
        });
    });

    ideas.forEach(item => {
        const alreadyInHistory = history.some(h =>
            h.blueprint?.title === item.blueprint?.title && h.domain === item.domain
        );
        if (!alreadyInHistory) {
            allBlueprints.push({
                ...item,
                type: 'saved',
                sortTime: item.createdAt?._seconds || 0,
            });
        }
    });

    allBlueprints.sort((a, b) => b.sortTime - a.sortTime);

    return (
        <div className="page-dashboard" style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div className="animate-fadeInUp" style={{ marginBottom: '40px' }}>
                <h1 className="heading-serif" style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#999', fontSize: '15px' }}>
                    Welcome back, {currentUser?.email?.split('@')[0] || 'builder'}
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '48px' }}
                className="animate-fadeInUp"
            >
                {/* Usage Card */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Usage</span>
                        <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px', fontFamily: "'Playfair Display', serif" }}>
                        {usage}<span style={{ fontSize: '18px', color: '#ccc' }}>/{maxUsage}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '3px',
                            width: `${usagePercent}%`,
                            background: usagePercent >= 80 ? 'linear-gradient(90deg, #EF4444, var(--color-accent))' : 'linear-gradient(90deg, var(--color-accent), #22C55E)',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                        {maxUsage - usage} ideas remaining this week
                    </p>
                </div>

                {/* Account Card */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</span>
                        <Crown size={18} style={{ color: '#8B5C8A' }} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                        {stats?.role === 'premium' ? 'Premium' : 'Free Plan'}
                    </div>
                    <p style={{ fontSize: '13px', color: '#999' }}>
                        {stats?.role === 'premium' ? 'Unlimited blueprints' : '5 blueprints per week'}
                    </p>
                </div>

                {/* Total Generated Card */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Generated</span>
                        <History size={18} style={{ color: '#8B5C8A' }} />
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Playfair Display', serif" }}>
                        {Math.max(usage, allBlueprints.length)}
                    </div>
                    <p style={{ fontSize: '13px', color: '#999' }}>blueprints generated this week</p>
                </div>
            </div>

            {/* Quick Action */}
            <Link to="/generate" className="glass-card quick-action-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 32px',
                textDecoration: 'none',
                marginBottom: '48px',
                transition: 'all 0.3s ease',
                borderColor: 'rgba(212,114,122,0.15)',
                boxShadow: '0 4px 24px rgba(212,114,122,0.06)',
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '16px' }}>Generate New Idea</div>
                        <div style={{ color: '#999', fontSize: '13px' }}>Create a structured project blueprint with AI</div>
                    </div>
                </div>
                <ArrowRight size={20} style={{ color: 'var(--color-accent)' }} />
            </Link>

            {/* Blueprint History */}
            <div>
                <div className="section-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={20} style={{ color: '#8B5C8A' }} />
                        <h2 className="heading-serif" style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>Blueprint History</h2>
                    </div>
                    {ideas.length > 0 && (
                        <Link to="/saved" style={{ color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                            View Saved →
                        </Link>
                    )}
                </div>

                {allBlueprints.length === 0 ? (
                    <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '14px',
                            background: 'rgba(139,92,138,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <History size={24} style={{ color: '#8B5C8A' }} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>No blueprints generated yet</h3>
                        <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>Generate your first project blueprint to see your history here.</p>
                        <Link to="/generate" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            Generate Idea <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {allBlueprints.map((item) => (
                            <div
                                key={item.id}
                                className="glass-card history-card"
                                onClick={() => navigate(item.type === 'history' ? `/history/${item.id}` : `/blueprint/${item.id}`)}
                                style={{
                                    padding: '18px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,114,122,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.blueprint?.title || 'Untitled Blueprint'}
                                        </h3>
                                        {item.type === 'saved' && (
                                            <span style={{
                                                padding: '1px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                background: 'rgba(34,197,94,0.08)', color: '#16a34a', textTransform: 'uppercase',
                                            }}>Saved</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(212,114,122,0.08)', color: 'var(--color-accent-dark)' }}>
                                            {item.domain}
                                        </span>
                                        <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(139,92,138,0.06)', color: '#8B5C8A' }}>
                                            {item.skillLevel}
                                        </span>
                                        {item.blueprint?.market_potential_score && (
                                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                                                Score: {item.blueprint.market_potential_score}/10
                                            </span>
                                        )}
                                        {item.sortTime > 0 && (
                                            <span style={{ fontSize: '11px', color: '#bbb', marginLeft: 'auto' }}>
                                                {formatDate(item.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight size={16} style={{ color: '#8B5C8A', marginLeft: '12px', flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
