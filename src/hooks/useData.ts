import { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    setDoc,
    addDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Department {
    id: string;
    name: string;
}

export interface Course {
    id: string;
    code: string;
    title: string;
    departmentId: string;
    level: string;
    semester?: string;
    papers?: number;
    lecturer?: string;
    driveFolderUrl?: string; // MVP: Google Drive folder containing papers
}

export interface Contributor {
    id?: string;
    name: string;
    course: string;
    count: number;
    date: string;
    department?: string;
    contributionCount?: number;
    levelOrYear?: string;
    badge?: string;
}

export interface Paper {
    id: string;
    title: string;
    code: string;
    year: string;
    semester: string;
    type: string;
    pdfUrl: string;
    thumbnailUrl?: string;
    downloads: number;
    isBookmarked?: boolean;
    courseId?: string;
}

export interface UserProfile {
    name?: string;
    email?: string;
    departmentId?: string;
    level?: string;
    avatar?: string;
    savedPapers?: string[]; // Array of paper IDs
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'alert' | 'success';
    createdAt: any;
    isRead: boolean;
}

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to real departments collection in Firestore
        const q = query(collection(db, 'departments'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const depts: Department[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
                .map((d: any) => ({ id: d.id, name: d.name }));
            setDepartments(depts);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching departments:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { departments, loading };
}


export function useCourses(departmentId: string | undefined) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!departmentId) {
            setCourses([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'courses'), where('departmentId', '==', departmentId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cs: Course[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            setCourses(cs);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching courses:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [departmentId]);
    return { courses, loading };
}

export function useContributors() {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'contributors'), orderBy('contributionCount', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const contribs: Contributor[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Contributor));
            setContributors(contribs);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching contributors:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { contributors, loading };
}

export function useRecentPapers(departmentId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to recent papers (optionally filter by department)
        let q;
        if (departmentId) {
            q = query(collection(db, 'papers'), where('departmentId', '==', departmentId), orderBy('createdAt', 'desc'), limit(20));
        } else {
            q = query(collection(db, 'papers'), orderBy('createdAt', 'desc'), limit(20));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    title: data.title || `${data.courseCode || data.code || ''} ${data.year || ''}`.trim(),
                    code: data.courseCode || data.code || '',
                    year: data.year || '',
                    semester: data.semester || '',
                    type: data.type || '',
                    pdfUrl: data.pdfUrl || data.url || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    downloads: data.downloads || 0,
                    courseId: data.courseId || data.course || undefined,
                } as Paper;
            });
            setPapers(docs);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching papers:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [departmentId]);

    return { papers, loading };
}

// Global Notifications Hook
export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [reading, setReading] = useState(false);

    useEffect(() => {
        if (!userId) {
            console.log('[useNotifications] No userId provided');
            setLoading(false);
            return;
        }

        console.log('[useNotifications] Setting up listener for userId:', userId);
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                console.log('[useNotifications] Received notifications snapshot:', snapshot.docs.length, 'docs');
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));

                // Fetch read status for this user
                const receipts: Record<string, boolean> = {};
                if (userId) {
                    try {
                        const userReadRef = collection(db, 'users', userId, 'read_notifications');
                        const readSnap = await getDocs(userReadRef);
                        readSnap.docs.forEach(d => {
                            receipts[d.id] = true;
                        });
                        console.log('[useNotifications] Fetched read receipts:', Object.keys(receipts).length);
                    } catch (e: any) {
                        console.warn('[useNotifications] Could not fetch read receipts:', e?.code, e?.message);
                    }
                }

                const merged = notifs.map(n => ({
                    ...n,
                    isRead: !!receipts[n.id]
                }));

                console.log('[useNotifications] Setting notifications - total:', merged.length, 'unread:', merged.filter(n => !n.isRead).length);
                setNotifications(merged);
                setLoading(false);
            } catch (e: any) {
                console.error('[useNotifications] ERROR in snapshot handler:', {
                    message: e?.message,
                    code: e?.code,
                    fullError: e
                });
                setLoading(false);
            }
        }, (err: any) => {
            console.error('[useNotifications] ERROR setting up listener:', {
                message: err?.message,
                code: err?.code,
                fullError: err
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, reading]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return { notifications, loading, unreadCount, setReading };
}

export async function markNotificationRead(userId: string, notificationId: string) {
    if (!userId) return;
    const userReadRef = doc(db, 'users', userId, 'read_notifications', notificationId);
    await setDoc(userReadRef, { readAt: new Date() });
    // Trigger re-render or state update handled by snapshot listener ideally?
    // Snapshot on 'read_notifications' subcollection would be better but simple refresh by prop works.
}

export async function markAllNotificationsAsRead(userId: string, notificationIds: string[]) {
    if (!userId || notificationIds.length === 0) return;
    // Write each notification as read
    const promises = notificationIds.map(id => {
        const userReadRef = doc(db, 'users', userId, 'read_notifications', id);
        return setDoc(userReadRef, { readAt: new Date() });
    });
    await Promise.all(promises);
}

export function useUserProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { profile, loading };
}

