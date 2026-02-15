import { ArrowLeft, Filter, Bookmark, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useCourses, useBookmarks, toggleBookmark, recordRecentCourse, Course, useGlobalConfig, useUserProfile } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, AlertCircle, X } from 'lucide-react';

interface PastQuestionsProps {
    onBack: () => void;
    departmentId?: string;
    courseCode?: string;
    selectedLevel?: string | null;
}

export function PastQuestions({ onBack, departmentId, courseCode, selectedLevel: initialLevel }: PastQuestionsProps) {
    const { config } = useGlobalConfig();
    const { courses, loading: loadingCourses } = useCourses(departmentId);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profile } = useUserProfile(user?.uid);
    const { bookmarkIds } = useBookmarks(user?.uid);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(initialLevel || null);
    const [showUpsell, setShowUpsell] = useState(false);

    // Default semester logic: Sync with global settings until user manually chooses a semester
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [hasInteractedWithSemester, setHasInteractedWithSemester] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Sync default semester once config loads (only if user hasn't manually changed it)
    useEffect(() => {
        if (config.currentSemester && !hasInteractedWithSemester) {
            setSelectedSemester(config.currentSemester);
        }
    }, [config.currentSemester, hasInteractedWithSemester]);

    const handleToggleBookmark = async (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        if (!user) return;

        const isCurrentlyBookmarked = bookmarkIds.includes(courseId);

        // Premium Limit Check: Max 3 for free users
        if (!isCurrentlyBookmarked && !profile?.isPremium && bookmarkIds.length >= 3) {
            setShowUpsell(true);
            return;
        }

        try {
            await toggleBookmark(user.uid, courseId, isCurrentlyBookmarked);
        } catch (err) {
            console.error('[PastQuestions] Error toggling bookmark:', err);
        }
    };

    const handleOpenDriveFolder = async (course: Course) => {
        if (user) {
            try {
                await recordRecentCourse(user.uid, course);
            } catch (err) {
                console.error('[PastQuestions] Error recording recently viewed:', err);
            }
        }
        if (course.driveFolderUrl) {
            window.open(course.driveFolderUrl, '_blank');
        }
    };

    const filteredCourses = courses.filter(c => {
        if (selectedLevel && c.level !== selectedLevel) return false;
        // Semester matching is case-insensitive
        if (selectedSemester && c.semester?.toLowerCase() !== selectedSemester.toLowerCase()) return false;
        return true;
    });

    return (
        <div className="pb-24 min-h-screen">
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
                <h1 className="text-2xl font-bold text-foreground">All Courses</h1>
                <p className="text-secondary text-sm">Browse all courses in your department</p>
                <div className="flex gap-2 mt-1">
                    {selectedLevel && <span className="text-primary text-xs font-semibold">{selectedLevel}</span>}
                    {selectedLevel && selectedSemester && <span className="text-secondary text-xs">•</span>}
                    {selectedSemester && <span className="text-primary text-xs font-semibold">{selectedSemester === 'First' ? '1st' : '2nd'} Sem</span>}
                </div>
            </div>

            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-muted/30 border-b border-border"
                    >
                        <div className="p-4 pb-2">
                            <p className="text-xs text-secondary mb-2 font-medium">Level</p>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
                        </div>

                        <div className="p-4 pt-2">
                            <p className="text-xs text-secondary mb-2 font-medium">Semester</p>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => {
                                        setSelectedSemester(null);
                                        setHasInteractedWithSemester(true);
                                    }}
                                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${!selectedSemester ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
                                >
                                    All Semesters
                                </button>
                                {[{ value: 'First', label: '1st Sem' }, { value: 'Second', label: '2nd Sem' }].map(sem => (
                                    <button
                                        key={sem.value}
                                        onClick={() => {
                                            setSelectedSemester(sem.value === selectedSemester ? null : sem.value);
                                            setHasInteractedWithSemester(true);
                                        }}
                                        className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedSemester === sem.value ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
                                    >
                                        {sem.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            {selectedLevel || selectedSemester ? `No courses match your filters.` : 'No courses available in this department.'}
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
                                        <div className="w-14 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 relative border border-border/20">
                                            <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div>
                                                    <h3 className="font-semibold text-foreground text-sm">{course.code}</h3>
                                                    <p className="text-xs text-secondary line-clamp-1">{course.title}</p>
                                                </div>
                                                <div className="flex gap-1.5 items-center">
                                                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded whitespace-nowrap">{course.level}</span>
                                                    {course.semester && (
                                                        <span className="text-xs font-medium px-2 py-1 bg-accent/10 text-accent rounded whitespace-nowrap">{course.semester === 'First' ? '1st' : '2nd'}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-secondary">{course.papers || 0} papers</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleToggleBookmark(e, course.id)}
                                                        className={`p-2 rounded-full transition-all ${isBookmarked ? 'text-primary bg-primary/10' : 'text-secondary hover:bg-muted'}`}
                                                    >
                                                        <Bookmark className="w-4 h-4" strokeWidth={2} fill={isBookmarked ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" /> Preview
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

            {/* Premium Upsell Modal */}
            <AnimatePresence>
                {showUpsell && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUpsell(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Visual Accent */}
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Crown className="w-24 h-24 text-primary" />
                            </div>

                            <button
                                onClick={() => setShowUpsell(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-secondary" />
                            </button>

                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <Crown className="w-8 h-8 text-primary" />
                            </div>

                            <h3 className="text-2xl font-black text-foreground mb-2">Limit Reached!</h3>
                            <p className="text-secondary text-sm font-medium leading-relaxed mb-8">
                                Free users can save up to <span className="text-foreground font-bold">3 courses</span>. Upgrade to Premium for unlimited bookmarks and more academic tools.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/premium')}
                                    className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                >
                                    Unlock Premium
                                </button>
                                <button
                                    onClick={() => setShowUpsell(false)}
                                    className="w-full h-14 bg-muted/50 text-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
