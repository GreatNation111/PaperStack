import { ArrowLeft, FileText, Eye, Download, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCoursePapers, Paper } from '@/hooks/useData';

export function CoursePapers() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Course info passed via route state
    const courseCode = location.state?.courseCode || '';
    const courseTitle = location.state?.courseTitle || '';

    const { papers, loading } = useCoursePapers(courseId);

    const handleViewPaper = (paper: Paper) => {
        navigate(`/view-paper/${paper.id}`, { state: { paper } });
    };

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="px-6 py-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={handleBack} className="text-foreground p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{courseCode || 'Course Papers'}</h1>
                        {courseTitle && <p className="text-secondary text-sm truncate">{courseTitle}</p>}
                    </div>
                </div>
                <p className="text-secondary text-xs">{papers.length} paper{papers.length !== 1 ? 's' : ''} available</p>
            </div>

            {/* Papers List */}
            <div className="px-6 py-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}
                    </div>
                ) : papers.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-secondary/40" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">No papers yet</h3>
                        <p className="text-secondary text-sm">Papers for this course haven't been uploaded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {papers.map((paper, index) => (
                            <motion.div
                                key={paper.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleViewPaper(paper)}
                                className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-all cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Thumbnail / Icon */}
                                    <div className="w-14 h-18 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 relative border border-border/20 overflow-hidden">
                                        {paper.thumbnailUrl ? (
                                            <img src={paper.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                                            {paper.title || `${paper.code} ${paper.type} ${paper.year}`}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-secondary mb-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {paper.year}
                                            </span>
                                            {paper.semester && (
                                                <span>{paper.semester === 'First' ? '1st' : '2nd'} Sem</span>
                                            )}
                                            {paper.type && (
                                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                                                    {paper.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs text-secondary">
                                                <Download className="w-3 h-3" />
                                                <span>{paper.downloads || 0} downloads</span>
                                            </div>
                                            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1 group-hover:scale-105 transition-transform">
                                                <Eye className="w-3 h-3" /> View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
