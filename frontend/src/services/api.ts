/**
 * API Service
 * Handles all communication with the backend server
 */

const API_BASE = '/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    token?: string | null;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}

/** Generate interview questions */
export const generateQuestions = (
    moduleType: string,
    count?: number,
    context?: { resumeText?: string; jobDescription?: string; role?: string }
) =>
    apiRequest<{ questions: string[] }>('/questions', {
        method: 'POST',
        body: { moduleType, count, ...context },
    });

/** Get AI feedback on an answer */
export const getFeedback = (question: string, answer: string, moduleType: string) =>
    apiRequest<FeedbackResult>('/feedback', {
        method: 'POST',
        body: { question, answer, moduleType },
    });

/** Generate follow-up questions */
export const getFollowUp = (question: string, answer: string) =>
    apiRequest<{ followUps: string[] }>('/follow-up', {
        method: 'POST',
        body: { question, answer },
    });

/** Save interview session */
export const saveSession = (
    token: string,
    data: {
        moduleType: string;
        question: string;
        answerTranscript: string;
        feedback: any;
        overallScore: number;
    }
) =>
    apiRequest('/sessions', {
        method: 'POST',
        body: data,
        token,
    });

/** Get user sessions */
export const getSessions = (token: string) =>
    apiRequest<{ sessions: SessionData[] }>('/sessions', { token });

/** Save user profile */
export const saveProfile = (
    token: string,
    data: { name?: string; jobRole?: string; experienceLevel?: string; resumeText?: string }
) =>
    apiRequest('/profile', { method: 'POST', body: data, token });

/** Get user profile */
export const getProfile = (token: string) =>
    apiRequest<{ profile: any }>('/profile', { token });

// ===== Types =====
export interface FeedbackResult {
    scores: {
        relevance: number;
        structure: number;
        clarity: number;
        depth: number;
        confidence: number;
    };
    overallScore: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
    improvedAnswer: string;
}

export interface SessionData {
    id: string;
    moduleType: string;
    question: string;
    answerTranscript: string;
    feedback: FeedbackResult;
    overallScore: number;
    createdAt: string;
}
