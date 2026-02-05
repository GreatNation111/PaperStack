import { ArrowLeft, Filter, Download, Bookmark, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useCourse, usePapers, useBookmarks, toggleBookmark, recordRecentCourse, Paper } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PastQuestionsProps {
    onBack: () => void;
    courseCode?: string;
    selectedLevel?: string | null;
    departmentId?: string;
}

export function PastQuestions({ onBack, courseCode, selectedLevel: initialLevel, departmentId }: PastQuestionsProps) {
    const navigate = useNavigate();

    // Only fetch course info if we have a specific courseCode
    const { course, loading: loadingCourse } = useCourse(courseCode);

    // Logic to avoid fetching "All Papers" while waiting for specific course ID
    const skipPapers = courseCode && !course;
    // Pass departmentId to filter if provided
    const { papers, loading: loadingPapers } = usePapers(skipPapers ? 'SKIP' : (course?.id), departmentId);

    const isLoading = (courseCode && loadingCourse) || loadingPapers;

    // Use real bookmarks
    const { user } = useAuth();
    const { bookmarkIds } = useBookmarks(user?.uid);
    // const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]); // Removed local state
    const [selectedLevel, setSelectedLevel] = useState<string | null>(initialLevel || null);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');

    // Group by Year
    const uniqueYears = Array.from(new Set(papers.map(p => p.year))).sort().reverse();

    // Filter papers to match selected level (if applicable) and semester
    // If showing "All Papers" (no courseCode), userLevel might be relevant, but papers list has mixed courses.
    // If courseCode is present, course level is fixed anyway.
    const filteredPapers = papers.filter(p => {
        let match = true;
        // If viewing specific course, we show all semsters? Or filter?
        // User requested semester organization.
        const semesterMatch = p.semester?.toLowerCase().includes(selectedSemester.toLowerCase());
        match = match && (semesterMatch || !p.semester); // Handle missing semester gracefully

        // If viewing "All Papers" repository, level filter applies
        if (!courseCode && selectedLevel) {
            // We need to know paper level. Paper has 'courseCode'. We might not have level on paper object easily 
            // unless we fetch courses or it's on paper. 
            // Paper interface in useData currently: id, departmentId, courseId, courseCode, year, semester, type...
            // It does NOT have level.
            // But we have `selectedLevel` UI.
            // For now, let's assume filtering by level in "All Papers" mode is tricky without level on Paper.
            // I'll skip level filter for Papers list unless I add level to Paper model.
            // But valid for now.
        }
        return match;
    });

    // Re-calculate unique years based on filtered results
    const activeUniqueYears = Array.from(new Set(filteredPapers.map(p => p.year))).sort().reverse();


    const handleToggleBookmark = async (paperId: string) => {
        if (!user) return;
        try {
            const isBookmarked = bookmarkIds.includes(paperId);
            await toggleBookmark(user.uid, paperId, isBookmarked);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = (paper: Paper) => {
        navigate(`/view-paper/${paper.id}`, { state: { paper } });
    };

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="px-6 py-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="text-foreground p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2} />
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedSemester('First')}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${selectedSemester === 'First' ? 'bg-primary text-primary-foreground' : 'bg-muted text-secondary'}`}
                        >
                            1st Sem
                        </button>
                        <button
                            onClick={() => setSelectedSemester('Second')}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${selectedSemester === 'Second' ? 'bg-primary text-primary-foreground' : 'bg-muted text-secondary'}`}
                        >
                            2nd Sem
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`p-2 rounded-full transition-colors ${showFilter ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                    >
                        <Filter className="w-6 h-6" strokeWidth={2} />
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-foreground">
                    {(courseCode && loadingCourse) ? 'Loading...' : course ? `${course.code} Papers` : 'All Past Questions'}
                </h1>
                {course && <p className="text-secondary text-sm">{course.title}</p>}
                {selectedLevel && <p className="text-primary text-xs font-semibold mt-1">Level: {selectedLevel}</p>}
            </div>

            {/* Filter UI */}
            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-muted/30 border-b border-border"
                    >
                        <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide">
                            {['100L', '200L', '300L', '400L'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level === selectedLevel ? null : level)}
                                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedLevel === level ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Papers List */}
            <div className="px-6 py-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}
                    </div>
                ) : activeUniqueYears.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-secondary/40" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No papers found</h3>
                        <p className="text-secondary text-sm">
                            No {selectedSemester} Semester papers found.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {activeUniqueYears.map((year) => {
                            const yearPapers = filteredPapers.filter((p) => p.year === year);
                            if (yearPapers.length === 0) return null;

                            return (
                                <div key={year}>
                                    <h2 className="text-lg font-bold text-foreground mb-4 sticky top-32">{year}</h2>
                                    <div className="space-y-3">
                                        {yearPapers.map((paper, index) => {
                                            const isBookmarked = bookmarkIds.includes(paper.id);
                                            return (
                                                <motion.div
                                                    key={paper.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-all group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Thumbnail */}
                                                        <div className="w-14 h-16 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-border/20">
                                                            {paper.thumbnailUrl ? (
                                                                <img src={paper.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <div>
                                                                    <h3 className="font-semibold text-foreground text-sm">
                                                                        {paper.semester} Semester
                                                                    </h3>
                                                                    <p className="text-xs text-secondary">{paper.type} • {paper.courseCode}</p>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center justify-between mt-3">
                                                                <button
                                                                    onClick={() => handleDownload(paper)}
                                                                    className="text-xs text-primary font-medium hover:underline"
                                                                >
                                                                    Preview
                                                                </button>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleToggleBookmark(paper.id)}
                                                                        className={`p-2 rounded-full transition-all ${isBookmarked
                                                                            ? 'text-primary bg-primary/10'
                                                                            : 'text-secondary hover:bg-muted'
                                                                            }`}
                                                                    >
                                                                        <Bookmark className="w-4 h-4" strokeWidth={2} fill={isBookmarked ? 'currentColor' : 'none'} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDownload(paper)}
                                                                        className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all shadow-sm"
                                                                    >
                                                                        <Download className="w-4 h-4" strokeWidth={2} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
