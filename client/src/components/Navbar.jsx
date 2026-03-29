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
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        color: '#000',
                        letterSpacing: '-0.04em',
                        fontFamily: "'Poppins', sans-serif",
                    }}>Planora</span>
                </Link>

                {/* Desktop Links */}
                <div
                    className="hidden md:flex"
                    style={{ alignItems: 'center', gap: '8px' }}
                >
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#111827'}
                                onMouseLeave={e => e.target.style.color = '#6b7280'}
                            >Dashboard</Link>
                            <Link to="/saved" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#111827'}
                                onMouseLeave={e => e.target.style.color = '#6b7280'}
                            >Library</Link>
                            <Link to="/premium" style={{ color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}
                            >Premium</Link>
                            <Link to="/generate" className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px', textDecoration: 'none', marginLeft: '8px' }}>
                                New Blueprint
                            </Link>

                            {/* User Profile */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                marginLeft: '16px', padding: '4px 12px 4px 4px',
                                borderRadius: '12px', background: '#f9fafb',
                                border: '1px solid #f3f4f6',
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: '#000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 700, color: '#fff',
                                }}>
                                    {getInitials()}
                                </div>
                                <span style={{ fontSize: '13px', color: '#111827', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            <Link to="/auth" style={{ 
                                color: '#000', 
                                textDecoration: 'none', 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                padding: '8px 20px',
                                borderRadius: '100px',
                                border: '1px solid #e5e7eb',
                                marginRight: '8px'
                            }}
                                onMouseEnter={e => { e.target.style.background = '#f9fafb'; }}
                                onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                            >Log In</Link>
                            <Link to="/auth" style={{ 
                                background: '#000',
                                color: '#fff',
                                padding: '10px 24px', 
                                fontSize: '14px', 
                                fontWeight: 600,
                                textDecoration: 'none',
                                borderRadius: '100px'
                            }}>
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
                    gap: '4px',
                }}
                    className="flex flex-col md:hidden"
                >
                    {currentUser ? (
                        <>
                            {/* Mobile Profile */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 0', marginBottom: '8px',
                                borderBottom: '1px solid #f3f4f6',
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: '#000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '15px', fontWeight: 700, color: '#fff',
                                }}>
                                    {getInitials()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{currentUser.email?.split('@')[0]}</div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{currentUser.email}</div>
                                </div>
                            </div>
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: '#4b5563', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 500 }}>Dashboard</Link>
                            <Link to="/saved" onClick={() => setMobileOpen(false)} style={{ color: '#4b5563', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 500 }}>Library</Link>
                            <Link to="/premium" onClick={() => setMobileOpen(false)} style={{ color: '#000', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 700 }}>Premium</Link>
                            <Link to="/generate" onClick={() => setMobileOpen(false)} style={{ color: '#000', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 800 }}>+ New Blueprint</Link>
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ color: '#9ca3af', background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>Logout</button>
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
