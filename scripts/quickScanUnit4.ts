import fs from 'fs';
import path from 'path';

async function quickScanUnit4() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    
    console.log(`Total pages: ${pdf.numPages}\n`);
    
    // Sample every 5th page to quickly find Unit 4
    const samplesToCheck = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 150); i += 5) {
      samplesToCheck.push(i);
    }
    
    console.log(`Sampling pages: ${samplesToCheck.join(', ')}\n`);
    
    for (const pageNum of samplesToCheck) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Show first 300 chars
      console.log(`Page ${pageNum}:`);
      console.log(pageText.substring(0, 300));
      console.log('---\n');
      
      if (/unit\s*4|unit\s+4\b/i.test(pageText)) {
        console.log(`\n✓✓✓ FOUND "Unit 4" at page ${pageNum}! ✓✓✓\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

quickScanUnit4();
