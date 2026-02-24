import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Use the bundled worker from pdfjs-dist
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).href;

/**
 * Extract all text from a PDF file, page by page.
 * @param {File} file - PDF File object from input[type=file]
 * @returns {Promise<string>} - Full text content
 */
export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(' ');
    pages.push(`--- Page ${i} ---\n${text}`);
  }

  return pages.join('\n\n');
}
