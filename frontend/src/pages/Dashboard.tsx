/**
 * Dashboard Page
 * Shows progress charts, session history, and stats
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSessions } from '../services/api';
import type { SessionData } from '../services/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
} from 'recharts';
import {
    Mic,
    BarChart3,
    TrendingUp,
    Calendar,
    Target,
    Flame,
    ArrowRight,
    Clock,
    Award,
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user, getIdToken } = useAuth();
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const token = await getIdToken();
                if (token) {
                    const result = await getSessions(token);
                    setSessions(result.sessions);
                }
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [getIdToken]);

    // ===== Computed Stats =====
    const totalSessions = sessions.length;
    const avgScore =
        totalSessions > 0
            ? (sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalSessions).toFixed(1)
            : '0.0';
    const bestScore = totalSessions > 0 ? Math.max(...sessions.map((s) => s.overallScore || 0)) : 0;

    // Chart data
    const scoreOverTime = sessions
        .slice(0, 20)
        .reverse()
        .map((s, i) => ({
            session: `#${i + 1}`,
            score: s.overallScore || 0,
            date: new Date(s.createdAt).toLocaleDateString(),
        }));

    const moduleBreakdown = ['hr', 'behavioral', 'technical'].map((mod) => {
        const modSessions = sessions.filter((s) => s.moduleType === mod);
        return {
            module: mod.charAt(0).toUpperCase() + mod.slice(1),
            count: modSessions.length,
            avgScore: modSessions.length
                ? +(modSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / modSessions.length).toFixed(1)
                : 0,
        };
    });

    // Radar chart for latest session
    const latestSession = sessions[0];
    const radarData = latestSession?.feedback?.scores
        ? Object.entries(latestSession.feedback.scores).map(([key, value]) => ({
            subject: key.charAt(0).toUpperCase() + key.slice(1),
            score: value,
            fullMark: 10,
        }))
        : [];

    const getScoreColor = (score: number) => {
        if (score >= 7) return '#34d399';
        if (score >= 4) return '#fbbf24';
        return '#f87171';
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                padding: '5rem 1.5rem 2rem',
                position: 'relative',
            }}
        >
            <div className="animated-bg" />
            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        Welcome back, <span className="gradient-text">{user?.displayName || 'Candidate'}</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Track your interview preparation progress and keep improving.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}
                >
                    {[
                        { label: 'Total Sessions', value: totalSessions, icon: Target, color: '#6366f1' },
                        { label: 'Average Score', value: `${avgScore}/10`, icon: TrendingUp, color: '#10b981' },
                        { label: 'Best Score', value: `${bestScore}/10`, icon: Award, color: '#f59e0b' },
                        { label: 'Last Practice', value: latestSession ? new Date(latestSession.createdAt).toLocaleDateString() : 'Never', icon: Clock, color: '#8b5cf6' },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className="glass-card"
                            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: 'var(--radius-md)',
                                    background: `${stat.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <stat.icon size={20} color={stat.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.15rem' }}>
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Charts Row */}
                {totalSessions > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '1.25rem',
                            marginBottom: '2rem',
                        }}
                    >
                        {/* Score Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card"
                            style={{ padding: '1.5rem' }}
                        >
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                                📈 Score Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={scoreOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                    <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a1a3e',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#6366f1', r: 4 }}
                                        activeDot={{ r: 6, fill: '#818cf8' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Module Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card"
                            style={{ padding: '1.5rem' }}
                        >
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                                📊 Module Performance
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={moduleBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                    <XAxis dataKey="module" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a1a3e',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                        }}
                                    />
                                    <Bar dataKey="avgScore" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Latest Score Radar */}
                        {radarData.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card"
                                style={{ padding: '1.5rem' }}
                            >
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                                    🎯 Latest Score Breakdown
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(99,102,241,0.15)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card"
                        style={{
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            marginBottom: '2rem',
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎤</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            No sessions yet!
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Start your first interview practice session to see your progress here.
                        </p>
                        <Link to="/interview" className="btn-primary">
                            Start Practicing <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                )}

                {/* Session History */}
                {totalSessions > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                            📋 Recent Sessions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {sessions.slice(0, 10).map((session, i) => (
                                <div
                                    key={session.id}
                                    className="glass-card"
                                    style={{
                                        padding: '1rem 1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.04em',
                                                color: session.moduleType === 'technical' ? '#10b981' : session.moduleType === 'behavioral' ? '#8b5cf6' : '#6366f1',
                                                background: session.moduleType === 'technical' ? 'rgba(16,185,129,0.1)' : session.moduleType === 'behavioral' ? 'rgba(139,92,246,0.1)' : 'rgba(99,102,241,0.1)',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: 'var(--radius-full)',
                                                marginBottom: '0.35rem',
                                            }}
                                        >
                                            {session.moduleType}
                                        </div>
                                        <p
                                            style={{
                                                fontSize: '0.88rem',
                                                color: 'var(--text-primary)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '400px',
                                            }}
                                        >
                                            {session.question}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </span>
                                        <span
                                            className={`score-badge ${session.overallScore >= 7 ? 'score-high' : session.overallScore >= 4 ? 'score-mid' : 'score-low'}`}
                                        >
                                            {session.overallScore}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Quick Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ textAlign: 'center', margin: '3rem 0 2rem' }}
                >
                    <Link to="/interview" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                        <Mic size={18} />
                        Start New Practice Session
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
