import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Layers, Brain, Target, Zap, ArrowRight, Check, ChevronRight } from 'lucide-react';

const Landing = () => {
    const { currentUser } = useAuth();

    const features = [
        { icon: <Brain size={24} />, title: "Domain Intelligence", desc: "AI generates ideas tailored to your specific CS domain — AI/ML, Web, Mobile, Cybersecurity & more." },
        { icon: <Layers size={24} />, title: "Skill Adaptation", desc: "Get recommendations matching your experience level, from Fresher learning paths to Advanced architectures." },
        { icon: <Target size={24} />, title: "Market Scoring", desc: "Every blueprint includes Market Potential, Difficulty, and Resume Impact scores to help you prioritize." },
        { icon: <Zap size={24} />, title: "Instant Blueprints", desc: "Complete project architecture in seconds — features, tech stack, roadmap, and differentiation." },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
    };

    return (
        <div className="modern-landing-root" style={{ 
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: '#ffffff',
            color: '#111827',
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .hero-section {
                    padding: 160px 5% 100px;
                    text-align: center;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .hero-headline {
                    font-size: clamp(48px, 8vw, 92px);
                    font-weight: 800;
                    line-height: 0.95;
                    letter-spacing: -0.05em;
                    color: #000;
                    margin-bottom: 32px;
                }
                .hero-subtitle {
                    font-size: clamp(18px, 2vw, 22px);
                    color: #4b5563;
                    max-width: 700px;
                    margin: 0 auto 48px;
                    line-height: 1.5;
                }
                .cta-group {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    margin-bottom: 80px;
                }
                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    padding: 80px 5%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .feature-card {
                    padding: 40px;
                    border-radius: 24px;
                    background: #f9fafb;
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                }
                .feature-card:hover {
                    background: #fff;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                    transform: translateY(-5px);
                }
                .mock-preview {
                    background: #000;
                    border-radius: 32px;
                    padding: 40px;
                    margin: 0 5%;
                    color: #fff;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.2);
                    max-width: 1100px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 700;
                    margin-bottom: 32px;
                    color: #000;
                    letter-spacing: 0.02em;
                }
                .nav-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                }
            ` }} />

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="status-badge">
                        <div className="nav-dot"></div>
                        v1.0 is now live — start building today
                    </div>

                    <h1 className="hero-headline">
                        Architect your ideas<br /> 
                        at the speed of AI.
                    </h1>
                    
                    <p className="hero-subtitle">
                        The new standard for project architecture. Stop guessing and start building with precision engineering roadmaps tailored to you.
                    </p>

                    <div className="cta-group">
                        <Link to={currentUser ? "/generate" : "/auth"} className="btn-primary" style={{ padding: '16px 48px', fontSize: '18px', textDecoration: 'none' }}>
                            {currentUser ? 'Generate Now' : 'Start for free'} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Visual Preview */}
            <motion.div 
                className="mock-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            >
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#374151' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#374151' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#374151' }}></div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                    <div style={{ borderLeft: '2px solid #10b981', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: 600 }}>DOMAIN</div>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>Fintech & Payments</div>
                    </div>
                    <div style={{ borderLeft: '2px solid #8b5cf6', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: 600 }}>ARCHITECTURE</div>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>Micro-services</div>
                    </div>
                    <div style={{ borderLeft: '2px solid #f59e0b', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: 600 }}>SCORING</div>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>9.8 Impact</div>
                    </div>
                </div>

                <div style={{ marginTop: '60px', padding: '32px', background: '#111827', borderRadius: '20px', border: '1px solid #374151' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '16px' }}>
                        <Sparkles size={18} />
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>AI RECOMMENDATION</span>
                    </div>
                    <code style={{ color: '#d1d5db', fontSize: '15px', lineHeight: 1.6 }}>
                        {"{"}<br />
                        &nbsp;&nbsp;"frontend": "Next.js 14 (App Router)",<br />
                        &nbsp;&nbsp;"state_mgmt": "Zustand + React Query",<br />
                        &nbsp;&nbsp;"security": "Plaid API + JWT Auth",<br />
                        &nbsp;&nbsp;"deploy": "Vercel + Edge Functions"<br />
                        {"}"}
                    </code>
                </div>
            </motion.div>

            {/* Features */}
            <motion.section 
                className="feature-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {features.map((f, i) => (
                    <motion.div key={i} className="feature-card" variants={itemVariants}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            background: '#000', 
                            color: '#fff', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            {f.icon}
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#000' }}>{f.title}</h3>
                        <p style={{ fontSize: '15px', color: '#4b5563', fontWeight: 500, lineHeight: 1.6 }}>{f.desc}</p>
                    </motion.div>
                ))}
            </motion.section>

            {/* Footer */}
            <footer style={{ padding: '80px 5% 60px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, marginBottom: '32px', letterSpacing: '-0.05em' }}>Planora</div>
                <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                    <span>Product</span>
                    <span>Company</span>
                    <span>Resources</span>
                    <span>Legal</span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '40px' }}>
                    © 2026 Planora. All rights reserved. Built with AI.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
