import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Floating Petal Background (Consistent with Landing) ─── */
const PETALS = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 15}s`,
    size: `${12 + Math.random() * 18}px`,
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

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, googleSignIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            await googleSignIn();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--sakura-mist)',
            fontFamily: 'var(--font-sans)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'var(--sakura-petal)', top: '-200px', right: '-150px', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'var(--sakura-deep)', bottom: '-100px', left: '-100px', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }} />
            
            <PetalBackground />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                style={{
                    width: '100%',
                    maxWidth: '460px',
                    padding: '56px 48px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '32px',
                    border: '1.5px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-hover)',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                    <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '22px',
                            background: 'var(--gradient-sakura)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: 'var(--shadow-btn)',
                        }}
                    >
                        <Brain size={36} color="#fff" />
                    </motion.div>
                    <h1 style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontSize: '38px', 
                        fontWeight: 700, 
                        color: 'var(--sakura-bark)', 
                        marginBottom: '10px', 
                        letterSpacing: '-0.02em' 
                    }}>
                        {isLogin ? 'Welcome back' : 'Create Account'}
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {isLogin ? 'Enter your details to sign in' : 'Start your project architecture journey'}
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            padding: '14px 20px',
                            borderRadius: '14px',
                            background: '#fff5f5',
                            border: '1px solid #feb2b2',
                            color: '#c53030',
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                        <span style={{ fontSize: '18px' }}>⚠️</span> {error}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 800, fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px', letterSpacing: '0.12em' }}>EMAIL ADDRESS</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sakura-petal)' }} />
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field"
                                style={{
                                    paddingLeft: '52px',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 800, fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px', letterSpacing: '0.12em' }}>PASSWORD</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sakura-petal)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field"
                                style={{
                                    paddingLeft: '52px',
                                    paddingRight: '52px',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '18px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px' }}>
                        {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Get Started'}
                        <ArrowRight size={20} />
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    margin: '36px 0',
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Social Sign In</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                </div>

                {/* Google Button */}
                <button onClick={handleGoogle} disabled={loading} style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '100px',
                    background: '#fff',
                    border: '1.5px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow: 'var(--shadow-soft)',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--sakura-mist)'; e.currentTarget.style.borderColor = 'var(--sakura-petal)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'none'; }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Toggle */}
                <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {isLogin ? "New to Planora? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ color: 'var(--sakura-deep)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, marginLeft: '6px', padding: '4px 0', borderBottom: '2.5px solid var(--sakura-petal)', transition: 'all 0.3s ease' }}
                    >
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                </p>
            </motion.div>

            {/* Footer Reference */}
            <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                🌸 POWERED BY PLANORA CORE
            </div>
        </div>
    );
};

export default Auth;
