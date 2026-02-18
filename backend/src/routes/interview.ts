/**
 * Interview Routes
 * Handles question generation, feedback analysis, and session management
 */
import { Router, Request, Response } from 'express';
import { generateQuestions, analyzeFeedback, generateFollowUp } from '../services/gemini';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/firebase';

const router = Router();

/**
 * POST /api/questions
 * Generate interview questions
 * Body: { moduleType, count?, resumeText?, jobDescription?, role? }
 */
router.post('/questions', async (req: Request, res: Response) => {
    try {
        const { moduleType, count, resumeText, jobDescription, role } = req.body;

        if (!moduleType || !['hr', 'behavioral', 'technical'].includes(moduleType)) {
            res.status(400).json({ error: 'Invalid moduleType. Must be: hr, behavioral, or technical' });
            return;
        }

        const result = await generateQuestions(moduleType, count || 5, {
            resumeText,
            jobDescription,
            role,
        });

        res.json(result);
    } catch (error) {
        console.error('Question generation error:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

/**
 * POST /api/feedback
 * Analyze an interview answer and return scores + suggestions
 * Body: { question, answer, moduleType }
 */
router.post('/feedback', async (req: Request, res: Response) => {
    try {
        const { question, answer, moduleType } = req.body;

        if (!question || !answer || !moduleType) {
            res.status(400).json({ error: 'question, answer, and moduleType are required' });
            return;
        }

        const feedback = await analyzeFeedback(question, answer, moduleType);
        res.json(feedback);
    } catch (error) {
        console.error('Feedback analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze answer' });
    }
});

/**
 * POST /api/follow-up
 * Generate follow-up questions based on previous Q&A
 * Body: { question, answer }
 */
router.post('/follow-up', async (req: Request, res: Response) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            res.status(400).json({ error: 'question and answer are required' });
            return;
        }

        const result = await generateFollowUp(question, answer);
        res.json(result);
    } catch (error) {
        console.error('Follow-up generation error:', error);
        res.status(500).json({ error: 'Failed to generate follow-up questions' });
    }
});

/**
 * POST /api/sessions
 * Save an interview session (authenticated)
 */
router.post('/sessions', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleType, question, answerTranscript, feedback, overallScore } = req.body;
        const userId = req.user!.uid;

        const sessionData = {
            userId,
            moduleType,
            question,
            answerTranscript,
            feedback,
            overallScore: overallScore || feedback?.overallScore || 0,
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('sessions').add(sessionData);
        res.status(201).json({ id: docRef.id, ...sessionData });
    } catch (error) {
        console.error('Session save error:', error);
        res.status(500).json({ error: 'Failed to save session' });
    }
});

/**
 * GET /api/sessions
 * Get all sessions for authenticated user
 */
router.get('/sessions', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.uid;
        const snapshot = await db
            .collection('sessions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const sessions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json({ sessions });
    } catch (error) {
        console.error('Session fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

/**
 * POST /api/profile
 * Save/update user profile (authenticated)
 */
router.post('/profile', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { name, jobRole, experienceLevel, resumeText } = req.body;

        const profileData = {
            userId,
            name,
            jobRole,
            experienceLevel,
            resumeText,
            updatedAt: new Date().toISOString(),
        };

        await db.collection('profiles').doc(userId).set(profileData, { merge: true });
        res.json({ message: 'Profile updated', ...profileData });
    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

/**
 * GET /api/profile
 * Get user profile (authenticated)
 */
router.get('/profile', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.uid;
        const doc = await db.collection('profiles').doc(userId).get();

        if (!doc.exists) {
            res.json({ profile: null });
            return;
        }

        res.json({ profile: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default router;
