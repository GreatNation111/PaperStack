interface PdfImagePage {
  width: number;
  height: number;
  bytes: Uint8Array;
}

const encoder = new TextEncoder();

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach(part => {
    merged.set(part, offset);
    offset += part.length;
  });
  return merged;
}

function ascii(value: string) {
  return encoder.encode(value);
}

async function imageFileToPdfPage(file: File): Promise<PdfImagePage> {
  const bitmap = await createImageBitmap(file);
  const maxLongEdge = 2200;
  const scale = Math.min(1, maxLongEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare scanned image.');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => {
      if (result) resolve(result);
      else reject(new Error('Could not convert scanned image to PDF page.'));
    }, 'image/jpeg', 0.92);
  });

  return {
    width,
    height,
    bytes: new Uint8Array(await blob.arrayBuffer()),
  };
}

export async function createPdfFromImageFiles(files: File[], filename = 'scanned-paper.pdf') {
  if (!files.length) throw new Error('Select at least one scanned image.');

  const pages = await Promise.all(files.map(imageFileToPdfPage));
  const parts: Uint8Array[] = [ascii('%PDF-1.4\n')];
  const offsets: number[] = [0];
  let byteLength = parts[0].length;
  const objectCount = 2 + pages.length * 3;

  const addObject = (id: number, body: Uint8Array | string) => {
    offsets[id] = byteLength;
    const objectParts = [
      ascii(`${id} 0 obj\n`),
      typeof body === 'string' ? ascii(body) : body,
      ascii('\nendobj\n'),
    ];
    objectParts.forEach(part => {
      parts.push(part);
      byteLength += part.length;
    });
  };

  const pageObjectIds = pages.map((_, index) => 3 + index * 3);
  addObject(1, `<< /Type /Catalog /Pages 2 0 R >>`);
  addObject(2, `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);

  pages.forEach((page, index) => {
    const pageObjectId = 3 + index * 3;
    const imageObjectId = pageObjectId + 1;
    const contentObjectId = pageObjectId + 2;
    const pageWidth = page.width;
    const pageHeight = page.height;

    addObject(
      pageObjectId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im${index} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );
    addObject(
      imageObjectId,
      concatBytes([
        ascii(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.length} >>\nstream\n`),
        page.bytes,
        ascii('\nendstream'),
      ])
    );
    const stream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im${index} Do\nQ`;
    addObject(contentObjectId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  const xrefOffset = byteLength;
  parts.push(ascii(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`));
  byteLength += parts[parts.length - 1].length;

  for (let id = 1; id <= objectCount; id += 1) {
    const entry = ascii(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    parts.push(entry);
    byteLength += entry.length;
  }

  parts.push(ascii(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));

  return new File([concatBytes(parts)], filename, { type: 'application/pdf' });
}
