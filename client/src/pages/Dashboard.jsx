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
                    border: '3px solid rgba(255,255,255,0.08)',
                    borderTop: '3px solid #F59E0B',
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

    // Merge history + saved ideas into one "Blueprint History" list
    // History items get type 'history', saved items get type 'saved'
    const allBlueprints = [];

    history.forEach(item => {
        allBlueprints.push({
            ...item,
            type: 'history',
            sortTime: item.createdAt?._seconds || 0,
        });
    });

    // Also include saved ideas that aren't already in history
    ideas.forEach(item => {
        // Check if this saved idea's blueprint title already exists in history
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

    // Sort by time descending
    allBlueprints.sort((a, b) => b.sortTime - a.sortTime);

    return (
        <div style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div className="animate-fadeInUp" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#666', fontSize: '15px' }}>
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
                        <span style={{ fontSize: '13px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Usage</span>
                        <Clock size={18} style={{ color: '#F59E0B' }} />
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                        {usage}<span style={{ fontSize: '18px', color: '#555' }}>/{maxUsage}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '3px',
                            width: `${usagePercent}%`,
                            background: usagePercent >= 80 ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : 'linear-gradient(90deg, #F59E0B, #22C55E)',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
                        {maxUsage - usage} ideas remaining this week
                    </p>
                </div>

                {/* Account Card */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</span>
                        <Crown size={18} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                        {stats?.role === 'premium' ? 'Premium' : 'Free Plan'}
                    </div>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                        {stats?.role === 'premium' ? 'Unlimited blueprints' : '5 blueprints per week'}
                    </p>
                </div>

                {/* Total Generated Card */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '13px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Generated</span>
                        <History size={18} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                        {Math.max(usage, allBlueprints.length)}
                    </div>
                    <p style={{ fontSize: '13px', color: '#666' }}>blueprints generated this week</p>
                </div>
            </div>

            {/* Quick Action */}
            <Link to="/generate" className="glass-card accent-glow" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 32px',
                textDecoration: 'none',
                marginBottom: '48px',
                transition: 'all 0.3s ease',
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={20} color="#000" />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Generate New Idea</div>
                        <div style={{ color: '#666', fontSize: '13px' }}>Create a structured project blueprint with AI</div>
                    </div>
                </div>
                <ArrowRight size={20} style={{ color: '#F59E0B' }} />
            </Link>

            {/* Blueprint History */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={20} style={{ color: '#8B5CF6' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Blueprint History</h2>
                    </div>
                    {ideas.length > 0 && (
                        <Link to="/saved" style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                            View Saved →
                        </Link>
                    )}
                </div>

                {allBlueprints.length === 0 ? (
                    <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '14px',
                            background: 'rgba(139,92,246,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <History size={24} style={{ color: '#8B5CF6' }} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>No blueprints generated yet</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Generate your first project blueprint to see your history here.</p>
                        <Link to="/generate" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            Generate Idea <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {allBlueprints.map((item) => (
                            <div
                                key={item.id}
                                className="glass-card"
                                onClick={() => navigate(item.type === 'history' ? `/history/${item.id}` : `/blueprint/${item.id}`)}
                                style={{
                                    padding: '18px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.blueprint?.title || 'Untitled Blueprint'}
                                        </h3>
                                        {item.type === 'saved' && (
                                            <span style={{
                                                padding: '1px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                background: 'rgba(34,197,94,0.15)', color: '#22C55E', textTransform: 'uppercase',
                                            }}>Saved</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                                            {item.domain}
                                        </span>
                                        <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                                            {item.skillLevel}
                                        </span>
                                        {item.blueprint?.market_potential_score && (
                                            <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: 600 }}>
                                                Score: {item.blueprint.market_potential_score}/10
                                            </span>
                                        )}
                                        {item.sortTime > 0 && (
                                            <span style={{ fontSize: '11px', color: '#444', marginLeft: 'auto' }}>
                                                {formatDate(item.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight size={16} style={{ color: '#8B5CF6', marginLeft: '12px', flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
