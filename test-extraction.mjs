import fs from 'fs';
import path from 'path';

// Test PDF extraction
console.log('Testing PDF extraction...\n');

async function testExtraction() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = './Learn w_ J.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);

    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    console.log(`✓ PDF loaded: ${pdf.numPages} pages\n`);

    // Extract first 10 pages to check structure
    let fullText = '';
    for (let i = 1; i <= Math.min(10, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      fullText += pageText + '\n\n';
    }

    // Look for scenario markers
    const roleplayMatches = fullText.match(/Role-?Play:[^\n]+/g) || [];
    const answersMatches = fullText.match(/Answers/g) || [];

    console.log(`Found patterns:`);
    console.log(`  • Role-Play headers: ${roleplayMatches.length}`);
    console.log(`  • Answers sections: ${answersMatches.length}`);
    console.log(`  • First 500 chars of extracted text:\n`);
    console.log(fullText.substring(0, 500));
    console.log('\n...\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

await testExtraction();
