import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = './Learn w_ J.pdf';
const pdfBuffer = fs.readFileSync(pdfPath);
const uint8Array = new Uint8Array(pdfBuffer);

const pdf = await pdfjsLib.getDocument(uint8Array).promise;
let fullText = '';

for (let i = 1; i <= Math.min(3, pdf.numPages); i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join(' ');
  fullText += `\n\n=== PAGE ${i} ===\n${pageText}`;
}

console.log(fullText.substring(0, 5000));
