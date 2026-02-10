import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Layers, Check, Loader2 } from 'lucide-react';

export function SeedAdminData() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            // Seed Admin Submissions
            const submissionsRef = collection(db, 'admin_submissions');
            await addDoc(submissionsRef, {
                userId: 'test_user_1',
                userName: 'John Doe',
                courseCode: 'CSC 301',
                paperTitle: '2023 Final Exam',
                paperType: 'Exam',
                year: '2023',
                semester: 'First',
                fileUrl: '#',
                status: 'pending',
                submittedAt: new Date()
            });
            await addDoc(submissionsRef, {
                userId: 'test_user_2',
                userName: 'Jane Smith',
                courseCode: 'PHY 202',
                paperTitle: '2024 Mid-Semester Test',
                paperType: 'Test',
                year: '2024',
                semester: 'Second',
                fileUrl: '#',
                status: 'pending',
                submittedAt: new Date(Date.now() - 86400000) // 1 day ago
            });

            // Seed Admin Logs
            const logsRef = collection(db, 'admin_logs');
            await addDoc(logsRef, {
                adminId: 'system',
                action: 'system_init',
                details: 'Admin dashboard initialized with seed data',
                timestamp: new Date()
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error seeding admin data:", error);
            alert("Failed to seed admin data. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSeed}
            disabled={loading || success}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${success
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-lg shadow-[#4F46E5]/25'
                }
            `}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Seeding...</span>
                </>
            ) : success ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>Seeded!</span>
                </>
            ) : (
                <>
                    <Layers className="w-4 h-4" />
                    <span>Seed Admin Data</span>
                </>
            )}
        </button>
    );
}
