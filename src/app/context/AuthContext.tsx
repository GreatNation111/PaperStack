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
            setUser(currentUser);

            if (currentUser) {
                // Fetch User Profile
                try {
                    console.log('[AuthContext] Fetching user document for:', currentUser.uid);
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        console.log('[AuthContext] User profile found');
                        setUserProfile(userDoc.data());
                    } else {
                        console.log('[AuthContext] User profile does not exist yet');
                    }

                    // Check Admin Status (Strict 'admins' collection check)
                    try {
                        console.log('[AuthContext] Checking admin status');
                        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
                        const isAdminUser = adminDoc.exists();
                        console.log('[AuthContext] Admin status:', isAdminUser);
                        setIsAdmin(isAdminUser);
                    } catch (adminErr: any) {
                        console.error('[AuthContext] Error checking admin status:', {
                            code: adminErr?.code,
                            message: adminErr?.message
                        });
                        setIsAdmin(false);
                    }
                } catch (error: any) {
                    console.error("[AuthContext] Error fetching user data:", {
                        code: error?.code,
                        message: error?.message,
                        fullError: error
                    });
                    // Don't block auth, just fail gracefully on extended data
                }
            } else {
                console.log('[AuthContext] No authenticated user');
                setUserProfile(null);
                setIsAdmin(false);
            }

            console.log('[AuthContext] Setting loading to false');
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
