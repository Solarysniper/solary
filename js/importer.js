// Import de cours : PDF (pdf.js), Word .docx, texte/Markdown, images (photos de cours)
let pdfjs;
async function loadPdf() {
  if (!pdfjs) { pdfjs = await import('../vendor/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.mjs', import.meta.url).href; }
  return pdfjs;
}
export async function openPdf(data) { const p = await loadPdf(); return p.getDocument({ data: data.slice ? data.slice(0) : data }).promise; }

async function pdfText(buf, onProgress) {
  const doc = await openPdf(buf); const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i); const tc = await page.getTextContent();
    let last = null; let s = '';
    for (const it of tc.items) {
      if (last && Math.abs(it.transform[5] - last) > 2) s += '\n'; else if (s && !s.endsWith(' ')) s += ' ';
      s += it.str; last = it.transform[5];
    }
    pages.push(s); onProgress?.(i / doc.numPages);
  }
  return { text: pages.join('\n\n'), pages: doc.numPages };
}

// Lecture minimale d'un .docx (zip) via DecompressionStream
async function docxText(buf) {
  const u8 = new Uint8Array(buf); const dv = new DataView(buf);
  let eocd = -1; for (let i = u8.length - 22; i >= 0; i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Fichier Word invalide');
  let p = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
  for (let k = 0; k < n; k++) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen));
    if (name === 'word/document.xml') {
      const lnl = dv.getUint16(off + 26, true), lxl = dv.getUint16(off + 28, true); const start = off + 30 + lnl + lxl;
      let data = u8.subarray(start, start + csize);
      if (method === 8) data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      const xml = new TextDecoder().decode(data);
      return xml.replace(/<w:tab\/>/g, '\t').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error('Contenu Word introuvable');
}

// Réduit les photos pour économiser stockage et mémoire
async function shrinkImage(file, max = 1800) {
  const bmp = await createImageBitmap(file); const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); bmp.close?.();
  return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
}

export async function importFile(file, onProgress) {
  const name = file.name.replace(/\.[^.]+$/, ''); const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (file.type === 'application/pdf' || ext === 'pdf') {
    const buf = await file.arrayBuffer(); const { text, pages } = await pdfText(buf, onProgress);
    return { title: name, type: 'pdf', text, pages, blob: new Blob([buf], { type: 'application/pdf' }) };
  }
  if (ext === 'docx') return { title: name, type: 'docx', text: await docxText(await file.arrayBuffer()) };
  if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(ext)) return { title: name, type: 'image', text: '', blob: await shrinkImage(file) };
  if (file.type.startsWith('text/') || ['txt', 'md', 'csv'].includes(ext)) return { title: name, type: 'text', text: await file.text() };
  throw new Error('Format non pris en charge (PDF, Word .docx, texte, images)');
}

export async function renderPdfPage(blob, n, canvas, width) {
  const doc = await openPdf(await blob.arrayBuffer()); const page = await doc.getPage(n);
  const vp1 = page.getViewport({ scale: 1 }); const scale = (width / vp1.width) * Math.min(window.devicePixelRatio || 1, 2);
  const vp = page.getViewport({ scale }); canvas.width = vp.width; canvas.height = vp.height; canvas.style.width = '100%';
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  return doc.numPages;
}
