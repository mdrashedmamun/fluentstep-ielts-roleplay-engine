/**
 * PDF Text Extraction Service
 * Extracts text from PDF while maintaining structure for scenario parsing
 */

import fs from 'fs';
import path from 'path';

export interface ExtractedPage {
  pageNum: number;
  text: string;
}

export interface ExtractedPDF {
  totalPages: number;
  pages: ExtractedPage[];
  fullText: string;
}

/**
 * Extracts text from PDF file asynchronously
 * Note: This requires pdfjs-dist to be available
 */
export async function extractPDFText(filePath: string): Promise<ExtractedPDF> {
  try {
    // Dynamic import for ESM compatibility
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(pdfBuffer);

    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    const pages: ExtractedPage[] = [];
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pages.push({ pageNum: i, text: pageText });
      fullText += pageText + '\n\n';
    }

    return {
      totalPages: pdf.numPages,
      pages,
      fullText
    };
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error(`Failed to extract PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extracts text from PDF and saves to file for debugging
 */
export async function extractAndSaveToFile(pdfPath: string, outputPath: string): Promise<void> {
  const extracted = await extractPDFText(pdfPath);
  fs.writeFileSync(outputPath, extracted.fullText, 'utf-8');
  console.log(`✓ Extracted ${extracted.totalPages} pages to ${outputPath}`);
}
