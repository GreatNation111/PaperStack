import { ArrowLeft, Download, Bookmark, ZoomIn, ZoomOut, Minimize2, Maximize2, ExternalLink, Loader2, Sparkles, X, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Paper, usePaper, useBookmarks, useDownloadedPapers } from '@/hooks/useData';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOfflinePaper } from '@/lib/indexedDB';
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-secondary text-sm">Loading PDF...</p>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-destructive text-sm">{pdfError}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
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
  const { user, userProfile } = useAuth();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { paper: fetchedPaper, loading } = usePaper(paperId);
  const paper = (location.state?.paper as Paper | undefined) || fetchedPaper;

  const { bookmarkIds } = useBookmarks(user?.uid);
  const isBookmarked = paper?.courseId ? bookmarkIds.includes(paper.courseId) : false;

  const { papers: downloadedPapers } = useDownloadedPapers(user?.uid);
  const isDownloaded = downloadedPapers.some(p => p.id === paper?.id);

  const [offlineDocUrl, setOfflineDocUrl] = useState<string | null>(null);
  const [offlineHtml, setOfflineHtml] = useState<string | null>(null);

  useEffect(() => {
    if (paperId) {
      getOfflinePaper(paperId).then(data => {
        if (data) {
          if (data.type === 'pdf') {
            const blob = new Blob([data.data as ArrayBuffer], { type: 'application/pdf' });
            setOfflineDocUrl(URL.createObjectURL(blob));
          } else if (data.type === 'html') {
            setOfflineHtml(data.data as string);
          }
        }
      }).catch(err => console.error('Error loading offline paper:', err));
    }
  }, [paperId]);

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

  const handleDownload = async () => {
    if (!paper?.pdfUrl && !paper?.richTextContent) return;
    
    const profile = userProfile;
    // Premium limit check: max 3 downloads for free users
    if (!profile?.isPremium && (profile?.downloadsCount || 0) >= 3) {
      setShowUpsellModal(true);
      return;
    }

    try {
      setIsDownloading(true);
      
      const { savePaperOffline } = await import('@/lib/indexedDB');
      const { recordPaperDownload } = await import('@/hooks/useData');

      if (paper.pdfUrl) {
        // PDF Offline Download
        const response = await fetch(paper.pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        await savePaperOffline(paper.id, 'pdf', arrayBuffer);
        
        // Update local viewer to use offline copy immediately
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        setOfflineDocUrl(URL.createObjectURL(blob));
      } else if (paper.richTextContent) {
        // Native Doc Offline Download
        await savePaperOffline(paper.id, 'html', paper.richTextContent);
        setOfflineHtml(paper.richTextContent);
      }

      if (user) {
        await recordPaperDownload(user.uid, paper);
        // Increment download count if not premium
        if (!profile?.isPremium) {
          await updateDoc(doc(db, 'users', user.uid), {
            downloadsCount: (profile?.downloadsCount || 0) + 1
          });
        }
      }
      
      alert('Paper saved for offline viewing! You can access it in the Library.');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to save paper for offline viewing.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/past-questions');
    }
  };

  if (loading && !paper) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-foreground bg-background">
        <div className="text-xl font-bold mb-2">Paper Not Found</div>
        <p className="text-secondary mb-6">The requested paper could not be found.</p>
        <button onClick={handleBack} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 text-secondary hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-foreground font-medium truncate max-w-[200px] md:max-w-md">
            {paper ? `${paper.code} - ${paper.year} (${paper.semester})` : 'Question Paper'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 text-secondary hover:text-foreground hover:bg-foreground/10 rounded-full hidden sm:block">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs text-secondary font-mono w-12 text-center hidden sm:block">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 text-secondary hover:text-foreground hover:bg-foreground/10 rounded-full hidden sm:block">
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          <button 
            onClick={async () => {
              if (paper?.courseId && user) {
                try {
                  const { toggleBookmark } = await import('@/hooks/useData');
                  await toggleBookmark(user.uid, paper.courseId, isBookmarked);
                } catch (e) {
                  console.error(e);
                  alert('Failed to update bookmark.');
                }
              }
            }}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-[#4F46E5] bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20' : 'text-secondary hover:text-foreground hover:bg-foreground/10'}`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Course"}
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading || (!paper?.pdfUrl && !paper?.richTextContent) || isDownloaded}
            className={`p-2 rounded-full transition-colors ${isDownloaded ? 'text-green-500 bg-green-500/10' : 'text-secondary hover:text-foreground hover:bg-foreground/10'} disabled:opacity-100`}
            title={isDownloaded ? "Saved Offline" : "Save for Offline"}
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin text-secondary" /> : isDownloaded ? <CheckCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 text-secondary hover:text-foreground hover:bg-foreground/10 rounded-full hidden sm:block">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-muted/30">
        {(offlineHtml || (paper && paper.richTextContent)) ? (
          <div
            className="bg-white shadow-xl transition-all origin-top rounded-lg mb-8"
            style={{
              width: '100%',
              maxWidth: '800px',
              height: 'max-content',
              fontSize: `${scale}rem`
            }}
          >
            <div
              className="p-8 md:p-12 prose prose-slate max-w-none w-full pb-16"
              dangerouslySetInnerHTML={{ __html: offlineHtml || paper!.richTextContent! }}
            />
          </div>
        ) : (offlineDocUrl || (paper && paper.pdfUrl)) ? (
          <PdfCanvasViewer pdfUrl={offlineDocUrl || paper!.pdfUrl!} scale={scale} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center text-secondary">
            <p>No content available for this paper.</p>
            <button onClick={handleBack} className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              Go Back
            </button>
          </div>
        )}
      </div>

      {/* Premium Upsell Modal */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#2f3133] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center relative">
              <button
                onClick={() => setShowUpsellModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Download Limit Reached
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                Free users can download up to <span className="text-white font-bold">3 papers</span>. Upgrade to Premium for unlimited downloads and more academic tools.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/premium')}
                  className="w-full py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Unlock Premium
                </button>
                <button
                  onClick={() => setShowUpsellModal(false)}
                  className="w-full py-3 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

