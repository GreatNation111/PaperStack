import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Department {
    id: string;
    name: string;
    code: string;
}

export interface Course {
    id: string;
    code: string;
    title: string;
    departmentId: string;
    level: string;
    semester?: string;
}

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDepartments() {
            try {
                const q = query(collection(db, 'departments'), orderBy('name'));
                const querySnapshot = await getDocs(q);
                const depts: Department[] = [];
                querySnapshot.forEach((doc) => {
                    depts.push({ id: doc.id, ...doc.data() } as Department);
                });
                setDepartments(depts);
            } catch (error) {
                console.error("Error fetching departments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDepartments();
    }, []);

    return { departments, loading };
}

export interface Contributor {
    id: string;
    name: string;
    department: string;
    levelOrYear: string;
    contributionCount: number;
    badge?: string;
}

export function useCourses(departmentId?: string) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            try {
                let q;
                if (departmentId) {
                    q = query(collection(db, 'courses'), where('departmentId', '==', departmentId));
                } else {
                    q = query(collection(db, 'courses'), limit(20)); // Limit for "all" view
                }

                const querySnapshot = await getDocs(q);
                const fetchedCourses: Course[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
                });
                setCourses(fetchedCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [departmentId]);

    return { courses, loading };
}

export function useContributors() {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContributors() {
            try {
                const q = query(collection(db, 'contributors'), orderBy('contributionCount', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);
                const contribs: Contributor[] = [];
                querySnapshot.forEach((doc) => {
                    contribs.push({ id: doc.id, ...doc.data() } as Contributor);
                });
                setContributors(contribs);
            } catch (error) {
                console.error("Error fetching contributors:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchContributors();
    }, []);

    return { contributors, loading };
}

export function useRecentCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                // For now, just fetching some courses. In a real app, this might rely on "recently viewed" user history
                // or just the latest added courses.
                const q = query(collection(db, 'courses'), limit(5));
                const querySnapshot = await getDocs(q);
                const fetchedCourses: Course[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
                });
                setCourses(fetchedCourses);
            } catch (error) {
                console.error("Error fetching recent courses:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    return { courses, loading };
}
// ... existing code ...

export interface Paper {
    id: string;
    departmentId: string;
    courseId: string;
    courseCode: string; // Denormalized for easier display
    year: string;
    semester: string;
    type: 'Exam' | 'Test' | 'Midterm';
    pdfUrl?: string;
    isPublished: boolean;
    createdAt: any;
}

export function useCourse(courseIdOrCode?: string) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourse() {
            if (!courseIdOrCode) return;
            setLoading(true);
            try {
                // Try to find by ID first
                const docRef = doc(db, 'courses', courseIdOrCode);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
                } else {
                    // Fallback: try to find by code (e.g. "PHY 101")
                    // Note: This assumes codes are unique. Ideally we use IDs.
                    const q = query(collection(db, 'courses'), where('code', '==', courseIdOrCode));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        setCourse({ id: doc.id, ...doc.data() } as Course);
                    } else {
                        setCourse(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourse();
    }, [courseIdOrCode]);

    return { course, loading };
}

export function usePapers(courseId?: string, departmentId?: string) {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPapers() {
            setLoading(true);
            try {
                let q;
                if (courseId) {
                    q = query(
                        collection(db, 'papers'),
                        where('courseId', '==', courseId),
                        where('isPublished', '==', true)
                    );
                } else if (departmentId) {
                    // Filter by department if no course specified
                    q = query(
                        collection(db, 'papers'),
                        where('departmentId', '==', departmentId),
                        where('isPublished', '==', true),
                        limit(50)
                    );
                } else {
                    // Fetch all papers (or recent ones) if no course OR department specified
                    q = query(
                        collection(db, 'papers'),
                        where('isPublished', '==', true),
                        limit(50)
                    );
                }

                const querySnapshot = await getDocs(q);
                const fetchedPapers: Paper[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedPapers.push({ id: doc.id, ...doc.data() } as Paper);
                });

                // Client-side sort if compound index is missing
                fetchedPapers.sort((a, b) => b.year.localeCompare(a.year));

                setPapers(fetchedPapers);
            } catch (error) {
                console.error("Error fetching papers:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPapers();
    }, [courseId]);

    return { papers, loading };
}
