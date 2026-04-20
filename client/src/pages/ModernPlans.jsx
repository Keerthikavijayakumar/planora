import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight, Star, Shield, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Floating Petal Background ─── */
const PETALS = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${12 + Math.random() * 14}s`,
    size: `${13 + Math.random() * 16}px`,
}));

const PetalBg = () => (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {PETALS.map(p => (
            <span key={p.id} className="petal" style={{
                left: p.left, top: '-60px',
                fontSize: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
            }}>🌸</span>
        ))}
    </div>
);

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: d, ease: [0.23, 1, 0.32, 1] } }),
};

/* ─── Plan data ─── */
const plans = [
    {
        id: 'free',
        icon: <Sparkles size={28} />,
        label: 'Free',
        price: '₹0',
        period: 'forever',
        tagline: 'Start building today',
        popular: false,
        cta: 'Get Started Free',
        color: 'var(--sakura-petal)',
        features: [
            '5 blueprints per week',
            'AI-generated project ideas',
            'Basic tech stack suggestions',
            'Save up to 10 ideas',
            'Community support',
        ],
    },
    {
        id: 'pro',
        icon: <Crown size={28} />,
        label: 'Pro',
        price: '₹499',
        period: '/month',
        tagline: 'For serious builders',
        popular: true,
        cta: 'Upgrade to Pro',
        color: 'var(--sakura-deep)',
        features: [
            'Unlimited blueprints',
            'Advanced AI insights',
            'Full tech stack & API design',
            'Database schema generation',
            'Security & testing strategies',
            'Export to PDF / Markdown',
            'Priority AI queue',
            'Advanced analytics dashboard',
        ],
    },
    {
        id: 'team',
        icon: <Rocket size={28} />,
        label: 'Team',
        price: '₹4,999',
        period: '/year',
        tagline: 'Save 17% — Best value',
        popular: false,
        cta: 'Get Annual Plan',
        color: 'var(--sakura-bark)',
        features: [
            'Everything in Pro',
            'Custom project templates',
            'Team collaboration (up to 5)',
            'Private idea vault',
            'Dedicated support',
            'Early access to new features',
        ],
    },
];

const ModernPlans = () => {
    const { currentUser } = useAuth();
    const [hoveredPlan, setHoveredPlan] = useState(null);

    return (
        <div style={{
            fontFamily: 'var(--font-sans)',
            minHeight: '100vh',
            background: 'var(--gradient-page)',
            backgroundAttachment: 'fixed',
            color: 'var(--text-primary)',
            paddingTop: '88px',
            position: 'relative',
            overflowX: 'hidden',
        }}>
            <PetalBg />

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 100px', position: 'relative', zIndex: 1 }}>

                {/* ── Header ── */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={0}
                    style={{ textAlign: 'center', marginBottom: '72px' }}
                >
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 22px',
                        background: 'var(--sakura-blush)',
                        border: '1.5px solid var(--glass-border)',
                        borderRadius: '100px',
                        marginBottom: '28px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        color: 'var(--sakura-deep)',
                    }}>
                        <Crown size={14} />
                        PLANORA PREMIUM
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(42px, 7vw, 80px)',
                        fontWeight: 700,
                        lineHeight: 0.95,
                        letterSpacing: '-0.03em',
                        color: 'var(--sakura-bark)',
                        marginBottom: '24px',
                    }}>
                        Build Without<br />
                        <span style={{
                            background: 'var(--gradient-text)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            animation: 'shimmer 4s linear infinite',
                        }}>Limits.</span>
                    </h1>

                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'clamp(17px, 2vw, 21px)',
                        color: 'var(--text-secondary)',
                        maxWidth: '580px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                        fontWeight: 400,
                    }}>
                        Unlock unlimited AI blueprints, complete implementation details, and tools that turn ideas into shipped products.
                    </p>
                </motion.div>

                {/* ── Pricing Cards ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                    gap: '24px',
                    marginBottom: '80px',
                    alignItems: 'start',
                }}>
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial="hidden"
                            animate="show"
                            variants={fadeUp}
                            custom={0.1 + i * 0.12}
                            onHoverStart={() => setHoveredPlan(plan.id)}
                            onHoverEnd={() => setHoveredPlan(null)}
                            style={{
                                position: 'relative',
                                background: plan.popular
                                    ? 'linear-gradient(145deg, rgba(192,87,107,0.07), rgba(244,167,185,0.12))'
                                    : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(253,232,238,0.65))',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                border: plan.popular
                                    ? '2px solid var(--sakura-petal)'
                                    : '1px solid var(--glass-border)',
                                borderRadius: '24px',
                                padding: plan.popular ? '44px 36px 40px' : '36px',
                                boxShadow: plan.popular ? 'var(--shadow-hover)' : 'var(--shadow-card)',
                                transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                                cursor: 'default',
                            }}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-14px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--gradient-sakura)',
                                    color: '#fff',
                                    padding: '5px 20px',
                                    borderRadius: '100px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    whiteSpace: 'nowrap',
                                    boxShadow: 'var(--shadow-btn)',
                                }}>⭐ MOST POPULAR</div>
                            )}

                            {/* Icon */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: plan.popular
                                    ? 'var(--gradient-sakura)'
                                    : 'var(--sakura-blush)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                color: plan.popular ? '#fff' : 'var(--sakura-deep)',
                                boxShadow: plan.popular ? '0 8px 24px rgba(192,87,107,0.3)' : 'none',
                            }}>
                                {plan.icon}
                            </div>

                            {/* Label & tagline */}
                            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '26px',
                                    fontWeight: 700,
                                    color: 'var(--sakura-bark)',
                                    margin: 0,
                                }}>{plan.label}</h3>
                            </div>
                            <p style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                color: 'var(--text-muted)',
                                marginBottom: '24px',
                                fontWeight: 500,
                            }}>{plan.tagline}</p>

                            {/* Price */}
                            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '52px',
                                    fontWeight: 700,
                                    color: plan.popular ? 'var(--sakura-deep)' : 'var(--sakura-bark)',
                                    lineHeight: 1,
                                    letterSpacing: '-0.03em',
                                }}>{plan.price}</span>
                                <span style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '15px',
                                    color: 'var(--text-muted)',
                                    fontWeight: 500,
                                }}>{plan.period}</span>
                            </div>

                            {/* CTA Button */}
                            {plan.id === 'free' ? (
                                <Link
                                    to={currentUser ? '/generate' : '/auth'}
                                    className="btn-secondary"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        textDecoration: 'none',
                                        marginBottom: '28px',
                                        padding: '13px 24px',
                                        fontSize: '15px',
                                    }}
                                >
                                    {plan.cta}
                                </Link>
                            ) : (
                                <button
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        marginBottom: '28px',
                                        padding: '14px',
                                        fontSize: '15px',
                                        background: plan.popular ? 'var(--gradient-sakura)' : undefined,
                                    }}
                                >
                                    {plan.cta} <ArrowRight size={16} style={{ marginLeft: '6px', display: 'inline', verticalAlign: 'middle' }} />
                                </button>
                            )}

                            {/* Divider */}
                            <hr className="sakura-divider" style={{ marginBottom: '24px' }} />

                            {/* Feature list */}
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {plan.features.map((feat, j) => (
                                    <li key={j} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '14.5px',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.4,
                                    }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '6px',
                                            background: plan.popular ? 'rgba(192,87,107,0.12)' : 'var(--sakura-blush)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginTop: '1px',
                                        }}>
                                            <Check size={13} color={plan.popular ? 'var(--sakura-deep)' : 'var(--sakura-petal)'} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* ── Trust badges ── */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={0.5}
                    style={{
                        display: 'flex',
                        gap: '32px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '80px',
                    }}
                >
                    {[
                        { icon: <Shield size={18} />, text: 'No hidden fees' },
                        { icon: <Star size={18} />, text: '5.0★ average rating' },
                        { icon: <Zap size={18} />, text: 'Cancel anytime' },
                    ].map((b, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 22px',
                            background: 'rgba(255,255,255,0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '100px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--sakura-deep)',
                        }}>
                            {b.icon}
                            {b.text}
                        </div>
                    ))}
                </motion.div>

                {/* ── CTA Banner ── */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={0.6}
                    style={{
                        textAlign: 'center',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.88), rgba(253,232,238,0.7))',
                        backdropFilter: 'blur(28px)',
                        border: '1.5px solid var(--glass-border)',
                        borderRadius: '28px',
                        padding: '60px 40px',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: 'var(--gradient-sakura)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 16px 32px rgba(192,87,107,0.35)',
                        animation: 'pulse-glow 2.5s ease-in-out infinite',
                    }}>
                        <Zap size={36} color="#fff" />
                    </div>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(28px, 4vw, 44px)',
                        fontWeight: 700,
                        color: 'var(--sakura-bark)',
                        marginBottom: '14px',
                        letterSpacing: '-0.02em',
                    }}>
                        Ready to architect the future?
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '17px',
                        color: 'var(--text-secondary)',
                        maxWidth: '500px',
                        margin: '0 auto 36px',
                        lineHeight: 1.6,
                    }}>
                        Join thousands of developers who've turned ideas into shipped projects with Planora's AI blueprints.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {currentUser ? (
                            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>
                                Upgrade Now <Crown size={18} style={{ marginLeft: '8px', display: 'inline', verticalAlign: 'middle' }} />
                            </button>
                        ) : (
                            <Link to="/auth" className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px', textDecoration: 'none' }}>
                                Start Free Today <ArrowRight size={18} style={{ marginLeft: '8px', display: 'inline', verticalAlign: 'middle' }} />
                            </Link>
                        )}
                        <Link to="/generate" className="btn-secondary" style={{ padding: '16px 36px', fontSize: '16px', textDecoration: 'none' }}>
                            Try for Free First
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ModernPlans;
