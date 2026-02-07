import { db, auth } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

export async function seedDatabase() {
    // Development mode - no auth required for seeding
    // TODO: Add admin authentication check when admin panel is built
    
    const batch = writeBatch(db);

    // 1. Departments
    const departments = [
        { id: 'physics_ed', name: 'Physics Education', code: 'PHY ED', icon: 'atom' },
        { id: 'computer_ed', name: 'Computer Education', code: 'CSC ED', icon: 'cpu' },
        { id: 'industrial_tech', name: 'Industrial Tech Education', code: 'IND TECH', icon: 'wrench' },
        { id: 'business_ed', name: 'Business Education', code: 'BUS ED', icon: 'briefcase' },
        { id: 'chemistry', name: 'Chemistry', code: 'CHM', icon: 'flask' }, // User just said "Chemistry card" but implied fitting the others
    ];

    departments.forEach(dept => {
        const ref = doc(db, 'departments', dept.id);
        batch.set(ref, dept);
    });

    // 2. Courses (MVP: with driveFolderUrl pointing to Google Drive folder)
    const courses = [
        // Physics Ed
        { id: 'phy101', code: 'PHY 101', title: 'General Physics I', departmentId: 'physics_ed', level: '100L', semester: 'First', papers: 5, lecturer: 'Dr. Einstein', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-phy101' },
        { id: 'phy102', code: 'PHY 102', title: 'General Physics II', departmentId: 'physics_ed', level: '100L', semester: 'Second', papers: 3, lecturer: 'Prof. Newton', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-phy102' },
        // Computer Ed
        { id: 'csc101', code: 'CSC 101', title: 'Introduction to Computer Science', departmentId: 'computer_ed', level: '100L', semester: 'First', papers: 8, lecturer: 'Dr. Lovelace', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-csc101' },
        { id: 'csc201', code: 'CSC 201', title: 'Programming I', departmentId: 'computer_ed', level: '200L', semester: 'First', papers: 6, lecturer: 'Dr. Turing', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-csc201' },
        // Industrial Tech
        { id: 'ind101', code: 'IND 101', title: 'Intro to Industrial Technology', departmentId: 'industrial_tech', level: '100L', semester: 'First', papers: 2, lecturer: 'Engr. Fixit', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-ind101' },
        // Business Ed
        { id: 'bus101', code: 'BUS 101', title: 'Principles of Business', departmentId: 'business_ed', level: '100L', semester: 'Second', papers: 10, lecturer: 'Dr. Bezos', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-bus101' },
        // Chemistry
        { id: 'chm101', code: 'CHM 101', title: 'General Chemistry I', departmentId: 'chemistry', level: '100L', semester: 'First', papers: 7, lecturer: 'Mme. Curie', driveFolderUrl: 'https://drive.google.com/drive/folders/1-placeholder-chm101' },
    ];

    courses.forEach(course => {
        const ref = doc(db, 'courses', course.id);
        batch.set(ref, course);
    });

    // 3. Contributors
    const contributors = [
        { id: 'user1', name: 'Ada Lovelace', department: 'Computer Education', levelOrYear: '400L', contributionCount: 42, badge: 'Top Contributor' },
        { id: 'user2', name: 'Isaac Newton', department: 'Physics Education', levelOrYear: '300L', contributionCount: 28 },
        { id: 'user3', name: 'Marie Curie', department: 'Chemistry', levelOrYear: '200L', contributionCount: 15 },
    ];

    contributors.forEach(contributor => {
        const ref = doc(db, 'contributors', contributor.id);
        batch.set(ref, contributor);
    });

    // 4. Notifications (sample)
    const notifications = [
        { id: 'notif1', title: 'Welcome to PaperStack!', message: 'Start exploring past questions to prepare for your exams.', type: 'info', createdAt: new Date(), isRead: false },
    ];

    notifications.forEach(notif => {
        const ref = doc(db, 'notifications', notif.id);
        batch.set(ref, notif);
    });

    try {
        await batch.commit();
        console.log('Database seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
}
