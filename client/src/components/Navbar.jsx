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

    // Get user initials for avatar
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
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                        background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Sparkles size={18} color="#000" />
                    </div>
                    <span style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                    }}>Planora</span>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    className="hidden md:flex"
                >
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" style={{ color: '#999', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#999'}
                            >Dashboard</Link>
                            <Link to="/generate" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px', textDecoration: 'none' }}>
                                New Idea
                            </Link>
                            <Link to="/saved" style={{ color: '#999', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#999'}
                            >Saved</Link>

                            {/* User Profile */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                marginLeft: '8px', padding: '4px 12px 4px 4px',
                                borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 700, color: '#fff',
                                }}>
                                    {getInitials()}
                                </div>
                                <span style={{ fontSize: '13px', color: '#ccc', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentUser.email?.split('@')[0]}
                                </span>
                            </div>

                            <button onClick={handleLogout} style={{
                                background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '8px',
                                display: 'flex', alignItems: 'center', transition: 'color 0.2s'
                            }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#666'}
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" style={{ color: '#999', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 16px' }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = '#999'}
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
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div style={{
                    padding: '16px 24px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(10, 10, 10, 0.95)',
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
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '15px', fontWeight: 700, color: '#fff',
                                }}>
                                    {getInitials()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{currentUser.email?.split('@')[0]}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{currentUser.email}</div>
                                </div>
                            </div>
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: '#ccc', textDecoration: 'none', padding: '12px 0', fontSize: '15px' }}>Dashboard</Link>
                            <Link to="/generate" onClick={() => setMobileOpen(false)} style={{ color: '#F59E0B', textDecoration: 'none', padding: '12px 0', fontSize: '15px', fontWeight: 600 }}>+ New Idea</Link>
                            <Link to="/saved" onClick={() => setMobileOpen(false)} style={{ color: '#ccc', textDecoration: 'none', padding: '12px 0', fontSize: '15px' }}>Saved Ideas</Link>
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ color: '#666', background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', cursor: 'pointer', textAlign: 'left' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" onClick={() => setMobileOpen(false)} style={{ color: '#ccc', textDecoration: 'none', padding: '12px 0', fontSize: '15px' }}>Login</Link>
                            <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center', marginTop: '8px' }}>Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
