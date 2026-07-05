export type PaperSemester = 'First' | 'Second' | 'Unknown';

export interface AcademicYearOption {
  label: string;
  key: string;
  startYear: number;
  endYear: number;
}

const ACADEMIC_YEAR_PATTERN = /(20\d{2})\s*[/-]\s*(20\d{2})/;

export function createAcademicYearOption(startYear: number): AcademicYearOption {
  const endYear = startYear + 1;
  return {
    label: `${startYear}/${endYear}`,
    key: `${startYear}-${endYear}`,
    startYear,
    endYear,
  };
}

export function getDefaultAcademicYearOption(date = new Date()) {
  return createAcademicYearOption(date.getFullYear() - 2);
}

export function getAcademicYearOptions(date = new Date(), yearsBack = 6, yearsForward = 2) {
  const defaultStartYear = getDefaultAcademicYearOption(date).startYear;
  const options: AcademicYearOption[] = [];

  for (let startYear = defaultStartYear + yearsForward; startYear >= defaultStartYear - yearsBack; startYear -= 1) {
    options.push(createAcademicYearOption(startYear));
  }

  return options;
}

export function normalizeAcademicYear(input?: string | number | null) {
  const raw = String(input || '').trim();
  const match = raw.match(ACADEMIC_YEAR_PATTERN);

  if (match) {
    const startYear = Number(match[1]);
    const endYear = Number(match[2]);
    if (endYear === startYear + 1) {
      return createAcademicYearOption(startYear);
    }
    return {
      label: `${startYear}/${endYear}`,
      key: `${startYear}-${endYear}`,
      startYear,
      endYear,
    };
  }

  const singleYear = raw.match(/^20\d{2}$/);
  if (singleYear) {
    const endYear = Number(raw);
    return createAcademicYearOption(endYear - 1);
  }

  return null;
}

export function getPaperAcademicYear(data: {
  academicYear?: string;
  academicYearKey?: string;
  year?: string | number;
}) {
  const normalized = normalizeAcademicYear(data.academicYear || data.year);
  if (normalized) return normalized;

  if (data.academicYearKey) {
    const [start, end] = data.academicYearKey.split('-').map(Number);
    if (start && end) {
      return {
        label: `${start}/${end}`,
        key: `${start}-${end}`,
        startYear: start,
        endYear: end,
      };
    }
  }

  return getDefaultAcademicYearOption();
}

export function normalizePaperSemester(input?: string | null): PaperSemester {
  const value = String(input || '').trim().toLowerCase();
  if (value.startsWith('first') || value.startsWith('1')) return 'First';
  if (value.startsWith('second') || value.startsWith('2')) return 'Second';
  return 'Unknown';
}

export function formatSemesterLabel(semester?: string | null) {
  const normalized = normalizePaperSemester(semester);
  if (normalized === 'First') return '1st Semester';
  if (normalized === 'Second') return '2nd Semester';
  return 'Semester not specified';
}

export function getAcademicYearSortValue(key?: string) {
  const normalized = normalizeAcademicYear(key);
  if (normalized) return normalized.startYear;
  const [start] = String(key || '').split('-').map(Number);
  return start || 0;
}
