import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = './Learn w_ J.pdf';
const pdfBuffer = fs.readFileSync(pdfPath);
const uint8Array = new Uint8Array(pdfBuffer);

const pdf = await pdfjsLib.getDocument(uint8Array).promise;
console.log(`Total pages: ${pdf.numPages}\n`);

let fullText = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join(' ');
  fullText += pageText + '\n\n';
}

fs.writeFileSync('pdf-extracted.txt', fullText);
console.log('Extracted PDF text to pdf-extracted.txt');
console.log('First 3000 characters:');
console.log(fullText.substring(0, 3000));
