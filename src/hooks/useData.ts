import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
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
