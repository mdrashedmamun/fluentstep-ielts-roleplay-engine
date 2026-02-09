/**
 * Full PDF Extraction and Integration Pipeline
 * Extracts scenarios from Learn w_ J.pdf and prepares them for integration
 */

import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('\n📚 FluentStep PDF Extraction & Integration\n');

    // Load PDF.js
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    // Extract full PDF text
    console.log('Step 1: Extracting PDF...');
    const pdfPath = './Learn w_ J.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      fullText += pageText + '\n\n';
    }
    console.log(`✓ Extracted ${pdf.numPages} pages\n`);

    // Parse scenarios manually with better regex
    console.log('Step 2: Parsing scenarios...');

    // More robust scenario detection:
    // Split by Role-Play markers (with emojis or plain text)
    const scenarioPatterns = fullText.match(
      /(?:[\p{Emoji}]*\s*)?Role-?Play:?\s*([^\n]+)\n([\s\S]*?)(?=(?:[\p{Emoji}]*\s*)?(?:Role-?Play|Tab|\d+\.|\n\n✈|🛒|$))/gu
    ) || [];

    console.log(`Found ${scenarioPatterns.length} scenarios\n`);

    // Extract structured data from scenarios
    const scenarios = [];
    let scenarioIndex = 31; // Start from 31 since there are already 30

    for (const scenario of scenarioPatterns.slice(0, 5)) {
      // Process first 5 as test
      const titleMatch = scenario.match(/Role-?Play:?\s*([^\n]+)/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Scenario';

      // Count blanks
      const blanks = (scenario.match(/________/g) || []).length;

      // Find Answers section
      const answerMatch = scenario.match(/Answers([\s\S]*?)(?=Tab|$)/i);
      const answersText = answerMatch ? answerMatch[1] : '';

      // Extract answer options (lines starting with numbers/bullets)
      const answerOptions = (answersText.match(/[•●]\s*([^\n–]+)/g) || [])
        .map(a => a.replace(/^[•●]\s*/, '').trim())
        .slice(0, blanks); // Match to blank count

      console.log(`${scenarioIndex}. ${title}`);
      console.log(`   Blanks: ${blanks}`);
      console.log(`   Answers extracted: ${answerOptions.length}`);
      if (answerOptions.length > 0) {
        console.log(`   Sample: ${answerOptions.slice(0, 2).join(', ')}`);
      }
      console.log('');

      scenarioIndex++;
    }

    console.log('\n✨ Extraction preview complete!');
    console.log('\nNext steps:');
    console.log('1. Use extracted-scenarios.json as reference');
    console.log('2. Manually review and adjust scenario IDs');
    console.log('3. Ensure LOCKED CHUNKS compliance (target 80%+)');
    console.log('4. Integrate into services/staticData.ts\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

await main();
