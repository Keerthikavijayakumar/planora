import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Flower, LayoutDashboard, BookMarked, Crown, Sparkles, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
        return currentUser.email.charAt(0).toUpperCase();
    };

    const navStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled
            ? 'rgba(255, 245, 248, 0.88)'
            : 'rgba(255, 245, 248, 0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(244, 167, 185, 0.35)' : 'rgba(244, 167, 185, 0.15)'}`,
        transition: 'all 0.4s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(192, 87, 107, 0.08)' : 'none',
    };

    const linkStyle = {
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        padding: '8px 14px',
        borderRadius: '10px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                .nav-link { color: var(--text-secondary); }
                .nav-link:hover { color: var(--sakura-deep) !important; background: var(--sakura-blush) !important; }
                .nav-cta-btn {
                    background: var(--gradient-sakura);
                    color: #fff;
                    font-weight: 600;
                    padding: 9px 22px;
                    border-radius: 100px;
                    font-size: 13px;
                    text-decoration: none;
                    font-family: var(--font-sans);
                    box-shadow: 0 4px 16px rgba(192, 87, 107, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                }
                .nav-cta-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(192, 87, 107, 0.4);
                }
                .nav-logo {
                    font-family: var(--font-display);
                    font-size: 26px;
                    font-weight: 600;
                    color: var(--sakura-bark);
                    letter-spacing: -0.01em;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: opacity 0.2s;
                }
                .nav-logo:hover { opacity: 0.8; }
                .nav-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    background: var(--gradient-sakura);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    color: #fff;
                    flex-shrink: 0;
                }
                .nav-user-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px 4px 4px;
                    border-radius: 12px;
                    background: var(--sakura-blush);
                    border: 1px solid var(--glass-border);
                }
                .nav-logout-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }
                .nav-logout-btn:hover {
                    color: var(--sakura-deep);
                    background: var(--sakura-blush);
                }
                .mobile-menu {
                    padding: 16px 20px 24px;
                    border-top: 1px solid var(--glass-border);
                    background: rgba(255, 245, 248, 0.96);
                    backdrop-filter: blur(24px);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .mobile-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    padding: 12px 16px;
                    font-size: 15px;
                    font-weight: 500;
                    font-family: var(--font-sans);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }
                .mobile-link:hover { background: var(--sakura-blush); color: var(--sakura-deep); }
            ` }} />

            <nav style={navStyle}>
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
                    <Link to="/" className="nav-logo">
                        <span style={{ color: 'var(--sakura-petal)', fontSize: '22px' }}>🌸</span>
                        Planora
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px' }}>
                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="nav-link" style={linkStyle}>
                                    <LayoutDashboard size={15} /> Dashboard
                                </Link>
                                <Link to="/saved" className="nav-link" style={linkStyle}>
                                    <BookMarked size={15} /> Library
                                </Link>
                                <Link to="/premium" className="nav-link" style={{ ...linkStyle, color: 'var(--sakura-deep)', fontWeight: 700 }}>
                                    <Crown size={15} /> Premium
                                </Link>
                                <Link to="/generate" className="nav-cta-btn" style={{ marginLeft: '8px' }}>
                                    <Sparkles size={14} /> New Blueprint
                                </Link>
                                <div className="nav-user-chip" style={{ marginLeft: '12px' }}>
                                    <div className="nav-avatar">{getInitials()}</div>
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {currentUser.email?.split('@')[0]}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="nav-logout-btn">
                                    <LogOut size={17} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth" style={{
                                    ...linkStyle,
                                    border: '1.5px solid var(--glass-border)',
                                    borderRadius: '100px',
                                    padding: '8px 20px',
                                    marginRight: '6px',
                                }} className="nav-link">
                                    Log In
                                </Link>
                                <Link to="/auth" className="nav-cta-btn">
                                    Get Started →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ background: 'none', border: 'none', color: 'var(--sakura-bark)', cursor: 'pointer', padding: '6px' }}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="mobile-menu md:hidden">
                        {currentUser ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div className="nav-avatar" style={{ width: '38px', height: '38px', borderRadius: '12px', fontSize: '16px' }}>{getInitials()}</div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.email?.split('@')[0]}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="mobile-link"><LayoutDashboard size={16} />Dashboard</Link>
                                <Link to="/saved" onClick={() => setMobileOpen(false)} className="mobile-link"><BookMarked size={16} />Library</Link>
                                <Link to="/premium" onClick={() => setMobileOpen(false)} className="mobile-link" style={{ color: 'var(--sakura-deep)', fontWeight: 700 }}><Crown size={16} />Premium</Link>
                                <Link to="/generate" onClick={() => setMobileOpen(false)} className="mobile-link" style={{ color: 'var(--sakura-deep)', fontWeight: 800 }}><Sparkles size={16} />New Blueprint</Link>
                                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="mobile-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: '100%', textAlign: 'left' }}><LogOut size={16} />Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth" onClick={() => setMobileOpen(false)} className="mobile-link">Log In</Link>
                                <Link to="/auth" onClick={() => setMobileOpen(false)} className="nav-cta-btn" style={{ marginTop: '8px', justifyContent: 'center' }}>Get Started →</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
