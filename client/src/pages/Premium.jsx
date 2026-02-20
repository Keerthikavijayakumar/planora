import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Premium = () => {
    const { currentUser } = useAuth();

    const features = {
        free: [
            '5 blueprints per week',
            'AI-generated project ideas',
            'Basic tech stack recommendations',
            'Save up to 10 ideas',
            'Weekly limit reset'
        ],
        premium: [
            'Unlimited blueprints',
            'Advanced AI insights',
            'Technical implementation details',
            'API structure & database schema',
            'Security & testing strategies',
            'Priority support',
            'Export to PDF/Markdown',
            'Team collaboration features',
            'Custom project templates',
            'Advanced analytics dashboard'
        ]
    };

    const pricingPlans = [
        {
            name: 'Monthly',
            price: '₹499',
            period: '/month',
            description: 'Billed monthly',
            popular: false
        },
        {
            name: 'Annual',
            price: '₹4,999',
            period: '/year',
            description: 'Save ₹989 (17% off)',
            popular: true
        }
    ];

    return (
        <div className="page-premium" style={{ minHeight: '100vh', paddingTop: '88px', padding: '88px 24px 60px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fadeInUp">
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 20px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,193,7,0.1))',
                        border: '1px solid rgba(255,215,0,0.3)',
                        marginBottom: '24px'
                    }}>
                        <Crown size={16} style={{ color: '#FFD700' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#D4A017' }}>Upgrade to Premium</span>
                    </div>
                    <h1 className="heading-serif" style={{ fontSize: '42px', fontWeight: 800, color: '#1a1a1a', marginBottom: '16px' }}>
                        Unlock Unlimited Creativity
                    </h1>
                    <p style={{ fontSize: '18px', color: '#666', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
                        Generate unlimited project blueprints with advanced AI insights and technical implementation details
                    </p>
                </div>

                {/* Pricing Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '60px', maxWidth: '800px', margin: '0 auto 60px' }}>
                    {pricingPlans.map((plan, i) => (
                        <div 
                            key={i} 
                            className="glass-card animate-fadeInUp"
                            style={{
                                padding: '36px 32px',
                                textAlign: 'center',
                                position: 'relative',
                                border: plan.popular ? '2px solid var(--color-accent)' : '1px solid rgba(0,0,0,0.08)',
                                background: plan.popular ? 'linear-gradient(135deg, rgba(212,114,122,0.03), rgba(232,160,166,0.03))' : 'rgba(255,255,255,0.95)',
                                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s ease',
                                animationDelay: `${i * 0.1}s`
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    padding: '4px 16px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Most Popular</div>
                            )}
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>{plan.name}</h3>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-accent)' }}>{plan.price}</span>
                                <span style={{ fontSize: '16px', color: '#888' }}>{plan.period}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>{plan.description}</p>
                            <button 
                                className="btn-primary" 
                                style={{ 
                                    width: '100%', 
                                    padding: '14px', 
                                    fontSize: '15px',
                                    background: plan.popular ? 'linear-gradient(135deg, #D4727A, #E8A0A6)' : undefined
                                }}
                            >
                                Get Started <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Feature Comparison */}
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 className="heading-serif" style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '40px' }}>
                        Compare Plans
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Free Plan */}
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(100,100,100,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Sparkles size={24} color="#888" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>Free</h3>
                                    <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>₹0/month</p>
                                </div>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {features.free.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#555' }}>
                                        <Check size={18} style={{ color: '#888', flexShrink: 0, marginTop: '2px' }} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Premium Plan */}
                        <div className="glass-card" style={{
                            padding: '32px',
                            background: 'linear-gradient(135deg, rgba(212,114,122,0.06), rgba(232,160,166,0.06))',
                            border: '2px solid rgba(212,114,122,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Crown size={24} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: '2px' }}>Premium</h3>
                                    <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>From ₹416/month</p>
                                </div>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {features.premium.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#555' }}>
                                        <Check size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div 
                    className="glass-card animate-fadeInUp" 
                    style={{
                        marginTop: '60px',
                        padding: '48px 40px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(212,114,122,0.08), rgba(232,160,166,0.08))',
                        border: '1px solid rgba(212,114,122,0.2)'
                    }}
                >
                    <Zap size={40} style={{ color: 'var(--color-accent)', marginBottom: '20px' }} />
                    <h2 className="heading-serif" style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>
                        Ready to Build Without Limits?
                    </h2>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
                        Join hundreds of developers who've accelerated their portfolio building journey with Planora Premium
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {currentUser ? (
                            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
                                Upgrade Now <Crown size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        ) : (
                            <Link to="/auth" className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px', textDecoration: 'none' }}>
                                Sign Up to Continue
                            </Link>
                        )}
                        <Link to="/generate" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '15px', textDecoration: 'none' }}>
                            Try Free First
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Premium;
