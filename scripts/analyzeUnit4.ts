import fs from 'fs';
import path from 'path';

async function analyzeUnit4() {
  try {
    // Dynamic import for ESM compatibility
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    console.log(`📖 Loading PDF: ${pdfPath}\n`);
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    
    console.log(`✓ Total pages: ${pdf.numPages}\n`);
    
    // Search for Unit 4 in pages 30-100
    let foundUnit4 = false;
    let unit4StartPage = -1;
    let unit4Content = '';
    let pageCount = 0;
    
    for (let i = 30; i <= Math.min(100, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Look for "Unit 4" header
      if (!foundUnit4 && /unit\s*4/i.test(pageText)) {
        console.log(`✓ Found Unit 4 at page ${i}`);
        foundUnit4 = true;
        unit4StartPage = i;
      }
      
      if (foundUnit4) {
        unit4Content += `\n--- PAGE ${i} ---\n${pageText}`;
        pageCount++;
        
        // Stop at Unit 5
        if (i > unit4StartPage && /unit\s*5/i.test(pageText)) {
          console.log(`✓ Unit 4 ends around page ${i}`);
          console.log(`✓ Unit 4 spans approximately ${pageCount} pages\n`);
          break;
        }
      }
    }
    
    if (foundUnit4) {
      console.log('📄 UNIT 4 CONTENT (first 4000 chars):\n');
      console.log(unit4Content.substring(0, 4000));
      console.log('\n... (content truncated)\n');
      
      // Count dialogues
      const dialogueIndicators = (unit4Content.match(/(?:Person A|A:|Person B|B:|Speaker|Dialogue|Conversation)/gi) || []).length;
      console.log(`📊 Dialogue Indicators Found: ~${dialogueIndicators}`);
    } else {
      console.log('❌ Unit 4 not found in pages 30-100');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeUnit4();
