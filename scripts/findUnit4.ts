import fs from 'fs';
import path from 'path';

interface TextContentItem {
  str?: unknown;
}

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const getTextItemString = (item: unknown): string => {
  if (typeof item !== 'object' || item === null) {
    return '';
  }

  const textItem = item as TextContentItem;
  return typeof textItem.str === 'string' ? textItem.str : '';
};

async function findUnit4(): Promise<void> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;

    writeLine(`Searching ${pdf.numPages} pages for Unit 4...`);
    writeLine();

    // Search all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(getTextItemString)
        .join(' ')
        .toLowerCase();

      if (/unit\s*4|unit\s+4\b/.test(pageText)) {
        writeLine(`✓ Found "Unit 4" at page ${i}`);

        // Extract and display this page
        const fullText = textContent.items
          .map(getTextItemString)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        writeLine();
        writeLine('Page content (first 2000 chars):');
        writeLine(fullText.substring(0, 2000));
        writeLine();
      }
    }
  } catch (error) {
    writeError(`Error: ${getErrorMessage(error)}`);
  }
}

void findUnit4();
