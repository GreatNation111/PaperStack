import { useState, useMemo } from 'react';
import { Search, Bookmark, FileText, ExternalLink, Download, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { useBookmarkedCourses, toggleBookmark, Course, useCourseThumbnails, useDownloadedPapers, removePaperDownload } from '@/hooks/useData';
import { removeOfflinePaper } from '@/lib/indexedDB';

export function Library() {
  const { user, userProfile } = useAuth();
  const { courses, loading } = useBookmarkedCourses(user?.uid);
  const { papers: downloadedPapers, loading: downloadsLoading } = useDownloadedPapers(user?.uid);

  // Fetch real thumbnails for bookmarked courses
  const courseIds = useMemo(() => courses.map(c => c.id), [courses]);
  const { thumbnails } = useCourseThumbnails(courseIds);

  const navigate = useNavigate();

  const handleRemoveBookmark = async (courseId: string) => {
    if (user?.uid) {
      await toggleBookmark(user.uid, courseId, true); // true = currently bookmarked, so remove
    }
  };

  const handleOpenCourse = (course: Course) => {
    navigate(`/course/${course.id}/papers`);
  };

  const canDeleteDownloads = !!userProfile?.isPremium || (userProfile?.downloadsCount || 0) > 3;

  const handleDeleteDownload = async (paperId: string) => {
    if (!user?.uid) return;
    if (!canDeleteDownloads) {
      alert('Free users can keep up to 3 downloads. Delete becomes available after the free download limit has been passed.');
      return;
    }
    if (!confirm('Remove this paper from your downloads?')) return;

    try {
      await removeOfflinePaper(paperId);
      await removePaperDownload(user.uid, paperId);
    } catch (err) {
      console.error('Failed to delete downloaded paper:', err);
      alert('Failed to delete this download.');
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <Bookmark className="w-10 h-10 text-secondary" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No bookmarks yet</h3>
      <p className="text-sm text-secondary text-center max-w-xs leading-relaxed">
        Bookmark courses from the Past Questions page for quick access
      </p>
    </div>
  );

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Library</h1>
          <button className="text-secondary">
            <Search className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Bookmarks Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Saved Courses</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOpenCourse(course)}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary transition-colors group"
                >
                  <div className="w-14 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors overflow-hidden">
                    {thumbnails[course.id] ? (
                      <img src={thumbnails[course.id]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground mb-1">
                      {course.code}
                    </div>
                    <div className="text-sm text-secondary mb-1 line-clamp-1">
                      {course.title}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">
                        {course.level}
                      </span>
                      {course.semester && (
                        <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded font-medium">
                          {course.semester === '1st Semester' ? '1st Sem' : '2nd Sem'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRemoveBookmark(course.id)}
                      className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Bookmark className="w-4 h-4" strokeWidth={2} fill="currentColor" />
                    </button>
                    {course.driveFolderUrl && (
                      <button
                        onClick={() => handleOpenCourse(course)}
                        className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Downloads Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Downloads</h2>
          {downloadsLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : downloadedPapers.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-secondary/50" strokeWidth={1.5} />
                </div>
                <p className="text-secondary text-sm font-medium mb-1">No Downloads Yet</p>
                <p className="text-xs text-secondary/60">Downloaded papers will appear here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {downloadedPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground mb-0.5 line-clamp-1">
                      {paper.title || `${paper.code} - ${paper.year}`}
                    </div>
                    <div className="text-xs text-secondary mb-1">
                      {paper.semester}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        navigate(`/view-paper/${paper.id}`, { state: { paper } });
                      }}
                      className="text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-medium"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => void handleDeleteDownload(paper.id)}
                      disabled={!canDeleteDownloads}
                      title={canDeleteDownloads ? 'Delete download' : 'Delete unlocks after more than 3 lifetime downloads'}
                      className={`text-sm px-3 py-1.5 rounded-lg transition-all font-medium flex items-center justify-center gap-1.5 ${
                        canDeleteDownloads
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground'
                          : 'bg-muted/60 text-secondary/50 cursor-not-allowed'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
