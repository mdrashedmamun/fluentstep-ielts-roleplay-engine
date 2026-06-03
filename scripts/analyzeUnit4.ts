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

async function analyzeUnit4(): Promise<void> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    writeLine(`📖 Loading PDF: ${pdfPath}\n`);

    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;

    writeLine(`✓ Total pages: ${pdf.numPages}\n`);

    // Search for Unit 4 in pages 30-100
    let foundUnit4 = false;
    let unit4StartPage = -1;
    let unit4Content = '';
    let pageCount = 0;

    for (let i = 30; i <= Math.min(100, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(getTextItemString)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Look for "Unit 4" header
      if (!foundUnit4 && /unit\s*4/i.test(pageText)) {
        writeLine(`✓ Found Unit 4 at page ${i}`);
        foundUnit4 = true;
        unit4StartPage = i;
      }

      if (foundUnit4) {
        unit4Content += `\n--- PAGE ${i} ---\n${pageText}`;
        pageCount++;

        // Stop at Unit 5
        if (i > unit4StartPage && /unit\s*5/i.test(pageText)) {
          writeLine(`✓ Unit 4 ends around page ${i}`);
          writeLine(`✓ Unit 4 spans approximately ${pageCount} pages\n`);
          break;
        }
      }
    }

    if (foundUnit4) {
      writeLine('📄 UNIT 4 CONTENT (first 4000 chars):\n');
      writeLine(unit4Content.substring(0, 4000));
      writeLine('\n... (content truncated)\n');

      // Count dialogues
      const dialogueIndicators = (unit4Content.match(/(?:Person A|A:|Person B|B:|Speaker|Dialogue|Conversation)/gi) || []).length;
      writeLine(`📊 Dialogue Indicators Found: ~${dialogueIndicators}`);
    } else {
      writeLine('❌ Unit 4 not found in pages 30-100');
    }
  } catch (error) {
    writeError(`Error: ${getErrorMessage(error)}`);
  }
}

void analyzeUnit4();
