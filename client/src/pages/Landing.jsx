import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Layers, Brain, Target, Zap, ArrowRight, Star, ChevronRight } from 'lucide-react';

const Landing = () => {
    const { currentUser } = useAuth();

    const features = [
        { icon: <Brain size={24} />, title: "Domain Intelligence", desc: "AI generates ideas tailored to your specific CS domain — AI/ML, Web, Mobile, Cybersecurity & more." },
        { icon: <Layers size={24} />, title: "Skill Adaptation", desc: "Get recommendations matching your experience level, from Fresher learning paths to Advanced architectures." },
        { icon: <Target size={24} />, title: "Market Scoring", desc: "Every blueprint includes Market Potential, Difficulty, and Resume Impact scores to help you prioritize." },
        { icon: <Zap size={24} />, title: "Instant Blueprints", desc: "Complete project architecture in seconds — features, tech stack, roadmap, and differentiation." },
    ];

    return (
        <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>

            {/* Ambient Background Glows */}
            <div style={{
                position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: '120vw', height: '120vw',
                background: 'radial-gradient(circle, rgba(212,114,122,0.06) 0%, transparent 60%)',
                pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', top: '10%', right: '-10%',
                width: '800px', height: '800px',
                background: 'radial-gradient(circle, rgba(212,114,122,0.03) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 1, paddingTop: '120px', paddingBottom: '60px' }}>

                {/* Hero Section */}
                <div style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

                    {/* Badge */}
                    <div className="animate-fadeInUp" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '32px', backdropFilter: 'blur(10px)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', boxShadow: '0 0 10px rgba(212,114,122,0.4)' }}></span>
                        <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>v1.0 is now live</span>
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fadeInUp heading-serif" style={{
                        fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 800,
                        lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px',
                        color: '#1a1a1a',
                    }}>
                        AI is the new standard <br />
                        <span className="pink-underline" style={{
                            color: 'var(--color-accent-dark)',
                        }}>
                            for project architecture
                        </span>
                    </h1>

                    <p className="animate-fadeInUp" style={{ fontSize: '20px', color: '#1a1a1a', fontWeight: 600, maxWidth: '600px', margin: '0 auto 16px', letterSpacing: '-0.01em' }}>
                        Architect your next big idea with AI-driven precision.
                    </p>

                    <p className="animate-fadeInUp" style={{ fontSize: '16px', color: '#888', maxWidth: '580px', margin: '0 auto 48px', lineHeight: 1.6 }}>
                        Generate comprehensive project blueprints tailored to your domain and skill level.
                        Stop guessing, start building.
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '80px' }}>
                        {currentUser ? (
                            <Link to="/generate" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 40px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                Start for free <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <div style={{ position: 'relative', display: 'flex', gap: '8px', padding: '4px', background: 'rgba(255,255,255,0.7)', borderRadius: '100px', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    disabled
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1a1a1a', padding: '0 16px', fontSize: '14px', width: '220px' }}
                                />
                                <Link to="/auth" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px', fontSize: '14px' }}>
                                    Start for free
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 3D Blueprint Generation Mock */}
                    <div className="perspective-2000 animate-fadeInUp" style={{ marginBottom: '120px' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.65)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(212,114,122,0.15)',
                            borderRadius: '24px',
                            boxShadow: '0 8px 60px rgba(0,0,0,0.04), 0 0 80px rgba(212,114,122,0.04)',
                            maxWidth: '1000px', margin: '0 auto', overflow: 'hidden', height: '540px', position: 'relative'
                        }}>
                            {/* Grid Background */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: 'linear-gradient(rgba(212,114,122,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,114,122,0.06) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                                opacity: 0.5
                            }} />

                            {/* Generating Nodes Animation */}
                            <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', height: '100%' }}>

                                {/* Core Node */}
                                <div className="animate-pulse" style={{
                                    padding: '16px 32px', borderRadius: '100px',
                                    background: 'rgba(212,114,122,0.08)', border: '1px solid rgba(212,114,122,0.3)',
                                    color: 'var(--color-accent-dark)', fontWeight: 700, fontSize: '18px',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}>
                                    <Sparkles size={18} /> AI Architecting...
                                </div>

                                {/* Branches */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', width: '100%' }}>
                                    {[
                                        { title: 'Frontend Strategy', items: ['React + Vite', 'Tailwind', 'Framer Motion'], delay: '0.5s' },
                                        { title: 'Backend Logic', items: ['Node.js', 'Express', 'PostgreSQL'], delay: '1s' },
                                        { title: 'Deployment', items: ['Vercel / AWS', 'CI/CD Pipeline', 'Docker'], delay: '1.5s' }
                                    ].map((col, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.06)',
                                            borderRadius: '16px', padding: '24px', opacity: 0,
                                            animation: `fadeInUp 0.5s ease forwards ${col.delay}`
                                        }}>
                                            <div style={{ fontSize: '14px', color: '#999', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {col.title}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {col.items.map((item, j) => (
                                                    <div key={j} style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#555',
                                                        padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px'
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)' }} />
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Flow Lines */}
                                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}>
                                    <path d="M500 110 L500 150 L180 150 L180 200" fill="none" stroke="rgba(212,114,122,0.15)" strokeWidth="2" strokeDasharray="5,5" />
                                    <path d="M500 110 L500 200" fill="none" stroke="rgba(212,114,122,0.15)" strokeWidth="2" strokeDasharray="5,5" />
                                    <path d="M500 110 L500 150 L820 150 L820 200" fill="none" stroke="rgba(212,114,122,0.15)" strokeWidth="2" strokeDasharray="5,5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Content Section */}
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 120px', textAlign: 'center' }}>
                    <h2 className="heading-serif" style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a', marginBottom: '24px' }}>
                        Stop wasting time on setup. <br />
                        <span style={{ color: 'var(--color-accent-dark)' }}>Start coding the important stuff.</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#777', lineHeight: 1.8, marginBottom: '60px' }}>
                        Planora isn't just a generic idea generator. It's a <strong style={{ color: '#1a1a1a' }}>technical co-founder</strong> that understands engineering.
                        Whether you're building a hackathon submission, a portfolio piece, or a startup MVP,
                        Planora gives you the exact architectural roadmap you need to succeed.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
                        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(10px)' }}>
                            <h3 className="heading-serif" style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>For Students & Learners</h3>
                            <p style={{ color: '#777', lineHeight: 1.6 }}>Bridge the gap between tutorials and real-world projects. Get step-by-step roadmaps tailored to your current skill level.</p>
                        </div>
                        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(10px)' }}>
                            <h3 className="heading-serif" style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>For Hackathon Teams</h3>
                            <p style={{ color: '#777', lineHeight: 1.6 }}>Skip the brainstorming paralysis. Generate a winning idea, tech stack, and feature list in seconds so you can start coding immediately.</p>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 100px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                        {features.map((f, i) => (
                            <div key={i} className="glass-card" style={{
                                padding: '32px',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}
                            >
                                <div style={{ color: 'var(--color-accent)', marginBottom: '20px' }}>{f.icon}</div>
                                <h3 className="heading-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>{f.title}</h3>
                                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Text */}
                <div style={{ textAlign: 'center', padding: '40px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: '14px', color: '#999', fontWeight: 500 }}>
                        Join thousands of architects building the future. <br />
                        <span style={{ color: '#bbb', fontSize: '12px', marginTop: '8px', display: 'inline-block' }}>© 2026 Planora. All rights reserved.</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Landing;
