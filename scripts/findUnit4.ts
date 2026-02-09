import fs from 'fs';
import path from 'path';

async function findUnit4() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    
    console.log(`Searching ${pdf.numPages} pages for Unit 4...\n`);
    
    // Search all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .toLowerCase();
      
      if (/unit\s*4|unit\s+4\b/.test(pageText)) {
        console.log(`✓ Found "Unit 4" at page ${i}`);
        
        // Extract and display this page
        const fullText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('\nPage content (first 2000 chars):');
        console.log(fullText.substring(0, 2000));
        console.log('\n');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

findUnit4();
