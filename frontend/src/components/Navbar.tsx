/**
 * Navbar Component
 * Responsive navigation with auth state awareness
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    BarChart3,
    User,
    LogOut,
    Menu,
    X,
    BrainCircuit,
} from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = user
        ? [
            { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
            { to: '/interview', label: 'Practice', icon: Mic },
            { to: '/profile', label: 'Profile', icon: User },
        ]
        : [];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'rgba(10, 10, 26, 0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
            }}
        >
            <div
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '64px',
                }}
            >
                {/* Logo */}
                <Link
                    to={user ? '/dashboard' : '/'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                    }}
                >
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <BrainCircuit size={20} color="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                        Interview<span className="gradient-text">AI</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                    }}
                    className="hidden md:flex"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: isActive(link.to) ? 'var(--primary-400)' : 'var(--text-secondary)',
                                background: isActive(link.to) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                transition: 'all var(--transition-fast)',
                            }}
                        >
                            <link.icon size={16} />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Auth Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {user ? (
                        <>
                            <span
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    display: 'none',
                                }}
                                className="md:inline"
                            >
                                {user.displayName || user.email?.split('@')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#f87171',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                }}
                                className="hidden md:flex"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                        >
                            Get Started
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    {user && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                display: 'flex',
                                padding: '0.5rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                            }}
                            className="md:hidden"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && user && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'var(--surface-1)',
                            borderTop: '1px solid rgba(99, 102, 241, 0.1)',
                            padding: '0.5rem 1rem',
                        }}
                        className="md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    textDecoration: 'none',
                                    color: isActive(link.to) ? 'var(--primary-400)' : 'var(--text-secondary)',
                                    fontWeight: 500,
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: '1rem',
                            }}
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
