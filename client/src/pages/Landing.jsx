import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Layers, Brain, Target, Zap, ArrowRight, Star } from 'lucide-react';

const Landing = () => {
    const { currentUser } = useAuth();

    const features = [
        { icon: <Brain size={24} />, title: "Domain Intelligence", desc: "AI generates ideas tailored to your specific CS domain — AI/ML, Web, Mobile, Cybersecurity & more." },
        { icon: <Layers size={24} />, title: "Skill Adaptation", desc: "Get recommendations matching your experience level, from Fresher learning paths to Advanced architectures." },
        { icon: <Target size={24} />, title: "Market Scoring", desc: "Every blueprint includes Market Potential, Difficulty, and Resume Impact scores to help you prioritize." },
        { icon: <Zap size={24} />, title: "Instant Blueprints", desc: "Complete project architecture in seconds — features, tech stack, 4-week roadmap, and differentiation analysis." },
    ];

    return (
        <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
            {/* Hero Section */}
            <section style={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                padding: '60px 24px',
            }}>
                {/* Background Effects */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                <div style={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 1 }}
                    className="animate-fadeInUp"
                >
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        borderRadius: '100px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#F59E0B',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.15)',
                        marginBottom: '32px',
                    }}>
                        <Star size={14} /> AI-Powered Project Architecture
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 72px)',
                        fontWeight: 900,
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        marginBottom: '24px',
                        color: '#fff',
                    }}>
                        From Idea to{' '}
                        <span className="gradient-text">Execution</span>
                        <br />in Seconds
                    </h1>

                    <p style={{
                        fontSize: '18px',
                        color: '#888',
                        maxWidth: '560px',
                        margin: '0 auto 48px',
                        lineHeight: 1.7,
                    }}>
                        AI generates structured project blueprints tailored to your domain,
                        skill level, and goals. Stop brainstorming, start building.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to={currentUser ? "/generate" : "/auth"} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} /> Generate Blueprint <ArrowRight size={16} />
                        </Link>
                        <Link to={currentUser ? "/dashboard" : "/auth"} className="btn-secondary" style={{ textDecoration: 'none' }}>
                            View Dashboard
                        </Link>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        gap: '48px',
                        justifyContent: 'center',
                        marginTop: '64px',
                        paddingTop: '40px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        {[
                            { num: '8+', label: 'Domains' },
                            { num: '4', label: 'Skill Levels' },
                            { num: '11', label: 'Blueprint Fields' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>{s.num}</div>
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                padding: '100px 24px',
                maxWidth: '1100px',
                margin: '0 auto',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                        Everything you need to{' '}
                        <span style={{ color: '#F59E0B' }}>ship faster</span>
                    </h2>
                    <p style={{ color: '#666', marginTop: '16px', fontSize: '16px' }}>
                        Planora does the thinking, so you can focus on building.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                }}>
                    {features.map((f, i) => (
                        <div key={i} className="glass-card" style={{
                            padding: '32px 28px',
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(245,158,11,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#F59E0B',
                                marginBottom: '20px',
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{f.title}</h3>
                            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '80px 24px',
                textAlign: 'center',
            }}>
                <div className="glass-card accent-glow" style={{
                    maxWidth: '700px',
                    margin: '0 auto',
                    padding: '64px 48px',
                    textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
                        Ready to architect your next project?
                    </h2>
                    <p style={{ color: '#888', marginBottom: '32px' }}>
                        5 free blueprints per week. No credit card required.
                    </p>
                    <Link to="/auth" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        Start Free <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '32px 24px',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                color: '#444',
                fontSize: '13px',
            }}>
                Built with ❤️ by Planora • Powered by Google Gemini AI
            </footer>
        </div>
    );
};

export default Landing;
