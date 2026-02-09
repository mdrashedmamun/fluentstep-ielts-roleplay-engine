import fs from 'fs';
import path from 'path';

async function tryPdfParse() {
  try {
    const pdfParse = (await import('pdf-parse/lib/index.cjs')).default;
    
    const pdfPath = path.resolve('./Source Materials/New-Headway-Advanced-Student_s-Book.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log('Attempting extraction with pdf-parse...\n');
    
    const data = await pdfParse(pdfBuffer);
    
    console.log(`Total pages: ${data.numpages}`);
    console.log(`Total text length: ${data.text.length} characters`);
    console.log(`Metadata:`, data.metadata, '\n');
    
    // Show first 1000 characters
    if (data.text && data.text.length > 0) {
      console.log('First 1000 characters:');
      console.log(data.text.substring(0, 1000));
    } else {
      console.log('No text extracted.');
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

tryPdfParse();
