import { ArrowLeft, Download, Bookmark, ZoomIn, ZoomOut, Minimize2, Maximize2, Loader2, Sparkles, X, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Paper, usePaper, useBookmarks, useDownloadedPapers } from '@/hooks/useData';
import { useState, useEffect, useRef, useMemo } from 'react';
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
type PdfSource = { url: string } | { data: ArrayBuffer };

async function inlineImagesForOffline(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(doc.querySelectorAll('img[src]'));

  await Promise.all(images.map(async image => {
    const src = image.getAttribute('src');
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

    try {
      const response = await fetch(src);
      if (!response.ok) return;
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      image.setAttribute('src', dataUrl);
    } catch (err) {
      console.warn('Could not cache native document image for offline use:', err);
    }
  }));

  return doc.body.innerHTML;
}

function PdfCanvasViewer({ source, scale, retryKey, onRetry }: { source: PdfSource; scale: number; retryKey: number; onRetry?: () => void }) {
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
        const loadingTask = 'data' in source
          ? pdfjsLib.getDocument({
              data: new Uint8Array(source.data.slice(0)),
              disableAutoFetch: false,
              disableStream: false,
            })
          : pdfjsLib.getDocument({
              url: source.url,
              disableAutoFetch: true,
              disableStream: false,
            });
        const pdf = await loadingTask.promise;
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
  }, [source, retryKey]);

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
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[800px] gap-3">
      {Array.from({ length: pageCount }, (_, index) => (
        <PdfPageCanvas
          key={`${index + 1}-${scale}`}
          pdf={pdfDocRef.current}
          pageNumber={index + 1}
          scale={scale}
          eager={'data' in source}
        />
      ))}
    </div>
  );
}

function PdfPageCanvas({ pdf, pageNumber, scale, eager = false }: { pdf: any; pageNumber: number; scale: number; eager?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldRender, setShouldRender] = useState(eager || pageNumber === 1);
  const [height, setHeight] = useState(520);

  useEffect(() => {
    if (eager && !shouldRender) {
      setShouldRender(true);
      return;
    }
    const wrapper = wrapperRef.current;
    if (!wrapper || shouldRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [eager, shouldRender]);

  useEffect(() => {
    if (!pdf || !shouldRender || !canvasRef.current) return;

    let cancelled = false;
    let renderTask: any;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: scale * 1.5 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.maxWidth = `${viewport.width}px`;
      canvas.style.height = 'auto';
      setHeight(viewport.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderTask = page.render({ canvasContext: ctx, viewport });
      await renderTask.promise;
    };

    renderPage().catch(err => {
      if (!cancelled && err?.name !== 'RenderingCancelledException') {
        console.error(`PDF page ${pageNumber} render error:`, err);
      }
    });

    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [pdf, pageNumber, scale, shouldRender]);

  return (
    <div
      ref={wrapperRef}
      className="w-full max-w-full flex justify-center overflow-hidden"
      style={{ minHeight: shouldRender ? undefined : `${height}px` }}
    >
      {shouldRender ? (
        <canvas
          ref={canvasRef}
          className="block max-w-full h-auto rounded shadow-[0_2px_12px_rgba(0,0,0,0.15)] bg-white"
        />
      ) : (
        <div className="w-full h-full min-h-[520px] rounded bg-card/60 border border-border animate-pulse" />
      )}
    </div>
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
  const { papers: downloadedPapers } = useDownloadedPapers(user?.uid);
  
  const downloadedPaper = downloadedPapers.find(p => p.id === paperId);
  const paper = (location.state?.paper as Paper | undefined) || fetchedPaper || downloadedPaper;

  const { bookmarkIds } = useBookmarks(user?.uid);
  const isBookmarked = paper?.courseId ? bookmarkIds.includes(paper.courseId) : false;

  const isDownloaded = downloadedPapers.some(p => p.id === paper?.id);

  const [offlinePdfData, setOfflinePdfData] = useState<ArrayBuffer | null>(null);
  const [offlineHtml, setOfflineHtml] = useState<string | null>(null);
  const [hasOfflineCopy, setHasOfflineCopy] = useState(false);
  const [pdfRetryKey, setPdfRetryKey] = useState(0);

  const loadOfflinePaper = async () => {
    if (!paperId) return;
    try {
      const data = await getOfflinePaper(paperId);
      if (data?.type === 'pdf') {
        const buffer = data.data as ArrayBuffer;
        setOfflinePdfData(buffer);
        setOfflineHtml(null);
        setHasOfflineCopy(true);
      } else if (data?.type === 'html') {
        setOfflineHtml(data.data as string);
        setOfflinePdfData(null);
        setHasOfflineCopy(true);
      }
    } catch (err) {
      console.error('Error loading offline paper:', err);
    }
  };

  useEffect(() => {
    void loadOfflinePaper();
  }, [paperId]);

  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfSource = useMemo<PdfSource | null>(() => {
    if (offlinePdfData) return { data: offlinePdfData };
    if (paper?.pdfUrl) return { url: paper.pdfUrl };
    return null;
  }, [offlinePdfData, paper?.pdfUrl]);

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
        if (!response.ok) throw new Error(`PDF download failed: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        await savePaperOffline(paper.id, 'pdf', arrayBuffer);
        
        // Update local viewer to use offline copy immediately
        setOfflinePdfData(arrayBuffer);
        setHasOfflineCopy(true);
      } else if (paper.richTextContent) {
        // Native Doc Offline Download
        const offlineHtmlContent = await inlineImagesForOffline(paper.richTextContent);
        await savePaperOffline(paper.id, 'html', offlineHtmlContent);
        setOfflineHtml(offlineHtmlContent);
        setHasOfflineCopy(true);
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
            disabled={isDownloading || (!paper?.pdfUrl && !paper?.richTextContent) || isDownloaded || hasOfflineCopy}
            className={`p-2 rounded-full transition-colors ${isDownloaded || hasOfflineCopy ? 'text-green-500 bg-green-500/10' : 'text-secondary hover:text-foreground hover:bg-foreground/10'} disabled:opacity-100`}
            title={isDownloaded || hasOfflineCopy ? "Saved Offline" : "Save for Offline"}
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin text-secondary" /> : isDownloaded || hasOfflineCopy ? <CheckCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
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
            className="bg-card shadow-xl transition-all origin-top rounded-lg mb-8 border border-border"
            style={{
              width: '100%',
              maxWidth: '800px',
              height: 'max-content',
              fontSize: `${scale}rem`
            }}
          >
            <div
              className="native-doc-page native-doc-readonly"
              dangerouslySetInnerHTML={{ __html: offlineHtml || paper!.richTextContent! }}
            />
          </div>
        ) : pdfSource ? (
          <PdfCanvasViewer
            source={pdfSource}
            scale={scale}
            retryKey={pdfRetryKey}
            onRetry={() => {
              void loadOfflinePaper();
              setPdfRetryKey(key => key + 1);
            }}
          />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center relative">
              <button
                onClick={() => setShowUpsellModal(false)}
                className="absolute right-4 top-4 text-secondary hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Download Limit Reached
              </h3>
              <p className="text-secondary text-sm mb-6">
                Free users can download up to <span className="text-foreground font-bold">3 papers</span>. Upgrade to Premium for unlimited downloads and more academic tools.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/premium')}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Unlock Premium
                </button>
                <button
                  onClick={() => setShowUpsellModal(false)}
                  className="w-full py-3 text-secondary hover:text-foreground font-medium transition-colors"
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