export async function updateUserProfile(userId: string, data: any) {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data, { merge: true });
}

export async function recordFeatureInterest(userId: string, featureName: string) {
    if (!userId) return;
    await addDoc(collection(db, 'feature_interest'), {
        userId,
        feature: featureName,
        timestamp: new Date()
    });
}

export function useFeatureInterests(userId: string | undefined) {
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setInterests([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'feature_interest'), where('userId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const features = snapshot.docs.map(doc => doc.data().feature as string);
            // Deduplicate just in case
            setInterests([...new Set(features)]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { interests, loading };
}

export function useBookmarks(userId: string | undefined) {
    const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setBookmarkIds([]);
            setLoading(false);
            return;
        }
        const q = collection(db, 'users', userId, 'bookmarks');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBookmarkIds(snapshot.docs.map(doc => doc.id));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userId]);

    return { bookmarkIds, loading };
}

export function useBookmarkedCourses(userId: string | undefined) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setCourses([]);
            setLoading(false);
            return;
        }

        // Listen to bookmarks subcollection
        const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
        const unsubscribe = onSnapshot(bookmarksRef, async (snapshot) => {
            try {
                const bookmarkedIds = snapshot.docs.map(doc => doc.id);

                if (bookmarkedIds.length === 0) {
                    setCourses([]);
                    setLoading(false);
                    return;
                }

                // Fetch actual course data for each bookmarked ID
                const coursesData: Course[] = [];
                for (const id of bookmarkedIds) {
                    try {
                        const courseDoc = await getDocs(query(collection(db, 'courses'), where('__name__', '==', id)));
                        if (!courseDoc.empty) {
                            const data = courseDoc.docs[0].data();
                            coursesData.push({
                                id: courseDoc.docs[0].id,
                                ...data
                            } as Course);
                        }
                    } catch (err) {
                        console.warn('[useBookmarkedCourses] Error fetching course:', id, err);
                    }
                }

                setCourses(coursesData);
            } catch (e) {
                console.error('[useBookmarkedCourses] Error:', e);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    return { courses, loading };
}

// Legacy - keeping for backwards compatibility but not used in MVP
export function useBookmarkedPapers(userId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setPapers([]);
            setLoading(false);
            return;
        }

        const fetchBookmarks = async () => {
            try {
                const q = collection(db, 'users', userId, 'bookmarks');
                const snapshot = await getDocs(q);
                const _bookmarkedIds = snapshot.docs.map(doc => doc.id);
                // For MVP, papers aren't used - courses are primary entity
                setPapers([]);
            } catch (e) {
                console.error("Error fetching bookmarked papers:", e);
                setPapers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, [userId]);

    return { bookmarks: papers, loading };
}

export async function toggleBookmark(userId: string, courseId: string, isCurrentlyBookmarked: boolean) {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'bookmarks', courseId);
    if (isCurrentlyBookmarked) {
        // Currently bookmarked, so REMOVE it
        try {
            await deleteDoc(ref);
        } catch (e) {
            // Already deleted or doesn't exist
        }
    } else {
        // Not bookmarked, so ADD it
        await setDoc(ref, { courseId, savedAt: new Date() });
    }
}

export async function recordRecentCourse(userId: string, courseId: string) {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'recent_courses', courseId);
    await setDoc(ref, {
        courseId,
        viewedAt: new Date()
    });
}

