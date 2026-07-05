import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Department } from '@/hooks/useData';
import { getPaperAcademicYear, normalizePaperSemester } from '@/utils/academicYear';

const DEPARTMENT_ALIASES: Record<string, string[]> = {
  industrial_tech: ['ITE', 'IND'],
  computer_ed: ['COS', 'CSC'],
};

export function normalizeCourseCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function courseIdFromCode(code: string) {
  return normalizeCourseCode(code).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function inferLevelFromCourseCode(code: string) {
  const match = normalizeCourseCode(code).match(/[A-Z]+\s*(\d)/);
  return match ? `${match[1]}00L` : '';
}

function codePrefixes(code?: string) {
  if (!code) return [];
  return code
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .map(part => part.trim())
    .filter(Boolean);
}

export function inferDepartmentFromCourseCode(code: string, departments: Department[]) {
  const prefix = normalizeCourseCode(code).match(/^([A-Z]+)/)?.[1];
  if (!prefix) return '';

  const matchingDepartment = departments.find(dept => {
    const aliases = [
      ...codePrefixes(dept.code),
      ...codePrefixes(dept.name),
      ...(DEPARTMENT_ALIASES[dept.id] || []),
    ];
    return aliases.includes(prefix);
  });

  return matchingDepartment?.id || '';
}

export function buildCourseCodeSuggestions(code: string, departments: Department[]) {
  return {
    normalizedCode: normalizeCourseCode(code),
    level: inferLevelFromCourseCode(code),
    departmentId: inferDepartmentFromCourseCode(code, departments),
  };
}

export async function findDuplicatePaper(params: {
  courseId: string;
  year: string;
  academicYearKey?: string;
  type: string;
  semester: string;
  excludePaperId?: string | null;
}) {
  const targetAcademicYear = getPaperAcademicYear({
    academicYear: params.year,
    academicYearKey: params.academicYearKey,
    year: params.year,
  });
  const targetSemester = normalizePaperSemester(params.semester);

  const duplicateQuery = query(
    collection(db, 'papers'),
    where('courseId', '==', params.courseId),
    where('type', '==', params.type)
  );
  const snapshot = await getDocs(duplicateQuery);
  const duplicate = snapshot.docs.find(docSnap => {
    if (docSnap.id === params.excludePaperId) return false;

    const data = docSnap.data() as any;
    const paperAcademicYear = getPaperAcademicYear(data);
    return paperAcademicYear.key === targetAcademicYear.key
      && normalizePaperSemester(data.semester) === targetSemester;
  });
  return duplicate ? { id: duplicate.id, data: duplicate.data() } : null;
}
