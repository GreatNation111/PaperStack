import { db } from '@/lib/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

export async function seedDatabase() {
    const batch = writeBatch(db);
    let queued = 0;
    let skipped = 0;

    const queueIfMissing = async (collectionName: string, item: { id: string; [key: string]: any }) => {
        const ref = doc(db, collectionName, item.id);
        const existing = await getDoc(ref);

        if (existing.exists()) {
            skipped++;
            return;
        }

        batch.set(ref, item);
        queued++;
    };

    // 1. Departments (Sync with existing simple schema)
    const departments = [
        { id: 'physics_ed', name: 'Physics Education', code: 'PHY ED', icon: 'atom' },
        { id: 'computer_ed', name: 'Computer Education', code: 'CSC ED', icon: 'cpu' },
        { id: 'industrial_tech', name: 'Industrial Tech Education', code: 'IND TECH', icon: 'wrench' },
        { id: 'business_ed', name: 'Business Education', code: 'BUS ED', icon: 'briefcase' },
        { id: 'chemistry', name: 'Chemistry', code: 'CHM', icon: 'flask' },
        { id: 'biology_ed', name: 'Biology Education', code: 'BIO ED', icon: 'leaf' },
        { id: 'art_ed', name: 'Art Education', code: 'ART ED', icon: 'palette' },
    ];

    for (const dept of departments) {
        await queueIfMissing('departments', dept);
    }

    // 2. Courses
    const courses = [
        { id: 'phy101', code: 'PHY 101', title: 'General Physics I', departmentId: 'physics_ed', level: '100L', semester: 'First', papers: 5, lecturer: 'Dr. Einstein', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-phy101' },
        { id: 'phy102', code: 'PHY 102', title: 'General Physics II', departmentId: 'physics_ed', level: '100L', semester: 'Second', papers: 3, lecturer: 'Prof. Newton', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-phy102' },
        { id: 'csc101', code: 'CSC 101', title: 'Introduction to Computer Science', departmentId: 'computer_ed', level: '100L', semester: 'First', papers: 8, lecturer: 'Dr. Lovelace', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-csc101' },
        { id: 'csc201', code: 'CSC 201', title: 'Programming I', departmentId: 'computer_ed', level: '200L', semester: 'First', papers: 6, lecturer: 'Dr. Turing', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-csc201' },
        { id: 'ind101', code: 'IND 101', title: 'Intro to Industrial Technology', departmentId: 'industrial_tech', level: '100L', semester: 'First', papers: 2, lecturer: 'Engr. Fixit', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-ind101' },
        { id: 'bus101', code: 'BUS 101', title: 'Principles of Business', departmentId: 'business_ed', level: '100L', semester: 'Second', papers: 10, lecturer: 'Dr. Bezos', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-bus101' },
        { id: 'chm101', code: 'CHM 101', title: 'General Chemistry I', departmentId: 'chemistry', level: '100L', semester: 'First', papers: 7, lecturer: 'Mme. Curie', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-chm101' },
    ];

    for (const course of courses) {
        await queueIfMissing('courses', course);
    }

    // 3. Contributors
    const contributors = [
        { id: 'user1', name: 'Ada Lovelace', department: 'Computer Education', levelOrYear: '400L', contributionCount: 42, badge: 'Top Contributor' },
        { id: 'user2', name: 'Isaac Newton', department: 'Physics Education', levelOrYear: '300L', contributionCount: 28 },
        { id: 'user3', name: 'Marie Curie', department: 'Chemistry', levelOrYear: '200L', contributionCount: 15 },
    ];

    for (const contributor of contributors) {
        await queueIfMissing('contributors', contributor);
    }

    // 4. Notifications
    const notifications = [
        { id: 'notif1', title: 'Welcome to PaperStack!', message: 'Start exploring past questions to prepare for your exams.', type: 'info', createdAt: new Date(), isRead: false },
    ];

    for (const notif of notifications) {
        await queueIfMissing('notifications', notif);
    }

    try {
        if (queued === 0) {
            console.log(`Seed skipped: all default records already exist (${skipped} checked).`);
            return true;
        }

        await batch.commit();
        console.log(`Seed completed safely. Added ${queued} missing records and skipped ${skipped} existing records.`);
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
}
