import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    userProfile: any | null; // Placeholder for robust type
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    userProfile: null,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState<any | null>(null);

    useEffect(() => {
        console.log('[AuthContext] Setting up auth listener');
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('[AuthContext] Auth state changed - user:', currentUser?.uid);

            // Set loading to true while we verify profile and admin status
            setLoading(true);
            setUser(currentUser);

            if (currentUser) {
                // Fetch User Profile
                try {
                    console.log('[AuthContext] Fetching profile and admin status...');
                    const [userDoc, adminDoc] = await Promise.all([
                        getDoc(doc(db, 'users', currentUser.uid)),
                        getDoc(doc(db, 'admins', currentUser.uid))
                    ]);

                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data());
                    }

                    const isAdminUser = adminDoc.exists();
                    console.log('[AuthContext] Admin status verified:', isAdminUser);
                    setIsAdmin(isAdminUser);
                } catch (error: any) {
                    console.error("[AuthContext] Error fetching extended user data:", error);
                    setIsAdmin(false);
                }
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }

            console.log('[AuthContext] Verification complete, setting loading to false');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, userProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
