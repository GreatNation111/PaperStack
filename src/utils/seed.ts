import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

export async function seedDatabase() {
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

    // 2. Courses (Sample data for these departments)
    const courses = [
        // Physics Ed
        { id: 'phy101', code: 'PHY 101', title: 'General Physics I', departmentId: 'physics_ed', level: '100L', semester: 'First', papers: 5, lecturer: 'Dr. Einstein' },
        { id: 'phy102', code: 'PHY 102', title: 'General Physics II', departmentId: 'physics_ed', level: '100L', semester: 'Second', papers: 3, lecturer: 'Prof. Newton' },
        // Computer Ed
        { id: 'csc101', code: 'CSC 101', title: 'Introduction to Computer Science', departmentId: 'computer_ed', level: '100L', semester: 'First', papers: 8, lecturer: 'Dr. Lovelace' },
        { id: 'csc201', code: 'CSC 201', title: 'Programming I', departmentId: 'computer_ed', level: '200L', semester: 'First', papers: 6, lecturer: 'Dr. Turing' },
        // Industrial Tech
        { id: 'ind101', code: 'IND 101', title: 'Intro to Industrial Technology', departmentId: 'industrial_tech', level: '100L', semester: 'First', papers: 2, lecturer: 'Engr. Fixit' },
        // Business Ed
        { id: 'bus101', code: 'BUS 101', title: 'Principles of Business', departmentId: 'business_ed', level: '100L', semester: 'Second', papers: 10, lecturer: 'Dr. Bezos' },
        // Chemistry
        { id: 'chm101', code: 'CHM 101', title: 'General Chemistry I', departmentId: 'chemistry', level: '100L', semester: 'First', papers: 7, lecturer: 'Mme. Curie' },
    ];

    courses.forEach(course => {
        const ref = doc(db, 'courses', course.id);
        batch.set(ref, course);
    });

    // 3. Papers (Sample)
    const papers = [
        // PHY 101 Papers
        { id: 'p1', courseId: 'phy101', courseCode: 'PHY 101', departmentId: 'physics_ed', year: '2023/2024', semester: 'First', type: 'Exam', isPublished: true, createdAt: new Date() },
        { id: 'p2', courseId: 'phy101', courseCode: 'PHY 101', departmentId: 'physics_ed', year: '2022/2023', semester: 'First', type: 'Exam', isPublished: true, createdAt: new Date() },
        { id: 'p3', courseId: 'phy101', courseCode: 'PHY 101', departmentId: 'physics_ed', year: '2023/2024', semester: 'First', type: 'Test', isPublished: true, createdAt: new Date() },
        // CSC 101 Papers
        { id: 'p4', courseId: 'csc101', courseCode: 'CSC 101', departmentId: 'computer_ed', year: '2023/2024', semester: 'First', type: 'Exam', isPublished: true, createdAt: new Date() },
    ];

    papers.forEach(paper => {
        const ref = doc(db, 'papers', paper.id);
        batch.set(ref, paper);
    });

    // 4. Contributors
    const contributors = [
        { id: 'user1', name: 'Ada Lovelace', department: 'Computer Education', levelOrYear: '400L', contributionCount: 42, badge: 'Top Contributor' },
        { id: 'user2', name: 'Isaac Newton', department: 'Physics Education', levelOrYear: '300L', contributionCount: 28 },
        { id: 'user3', name: 'Marie Curie', department: 'Chemistry', levelOrYear: '200L', contributionCount: 15 },
    ];

    contributors.forEach(contributor => {
        const ref = doc(db, 'contributors', contributor.id);
        batch.set(ref, contributor);
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
