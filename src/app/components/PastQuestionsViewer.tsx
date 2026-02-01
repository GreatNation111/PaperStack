import { ArrowLeft, Share2, Download, Bookmark, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper } from '@/hooks/useData';
import { useState } from 'react';

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

export function PastQuestionsViewer({ onBack }: { onBack: () => void; courseCode?: string }) {
  const navigate = useNavigate(); // Need navigate for back button if onBack not provided or custom handling
  const location = useLocation();
  const paper = location.state?.paper as Paper | undefined;
  const [scale, setScale] = useState(1);

  // Fallback if accessed directly without state (though mostly intended via navigation)
  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-xl font-bold mb-2">No Paper Selected</div>
        <button onClick={onBack} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#525659]">
      {/* Toolbar */}
      <div className="h-14 bg-[#2f3133] flex items-center justify-between px-4 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white font-medium truncate max-w-[200px] md:max-w-md">
            {paper.courseCode} - {paper.year} ({paper.semester})
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
          <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
            <Share2 className="w-5 h-5" />
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
            transform: `scale(${scale})`
          }}
        >
          {paper.pdfUrl ? (
            <iframe
              src={paper.pdfUrl}
              className="w-full h-full min-h-[1000px]"
              title="Mock PDF"
            />
          ) : (
            <MockPDFContent title={`${paper.courseCode} - ${paper.type}`} />
          )}
        </div>
      </div>
    </div>
  );
}
