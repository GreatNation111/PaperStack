import { Search, Bookmark, Download, X, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Library() {
  const [bookmarks, setBookmarks] = useState([
    {
      id: '1',
      code: 'PHY 101',
      title: 'General Physics I',
      year: '2023/2024',
      examType: 'First Semester',
      addedDate: 'Jan 15, 2025',
    },
    {
      id: '2',
      code: 'MTH 101',
      title: 'Elementary Mathematics',
      year: '2023/2024',
      examType: 'First Semester',
      addedDate: 'Jan 14, 2025',
    },
    {
      id: '3',
      code: 'CSC 201',
      title: 'Computer Programming I',
      year: '2022/2023',
      examType: 'Second Semester',
      addedDate: 'Jan 10, 2025',
    },
  ]);

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
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
          {bookmarks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-secondary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground mb-1">
                      {bookmark.code} - {bookmark.year}
                    </div>
                    <div className="text-sm text-secondary mb-2">{bookmark.title}</div>
                    <div className="text-xs text-secondary">
                      {bookmark.examType} • Added {bookmark.addedDate}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-all">
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