export function useRecentCourses(userId: string | undefined) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            console.log('[useRecentCourses] No userId provided');
            setCourses([]);
            setLoading(false);
            return;
        }

        console.log('[useRecentCourses] Fetching for userId:', userId);
        const fetchRecent = async () => {
            try {
                const q = query(collection(db, 'users', userId, 'recent_courses'), orderBy('viewedAt', 'desc'), limit(10));
                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                console.log('[useRecentCourses] Fetched successfully:', fetched.length, 'courses');
                setCourses(fetched);
            } catch (e: any) {
                console.error('[useRecentCourses] ERROR fetching recent courses:', {
                    message: e?.message,
                    code: e?.code,
                    fullError: e
                });
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, [userId]);

    return { courses, loading };
}

export function useCourse(courseCode: string | undefined) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseCode) {
            setCourse(null);
            setLoading(false);
            return;
        }
        const staticCourses: Course[] = [
            { id: '1', code: 'PHY 314', title: 'Solid State Physics', departmentId: 'physics_ed', level: '300L' },
            { id: '2', code: 'EDU 312', title: 'Research Methods', departmentId: 'physics_ed', level: '300L' },
            { id: '10', code: 'CSC 301', title: 'Structured Programming', departmentId: 'computer_science', level: '300L' },
        ];
        const found = staticCourses.find(c => c.code === courseCode);
        setCourse(found || null);
        setLoading(false);
    }, [courseCode]);
    return { course, loading };
}

export function usePapers(_courseId: string | undefined, departmentId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If no department provided, can't query
        if (!departmentId) {
            setPapers([]);
            setLoading(false);
            return;
        }

        // Query all papers for the department (ignore courseId - show ALL papers for department)
        // This allows filtering by level and semester in the component
        const q = query(collection(db, 'papers'), where('departmentId', '==', departmentId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    title: data.title || `${data.courseCode || data.code || ''} ${data.year || ''}`.trim(),
                    code: data.courseCode || data.code || '',
                    year: data.year || '',
                    semester: data.semester || '',
                    type: data.type || '',
                    pdfUrl: data.pdfUrl || data.url || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    downloads: data.downloads || 0,
                    courseId: data.courseId || data.course || undefined,
                } as Paper;
            });
            setPapers(docs);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching papers:', err);
            setPapers([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [departmentId]);

    return { papers, loading };
}

export function usePaper(paperId: string | undefined) {
    const [paper, setPaper] = useState<Paper | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!paperId) {
            setPaper(null);
            setLoading(false);
            return;
        }

        const fetchPaper = async () => {
            try {
                const staticPapers: Paper[] = [
                    { id: '1', title: '2023 First Semester Exam', code: 'PHY 314', year: '2023', semester: 'First', type: 'Exam', pdfUrl: '#', thumbnailUrl: '', downloads: 124, courseId: '1' },
                    { id: '2', title: '2022 Second Semester Test', code: 'PHY 314', year: '2022', semester: 'Second', type: 'Test', pdfUrl: '#', thumbnailUrl: '', downloads: 89, courseId: '1' },
                ];
                const found = staticPapers.find(p => p.id === paperId);
                setPaper(found || null);
            } catch (e) {
                console.error("Error fetching paper", e);
                setPaper(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPaper();
    }, [paperId]);

    return { paper, loading };
}

export async function createGlobalNotification(title: string, message: string, type: 'info' | 'alert' | 'success') {
    try {
        await addDoc(collection(db, 'notifications'), {
            title,
            message,
            type,
            createdAt: new Date(),
            targets: ['all'] // Broadcast to all users
        });
    } catch (e) {
        console.error('Error creating notification:', e);
        throw e;
    }
}
