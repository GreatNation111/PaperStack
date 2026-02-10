import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminSubmission {
    id: string;
    userId: string;
    userName?: string;
    courseCode: string;
    paperTitle: string;
    paperType: 'Exam' | 'Test' | 'Assignment' | 'Other';
    year: string;
    semester: 'First' | 'Second';
    fileUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: any;
}

export interface AdminLog {
    id: string;
    adminId: string;
    adminName?: string;
    action: string;
    details: string;
    timestamp: any;
}

export function useAdminSubmissions() {
    const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'admin_submissions'), orderBy('submittedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AdminSubmission));
            setSubmissions(data);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching admin submissions:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { submissions, loading };
}

export function useAdminLogs() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AdminLog));
            setLogs(data);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching admin logs:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { logs, loading };
}

export async function updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected', adminId: string) {
    const ref = doc(db, 'admin_submissions', submissionId);
    await updateDoc(ref, { status });

    // Log the action
    await addDoc(collection(db, 'admin_logs'), {
        adminId,
        action: `submission_${status}`,
        details: `Submission ${submissionId} was ${status}`,
        timestamp: new Date()
    });
}
