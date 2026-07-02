import { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    documentId,
    or
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Department {
    id: string;
    name: string;
    code?: string;
    icon?: string;
    iconUrl?: string;
    backgroundUrl?: string;
}

export interface Course {
    id: string;
    code: string;
    title: string;
    departmentId: string;
    departmentIds?: string[];
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
    avatar?: string;
}

export interface Paper {
    id: string;
    title: string;
    code: string;
    year: string;
    semester: string;
    type: string;
    pdfUrl?: string;
    richTextContent?: string;
    driveFolderUrl?: string;
    thumbnailUrl?: string;
    pageCount?: number;
    downloads: number;
    isBookmarked?: boolean;
    courseId?: string;
    departmentId?: string;
    departmentIds?: string[];
}

export interface UserProfile {
    name?: string;
    email?: string;
    departmentId?: string;
    level?: string;
    avatar?: string;
    notificationSettings?: NotificationSettings;
    savedPapers?: string[]; // Array of paper IDs
    downloadsCount?: number; // Track PDF downloads
    isPremium: boolean;
    premiumExpiresAt?: any; // Firestore Timestamp
    createdAt?: any;
}

export type NotificationSwipeAction = 'markRead' | 'delete' | 'none';

export interface NotificationSettings {
    pushEnabled?: boolean;
    swipeRightAction?: NotificationSwipeAction;
    swipeLeftAction?: NotificationSwipeAction;
}

export interface Notification {
    id: string;
    title: string;
    body: string; // Changed from message to body to match Admin
    message?: string; // Backwards compatibility
    type: 'info' | 'alert' | 'warning' | 'success';
    target?: 'global' | 'department';
    targetId?: string;
    createdAt: any;
    isRead: boolean;
}

export interface StudentFeedback {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    departmentId?: string;
    departmentName?: string;
    level?: string;
    rating: number;
    message?: string;
    contextPath?: string;
    createdAt: any;
    updatedAt?: any;
}

const WELCOME_NOTIFICATION_ID = 'paperstack_welcome';
const WELCOME_NOTIFICATION_TITLE = 'Welcome to PaperStack';
const WELCOME_NOTIFICATION_BODY = 'Your study hub is ready. Set your department and level in Profile, explore past questions by course, save useful papers to your Library, and check Notifications for new uploads and important academic updates.';

let departmentsCache: Department[] | null = null;
const coursesCache: Record<string, Course[]> = {};
let allCoursesCache: Course[] | null = null;
let contributorsCache: Contributor[] | null = null;
const bookmarkedCoursesCache: Record<string, Course[]> = {};
const recentCoursesCache: Record<string, Course[]> = {};
const downloadedPapersCache: Record<string, Paper[]> = {};

export function clearCourseDataCaches() {
    Object.keys(coursesCache).forEach(key => delete coursesCache[key]);
    allCoursesCache = null;
    Object.keys(bookmarkedCoursesCache).forEach(key => delete bookmarkedCoursesCache[key]);
    Object.keys(recentCoursesCache).forEach(key => delete recentCoursesCache[key]);
    Object.keys(downloadedPapersCache).forEach(key => delete downloadedPapersCache[key]);
}

function normalizeDepartmentIds(data: { departmentId?: string; departmentIds?: unknown }) {
    if (Array.isArray(data.departmentIds) && data.departmentIds.length > 0) {
        return data.departmentIds.filter((id): id is string => typeof id === 'string' && id.length > 0);
    }
    return data.departmentId ? [data.departmentId] : [];
}

function mapCourseDoc(d: any): Course {
    const data = d.data() as any;
    const departmentIds = normalizeDepartmentIds(data);
    return {
        id: d.id,
        ...data,
        departmentId: data.departmentId || departmentIds[0] || '',
        departmentIds,
    } as Course;
}

async function mergeCoursePageCounts(courses: Course[], departmentId?: string) {
    const papersQuery = departmentId
        ? query(
            collection(db, 'papers'),
            or(
                where('departmentId', '==', departmentId),
                where('departmentIds', 'array-contains', departmentId)
            )
        )
        : query(collection(db, 'papers'));

    const papersSnapshot = await getDocs(papersQuery);
    const pageCountsByCourse = papersSnapshot.docs.reduce<Record<string, number>>((counts, paperDoc) => {
        const data = paperDoc.data() as any;
        const courseId = data.courseId;
        const pageCount = Number(data.pageCount || 0);
        if (courseId && pageCount > 0) counts[courseId] = Math.max(counts[courseId] || 0, pageCount);
        return counts;
    }, {});

    return courses.map(course => ({
        ...course,
        papers: pageCountsByCourse[course.id] ?? course.papers ?? 0,
    }));
}

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>(departmentsCache || []);
    const [loading, setLoading] = useState(!departmentsCache);

    useEffect(() => {
        let isMounted = true;
        const fetchDepartments = async () => {
            try {
                const q = query(collection(db, 'departments'));
                const snapshot = await getDocs(q);
                if (!isMounted) return;
                const depts: Department[] = snapshot.docs.map((d: any) => {
                    const data = d.data() as any;
                    return {
                        id: d.id,
                        name: data.name || d.id,
                        code: data.code,
                        icon: data.icon,
                        iconUrl: data.iconUrl,
                        backgroundUrl: data.backgroundUrl,
                    };
                });
                departmentsCache = depts;
                setDepartments(depts);
            } catch (err) {
                console.error('Error fetching departments:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDepartments();
        return () => { isMounted = false; };
    }, []);

    return { departments, loading };
}


export function useCourses(departmentId: string | undefined) {
    const cacheKey = departmentId || '';
    const [courses, setCourses] = useState<Course[]>(coursesCache[cacheKey] || []);
    const [loading, setLoading] = useState(!coursesCache[cacheKey]);

    useEffect(() => {
        if (!departmentId) {
            setCourses([]);
            setLoading(false);
            return;
        }

        let isMounted = true;
        if (coursesCache[departmentId]) {
            setCourses(coursesCache[departmentId]);
            setLoading(false);
        }
        const fetchCourses = async () => {
            setLoading(!coursesCache[departmentId]);
            try {
                const q = query(
                    collection(db, 'courses'),
                    or(
                        where('departmentId', '==', departmentId),
                        where('departmentIds', 'array-contains', departmentId)
                    )
                );
                const snapshot = await getDocs(q);
                if (!isMounted) return;
                const baseCourses = snapshot.docs.map(mapCourseDoc);
                const cs = await mergeCoursePageCounts(baseCourses, departmentId);
                coursesCache[departmentId] = cs;
                setCourses(cs);
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCourses();
        return () => { isMounted = false; };
    }, [departmentId]);
    return { courses, loading };
}

export function useAllCourses() {
    const [courses, setCourses] = useState<Course[]>(allCoursesCache || []);
    const [loading, setLoading] = useState(!allCoursesCache);

    useEffect(() => {
        let isMounted = true;

        if (allCoursesCache) {
            setCourses(allCoursesCache);
            setLoading(false);
        }

        const fetchCourses = async () => {
            setLoading(!allCoursesCache);
            try {
                const snapshot = await getDocs(query(collection(db, 'courses')));
                if (!isMounted) return;
                const baseCourses = snapshot.docs.map(mapCourseDoc);
                const cs = await mergeCoursePageCounts(baseCourses);
                allCoursesCache = cs;
                setCourses(cs);
            } catch (err) {
                console.error('Error fetching all courses:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCourses();
        return () => { isMounted = false; };
    }, []);

    return { courses, loading };
}

export function useContributors() {
    const [contributors, setContributors] = useState<Contributor[]>(contributorsCache || []);
    const [loading, setLoading] = useState(!contributorsCache);

    useEffect(() => {
        let isMounted = true;
        const fetchContributors = async () => {
            try {
                const q = query(collection(db, 'contributors'), orderBy('contributionCount', 'desc'), limit(10));
                const snapshot = await getDocs(q);
                if (!isMounted) return;
                const contribs: Contributor[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Contributor));
                contributorsCache = contribs;
                setContributors(contribs);
            } catch (err) {
                console.error('Error fetching contributors:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchContributors();
        return () => { isMounted = false; };
    }, []);

    return { contributors, loading };
}

export function useRecentPapers(departmentId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchPapers = async () => {
            setLoading(true);
            try {
                let q;
                if (departmentId) {
                    q = query(
                        collection(db, 'papers'),
                        or(
                            where('departmentId', '==', departmentId),
                            where('departmentIds', 'array-contains', departmentId)
                        ),
                        orderBy('createdAt', 'desc'),
                        limit(20)
                    );
                } else {
                    q = query(collection(db, 'papers'), orderBy('createdAt', 'desc'), limit(20));
                }

                const snapshot = await getDocs(q);
                if (!isMounted) return;
                const docs = snapshot.docs.map(d => {
                    const data = d.data() as any;
                    const departmentIds = normalizeDepartmentIds(data);
                    return {
                        id: d.id,
                        title: data.title || `${data.courseCode || data.code || ''} ${data.year || ''}`.trim(),
                        code: data.courseCode || data.code || '',
                        year: data.year || '',
                        semester: data.semester || '',
                        type: data.type || '',
                        pdfUrl: data.pdfUrl || data.url || '',
                        thumbnailUrl: data.thumbnailUrl || '',
                        pageCount: data.pageCount || undefined,
                        downloads: data.downloads || 0,
                        courseId: data.courseId || data.course || undefined,
                        departmentId: data.departmentId || departmentIds[0],
                        departmentIds,
                    } as Paper;
                });
                setPapers(docs);
            } catch (err) {
                console.error('Error fetching recent papers:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPapers();
        return () => { isMounted = false; };
    }, [departmentId]);

    return { papers, loading };
}

// Global Notifications Hook
export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [reading, setReading] = useState(false);

    // Need user profile to filter by department
    const { profile } = useUserProfile(userId);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Only proceed if we have the profile loaded (or if we decide to show nothing until then)
        // But profile might be null if not found. 

        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Map message to body if body is missing (legacy)
                    body: doc.data().body || doc.data().message || ''
                } as Notification));

                // Fetch per-user receipts for read and deleted state.
                const receipts: Record<string, boolean> = {};
                const deletedReceipts: Record<string, boolean> = {};
                try {
                    const userReadRef = collection(db, 'users', userId, 'read_notifications');
                    const readSnap = await getDocs(userReadRef);
                    readSnap.docs.forEach(d => {
                        receipts[d.id] = true;
                    });
                } catch (e) {
                    console.warn('Could not load notification read receipts:', e);
                }

                try {
                    const userDeletedRef = collection(db, 'users', userId, 'deleted_notifications');
                    const deletedSnap = await getDocs(userDeletedRef);
                    deletedSnap.docs.forEach(d => {
                        deletedReceipts[d.id] = true;
                    });
                } catch (e) {
                    console.warn('Could not load notification delete receipts:', e);
                }

                // FILTERING LOGIC
                const filtered = notifs.filter(n => {
                    if (deletedReceipts[n.id]) return false;
                    if (n.id === 'notif1' && n.title?.toLowerCase().includes('welcome to paperstack')) return false;

                    // 1. Global: Always show
                    if (!n.target || n.target === 'global') return true;

                    // 2. Department: Show if matches user's department
                    if (n.target === 'department') {
                        return profile?.departmentId === n.targetId;
                    }

                    return true;
                });

                const welcomeNotification: Notification | null = deletedReceipts[WELCOME_NOTIFICATION_ID]
                    ? null
                    : {
                        id: WELCOME_NOTIFICATION_ID,
                        title: WELCOME_NOTIFICATION_TITLE,
                        body: WELCOME_NOTIFICATION_BODY,
                        type: 'info',
                        target: 'global',
                        createdAt: profile?.createdAt || null,
                        isRead: !!receipts[WELCOME_NOTIFICATION_ID]
                    };

                const merged = filtered.map(n => ({
                    ...n,
                    isRead: !!receipts[n.id]
                }));

                setNotifications(welcomeNotification ? [...merged, welcomeNotification] : merged);
                setLoading(false);
            } catch (e: any) {
                console.error(e);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userId, reading, profile?.departmentId, profile?.createdAt]); // Re-run if profile loads/changes

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

export async function deleteNotificationForUser(userId: string, notificationId: string) {
    if (!userId || !notificationId) return;
    const userDeletedRef = doc(db, 'users', userId, 'deleted_notifications', notificationId);
    await setDoc(userDeletedRef, { deletedAt: new Date() });
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

export async function submitStudentFeedback({
    user,
    profile,
    departmentName,
    rating,
    message,
    contextPath
}: {
    user: any;
    profile?: UserProfile | null;
    departmentName?: string;
    rating: number;
    message?: string;
    contextPath?: string;
}) {
    if (!user?.uid) return;

    const now = new Date();
    const feedbackRef = doc(db, 'student_feedback', user.uid);

    await setDoc(feedbackRef, {
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Student',
        userEmail: profile?.email || user.email || '',
        userAvatar: profile?.avatar || user.photoURL || '',
        departmentId: profile?.departmentId || '',
        departmentName: departmentName || '',
        level: profile?.level || '',
        rating,
        message: message?.trim() || '',
        contextPath: contextPath || '',
        createdAt: now,
        updatedAt: now
    }, { merge: true });
}

export function useStudentFeedbackResponses() {
    const [feedback, setFeedback] = useState<StudentFeedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'student_feedback'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFeedback(snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as StudentFeedback)));
            setLoading(false);
        }, (error) => {
            console.error('Error fetching student feedback:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { feedback, loading };
}

function getFeatureInterestDocId(userId: string, featureName: string) {
    const featureKey = featureName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'feature';

    return `${userId}_${featureKey}`;
}

export async function recordFeatureInterest(user: any, featureName: string) {
    if (!user?.uid) return;
    await setDoc(doc(db, 'feature_interest', getFeatureInterestDocId(user.uid, featureName)), {
        userId: user.uid,
        userName: user.displayName || user.name || 'Anonymous',
        userEmail: user.email || '',
        userAvatar: user.photoURL || user.avatar || '',
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
    const cacheKey = userId || '';
    const [courses, setCourses] = useState<Course[]>(bookmarkedCoursesCache[cacheKey] || []);
    const [loading, setLoading] = useState(!bookmarkedCoursesCache[cacheKey]);

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
                    bookmarkedCoursesCache[userId] = [];
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

                bookmarkedCoursesCache[userId] = coursesData;
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
                await getDocs(q);
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

export async function recordRecentCourse(userId: string, course: Course) {
    if (!userId || !course.id) return;
    const ref = doc(db, 'users', userId, 'recent_courses', course.id);
    // Store full course data for display
    await setDoc(ref, {
        courseId: course.id,
        code: course.code,
        title: course.title,
        level: course.level,
        semester: course.semester,
        lecturer: course.lecturer,
        papers: course.papers,
        driveFolderUrl: course.driveFolderUrl,
        departmentId: course.departmentId || course.departmentIds?.[0] || '',
        departmentIds: course.departmentIds?.length ? course.departmentIds : (course.departmentId ? [course.departmentId] : []),
        viewedAt: new Date()
    });
}

export async function recordPaperDownload(userId: string, paper: Paper) {
    if (!userId || !paper.id) return;
    const ref = doc(db, 'users', userId, 'downloaded_papers', paper.id);
    await setDoc(ref, {
        paperId: paper.id,
        title: paper.title,
        code: paper.code,
        year: paper.year,
        semester: paper.semester,
        type: paper.type,
        pdfUrl: paper.pdfUrl || null,
        richTextContent: paper.richTextContent || null,
        courseId: paper.courseId || null,
        departmentId: paper.departmentId || paper.departmentIds?.[0] || null,
        departmentIds: paper.departmentIds || [],
        downloadedAt: new Date()
    });
}

export async function removePaperDownload(userId: string, paperId: string) {
    if (!userId || !paperId) return;
    await deleteDoc(doc(db, 'users', userId, 'downloaded_papers', paperId));
    if (downloadedPapersCache[userId]) {
        downloadedPapersCache[userId] = downloadedPapersCache[userId].filter(paper => paper.id !== paperId);
    }
}

export function useDownloadedPapers(userId: string | undefined) {
    const cacheKey = userId || '';
    const [papers, setPapers] = useState<Paper[]>(downloadedPapersCache[cacheKey] || []);
    const [loading, setLoading] = useState(!downloadedPapersCache[cacheKey]);

    // Step 1: Immediately load from IndexedDB (the true offline source of truth)
    useEffect(() => {
        let cancelled = false;
        import('@/lib/indexedDB').then(({ getAllOfflinePapers }) => {
            getAllOfflinePapers().then(offlinePapers => {
                if (cancelled) return;
                if (offlinePapers.length > 0 && papers.length === 0) {
                    const localPapers: Paper[] = offlinePapers.map(op => ({
                        id: op.paperId,
                        title: op.title || 'Downloaded Paper',
                        code: '',
                        year: '',
                        semester: '',
                        type: op.type === 'pdf' ? 'pdf' : 'native',
                    } as Paper));
                    setPapers(localPapers);
                    setLoading(false);
                }
            }).catch(() => {});
        });
        return () => { cancelled = true; };
    }, [userId]);

    // Step 2: Listen to Firestore for full metadata (when online, this overrides the IndexedDB list)
    useEffect(() => {
        if (!userId) {
            setPapers([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users', userId, 'downloaded_papers'),
            orderBy('downloadedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data
                } as Paper;
            });
            downloadedPapersCache[userId] = fetched;
            setPapers(fetched);
            setLoading(false);
        }, (err) => {
            console.error('[useDownloadedPapers] Firestore error (likely offline):', err);
            // CRITICAL: Do NOT wipe papers to []. Keep whatever we already have.
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { papers, loading };
}

export function useRecentCourses(userId: string | undefined) {
    const cacheKey = userId || '';
    const [courses, setCourses] = useState<Course[]>(recentCoursesCache[cacheKey] || []);
    const [loading, setLoading] = useState(!recentCoursesCache[cacheKey]);

    useEffect(() => {
        if (!userId) {
            setCourses([]);
            setLoading(false);
            return;
        }

        // Listen to recent_courses subcollection with real-time updates
        const q = query(
            collection(db, 'users', userId, 'recent_courses'),
            orderBy('viewedAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const recentRows = snapshot.docs.map(docSnap => ({ id: docSnap.id, data: docSnap.data() }));
            const courseIds = recentRows.map(row => row.id);
            const liveCourses: Record<string, any> = {};
            const livePageCounts: Record<string, number> = {};

            for (let i = 0; i < courseIds.length; i += 30) {
                const batch = courseIds.slice(i, i + 30);
                try {
                    const coursesSnap = await getDocs(query(collection(db, 'courses'), where(documentId(), 'in', batch)));
                    coursesSnap.docs.forEach(courseDoc => {
                        liveCourses[courseDoc.id] = courseDoc.data();
                    });
                } catch (err) {
                    console.warn('[useRecentCourses] Error refreshing course batch:', err);
                }

                try {
                    const papersSnap = await getDocs(query(collection(db, 'papers'), where('courseId', 'in', batch)));
                    papersSnap.docs.forEach(paperDoc => {
                        const data = paperDoc.data() as any;
                        const pageCount = Number(data.pageCount || 0);
                        if (data.courseId && pageCount > 0) {
                            livePageCounts[data.courseId] = Math.max(livePageCounts[data.courseId] || 0, pageCount);
                        }
                    });
                } catch (err) {
                    console.warn('[useRecentCourses] Error refreshing page counts:', err);
                }
            }

            const fetched = recentRows.map(row => {
                const data = { ...row.data, ...(liveCourses[row.id] || {}) };
                const departmentIds = normalizeDepartmentIds(data);
                return {
                    id: row.id,
                    code: data.code || '',
                    title: data.title || '',
                    departmentId: data.departmentId || departmentIds[0] || '',
                    departmentIds,
                    level: data.level || '',
                    semester: data.semester,
                    lecturer: data.lecturer,
                    papers: livePageCounts[row.id] ?? data.papers ?? 0,
                    driveFolderUrl: data.driveFolderUrl
                } as Course;
            });
            recentCoursesCache[userId] = fetched;
            setCourses(fetched);
            setLoading(false);
        }, (err) => {
            console.error('[useRecentCourses] Error:', err);
            setCourses([]);
            setLoading(false);
        });

        return () => unsubscribe();
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
        if (!departmentId) {
            setPapers([]);
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchDepartmentPapers = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'papers'),
                    or(
                        where('departmentId', '==', departmentId),
                        where('departmentIds', 'array-contains', departmentId)
                    )
                );
                const snapshot = await getDocs(q);
                if (!isMounted) return;
                const docs = snapshot.docs.map(d => {
                    const data = d.data() as any;
                    const departmentIds = normalizeDepartmentIds(data);
                    return {
                        id: d.id,
                        title: data.title || `${data.courseCode || data.code || ''} ${data.year || ''}`.trim(),
                        code: data.courseCode || data.code || '',
                        year: data.year || '',
                        semester: data.semester || '',
                        type: data.type || '',
                        pdfUrl: data.pdfUrl || data.url || '',
                        thumbnailUrl: data.thumbnailUrl || '',
                        pageCount: data.pageCount || undefined,
                        downloads: data.downloads || 0,
                        courseId: data.courseId || data.course || undefined,
                        departmentId: data.departmentId || departmentIds[0],
                        departmentIds,
                    } as Paper;
                });
                setPapers(docs);
            } catch (err) {
                console.error('Error fetching papers:', err);
                if (isMounted) setPapers([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDepartmentPapers();
        return () => { isMounted = false; };
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

        let isMounted = true;
        const fetchPaper = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'papers', paperId);
                const docSnap = await getDoc(docRef);
                if (!isMounted) return;
                if (docSnap.exists()) {
                    const data = docSnap.data() as any;
                    const departmentIds = normalizeDepartmentIds(data);
                    setPaper({
                        id: docSnap.id,
                        title: data.title || `${data.courseCode || data.code || ''} ${data.year || ''}`.trim(),
                        code: data.courseCode || data.code || '',
                        year: data.year || '',
                        semester: data.semester || '',
                        type: data.type || '',
                        pdfUrl: data.pdfUrl || data.url || '',
                        richTextContent: data.richTextContent || '',
                        thumbnailUrl: data.thumbnailUrl || '',
                        pageCount: data.pageCount || undefined,
                        downloads: data.downloads || 0,
                        courseId: data.courseId || undefined,
                        departmentId: data.departmentId || departmentIds[0],
                        departmentIds,
                    });
                } else {
                    setPaper(null);
                }
            } catch (e) {
                console.error("Error fetching paper:", e);
                if (isMounted) setPaper(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchPaper();
        return () => { isMounted = false; };
    }, [paperId]);

    return { paper, loading };
}

// Fetch all papers for a specific course
export function useCoursePapers(courseId: string | undefined) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) {
            setPapers([]);
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchPapers = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'papers'), where('courseId', '==', courseId));
                const snapshot = await getDocs(q);
                if (!isMounted) return;
                const docs = snapshot.docs.map(d => {
                    const data = d.data() as any;
                    const departmentIds = normalizeDepartmentIds(data);
                    return {
                        id: d.id,
                        title: data.title || `${data.courseCode || data.code || ''} ${data.year || ''}`.trim(),
                        code: data.courseCode || data.code || '',
                        year: data.year || '',
                        semester: data.semester || '',
                        type: data.type || '',
                        pdfUrl: data.pdfUrl || data.url || '',
                        richTextContent: data.richTextContent || '',
                        thumbnailUrl: data.thumbnailUrl || '',
                        pageCount: data.pageCount || undefined,
                        downloads: data.downloads || 0,
                        courseId: data.courseId || undefined,
                        departmentId: data.departmentId || departmentIds[0],
                        departmentIds,
                    } as Paper;
                });
                setPapers(docs);
            } catch (err) {
                console.error('Error fetching course papers:', err);
                if (isMounted) setPapers([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPapers();
        return () => { isMounted = false; };
    }, [courseId]);

    return { papers, loading };
}

export function useUserCount() {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchUserCount = async () => {
            try {
                const q = query(collection(db, 'users'));
                const snapshot = await getDocs(q);
                if (isMounted) setCount(snapshot.size);
            } catch (err) {
                console.error('Error fetching user count:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUserCount();
        return () => { isMounted = false; };
    }, []);

    return { count, loading };
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

export interface GlobalConfig {
    maintenanceMode: boolean;
    currentSemester: string;
    currentSession: string;
    platformName: string;
}

export interface PricingOption {
    amount: number;
    label: string;
}

export interface PricingConfig {
    title: string;
    description: string;
    options: PricingOption[];
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
    title: 'Fair Price?',
    description: 'PaperStack Premium will launch next semester. What would you consider a fair price for all these features per semester?',
    options: [
        { amount: 1000, label: '\u20A61,000 / Semester' },
        { amount: 2000, label: '\u20A62,000 / Semester' },
        { amount: 3000, label: '\u20A63,000 / Semester' },
    ],
};

export function useGlobalConfig() {
    const [config, setConfig] = useState<GlobalConfig>({
        maintenanceMode: false,
        currentSemester: '1st',
        currentSession: '2023/2024',
        platformName: 'PaperStack'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as GlobalConfig;
                // Normalize semester for consistent filtering across components
                // "1st" -> "First", "2nd" -> "Second"
                const normalized = data.currentSemester === '1st' ? 'First' :
                    data.currentSemester === '2nd' ? 'Second' :
                        data.currentSemester;

                setConfig({
                    ...data,
                    currentSemester: normalized
                });
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching global config:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { config, loading };
}

export function usePricingConfig() {
    const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'config', 'pricing'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Partial<PricingConfig>;
                const options = Array.isArray(data.options)
                    ? data.options
                        .map((option: any) => ({
                            amount: Number(option.amount) || 0,
                            label: option.label || `\u20A6${Number(option.amount || 0).toLocaleString()} / Semester`,
                        }))
                        .filter(option => option.amount > 0)
                    : DEFAULT_PRICING_CONFIG.options;

                setPricingConfig({
                    title: data.title || DEFAULT_PRICING_CONFIG.title,
                    description: data.description || DEFAULT_PRICING_CONFIG.description,
                    options: options.length ? options : DEFAULT_PRICING_CONFIG.options,
                });
            } else {
                setPricingConfig(DEFAULT_PRICING_CONFIG);
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching pricing config:', err);
            setPricingConfig(DEFAULT_PRICING_CONFIG);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { pricingConfig, loading };
}

// PREMIUM ARCHITECTURE HOOKS & FUNCTIONS

export interface Exam {
    courseId?: string;
    courseCode: string;
    title: string;
    date: string;
    time: string;
}

export interface Timetable {
    departmentId: string;
    exams: Exam[];
}

export function useTimetable(departmentId: string | undefined) {
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!departmentId) {
            setTimetable(null);
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, 'timetables', departmentId), (snap) => {
            if (snap.exists()) {
                setTimetable(snap.data() as Timetable);
            } else {
                setTimetable(null);
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching timetable:', err);
            setLoading(false);
        });

        return () => unsub();
    }, [departmentId]);

    return { timetable, loading };
}

export interface RepeatedQuestion {
    courseId?: string;
    courseCode: string;
    questions: string;
    updatedAt: any;
}

export interface RepeatedQuestionsData {
    departmentId: string;
    items: RepeatedQuestion[];
}

export function useRepeatedQuestions(departmentId: string | undefined) {
    const [data, setData] = useState<RepeatedQuestionsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!departmentId) {
            setData(null);
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, 'repeated_questions', departmentId), (snap) => {
            if (snap.exists()) {
                setData(snap.data() as RepeatedQuestionsData);
            } else {
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching repeated questions:', err);
            setLoading(false);
        });

        return () => unsub();
    }, [departmentId]);

    return { data, loading };
}

export async function submitPricingFeedback(user: any, suggestedPrice: number) {
    if (!user?.uid) return;
    await setDoc(doc(db, 'pricingFeedback', user.uid), {
        userId: user.uid,
        userName: user.displayName || user.name || 'Anonymous',
        userEmail: user.email || '',
        userAvatar: user.photoURL || user.avatar || '',
        suggestedPrice,
        createdAt: new Date()
    });
}

/**
 * Fetches the first available thumbnail URL for a list of courses.
 * Returns a map of courseId -> thumbnailUrl for use in course card previews.
 */
export function useCourseThumbnails(courseIds: string[]) {
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!courseIds.length) {
            setThumbnails({});
            return;
        }

        let isMounted = true;
        const fetchThumbnails = async () => {
            setLoading(true);
            const thumbMap: Record<string, string> = {};

            // Firestore 'in' queries support max 30 items per batch
            const batches: string[][] = [];
            for (let i = 0; i < courseIds.length; i += 30) {
                batches.push(courseIds.slice(i, i + 30));
            }

            for (const batch of batches) {
                try {
                    const q = query(
                        collection(db, 'papers'),
                        where('courseId', 'in', batch),
                        where('thumbnailUrl', '!=', ''),
                        limit(batch.length)
                    );
                    const snapshot = await getDocs(q);
                    snapshot.docs.forEach(d => {
                        const data = d.data();
                        // Only set first thumbnail per course
                        if (data.courseId && data.thumbnailUrl && !thumbMap[data.courseId]) {
                            thumbMap[data.courseId] = data.thumbnailUrl;
                        }
                    });
                } catch (err) {
                    console.warn('[useCourseThumbnails] Error fetching batch:', err);
                }
            }

            if (isMounted) {
                setThumbnails(thumbMap);
                setLoading(false);
            }
        };

        fetchThumbnails();
        return () => { isMounted = false; };
    }, [courseIds.join(',')]); // Stringify array to avoid infinite re-renders

    return { thumbnails, loading };
}
