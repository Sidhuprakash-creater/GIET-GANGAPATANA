/**
 * Interview Practice Page
 * Core interaction: select module → get questions → answer → get feedback
 */
import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateQuestions, getFeedback, getFollowUp, saveSession } from '../services/api';
import type { FeedbackResult } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Send,
    RotateCcw,
    ChevronRight,
    Loader2,
    MessageSquare,
    Users,
    Code2,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    BookOpen,
    Target,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';

type ModuleType = 'hr' | 'behavioral' | 'technical';
type Step = 'select' | 'practice' | 'feedback';

const moduleInfo = {
    hr: {
        title: 'HR Interview',
        description: 'Practice general HR questions about your background, motivation, and career goals.',
        icon: Users,
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    },
    behavioral: {
        title: 'Behavioral Interview',
        description: 'STAR-method based questions testing leadership, problem-solving, and adaptability.',
        icon: MessageSquare,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    },
    technical: {
        title: 'Technical Interview',
        description: 'DSA, system design, and domain-specific technical questions for your role.',
        icon: Code2,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    },
};

const InterviewPage: React.FC = () => {
    const { user, getIdToken } = useAuth();

    // State
    const [step, setStep] = useState<Step>('select');
    const [moduleType, setModuleType] = useState<ModuleType>('hr');
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
    const [followUps, setFollowUps] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingType, setRecordingType] = useState<'text' | 'audio' | 'video'>('text');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);

    // Job context (optional)
    const [jobRole, setJobRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [showContext, setShowContext] = useState(false);

    // ===== Handlers =====

    const handleStartInterview = async (module: ModuleType) => {
        setModuleType(module);
        setLoading(true);
        setLoadingMsg('Generating personalized questions...');

        try {
            const result = await generateQuestions(module, 5, {
                role: jobRole || undefined,
                jobDescription: jobDescription || undefined,
            });
            setQuestions(result.questions);
            setCurrentQuestionIndex(0);
            setAnswer('');
            setFeedback(null);
            setFollowUps([]);
            setStep('practice');
        } catch (err) {
            toast.error('Failed to generate questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMsg('');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            toast.error('Please provide an answer before submitting.');
            return;
        }

        setLoading(true);
        setLoadingMsg('AI is analyzing your answer...');

        try {
            const currentQuestion = questions[currentQuestionIndex];
            const feedbackResult = await getFeedback(currentQuestion, answer, moduleType);
            setFeedback(feedbackResult);
            setStep('feedback');

            // Generate follow-ups in background
            getFollowUp(currentQuestion, answer)
                .then((result) => setFollowUps(result.followUps))
                .catch(console.error);

            // Save session if authenticated
            if (user) {
                const token = await getIdToken();
                if (token) {
                    saveSession(token, {
                        moduleType,
                        question: currentQuestion,
                        answerTranscript: answer,
                        feedback: feedbackResult,
                        overallScore: feedbackResult.overallScore,
                    }).catch(console.error);
                }
            }
        } catch (err) {
            toast.error('Failed to get feedback. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMsg('');
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setAnswer('');
            setFeedback(null);
            setFollowUps([]);
            setStep('practice');
        } else {
            toast.success('Interview complete! Check your dashboard for progress.');
            handleReset();
        }
    };

    const handleFollowUp = (question: string) => {
        setQuestions((prev) => [...prev, question]);
        setCurrentQuestionIndex(questions.length);
        setAnswer('');
        setFeedback(null);
        setFollowUps([]);
        setStep('practice');
    };

    const handleReset = () => {
        setStep('select');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setFeedback(null);
        setFollowUps([]);
        setIsRecording(false);
    };

    // ===== Speech Recognition =====
    const startSpeechRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Speech recognition not supported in this browser. Try Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setAnswer(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'aborted') {
                toast.error('Speech recognition error. Please try again.');
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        toast.success('Listening... Speak your answer');
    }, []);

    const stopSpeechRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            stopSpeechRecognition();
        } else {
            startSpeechRecognition();
        }
    };

    // ===== Score Helpers =====
    const getScoreClass = (score: number) => {
        if (score >= 7) return 'score-high';
        if (score >= 4) return 'score-mid';
        return 'score-low';
    };

    const getScoreColor = (score: number) => {
        if (score >= 7) return '#34d399';
        if (score >= 4) return '#fbbf24';
        return '#f87171';
    };

    // ===== Render =====
    return (
        <div
            style={{
                minHeight: '100vh',
                padding: '5rem 1.5rem 2rem',
                position: 'relative',
            }}
        >
            <div className="animated-bg" />
            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <AnimatePresence mode="wait">
                    {/* ===== STEP 1: Module Selection ===== */}
                    {step === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h1
                                    style={{
                                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                                        fontWeight: 800,
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    Choose Your <span className="gradient-text">Interview Module</span>
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                                    Select the type of interview you want to practice today.
                                </p>
                            </div>

                            {/* Optional Context Toggle */}
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <button
                                    onClick={() => setShowContext(!showContext)}
                                    className="btn-secondary"
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                                >
                                    <Target size={14} />
                                    {showContext ? 'Hide' : 'Add'} Job Context (Optional)
                                </button>

                                <AnimatePresence>
                                    {showContext && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="glass-card"
                                            style={{
                                                marginTop: '1rem',
                                                padding: '1.5rem',
                                                maxWidth: '500px',
                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                            }}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Target Role (e.g., React Developer)"
                                                value={jobRole}
                                                onChange={(e) => setJobRole(e.target.value)}
                                                className="input-field"
                                                style={{ marginBottom: '0.75rem' }}
                                            />
                                            <textarea
                                                placeholder="Paste Job Description (optional)"
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                className="input-field"
                                                rows={3}
                                                style={{ resize: 'vertical' }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                Adding context generates more relevant questions for your target role.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Module Cards */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                    gap: '1.25rem',
                                }}
                            >
                                {(Object.keys(moduleInfo) as ModuleType[]).map((key, i) => {
                                    const mod = moduleInfo[key];
                                    return (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="module-card"
                                            onClick={() => !loading && handleStartInterview(key)}
                                            style={{ cursor: loading ? 'wait' : 'pointer' }}
                                        >
                                            <div
                                                style={{
                                                    width: '52px',
                                                    height: '52px',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: mod.gradient,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '1.25rem',
                                                }}
                                            >
                                                <mod.icon size={24} color="white" />
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                                {mod.title}
                                            </h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                                                {mod.description}
                                            </p>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    color: mod.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                Start Practice <ChevronRight size={16} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ===== STEP 2: Practice ===== */}
                    {step === 'practice' && (
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '2rem',
                                    flexWrap: 'wrap',
                                    gap: '0.75rem',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.8rem',
                                            color: moduleInfo[moduleType].color,
                                            fontWeight: 600,
                                            background: `${moduleInfo[moduleType].color}15`,
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        {React.createElement(moduleInfo[moduleType].icon, { size: 14 })}
                                        {moduleInfo[moduleType].title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </div>
                                </div>
                                <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                                    <RotateCcw size={14} />
                                    New Session
                                </button>
                            </div>

                            {/* Question */}
                            <div
                                className="glass-card"
                                style={{
                                    padding: '2rem',
                                    marginBottom: '1.5rem',
                                    borderLeft: `3px solid ${moduleInfo[moduleType].color}`,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    <BookOpen size={14} />
                                    Question
                                </div>
                                <p
                                    style={{
                                        fontSize: '1.15rem',
                                        fontWeight: 500,
                                        lineHeight: 1.7,
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {questions[currentQuestionIndex]}
                                </p>
                            </div>

                            {/* Answer Area */}
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Your Answer
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={toggleRecording}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.4rem 0.85rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: 'none',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                                                color: isRecording ? '#f87171' : 'var(--primary-400)',
                                                transition: 'all var(--transition-fast)',
                                            }}
                                            className={isRecording ? 'recording-pulse' : ''}
                                        >
                                            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                                            {isRecording ? 'Stop' : 'Voice'}
                                        </button>
                                    </div>
                                </div>

                                {isRecording && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            background: 'rgba(239, 68, 68, 0.08)',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: '0.75rem',
                                            fontSize: '0.8rem',
                                            color: '#f87171',
                                        }}
                                    >
                                        <div className="recording-dot" />
                                        Recording... speak clearly
                                    </div>
                                )}

                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your answer here, or use the voice button to dictate..."
                                    className="input-field"
                                    rows={8}
                                    style={{
                                        resize: 'vertical',
                                        lineHeight: 1.7,
                                        fontSize: '0.95rem',
                                    }}
                                />

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '1rem',
                                    }}
                                >
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {answer.split(/\s+/).filter(Boolean).length} words
                                    </span>
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={loading || !answer.trim()}
                                        className="btn-primary"
                                        style={{ padding: '0.65rem 1.5rem' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Answer <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== STEP 3: Feedback ===== */}
                    {step === 'feedback' && feedback && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '2rem',
                                    flexWrap: 'wrap',
                                    gap: '0.75rem',
                                }}
                            >
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                    <Sparkles size={20} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--primary-400)' }} />
                                    AI Feedback
                                </h2>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                                        <RotateCcw size={14} /> New Session
                                    </button>
                                    {currentQuestionIndex < questions.length - 1 && (
                                        <button onClick={handleNextQuestion} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                                            Next Question <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Overall Score */}
                            <div
                                className="glass-card"
                                style={{
                                    padding: '2rem',
                                    marginBottom: '1.5rem',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Overall Score
                                </div>
                                <div
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: `conic-gradient(${getScoreColor(feedback.overallScore)} ${feedback.overallScore * 10}%, var(--surface-2) 0%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'var(--surface-1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.75rem',
                                            fontWeight: 800,
                                            color: getScoreColor(feedback.overallScore),
                                        }}
                                    >
                                        {feedback.overallScore}
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {feedback.overallScore >= 8 ? '🌟 Excellent!' : feedback.overallScore >= 6 ? '👍 Good effort!' : feedback.overallScore >= 4 ? '📈 Room for improvement' : '💪 Keep practicing!'}
                                </p>
                            </div>

                            {/* Score Breakdown */}
                            <div
                                className="glass-card"
                                style={{ padding: '1.5rem', marginBottom: '1.5rem' }}
                            >
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                                    Score Breakdown
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {Object.entries(feedback.scores).map(([key, value]) => (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div
                                                style={{
                                                    width: '100px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-secondary)',
                                                    textTransform: 'capitalize',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {key}
                                            </div>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    height: '8px',
                                                    background: 'var(--surface-3)',
                                                    borderRadius: 'var(--radius-full)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${value * 10}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                                    style={{
                                                        height: '100%',
                                                        background: getScoreColor(value),
                                                        borderRadius: 'var(--radius-full)',
                                                    }}
                                                />
                                            </div>
                                            <span className={`score-badge ${getScoreClass(value)}`}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths & Improvements */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.25rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                {/* Strengths */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            color: 'var(--accent-400)',
                                        }}
                                    >
                                        <CheckCircle2 size={16} /> Strengths
                                    </h3>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {feedback.strengths.map((s, i) => (
                                            <li
                                                key={i}
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.5rem',
                                                    fontSize: '0.88rem',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                <span style={{ color: 'var(--accent-400)', flexShrink: 0 }}>✓</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            color: 'var(--warm-400)',
                                        }}
                                    >
                                        <TrendingUp size={16} /> Areas to Improve
                                    </h3>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {feedback.improvements.map((imp, i) => (
                                            <li
                                                key={i}
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.5rem',
                                                    fontSize: '0.88rem',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                <span style={{ color: 'var(--warm-400)', flexShrink: 0 }}>→</span>
                                                {imp}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Detailed Feedback */}
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                    💡 Detailed Feedback
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                                    {feedback.detailedFeedback}
                                </p>
                            </div>

                            {/* Improved Answer */}
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                    ✨ Suggested Better Answer
                                </h3>
                                <p
                                    style={{
                                        color: 'var(--accent-400)',
                                        fontSize: '0.92rem',
                                        lineHeight: 1.7,
                                        fontStyle: 'italic',
                                        padding: '1rem',
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '3px solid var(--accent-500)',
                                    }}
                                >
                                    {feedback.improvedAnswer}
                                </p>
                            </div>

                            {/* Follow-Up Questions */}
                            {followUps.length > 0 && (
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                                        🎯 Follow-Up Questions
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {followUps.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleFollowUp(q)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.85rem 1rem',
                                                    background: 'rgba(99, 102, 241, 0.05)',
                                                    border: '1px solid rgba(99, 102, 241, 0.15)',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.88rem',
                                                    textAlign: 'left',
                                                    fontFamily: 'inherit',
                                                    transition: 'all var(--transition-fast)',
                                                    width: '100%',
                                                }}
                                            >
                                                <span>{q}</span>
                                                <ArrowRight size={14} color="var(--primary-400)" style={{ flexShrink: 0 }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(10, 10, 26, 0.7)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 100,
                                gap: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    border: '3px solid rgba(99, 102, 241, 0.2)',
                                    borderTopColor: 'var(--primary-500)',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }}
                            />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                {loadingMsg || 'Processing...'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default InterviewPage;
