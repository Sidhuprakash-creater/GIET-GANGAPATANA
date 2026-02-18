/**
 * Profile Page
 * User profile management with job role and resume text
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, saveProfile } from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    User,
    Briefcase,
    GraduationCap,
    FileText,
    Save,
    Loader2,
    CheckCircle2,
    Mail,
} from 'lucide-react';

const experienceLevels = ['Fresher', 'Intern', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];

const ProfilePage: React.FC = () => {
    const { user, getIdToken } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [jobRole, setJobRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = await getIdToken();
                if (token) {
                    const result = await getProfile(token);
                    if (result.profile) {
                        setName(result.profile.name || user?.displayName || '');
                        setJobRole(result.profile.jobRole || '');
                        setExperienceLevel(result.profile.experienceLevel || '');
                        setResumeText(result.profile.resumeText || '');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [getIdToken, user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getIdToken();
            if (token) {
                await saveProfile(token, { name, jobRole, experienceLevel, resumeText });
                setSaved(true);
                toast.success('Profile saved successfully!');
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            toast.error('Failed to save profile');
            console.error(err);
        } finally {
            setSaving(false);
        }
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
            <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Your <span className="gradient-text">Profile</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Keep your profile updated for more personalized interview questions.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '2rem' }}
                >
                    {/* Avatar & Email */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.25rem',
                            marginBottom: '2rem',
                            paddingBottom: '1.5rem',
                            borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
                        }}
                    >
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'white',
                                flexShrink: 0,
                            }}
                        >
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                {user?.displayName || 'User'}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    marginTop: '0.15rem',
                                }}
                            >
                                <Mail size={13} />
                                {user?.email}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Name */}
                        <div>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                <User size={14} /> Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="input-field"
                            />
                        </div>

                        {/* Job Role */}
                        <div>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                <Briefcase size={14} /> Target Job Role
                            </label>
                            <input
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g., Frontend Developer, Data Analyst"
                                className="input-field"
                            />
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                <GraduationCap size={14} /> Experience Level
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {experienceLevels.map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setExperienceLevel(level)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: 'var(--radius-full)',
                                            border: `1px solid ${experienceLevel === level ? 'var(--primary-500)' : 'rgba(99,102,241,0.15)'}`,
                                            background: experienceLevel === level ? 'rgba(99,102,241,0.15)' : 'transparent',
                                            color: experienceLevel === level ? 'var(--primary-400)' : 'var(--text-secondary)',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resume Text */}
                        <div>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                <FileText size={14} /> Resume Summary
                            </label>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume content or a brief summary of your skills, projects, and experience..."
                                className="input-field"
                                rows={6}
                                style={{ resize: 'vertical', lineHeight: 1.7 }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                This helps generate personalized interview questions. Your data is stored securely.
                            </p>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '0.85rem',
                                marginTop: '0.5rem',
                            }}
                        >
                            {saving ? (
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : saved ? (
                                <>
                                    <CheckCircle2 size={18} /> Saved!
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ProfilePage;
