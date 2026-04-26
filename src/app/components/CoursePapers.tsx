import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCoursePapers } from '@/hooks/useData';
import { useEffect } from 'react';
import { Loader2, BookOpen } from 'lucide-react';

/**
 * Bridge component: fetches papers for a course and auto-redirects
 * to the PastQuestionsViewer with the first paper.
 * If only one paper (most common case), user sees the PDF immediately.
 */
export function CoursePapers() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const courseCode = location.state?.courseCode || '';
    const { papers, loading } = useCoursePapers(courseId);

    // Auto-navigate to the first paper as soon as it loads
    useEffect(() => {
        if (!loading && papers.length > 0) {
            // Go directly to viewing the first (usually only) paper
            navigate(`/view-paper/${papers[0].id}`, {
                replace: true, // Replace this page in history so back goes to course list
                state: { paper: papers[0] }
            });
        }
    }, [loading, papers, navigate]);

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/home');
        }
    };

    // Show loading while fetching
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-secondary text-sm">Loading {courseCode || 'course'} paper...</p>
            </div>
        );
    }

    // No papers found
    if (papers.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-secondary/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No Papers Yet</h3>
                <p className="text-secondary text-sm mb-6">
                    Papers for {courseCode || 'this course'} haven't been uploaded yet.
                </p>
                <button
                    onClick={handleBack}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Fallback (should have redirected already)
    return null;
}
