import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, FileText, Layers, Loader2 } from 'lucide-react';
import { Paper, useCoursePapers } from '@/hooks/useData';
import {
    formatSemesterLabel,
    getAcademicYearOptions,
    getAcademicYearSortValue,
    getDefaultAcademicYearOption,
    getPaperAcademicYear,
    normalizePaperSemester,
    type AcademicYearOption
} from '@/utils/academicYear';

const SEMESTER_OPTIONS = [
    { value: 'all', label: 'All semesters' },
    { value: 'First', label: '1st Semester' },
    { value: 'Second', label: '2nd Semester' },
    { value: 'Unknown', label: 'Not specified' },
];

function buildYearOptions(papers: Paper[]) {
    const options = new Map<string, AcademicYearOption>();

    getAcademicYearOptions().forEach(option => {
        options.set(option.key, option);
    });

    papers.forEach(paper => {
        const academicYear = getPaperAcademicYear(paper);
        options.set(academicYear.key, academicYear);
    });

    return Array.from(options.values())
        .sort((a, b) => getAcademicYearSortValue(b.key) - getAcademicYearSortValue(a.key));
}

function sortPapers(papers: Paper[]) {
    const semesterOrder: Record<string, number> = {
        First: 0,
        Second: 1,
        Unknown: 2,
    };

    return [...papers].sort((a, b) => {
        const yearDiff = getAcademicYearSortValue(b.academicYearKey || b.year) - getAcademicYearSortValue(a.academicYearKey || a.year);
        if (yearDiff !== 0) return yearDiff;
        return semesterOrder[normalizePaperSemester(a.semester)] - semesterOrder[normalizePaperSemester(b.semester)];
    });
}

export function CoursePapers() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const courseCode = location.state?.courseCode || '';
    const courseTitle = location.state?.courseTitle || '';
    const { papers, loading } = useCoursePapers(courseId);

    const defaultAcademicYear = getDefaultAcademicYearOption();
    const [selectedYearKey, setSelectedYearKey] = useState(defaultAcademicYear.key);
    const [selectedSemester, setSelectedSemester] = useState('all');

    const yearOptions = useMemo(() => buildYearOptions(papers), [papers]);
    const sortedPapers = useMemo(() => sortPapers(papers), [papers]);
    const filteredPapers = useMemo(() => {
        return sortedPapers.filter(paper => {
            const paperAcademicYear = getPaperAcademicYear(paper);
            if (selectedYearKey !== 'all' && paperAcademicYear.key !== selectedYearKey) return false;
            if (selectedSemester !== 'all' && normalizePaperSemester(paper.semester) !== selectedSemester) return false;
            return true;
        });
    }, [selectedSemester, selectedYearKey, sortedPapers]);

    const activeYearLabel = selectedYearKey === 'all'
        ? 'all years'
        : yearOptions.find(option => option.key === selectedYearKey)?.label || defaultAcademicYear.label;

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/home');
        }
    };

    const handleOpenPaper = (paper: Paper) => {
        navigate(`/view-paper/${paper.id}`, {
            state: { paper }
        });
    };

    return (
        <div className="min-h-screen bg-background pb-24 text-foreground">
            <div className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-4 backdrop-blur">
                <div className="mx-auto flex max-w-xl items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-black tracking-tight">{courseCode || 'Course Papers'}</h1>
                        <p className="truncate text-xs text-secondary">{courseTitle || 'Past questions by academic year'}</p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-xl space-y-5 px-4 py-5">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        Filter papers
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-secondary">Academic Year</label>
                            <select
                                value={selectedYearKey}
                                onChange={(event) => setSelectedYearKey(event.target.value)}
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary"
                            >
                                <option value="all">All years</option>
                                {yearOptions.map(option => (
                                    <option key={option.key} value={option.key}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-secondary">Semester</label>
                            <select
                                value={selectedSemester}
                                onChange={(event) => setSelectedSemester(event.target.value)}
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary"
                            >
                                {SEMESTER_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-secondary">
                        Showing {activeYearLabel}. Change the year to browse older or newer papers for this course.
                    </p>
                </div>

                {loading ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-secondary">Loading {courseCode || 'course'} papers...</p>
                    </div>
                ) : papers.length === 0 ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <BookOpen className="h-8 w-8 text-secondary/40" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-foreground">No Papers Yet</h3>
                        <p className="mb-6 text-sm text-secondary">
                            Papers for {courseCode || 'this course'} have not been uploaded yet.
                        </p>
                        <button
                            onClick={handleBack}
                            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            Go Back
                        </button>
                    </div>
                ) : filteredPapers.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <Layers className="h-7 w-7 text-secondary/50" />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-foreground">No match for this filter</h3>
                        <p className="mb-4 text-sm leading-6 text-secondary">
                            There are papers for this course, but none under {activeYearLabel}
                            {selectedSemester !== 'all' ? `, ${SEMESTER_OPTIONS.find(option => option.value === selectedSemester)?.label}` : ''}.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedYearKey('all');
                                setSelectedSemester('all');
                            }}
                            className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            Show all papers
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredPapers.map(paper => {
                            const paperAcademicYear = getPaperAcademicYear(paper);
                            return (
                                <button
                                    key={paper.id}
                                    onClick={() => handleOpenPaper(paper)}
                                    className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 truncate text-sm font-black text-foreground">
                                                {paper.title || `${paper.code} ${paperAcademicYear.label}`}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                                                <span className="rounded-full bg-muted px-2 py-1 font-semibold">{paperAcademicYear.label}</span>
                                                <span className="rounded-full bg-muted px-2 py-1 font-semibold">{formatSemesterLabel(paper.semester)}</span>
                                                {paper.type && <span className="rounded-full bg-muted px-2 py-1 font-semibold">{paper.type}</span>}
                                                {paper.pageCount ? <span>{paper.pageCount} page{paper.pageCount === 1 ? '' : 's'}</span> : null}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
