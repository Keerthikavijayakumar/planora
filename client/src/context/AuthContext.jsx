import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    const signup = (email, password) => {
        if (!auth) throw new Error("Firebase not configured. Check .env file.");
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        if (!auth) throw new Error("Firebase not configured. Check .env file.");
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        if (!auth) return Promise.resolve();
        return signOut(auth);
    };

    const googleSignIn = () => {
        if (!auth) throw new Error("Firebase not configured. Check .env file.");
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    useEffect(() => {
        if (!auth) {
            console.warn("⚠️ AuthContext: No Firebase Auth instance found. App running in UI-only mode.");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Optionally sync with backend here or get token
                const token = await user.getIdToken();
                localStorage.setItem('token', token);

                // read custom claims to detect premium
                try {
                    const idRes = await user.getIdTokenResult(true);
                    setIsPremium(!!idRes.claims?.premium);
                } catch (e) {
                    // ignore
                }
            } else {
                localStorage.removeItem('token');
                setIsPremium(false);
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const refreshUser = async () => {
        try {
            if (!auth) return setIsPremium(false);
            const user = auth.currentUser;
            if (!user) return setIsPremium(false);
            // Force refresh token to pick up custom claims (premium)
            const idRes = await user.getIdTokenResult(true);
            localStorage.setItem('token', idRes.token || '');
            setIsPremium(!!idRes.claims?.premium);
            // update currentUser reference
            setCurrentUser(user);
            return idRes;
        } catch (e) {
            console.warn('refreshUser failed', e.message || e);
            return null;
        }
    };

    const value = {
        currentUser,
        isPremium,
        refreshUser,
        signup,
        login,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
