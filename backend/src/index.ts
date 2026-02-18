/**
 * AI Interview Practice Platform - Backend Server
 * Express server with Firebase Auth, Gemini AI, and Firestore
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interview';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== Routes =====
app.use('/api', interviewRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'AI Interview Practice Platform - API',
    });
});

// ===== Error Handler =====
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║  🎤 AI Interview Practice Platform - API     ║
  ║  🚀 Server running on port ${PORT}              ║
  ║  📍 http://localhost:${PORT}                    ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
