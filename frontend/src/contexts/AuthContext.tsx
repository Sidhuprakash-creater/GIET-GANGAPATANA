/**
 * Authentication Context
 * Provides user authentication state and methods throughout the app
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const loginWithGoogle = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const getIdToken = async (): Promise<string | null> => {
        if (!user) return null;
        return user.getIdToken();
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, loginWithGoogle, logout, getIdToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
