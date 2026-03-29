import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
            backgroundColor: '#ffffff',
            fontFamily: "'Poppins', sans-serif",
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '48px',
                    background: '#f9fafb',
                    borderRadius: '32px',
                    border: '1px solid #f3f4f6',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 28px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    }}>
                        <Sparkles size={32} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', marginBottom: '12px', letterSpacing: '-0.05em' }}>
                        {isLogin ? 'Welcome back' : 'Join Planora'}
                    </h1>
                    <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>
                        {isLogin ? 'Enter your details to sign in' : 'Create an account to start building'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#b91c1c',
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '24px',
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 800, fontSize: '12px', color: '#374151', marginLeft: '4px', letterSpacing: '0.05em' }}>EMAIL</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '18px 18px 18px 52px',
                                    borderRadius: '18px',
                                    border: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#000'; e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.03)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 800, fontSize: '12px', color: '#374151', marginLeft: '4px', letterSpacing: '0.05em' }}>PASSWORD</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '18px 52px 18px 52px',
                                    borderRadius: '18px',
                                    border: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#000'; e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.03)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '18px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px' }}>
                        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={20} />
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    margin: '32px 0',
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                {/* Google Button */}
                <button onClick={handleGoogle} disabled={loading} style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '18px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    color: '#111827',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
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
                <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                    {isLogin ? "New to Planora? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ color: '#111827', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, marginLeft: '4px', padding: '4px 0', borderBottom: '2px solid #000', transition: 'all 0.2s ease' }}
                    >
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
