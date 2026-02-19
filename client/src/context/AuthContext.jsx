import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
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
            } else {
                localStorage.removeItem('token');
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
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
