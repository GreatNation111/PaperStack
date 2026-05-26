import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/** Maximum allowed PDF file size in bytes (20MB) */
export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_SIZE_LABEL = '20MB';

/**
 * Generates a PNG thumbnail from the first page of a PDF file.
 * Renders at a reduced scale for fast, lightweight thumbnails.
 * 
 * @param file - The PDF File object
 * @param scale - Render scale (0.5 = half resolution, good for thumbnails)
 * @returns A Blob containing the PNG thumbnail image
 */
export async function generatePdfThumbnail(file: File, scale = 0.5): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

  // Clean up
  await pdf.destroy();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate thumbnail blob'));
      },
      'image/png',
      0.85
    );
  });
}

/**
 * Reads the page count from a PDF without rendering any pages.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pageCount = pdf.numPages;
  await pdf.destroy();
  return pageCount;
}

/**
 * Generates a thumbnail from a PDF URL (e.g. Firebase Storage download URL).
 * Useful for generating thumbnails for already-uploaded PDFs.
 */
export async function generatePdfThumbnailFromUrl(pdfUrl: string, scale = 0.5): Promise<Blob> {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

  await pdf.destroy();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate thumbnail blob from URL'));
      },
      'image/png',
      0.85
    );
  });
}

/**
 * Validates a PDF file before upload.
 * Returns an error message string if invalid, or null if valid.
 */
export function validatePdfFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF files are allowed.';
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return 'File is too large. Maximum size is ' + MAX_PDF_SIZE_LABEL + '. Your file is ' + (file.size / (1024 * 1024)).toFixed(1) + 'MB.';
  }
  return null;
}
