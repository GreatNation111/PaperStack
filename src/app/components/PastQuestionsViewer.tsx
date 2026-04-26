import { ArrowLeft, Download, Bookmark, ZoomIn, ZoomOut, Minimize2, Maximize2, ExternalLink, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Paper, usePaper } from '@/hooks/useData';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite ?url import for local worker bundling
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Canvas-based PDF viewer using pdf.js.
 * Avoids cross-origin iframe blocking (e.g. Brave, Safari).
 */
function PdfCanvasViewer({ pdfUrl, scale }: { pdfUrl: string; scale: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Load the PDF document once
  useEffect(() => {
    let cancelled = false;
    setPdfLoading(true);
    setPdfError(null);

    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) { await pdf.destroy(); return; }
        pdfDocRef.current = pdf;
        setPageCount(pdf.numPages);
        setPdfLoading(false);
      } catch (err: any) {
        console.error('PDF load error:', err);
        if (!cancelled) {
          setPdfError('Could not load PDF. Try opening it directly.');
          setPdfLoading(false);
        }
      }
    };
    loadPdf();

    return () => {
      cancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [pdfUrl]);

  // Render all pages when PDF is loaded or scale changes
  const renderPages = useCallback(async () => {
    const pdf = pdfDocRef.current;
    const container = containerRef.current;
    if (!pdf || !container) return;

    // Clear previous canvases
    container.innerHTML = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale * 1.5 }); // 1.5x base for crisp text

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.maxWidth = `${viewport.width}px`;
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      canvas.style.marginBottom = '12px';
      canvas.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
      canvas.style.borderRadius = '4px';

      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      container.appendChild(canvas);
    }
  }, [scale]);

  useEffect(() => {
    if (pageCount > 0) renderPages();
  }, [pageCount, scale, renderPages]);

  if (pdfLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="text-gray-300 text-sm">Loading PDF...</p>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-red-300 text-sm">{pdfError}</p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Open PDF Directly
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full max-w-[800px]" />
  );
}

export function PastQuestionsViewer(_props: { onBack: () => void; courseCode?: string }) {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get paper from state (fast), otherwise fetch (refresh)
  const { paper: fetchedPaper, loading } = usePaper(paperId);
  const paper = (location.state?.paper as Paper | undefined) || fetchedPaper;

  // If paper has driveFolderUrl and no other content, open it directly and go back
  useEffect(() => {
    if (paper && !loading) {
      if (paper.driveFolderUrl && !paper.pdfUrl && !paper.richTextContent) {
        window.open(paper.driveFolderUrl, '_blank');
        navigate(-1);
      }
    }
  }, [paper, loading, navigate]);

  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleBack = () => {
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

          {paper?.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
            <Bookmark className="w-5 h-5" />
          </button>
          <a
            href={paper?.pdfUrl || '#'}
            download
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button onClick={toggleFullscreen} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full hidden sm:block">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#525659]">
        {paper && paper.richTextContent ? (
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
            <div
              className="p-8 md:p-12 prose prose-slate max-w-none min-h-[1000px] w-full"
              dangerouslySetInnerHTML={{ __html: paper.richTextContent }}
            />
          </div>
        ) : paper && paper.pdfUrl ? (
          <PdfCanvasViewer pdfUrl={paper.pdfUrl} scale={scale} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center text-gray-300">
            <p>No content available for this paper.</p>
            <button onClick={handleBack} className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium">
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

