/**
 * Firebase Auth Middleware
 * Verifies Firebase ID tokens from the Authorization header
 */
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        name?: string;
    };
}

/**
 * Middleware to verify Firebase authentication tokens
 * Attaches decoded user info to req.user
 */
export const verifyAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No authentication token provided' });
            return;
        }

        const token = authHeader.split('Bearer ')[1];
        // console.log(`🔍 Verifying token: ${token.substring(0, 10)}...`);
        const decoded = await auth.verifyIdToken(token);
        // console.log(`✅ Token verified for user: ${decoded.uid}`);

        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
        };

        next();
    } catch (error) {
        console.error('❌ Auth verification error:', error);
        res.status(401).json({ error: 'Invalid or expired token', details: (error as Error).message });
    }
};

/**
 * Optional auth - continues even if token is missing
 * Useful for endpoints that work differently for logged-in vs anonymous users
 */
export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            const decoded = await auth.verifyIdToken(token);
            req.user = {
                uid: decoded.uid,
                email: decoded.email,
                name: decoded.name,
            };
        }
    } catch (error) {
        // Silently continue - user will be undefined
    }
    next();
};
