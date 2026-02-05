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
}

export interface Contributor {
    id?: string;
    name: string;
    course: string;
    count: number;
    date: string;
    department?: string;
    contributionCount?: number;
}

export interface Paper {
    id: string;
    title: string;
    code: string;
    year: string;
    semester: string;
    type: string;
    url: string;
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
        const fetchDepartments = async () => {
            // Mock data or real fetch
            // For now, let's use the static data or fetch from firestore if you populated it.
            // We'll stick to static for speed unless you want me to fetch.
            // Using static for now as per your original request.
            // Actually, let's use the ones you had.
            const staticDepts = [
                { id: 'computer_science', name: 'Computer Science' },
                { id: 'physics_ed', name: 'Physics Education' },
                { id: 'chemistry', name: 'Chemistry' },
                { id: 'biology', name: 'Biology' },
                // ... add others
            ];
            // If you want to fetch from Firestore:
            // const q = query(collection(db, 'departments'));
            // const querySnapshot = await getDocs(q);
            // ...
            setDepartments(staticDepts);
            setLoading(false);
        };
        fetchDepartments();
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

        const fetchCourses = async () => {
            // Here we would query firestore for courses where departmentId == departmentId
            // For now, returning mock/static based on ID
            // You previously had a list.
            const staticCourses: Course[] = [
                { id: '1', code: 'PHY 314', title: 'Solid State Physics', departmentId: 'physics_ed', level: '300L' },
                { id: '2', code: 'EDU 312', title: 'Research Methods', departmentId: 'physics_ed', level: '300L' },
                { id: '10', code: 'CSC 301', title: 'Structured Programming', departmentId: 'computer_science', level: '300L' },
            ];
            setCourses(staticCourses.filter(c => c.departmentId === departmentId));
            setLoading(false);
        };
        fetchCourses();
    }, [departmentId]);
    return { courses, loading };
}

export function useContributors() {
    const [contributors, setContributors] = useState<Contributor[]>([]);

    useEffect(() => {
        // Fetch from Firestore 'contributors' collection
        // For now mock
        setContributors([
            { name: 'Sarah Wilson', course: 'PHY 314', count: 12, date: '2d ago', department: 'Physics Ed', contributionCount: 15 },
            { name: 'James Olu', course: 'MTH 211', count: 8, date: '5d ago', department: 'Mathematics', contributionCount: 8 },
        ]);
    }, []);

    return { contributors };
}

export function useRecentPapers(departmentId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch recent papers
        setPapers([
            { id: '1', title: '2023 First Semester Exam', code: 'PHY 314', year: '2023', semester: 'First', type: 'Exam', url: '#', downloads: 124 },
            { id: '2', title: '2022 Second Semester Test', code: 'EDU 312', year: '2022', semester: 'Second', type: 'Test', url: '#', downloads: 89 },
        ]);
        setLoading(false);
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
            setLoading(false);
            return;
        }

        // 1. Listen to global notifications (sent to everyone or broadcast)
        // Assuming a 'notifications' collection where target is 'all' or userId is in targets.
        // For simplicity, let's say 'notifications' collection contains global alerts.
        // AND user-specific notifications would be in users/{uid}/notifications or similar.
        // Let's implement a simple global feed + read status tracking.

        // Better approach for scaling: 
        // - 'notifications' collection for broadcast/system messages.
        // - 'users/{uid}/read_notifications' contains IDs of read notifications.

        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));

            // Fetch read status for this user
            // We can store read status in a subcollection users/{uid}/readReceipts/{notifId}
            const receipts: Record<string, boolean> = {};
            if (userId) {
                // This is a naive read check (N reads). Better to store an array of read IDs in user profile if N is small,
                // or use subcollection. Let's assume subcollection 'read_notifications'
                const userReadRef = collection(db, 'users', userId, 'read_notifications');
                const readSnap = await getDocs(userReadRef);
                readSnap.docs.forEach(d => {
                    receipts[d.id] = true;
                });
            }

            const merged = notifs.map(n => ({
                ...n,
                isRead: !!receipts[n.id]
            }));

            setNotifications(merged);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, reading]); // dependency on reading to refresh list when marked read

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

export async function markAllNotificationsAsRead(_userId: string, _notificationIds: string[]) {
    // Batch write
    // ...
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
                // For now, return mock papers based on bookmark IDs
                const bookmarkedPapers: Paper[] = [
                    { id: '1', title: '2023 First Semester Exam', code: 'PHY 314', year: '2023', semester: 'First', type: 'Exam', url: '#', downloads: 124, courseId: '1' },
                    { id: '2', title: '2022 Second Semester Test', code: 'PHY 314', year: '2022', semester: 'Second', type: 'Test', url: '#', downloads: 89, courseId: '1' },
                ];
                // Filter to only bookmarked ones
                const bookmarkedIds = snapshot.docs.map(doc => doc.id);
                setPapers(bookmarkedPapers.filter(p => bookmarkedIds.includes(p.id)));
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

export async function toggleBookmark(userId: string, paperId: string, isBookmarked: boolean) {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'bookmarks', paperId);
    if (isBookmarked) {
        await setDoc(ref, { paperId, savedAt: new Date() });
    } else {
        try {
            await deleteDoc(ref);
        } catch (e) {
            // Already deleted or doesn't exist
        }
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
            setCourses([]);
            setLoading(false);
            return;
        }

        const fetchRecent = async () => {
            try {
                const q = query(collection(db, 'users', userId, 'recent_courses'), orderBy('viewedAt', 'desc'), limit(10));
                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(fetched);
            } catch (e) {
                console.error("Error fetching recent courses", e);
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

export function usePapers(courseId: string | undefined, departmentId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId || courseId === 'SKIP') {
            setPapers([]);
            setLoading(false);
            return;
        }

        const fetchPapers = async () => {
            try {
                const staticPapers: Paper[] = [
                    { id: '1', title: '2023 First Semester Exam', code: 'PHY 314', year: '2023', semester: 'First', type: 'Exam', url: '#', downloads: 124 },
                    { id: '2', title: '2022 Second Semester Test', code: 'PHY 314', year: '2022', semester: 'Second', type: 'Test', url: '#', downloads: 89 },
                ];
                setPapers(staticPapers);
            } catch (e) {
                console.error("Error fetching papers", e);
                setPapers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPapers();
    }, [courseId, departmentId]);

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
                    { id: '1', title: '2023 First Semester Exam', code: 'PHY 314', year: '2023', semester: 'First', type: 'Exam', url: '#', downloads: 124, courseId: '1' },
                    { id: '2', title: '2022 Second Semester Test', code: 'PHY 314', year: '2022', semester: 'Second', type: 'Test', url: '#', downloads: 89, courseId: '1' },
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
