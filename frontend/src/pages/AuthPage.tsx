/**
 * Auth Page (Login / Signup)
 * Handles both login and signup with email and Google
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthPageProps {
    mode: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                if (!name.trim()) {
                    setError('Name is required');
                    setLoading(false);
                    return;
                }
                await signup(email, password, name);
            }
            navigate('/dashboard');
        } catch (err: any) {
            const code = err.code || '';
            if (code.includes('user-not-found')) setError('No account found with this email');
            else if (code.includes('wrong-password')) setError('Incorrect password');
            else if (code.includes('email-already-in-use')) setError('An account already exists with this email');
            else if (code.includes('weak-password')) setError('Password must be at least 6 characters');
            else if (code.includes('invalid-email')) setError('Please enter a valid email address');
            else setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                position: 'relative',
            }}
        >
            <div className="animated-bg" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '2.5rem',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}
                    >
                        <BrainCircuit size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {mode === 'login'
                            ? 'Sign in to continue your practice'
                            : 'Start your interview preparation journey'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: '#f87171',
                            fontSize: '0.85rem',
                            marginBottom: '1.25rem',
                        }}
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                {/* Google Login */}
                <button onClick={handleGoogleLogin} className="btn-google" type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        margin: '1.5rem 0',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                    }}
                >
                    <div style={{ flex: 1, height: '1px', background: 'rgba(99, 102, 241, 0.15)' }} />
                    or
                    <div style={{ flex: 1, height: '1px', background: 'rgba(99, 102, 241, 0.15)' }} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mode === 'signup' && (
                        <div style={{ position: 'relative' }}>
                            <User
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }}
                            />
                            <input
                                id="name-input"
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail
                            size={16}
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }}
                        />
                        <input
                            id="email-input"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock
                            size={16}
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }}
                        />
                        <input
                            id="password-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.25rem',
                            }}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}
                    >
                        {loading ? (
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.6s linear infinite',
                                }}
                            />
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <Link
                        to={mode === 'login' ? '/signup' : '/login'}
                        style={{ color: 'var(--primary-400)', fontWeight: 600, textDecoration: 'none' }}
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </Link>
                </p>
            </motion.div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default AuthPage;
