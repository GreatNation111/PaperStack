import { ArrowLeft, Download, Bookmark, ZoomIn, ZoomOut, Minimize2, Maximize2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Paper, usePaper, recordRecentCourse } from '@/hooks/useData';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';

// Mock PDF component since we can't easily embed real PDFs without a library or file URL
// In production, use 'react-pdf' or an iframe with the PDF URL
function MockPDFContent({ title }: { title: string }) {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center p-8 overflow-y-auto">
      <div className="max-w-2xl w-full space-y-6 text-slate-800">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
          <h1 className="text-xl font-bold uppercase tracking-wider">University of Excellence</h1>
          <h2 className="text-lg font-bold mt-2">{title}</h2>
          <div className="flex justify-between mt-4 text-sm font-medium">
            <span>Time: 2 Hours</span>
            <span>Total Marks: 70</span>
          </div>
          <div className="mt-4 italic text-sm">Attempt all questions in Section A and any 3 in Section B</div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold">SECTION A (Compulsory)</h3>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex gap-2">
              <span className="font-bold">{n}.</span>
              <p>
                Explain the fundamental principles of {title.split(' ').slice(0, 2).join(' ')}.
                (5 Marks)
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="font-bold">SECTION B</h3>
          {[5, 6, 7].map(n => (
            <div key={n} className="flex gap-2">
              <span className="font-bold">{n}.</span>
              <p>
                Discuss the impact of modern technology on the study of this subject.
                Support your answer with relevant diagrams where necessary. (15 Marks)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PastQuestionsViewer(_props: { onBack: () => void; courseCode?: string }) {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get paper from state (fast), otherwise fetch (refresh)
  const { paper: fetchedPaper, loading } = usePaper(paperId);
  const paper = (location.state?.paper as Paper | undefined) || fetchedPaper;
  const { user } = useAuth();

  useEffect(() => {
    if (user && paper?.courseId) {
      // Record the COURSE of this paper as recently viewed
      recordRecentCourse(user.uid, paper.courseId);
    }
  }, [user, paper]);

  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleBack = () => {
    // Smart back navigation
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/past-questions');
    }
  };

  if (loading && !paper) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#525659] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p>Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-white bg-[#525659]">
        <div className="text-xl font-bold mb-2">Paper Not Found</div>
        <p className="text-gray-300 mb-6">The requested paper could not be found.</p>
        <button onClick={handleBack} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90">
          Go Back
        </button>
      </div>
    );
  }

  // Use override onBack if provided (e.g. from props), else use internal handler
  // Actually, props onBack might be passed by Router? No, checking App.tsx. 
  // App.tsx passes `onBack={() => navigate(-1)}`. 
  // If we are refreshing, that prop logic is fine IF history exists.
  // But we want our robust `handleBack` to take precedence if needed.
  // I will ignore the prop in favor of robust logic or combine them.
  // Let's use `handleBack` which is robust.

  return (
    <div className={`h-screen flex flex-col bg-[#525659] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="h-14 bg-[#2f3133] flex items-center justify-between px-4 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white font-medium truncate max-w-[200px] md:max-w-md">
            {paper ? `${paper.code} - ${paper.year} (${paper.semester})` : 'Question Paper'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full hidden sm:block">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs text-gray-400 font-mono w-12 text-center hidden sm:block">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full hidden sm:block">
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block" />

          <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={toggleFullscreen} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full hidden sm:block">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#525659]">
        <div
          className="bg-white shadow-2xl transition-transform origin-top"
          style={{
            width: '100%',
            maxWidth: '800px',
            minHeight: '1000px',
            transform: `scale(${scale})`,
            marginBottom: `${(scale - 1) * 500}px`
          }}
        >
          {paper && paper.url ? (
            <iframe
              src={paper.url}
              className="w-full h-full min-h-[1000px]"
              title="Question Paper PDF"
            />
          ) : (
            <MockPDFContent title={`${paper?.code || 'Question'} - ${paper?.type || 'Paper'}`} />
          )}
        </div>
      </div>
    </div>
  );
}
