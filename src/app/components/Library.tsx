import { Search, Bookmark, Download, X, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/app/context/AuthContext';
import { useBookmarks, toggleBookmark, Paper } from '@/hooks/useData';
import { useNavigate } from 'react-router-dom';

export function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookmarks, loading } = useBookmarks(user?.uid);

  const handleRemoveBookmark = async (id: string) => {
    if (user?.uid) {
      await toggleBookmark(user.uid, id, true);
    }
  };

  const handleOpenPaper = (paper: Paper) => {
    navigate(`/view-paper/${paper.courseCode || 'general'}`, { state: { paper } });
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <Bookmark className="w-10 h-10 text-secondary" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No bookmarks yet</h3>
      <p className="text-sm text-secondary text-center max-w-xs leading-relaxed">
        Start bookmarking your favorite past questions for quick access
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
          <h2 className="text-xl font-bold text-foreground mb-4">Bookmarks</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : bookmarks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {bookmarks.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOpenPaper(paper)}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary transition-colors group"
                >
                  <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/5 transition-colors">
                    <FileText className="w-7 h-7 text-secondary group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground mb-1">
                      {paper.courseCode}
                    </div>
                    <div className="text-sm text-secondary mb-2">
                      {paper.year} • {paper.semester} Sem
                    </div>
                    <div className="text-xs text-secondary bg-secondary/10 inline-block px-2 py-0.5 rounded">
                      {paper.type}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRemoveBookmark(paper.id)}
                      className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-all shadow-sm">
                      <Download className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Downloads Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Downloads</h2>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Offline Packs</h3>
              <p className="text-sm text-secondary mb-4 max-w-xs leading-relaxed">
                Download entire course packs for offline access
              </p>
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
