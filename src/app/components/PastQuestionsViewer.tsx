import { ArrowLeft, Filter, Download, Bookmark, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface PastQuestionsViewerProps {
  onBack: () => void;
  courseCode?: string;
}

export function PastQuestionsViewer({ onBack, courseCode }: PastQuestionsViewerProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['1', '3']);

  const papers = [
    {
      id: '1',
      course: 'PHY 101',
      title: 'General Physics I',
      year: '2023/2024',
      semester: 'First Semester',
      examType: 'Final Exam',
      level: '100L',
      repeated: true,
    },
    {
      id: '2',
      course: 'PHY 101',
      title: 'General Physics I',
      year: '2022/2023',
      semester: 'Second Semester',
      examType: 'Final Exam',
      level: '100L',
      repeated: false,
    },
    {
      id: '3',
      course: 'PHY 101',
      title: 'General Physics I',
      year: '2022/2023',
      semester: 'First Semester',
      examType: 'Final Exam',
      level: '100L',
      repeated: true,
    },
    {
      id: '4',
      course: 'PHY 101',
      title: 'General Physics I',
      year: '2021/2022',
      semester: 'Second Semester',
      examType: 'Final Exam',
      level: '100L',
      repeated: false,
    },
  ];

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]
    );
  };

  const handleDownload = (paper: typeof papers[0]) => {
    // Mock download
    console.log('Downloading:', paper);
    alert(`Downloading ${paper.course} - ${paper.year} ${paper.semester}`);
  };

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-foreground">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <button className="text-foreground">
            <Filter className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {courseCode ? `${courseCode} Past Questions` : 'All Past Questions - Physics'}
        </h1>
      </div>

      {/* Papers List */}
      <div className="px-6 py-6">
        {/* Group by Year */}
        <div className="space-y-6">
          {['2023/2024', '2022/2023', '2021/2022'].map((year) => {
            const yearPapers = papers.filter((p) => p.year === year);
            if (yearPapers.length === 0) return null;

            return (
              <div key={year}>
                <h2 className="text-lg font-bold text-foreground mb-4">{year}</h2>
                <div className="space-y-3">
                  {yearPapers.map((paper, index) => {
                    const isBookmarked = bookmarkedIds.includes(paper.id);
                    return (
                      <motion.div
                        key={paper.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-7 h-7 text-secondary" strokeWidth={1.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  {paper.course} - {paper.semester}
                                </h3>
                                <p className="text-sm text-secondary">{paper.title}</p>
                              </div>
                              {paper.repeated && (
                                <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-lg flex-shrink-0">
                                  Repeated
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-secondary mb-3">
                              {paper.level} • {paper.examType}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleBookmark(paper.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                  isBookmarked
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                }`}
                              >
                                <Bookmark
                                  className="w-4 h-4"
                                  strokeWidth={2}
                                  fill={isBookmarked ? 'currentColor' : 'none'}
                                />
                                <span className="text-sm font-medium">
                                  {isBookmarked ? 'Saved' : 'Save'}
                                </span>
                              </button>
                              <button
                                onClick={() => handleDownload(paper)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all"
                              >
                                <Download className="w-4 h-4" strokeWidth={2} />
                                <span className="text-sm">Download</span>
                              </button>
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
      </div>
    </div>
  );
}
