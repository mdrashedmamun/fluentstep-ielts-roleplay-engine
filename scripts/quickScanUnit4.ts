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

async function quickScanUnit4(): Promise<void> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;

    writeLine(`Total pages: ${pdf.numPages}\n`);

    // Sample every 5th page to quickly find Unit 4
    const samplesToCheck: number[] = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 150); i += 5) {
      samplesToCheck.push(i);
    }

    writeLine(`Sampling pages: ${samplesToCheck.join(', ')}\n`);

    for (const pageNum of samplesToCheck) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(getTextItemString)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Show first 300 chars
      writeLine(`Page ${pageNum}:`);
      writeLine(pageText.substring(0, 300));
      writeLine('---\n');

      if (/unit\s*4|unit\s+4\b/i.test(pageText)) {
        writeLine(`\n✓✓✓ FOUND "Unit 4" at page ${pageNum}! ✓✓✓\n`);
      }
    }
  } catch (error) {
    writeError(`Error: ${getErrorMessage(error)}`);
  }
}

void quickScanUnit4();
