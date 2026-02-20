import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const getInitials = () => {
        if (!currentUser?.email) return '?';
        const name = currentUser.email.split('@')[0];
        return name.charAt(0).toUpperCase();
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px',
            }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Sparkles size={18} color="#fff" />
                    </div>
                    <span style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#1a1a1a',
                        letterSpacing: '-0.02em',
                        fontFamily: "'Playfair Display', serif",
                    }}>Planora</span>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    className="hidden md:flex"
                >
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 400, padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#1a1a1a'}
                                onMouseLeave={e => e.target.style.color = '#888'}
                            >Dashboard</Link>
                            <Link to="/generate" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px', textDecoration: 'none' }}>
                                New Idea
                            </Link>
                            <Link to="/saved" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 400, padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#1a1a1a'}
                                onMouseLeave={e => e.target.style.color = '#888'}
                            >Saved</Link>
                            <Link to="/premium" style={{ color: '#D4A017', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}
                                onMouseEnter={e => { e.target.style.background = 'rgba(255,215,0,0.15)'; e.target.style.borderColor = 'rgba(255,215,0,0.3)'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(255,215,0,0.08)'; e.target.style.borderColor = 'rgba(255,215,0,0.2)'; }}
                            >👑 Premium</Link>

                            {/* User Profile */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                marginLeft: '8px', padding: '4px 12px 4px 4px',
                                borderRadius: '12px', background: 'rgba(212, 114, 122, 0.06)',
                                border: '1px solid rgba(212, 114, 122, 0.1)',
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 700, color: '#fff',
                                }}>
                                    {getInitials()}
                                </div>
                                <span style={{ fontSize: '13px', color: '#555', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentUser.email?.split('@')[0]}
                                </span>
                            </div>

                            <button onClick={handleLogout} style={{
                                background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '8px',
                                display: 'flex', alignItems: 'center', transition: 'color 0.2s'
                            }}
                                onMouseEnter={e => e.target.style.color = '#1a1a1a'}
                                onMouseLeave={e => e.target.style.color = '#aaa'}
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 400, padding: '8px 16px' }}
                                onMouseEnter={e => e.target.style.color = '#1a1a1a'}
                                onMouseLeave={e => e.target.style.color = '#888'}
                            >Login</Link>
                            <Link to="/auth" className="btn-primary" style={{ padding: '8px 24px', fontSize: '13px', textDecoration: 'none' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{ background: 'none', border: 'none', color: '#1a1a1a', cursor: 'pointer' }}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div style={{
                    padding: '16px 24px 24px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}
                    className="md:hidden"
                >
                    {currentUser ? (
                        <>
                            {/* Mobile Profile */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 0', marginBottom: '8px',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #D4727A, #E8A0A6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '15px', fontWeight: 700, color: '#fff',
                                }}>
                                    {getInitials()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{currentUser.email?.split('@')[0]}</div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>{currentUser.email}</div>
                                </div>
                            </div>
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: '#555', textDecoration: 'none', padding: '12px 0', fontSize: '15px' }}>Dashboard</Link>
                            <Link to="/generate" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-accent)', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600 }}>+ New Idea</Link>
                            <Link to="/saved" onClick={() => setMobileOpen(false)} style={{ color: '#555', textDecoration: 'none', padding: '12px 0', fontSize: '15px' }}>Saved Ideas</Link>
                            <Link to="/premium" onClick={() => setMobileOpen(false)} style={{ color: '#D4A017', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600 }}>👑 Premium</Link>
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ color: '#999', background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer', textAlign: 'left' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" onClick={() => setMobileOpen(false)} style={{ color: '#555', textDecoration: 'none', padding: '12px 0', fontSize: '15px' }}>Login</Link>
                            <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center', marginTop: '8px' }}>Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
