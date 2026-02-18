/**
 * Landing Page
 * Hero section with features overview for non-authenticated users
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mic,
    Brain,
    BarChart3,
    FileText,
    Target,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Users,
    Clock,
    Shield,
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Questions',
        description: 'Dynamically generated questions tailored to your role, experience, and resume using Google Gemini.',
        color: '#6366f1',
    },
    {
        icon: Mic,
        title: 'Multi-Mode Recording',
        description: 'Practice with text, audio, or video responses. Real-time speech transcription built in.',
        color: '#8b5cf6',
    },
    {
        icon: Target,
        title: '5-Axis Feedback',
        description: 'Detailed scoring on Relevance, Structure, Clarity, Depth, and Confidence with actionable suggestions.',
        color: '#a855f7',
    },
    {
        icon: BarChart3,
        title: 'Progress Dashboard',
        description: 'Track your improvement over time with visual charts and session history.',
        color: '#10b981',
    },
    {
        icon: FileText,
        title: 'Resume Personalization',
        description: 'Upload your resume and paste job descriptions for hyper-relevant interview questions.',
        color: '#f59e0b',
    },
    {
        icon: Sparkles,
        title: 'Follow-Up Probes',
        description: 'AI-generated follow-up questions that simulate real interview depth and pressure.',
        color: '#ec4899',
    },
];

const stats = [
    { value: '3', label: 'Interview Modules', icon: Target },
    { value: '5-Axis', label: 'AI Feedback', icon: Brain },
    { value: '24/7', label: 'Available', icon: Clock },
    { value: '100%', label: 'Free to Use', icon: Shield },
];

const LandingPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="animated-bg" />

            {/* ===== Hero Section ===== */}
            <section
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '8rem 1.5rem 4rem',
                    textAlign: 'center',
                }}
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--primary-400)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '2rem',
                    }}
                >
                    <Sparkles size={14} />
                    Powered by Google Gemini AI
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        maxWidth: '800px',
                        marginBottom: '1.5rem',
                    }}
                >
                    Ace Your Next Interview with{' '}
                    <span className="gradient-text">AI Practice</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: 'var(--text-secondary)',
                        maxWidth: '600px',
                        lineHeight: 1.7,
                        marginBottom: '2.5rem',
                    }}
                >
                    Practice HR, Behavioral, and Technical interviews with AI-generated questions,
                    record your answers, and get instant detailed feedback to crush your next interview.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    <Link to="/signup" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
                        Start Practicing Free
                        <ArrowRight size={18} />
                    </Link>
                    <a href="#features" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
                        See Features
                    </a>
                </motion.div>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '5rem',
                        maxWidth: '700px',
                        width: '100%',
                    }}
                >
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            style={{
                                textAlign: 'center',
                                padding: '1.25rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'rgba(99, 102, 241, 0.05)',
                                border: '1px solid rgba(99, 102, 241, 0.1)',
                            }}
                        >
                            <stat.icon size={20} color="var(--primary-400)" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ===== Features Section ===== */}
            <section
                id="features"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '6rem 1.5rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            marginBottom: '1rem',
                        }}
                    >
                        Everything You Need to{' '}
                        <span className="gradient-text">Succeed</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                        A comprehensive AI interview coach that adapts to you.
                    </p>
                </motion.div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="glass-card"
                            style={{ padding: '2rem' }}
                        >
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-md)',
                                    background: `${feature.color}15`,
                                    border: `1px solid ${feature.color}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                <feature.icon size={22} color={feature.color} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                {feature.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ===== How It Works ===== */}
            <section
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '6rem 1.5rem',
                    maxWidth: '900px',
                    margin: '0 auto',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            marginBottom: '1rem',
                        }}
                    >
                        How It <span className="gradient-text">Works</span>
                    </h2>
                </motion.div>

                {[
                    { step: '01', title: 'Choose Your Module', desc: 'Select HR, Behavioral, or Technical interview type.' },
                    { step: '02', title: 'Practice Your Answer', desc: 'Type, record audio, or use video to respond to AI-generated questions.' },
                    { step: '03', title: 'Get AI Feedback', desc: 'Receive 5-axis scored feedback with strengths, improvements, and a better answer example.' },
                    { step: '04', title: 'Track Progress', desc: 'View your dashboard to see score trends and areas for improvement over time.' },
                ].map((item, i) => (
                    <motion.div
                        key={item.step}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1.5rem',
                            marginBottom: '2.5rem',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'rgba(99, 102, 241, 0.03)',
                            border: '1px solid rgba(99, 102, 241, 0.08)',
                        }}
                    >
                        <div
                            className="mono gradient-text"
                            style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, flexShrink: 0 }}
                        >
                            {item.step}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                {item.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* ===== CTA Section ===== */}
            <section
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '6rem 1.5rem',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        maxWidth: '700px',
                        margin: '0 auto',
                        padding: '4rem 2rem',
                    }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Ready to <span className="gradient-text">Crush</span> Your Interview?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
                        Join thousands of students who improved their interview scores. Start practicing today — it's free.
                    </p>
                    <Link to="/signup" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Get Started Now <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </section>

            {/* ===== Footer ===== */}
            <footer
                style={{
                    position: 'relative',
                    zIndex: 1,
                    borderTop: '1px solid rgba(99, 102, 241, 0.1)',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                }}
            >
                <p>© 2026 InterviewAI — Built with ❤️ for GIET Gangapatana Hackathon</p>
            </footer>
        </div>
    );
};

export default LandingPage;
