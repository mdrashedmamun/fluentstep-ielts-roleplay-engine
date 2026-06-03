import fs from 'fs';
const writeLine = (message = '') => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message) => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error) => (
  error instanceof Error ? error.message : String(error)
);

const getTextItemString = (item) => {
  if (typeof item !== 'object' || item === null) {
    return '';
  }

  return typeof Reflect.get(item, 'str') === 'string' ? String(Reflect.get(item, 'str')) : '';
};

// Test PDF extraction
writeLine('Testing PDF extraction...\n');

async function testExtraction() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = './Learn w_ J.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);

    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    writeLine(`✓ PDF loaded: ${pdf.numPages} pages\n`);

    // Extract first 10 pages to check structure
    let fullText = '';
    for (let i = 1; i <= Math.min(10, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(getTextItemString)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      fullText += `${pageText}\n\n`;
    }

    // Look for scenario markers
    const roleplayMatches = fullText.match(/Role-?Play:[^\n]+/g) || [];
    const answersMatches = fullText.match(/Answers/g) || [];

    writeLine(`Found patterns:`);
    writeLine(`  • Role-Play headers: ${roleplayMatches.length}`);
    writeLine(`  • Answers sections: ${answersMatches.length}`);
    writeLine(`  • First 500 chars of extracted text:\n`);
    writeLine(fullText.substring(0, 500));
    writeLine('\n...\n');

  } catch (error) {
    writeError(`Error: ${getErrorMessage(error)}`);
  }
}

await testExtraction();
