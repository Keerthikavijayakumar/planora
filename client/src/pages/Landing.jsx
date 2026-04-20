import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Brain, Layers, Target, Zap, ArrowRight, Sparkles } from 'lucide-react';

/* ─── Floating Petal Background ─── */
const PETALS = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 13}s`,
    duration: `${11 + Math.random() * 15}s`,
    size: `${14 + Math.random() * 20}px`,
    emoji: ['🌸', '🌸', '🌸', '🌹', '🪷'][Math.floor(Math.random() * 5)],
}));

const PetalBackground = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {PETALS.map(p => (
            <span key={p.id} className="petal" style={{
                left: p.left,
                top: '-60px',
                fontSize: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
            }}>
                {p.emoji}
            </span>
        ))}
    </div>
);

/* ─── Horizontal Scroll Section (Scroll-Hijack-Free) ─── */
const HorizontalFeatures = ({ features }) => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // Raw useTransform — NO useSpring (spring was the hijacking culprit)
    // Maps vertical scroll 0→1 directly to horizontal translate
    const x = useTransform(
        scrollYProgress,
        [0, 1],
        ["0vw", `-${(features.length - 1) * 100}vw`]
    );

    return (
        // One viewport height per panel so scroll is 1:1 with panels
        <section ref={targetRef} className="h-scroll-section" style={{ height: `${features.length * 100}vh` }}>
            <div className="h-scroll-sticky">

                {/* "Scroll to Explore" label */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}>
                    <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        color: 'var(--sakura-deep)',
                        background: 'var(--sakura-blush)',
                        padding: '7px 20px',
                        borderRadius: '100px',
                        border: '1.5px solid var(--glass-border)',
                        boxShadow: 'var(--shadow-soft)',
                        whiteSpace: 'nowrap',
                    }}>SCROLL TO EXPLORE 🌸</span>
                </div>

                {/* Progress dots */}
                <div style={{
                    position: 'absolute',
                    bottom: '36px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    gap: '8px',
                    pointerEvents: 'none',
                }}>
                    {features.map((_, i) => (
                        <div key={i} style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: 'var(--sakura-petal)',
                            opacity: 0.55,
                        }} />
                    ))}
                </div>

                <motion.div style={{ x }} className="h-scroll-container">
                    {features.map((f, i) => (
                        <div key={i} className="h-panel" style={{ background: f.bg, position: 'relative' }}>
                            {/* Soft blur orbs */}
                            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.12, pointerEvents: 'none' }}>
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} style={{
                                        position: 'absolute',
                                        width: `${160 + j * 60}px`,
                                        height: `${160 + j * 60}px`,
                                        borderRadius: '50%',
                                        background: 'var(--sakura-petal)',
                                        left: `${j * 22}%`,
                                        top: `${j % 2 === 0 ? 10 : 55}%`,
                                        filter: 'blur(90px)',
                                    }} />
                                ))}
                            </div>

                            <div style={{
                                maxWidth: '800px',
                                padding: '0 5% 0 10%',
                                textAlign: 'left',
                                position: 'relative',
                                zIndex: 1,
                            }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.15 }}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: f.iconBg,
                                        borderRadius: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '36px',
                                        boxShadow: '0 20px 40px rgba(192,87,107,0.3)',
                                    }}
                                >
                                    {f.icon}
                                </motion.div>

                                <div style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    letterSpacing: '0.18em',
                                    color: 'var(--sakura-deep)',
                                    marginBottom: '20px',
                                }}>0{i + 1} — FEATURE</div>

                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(44px, 8vw, 84px)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    color: 'var(--sakura-bark)',
                                    marginBottom: '28px',
                                    letterSpacing: '-0.02em',
                                }}>
                                    {f.title}
                                </h2>

                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 'clamp(17px, 2.2vw, 22px)',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6,
                                    maxWidth: '580px',
                                    fontWeight: 400,
                                }}>
                                    {f.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

/* ─── Landing Component ─── */
const Landing = () => {
    const { currentUser } = useAuth();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    // Parallax transforms for hero text
    const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const features = [
        {
            icon: <Brain size={36} color="#fff" />,
            title: 'Domain Intelligence',
            desc: 'AI generates ideas tailored to your specific CS domain — AI/ML, Web Dev, Mobile, Cybersecurity & beyond. Every blueprint is scoped effectively.',
            bg: 'linear-gradient(145deg, #FFF5F8 0%, #FDE8EE 100%)',
            iconBg: 'linear-gradient(135deg, #F4A7B9, #C0576B)',
        },
        {
            icon: <Layers size={36} color="#fff" />,
            title: 'Skill Adaptation',
            desc: 'Get recommendations matching your experience level — from Fresher learning paths to Advanced architectures. The AI adapts to your growth.',
            bg: 'linear-gradient(145deg, #FFF0F5 0%, #FEE0EA 100%)',
            iconBg: 'linear-gradient(135deg, #E8A0B4, #A84D62)',
        },
        {
            icon: <Target size={36} color="#fff" />,
            title: 'Market Scoring',
            desc: 'Every blueprint includes Market Potential, Difficulty, and Resume Impact scores. Focus on projects that move the needle for your career.',
            bg: 'linear-gradient(145deg, #FFF5FA 0%, #FDE8F2 100%)',
            iconBg: 'linear-gradient(135deg, #F4A7B9, #C0576B)',
        },
        {
            icon: <Zap size={36} color="#fff" />,
            title: 'Instant Blueprints',
            desc: 'Complete project architecture in seconds — features, tech stack, 4-week roadmap, and differentiation. From vision to blueprint instantly.',
            bg: 'linear-gradient(145deg, #FFF8FA 0%, #FDEEF4 100%)',
            iconBg: 'linear-gradient(135deg, #E8A0B4, #A84D62)',
        },
    ];

    const statsData = [
        { value: '12K+', label: 'Blueprints Generated' },
        { value: '8', label: 'CS Domains' },
        { value: '<2s', label: 'Generation Time' },
        { value: '5.0★', label: 'Student Rating' },
    ];

    return (
        <div style={{
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--sakura-mist)',
            color: 'var(--text-primary)',
            minHeight: '100vh',
            overflowX: 'hidden',
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .lp-hero {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 140px 5% 80px;
                    text-align: center;
                    overflow: hidden;
                    background: var(--gradient-hero);
                }
                .lp-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.3;
                    pointer-events: none;
                }
                .lp-headline {
                    font-family: var(--font-display);
                    font-size: clamp(56px, 10vw, 120px);
                    font-weight: 700;
                    line-height: 0.9;
                    letter-spacing: -0.04em;
                    color: var(--sakura-bark);
                    margin-bottom: 24px;
                }
                .lp-subtitle {
                    font-family: var(--font-sans);
                    font-size: clamp(18px, 2.4vw, 23px);
                    color: var(--text-secondary);
                    max-width: 680px;
                    margin: 0 auto 52px;
                    line-height: 1.5;
                    font-weight: 400;
                }
                .lp-cta-group {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    margin-bottom: 80px;
                    flex-wrap: wrap;
                }
                .lp-mock {
                    width: 100%;
                    max-width: 1000px;
                    margin: 0 auto;
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(40px);
                    border: 1.5px solid var(--glass-border);
                    border-radius: 32px;
                    padding: 44px 48px;
                    box-shadow: var(--shadow-hover);
                }
                .lp-stats-row {
                    display: flex;
                    justify-content: center;
                    gap: 80px;
                    padding: 100px 5%;
                    flex-wrap: wrap;
                    background: var(--sakura-blush);
                    border-top: 1px solid var(--glass-border);
                    border-bottom: 1px solid var(--glass-border);
                }
                .lp-live-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 22px;
                    background: #fff;
                    border: 1.5px solid var(--glass-border);
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 800;
                    margin-bottom: 40px;
                    color: var(--sakura-deep);
                    letter-spacing: 0.05em;
                    font-family: var(--font-sans);
                }
                .lp-live-dot {
                    width: 7px; height: 7px;
                    background: var(--sakura-deep);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--sakura-petal);
                    animation: pulse 2s infinite;
                }
            ` }} />

            {/* ── Hero ── */}
            <section className="lp-hero" ref={heroRef}>
                <div className="lp-orb" style={{ width: '600px', height: '600px', background: 'var(--sakura-petal)', top: '-150px', right: '-100px' }} />
                <div className="lp-orb" style={{ width: '400px', height: '400px', background: 'var(--sakura-deep)', bottom: '50px', left: '-150px', opacity: 0.1 }} />
                
                <PetalBackground />

                <motion.div style={{ y: yHero, opacity: opacityHero, position: 'relative', zIndex: 2 }}>
                    <div className="lp-live-badge">
                        <span className="lp-live-dot" />
                        🌸 PLANORA V1 — BUILT FOR BUILDERS
                    </div>

                    <h1 className="lp-headline">
                        Architect your<br />
                        <span style={{ color: 'var(--sakura-deep)', fontStyle: 'italic', fontWeight: 400 }}>ideas</span> with AI.
                    </h1>

                    <p className="lp-subtitle">
                        The elite standard for project architecture. Precision technical roadmaps that turn messy ideas into structured reality.
                    </p>

                    <div className="lp-cta-group">
                        <Link to={currentUser ? '/generate' : '/auth'} className="btn-primary" style={{ padding: '18px 48px', fontSize: '18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {currentUser ? 'Generate Now' : 'Join the Alpha'} <ArrowRight size={20} />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    className="lp-mock"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{ position: 'relative', zIndex: 2 }}
                >
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                        {['#F4A7B9', '#F4C2A1', '#A8D5A2'].map((c, i) => (
                            <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                        <div style={{ borderLeft: '3.5px solid var(--sakura-petal)', paddingLeft: '24px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800, letterSpacing: '0.1em' }}>DOMAIN</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--sakura-bark)', fontFamily: 'var(--font-display)' }}>Fintech & Payments</div>
                        </div>
                        <div style={{ borderLeft: '3.5px solid var(--sakura-deep)', paddingLeft: '24px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800, letterSpacing: '0.1em' }}>ARCHITECTURE</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--sakura-bark)', fontFamily: 'var(--font-display)' }}>Event-Driven Ops</div>
                        </div>
                        <div style={{ borderLeft: '3.5px solid var(--sakura-bark)', paddingLeft: '24px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800, letterSpacing: '0.1em' }}>RESUME SCORE</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--sakura-bark)', fontFamily: 'var(--font-display)' }}>9.8 Impact</div>
                        </div>
                    </div>

                    <div style={{ padding: '28px', background: 'rgba(61,26,36,0.04)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sakura-deep)', marginBottom: '16px' }}>
                            <Sparkles size={18} />
                            <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em', fontFamily: 'var(--font-sans)' }}>AI ENGINE ACTIVE</span>
                        </div>
                        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, display: 'block' }}>
                            {"{"}<br />
                            &nbsp;&nbsp;"framework": "Next.js 14 App Router",<br />
                            &nbsp;&nbsp;"database": "PostgreSQL + Neon DB",<br />
                            &nbsp;&nbsp;"auth": "NextAuth.js (Discord/GitHub)",<br />
                            &nbsp;&nbsp;"messaging": "Upstash Redis + Kafka"<br />
                            {"}"}
                        </code>
                    </div>
                </motion.div>
            </section>

            {/* ── Stats ── */}
            <section className="lp-stats-row">
                {statsData.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 6vw, 64px)', fontWeight: 700, color: 'var(--sakura-deep)', lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '10px', letterSpacing: '0.1em' }}>{s.label}</div>
                    </motion.div>
                ))}
            </section>

            {/* ── Features (Horizontal Scroll) ── */}
            <HorizontalFeatures features={features} />

            {/* ── Footer ── */}
            <footer style={{ padding: '100px 5% 60px', textAlign: 'center', background: 'var(--sakura-mist)', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, marginBottom: '32px', color: 'var(--sakura-bark)', letterSpacing: '-0.02em' }}>🌸 Planora</div>
                <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600, marginBottom: '48px', fontFamily: 'var(--font-sans)' }}>
                    <span>Product</span><span>Resources</span><span>Twitter</span><span>Legal</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>© 2026 Planora. Powered by Cherry Blossoms & Gemini.</div>
            </footer>
        </div>
    );
};

export default Landing;
