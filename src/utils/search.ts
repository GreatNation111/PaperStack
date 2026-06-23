type SearchableCourse = {
  code?: string;
  title?: string;
  lecturer?: string;
  semester?: string;
  level?: string;
};

export function normalizeSearchText(value: string | undefined | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function compactSearchText(value: string | undefined | null) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

export function courseMatchesSearch(course: SearchableCourse, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const compactQuery = compactSearchText(query);

  if (!normalizedQuery && !compactQuery) return true;

  const fields = [
    course.code,
    course.title,
    course.lecturer,
    course.semester,
    course.level,
  ];

  return fields.some(field => {
    const normalizedField = normalizeSearchText(field);
    const compactField = compactSearchText(field);

    return (
      normalizedField.includes(normalizedQuery) ||
      compactField.includes(compactQuery)
    );
  });
}
