import { ArrowLeft, Filter, Download, Bookmark, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCourses, useBookmarks, toggleBookmark, Course } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';

interface PastQuestionsProps {
    onBack: () => void;
    departmentId?: string;
}

export function PastQuestions({ onBack, departmentId }: PastQuestionsProps) {
    // MVP: Show all courses for the department, user clicks to open Google Drive folder
    const { courses, loading: loadingCourses } = useCourses(departmentId);
    const { user } = useAuth();
    const { bookmarkIds } = useBookmarks(user?.uid);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [showFilter, setShowFilter] = useState(false);

    const handleToggleBookmark = async (courseId: string) => {
        if (!user) return;
        try {
            const isBookmarked = bookmarkIds.includes(courseId);
            await toggleBookmark(user.uid, courseId, isBookmarked);
        } catch (err) {
            console.error('[PastQuestions] Error toggling bookmark:', err);
        }
    };

    const handleOpenDriveFolder = (course: Course) => {
        if (course.driveFolderUrl) {
            window.open(course.driveFolderUrl, '_blank');
        }
    };

    // Filter courses by selected level if any
    const filteredCourses = selectedLevel
        ? courses.filter(c => c.level === selectedLevel)
        : courses;

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="px-6 py-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="text-foreground p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2} />
                    </button>

                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`p-2 rounded-full transition-colors ${showFilter ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                    >
                        <Filter className="w-6 h-6" strokeWidth={2} />
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-foreground">
                    All Courses
                </h1>
                <p className="text-secondary text-sm">Browse all courses in your department</p>
                {selectedLevel && <p className="text-primary text-xs font-semibold mt-1">Showing: {selectedLevel}</p>}
            </div>

            {/* Filter UI - Level Selection */}
            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-muted/30 border-b border-border"
                    >
                        <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setSelectedLevel(null)}
                                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${!selectedLevel ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
                            >
                                All Levels
                            </button>
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

            {/* Courses List - MVP */}
            <div className="px-6 py-6">
                {loadingCourses ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-secondary/40" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No courses found</h3>
                        <p className="text-secondary text-sm">
                            {selectedLevel ? `No courses found for level ${selectedLevel}.` : 'No courses available in this department.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCourses.map((course, index) => {
                            const isBookmarked = bookmarkIds.includes(course.id);
                            return (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-all group cursor-pointer"
                                    onClick={() => handleOpenDriveFolder(course)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Course Thumbnail */}
                                        <div className="w-14 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-border/20">
                                            <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
                                        </div>

                                        {/* Course Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div>
                                                    <h3 className="font-semibold text-foreground text-sm">{course.code}</h3>
                                                    <p className="text-xs text-secondary line-clamp-1">{course.title}</p>
                                                </div>
                                                <div className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded whitespace-nowrap">
                                                    {course.level}
                                                </div>
                                            </div>
                                            <p className="text-xs text-secondary mb-2">{course.lecturer}</p>

                                            {/* Actions */}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-secondary">{course.papers || 0} papers</span>
                                                    {course.driveFolderUrl && (
                                                        <ExternalLink className="w-3 h-3 text-primary/60" strokeWidth={2} />
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleBookmark(course.id);
                                                        }}
                                                        className={`p-2 rounded-full transition-all ${isBookmarked
                                                            ? 'text-primary bg-primary/10'
                                                            : 'text-secondary hover:bg-muted'
                                                            }`}
                                                    >
                                                        <Bookmark className="w-4 h-4" strokeWidth={2} fill={isBookmarked ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenDriveFolder(course);
                                                        }}
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
                )}
            </div>
        </div>
    );
}
