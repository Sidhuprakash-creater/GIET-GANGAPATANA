/**
 * Google Gemini AI Service
 * Handles question generation, answer feedback, and follow-up questions
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/** Get the generative model instance */
const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Generate interview questions based on module type and optional context
 */
export async function generateQuestions(
    moduleType: 'hr' | 'behavioral' | 'technical',
    count: number = 5,
    context?: { resumeText?: string; jobDescription?: string; role?: string }
): Promise<{ questions: string[] }> {
    const model = getModel();

    let contextPrompt = '';
    if (context?.resumeText) {
        contextPrompt += `\nCandidate Resume Summary: ${context.resumeText.substring(0, 1500)}`;
    }
    if (context?.jobDescription) {
        contextPrompt += `\nJob Description: ${context.jobDescription.substring(0, 1000)}`;
    }
    if (context?.role) {
        contextPrompt += `\nTarget Role: ${context.role}`;
    }

    const modulePrompts: Record<string, string> = {
        hr: `Generate ${count} realistic HR interview questions. Focus on: motivation, teamwork, conflict resolution, strengths/weaknesses, career goals. Make them specific and thought-provoking, not generic.`,
        behavioral: `Generate ${count} behavioral interview questions using the STAR method format. Focus on: leadership, problem-solving, adaptability, communication, decision-making. Each question should start with "Tell me about a time when..." or similar behavioral prompt.`,
        technical: `Generate ${count} technical interview questions. Include a mix of: conceptual questions, problem-solving scenarios, system design basics, and coding logic questions. ${context?.role ? `Tailor for a ${context.role} role.` : 'Focus on general software engineering.'}`,
    };

    const prompt = `You are an expert interview coach. ${modulePrompts[moduleType]}
${contextPrompt}

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "questions": ["question 1", "question 2", ...]
}

Do not include any text before or after the JSON.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        const parsed = JSON.parse(jsonMatch[0]);
        return { questions: parsed.questions.slice(0, count) };
    } catch (error) {
        console.error('Gemini question generation error:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
        // Fallback questions
        return { questions: getFallbackQuestions(moduleType, count) };
    }
}

/**
 * Analyze an interview answer and provide detailed feedback
 */
export async function analyzeFeedback(
    question: string,
    answer: string,
    moduleType: 'hr' | 'behavioral' | 'technical'
): Promise<FeedbackResult> {
    const model = getModel();

    const prompt = `You are an expert interview coach with 20+ years of experience. Analyze this interview answer thoroughly.

INTERVIEW TYPE: ${moduleType.toUpperCase()}
QUESTION: "${question}"
CANDIDATE'S ANSWER: "${answer}"

Evaluate the answer on these criteria (score each 1-10):

1. **Relevance** - Does the answer directly address the question?
2. **Structure** - Is it well-organized? ${moduleType === 'behavioral' ? '(STAR method: Situation, Task, Action, Result)' : '(Clear intro, body, conclusion)'}
3. **Clarity** - Is the language clear? Any filler words, rambling, or vague statements?
4. **Depth** - Does the answer show real experience, specific examples, and quantifiable results?
5. **Confidence** - Does the answer demonstrate conviction and professionalism?

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "scores": {
    "relevance": <1-10>,
    "structure": <1-10>,
    "clarity": <1-10>,
    "depth": <1-10>,
    "confidence": <1-10>
  },
  "overallScore": <1-10>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "detailedFeedback": "A 2-3 sentence overall assessment with actionable advice.",
  "improvedAnswer": "A brief example of how the answer could be improved (2-3 sentences showing the key changes)."
}

Do not include any text before or after the JSON.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        return JSON.parse(jsonMatch[0]) as FeedbackResult;
    } catch (error) {
        console.error('Gemini feedback analysis error:', error);
        return getDefaultFeedback();
    }
}

/**
 * Generate follow-up questions based on the candidate's answer
 */
export async function generateFollowUp(
    question: string,
    answer: string
): Promise<{ followUps: string[] }> {
    const model = getModel();

    const prompt = `You are an experienced interviewer. Based on this Q&A, generate 2 natural follow-up questions that probe deeper.

ORIGINAL QUESTION: "${question}"
CANDIDATE'S ANSWER: "${answer}"

Respond ONLY with valid JSON:
{
  "followUps": ["follow-up question 1", "follow-up question 2"]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Follow-up generation error:', error);
        return { followUps: ['Can you elaborate on that?', 'What would you do differently next time?'] };
    }
}

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

// ===== Fallback Data =====
function getFallbackQuestions(moduleType: string, count: number): string[] {
    const fallbacks: Record<string, string[]> = {
        hr: [
            'Tell me about yourself and your career journey so far.',
            'Why are you interested in this position?',
            'Where do you see yourself in 5 years?',
            'What is your greatest strength and how has it helped you professionally?',
            'Describe a challenging work situation and how you handled it.',
            'What motivates you to do your best work?',
            'How do you handle feedback and criticism?',
        ],
        behavioral: [
            'Tell me about a time when you had to work with a difficult team member.',
            'Describe a situation where you had to meet a tight deadline.',
            'Give an example of when you showed leadership in a project.',
            'Tell me about a time you failed and what you learned from it.',
            'Describe a situation where you had to adapt to a significant change.',
            'Tell me about a time you went above and beyond your responsibilities.',
            'Give an example of how you resolved a conflict at work.',
        ],
        technical: [
            'Explain the difference between REST and GraphQL APIs.',
            'How would you optimize a slow database query?',
            'Describe how you would design a URL shortening service.',
            'What are the SOLID principles? Give an example of one.',
            'Explain the concept of time complexity with an example.',
            'How does garbage collection work in modern programming languages?',
            'What is the difference between SQL and NoSQL databases?',
        ],
    };
    return (fallbacks[moduleType] || fallbacks.hr).slice(0, count);
}

function getDefaultFeedback(): FeedbackResult {
    return {
        scores: { relevance: 5, structure: 5, clarity: 5, depth: 5, confidence: 5 },
        overallScore: 5,
        strengths: ['You attempted to answer the question'],
        improvements: ['Try to be more specific with examples', 'Use the STAR method for behavioral questions', 'Add quantifiable results'],
        detailedFeedback: 'Your answer covers the basics but could benefit from more specific examples and a clearer structure.',
        improvedAnswer: 'Consider starting with a specific situation, describing your role, the actions you took, and the measurable results.',
    };
}
