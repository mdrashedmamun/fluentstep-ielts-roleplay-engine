/**
 * Extraction Test Runner
 * Tests the PDF extraction pipeline with real data
 */

import fs from 'fs';
import path from 'path';

// Import required modules
async function main() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    console.log('\n📄 FluentStep PDF Extraction Test\n');

    // Step 1: Extract PDF
    console.log('Step 1: Extracting PDF text...');
    const pdfPath = './Learn w_ J.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);

    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    console.log(`✓ Loaded ${pdf.numPages} pages`);

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

    console.log(`✓ Extracted full text (${fullText.length} chars)\n`);

    // Step 2: Detect scenario patterns
    console.log('Step 2: Detecting scenario markers...');
    const miniStoryMatches = (fullText.match(/Mini-Story\s+\d+:/g) || []).length;
    const roleplayMatches = (fullText.match(/Role-?Play:/gi) || []).length;
    const answersMatches = (fullText.match(/^Answers/gm) || []).length;
    const promptMatches = (fullText.match(/Prompt\s+\d+:/g) || []).length;

    console.log(`  • Mini-Story markers: ${miniStoryMatches}`);
    console.log(`  • Role-Play markers: ${roleplayMatches}`);
    console.log(`  • Answers sections: ${answersMatches}`);
    console.log(`  • Prompt markers: ${promptMatches}`);
    console.log(`  Total scenarios found: ${miniStoryMatches + roleplayMatches}\n`);

    // Step 3: Extract first scenario as sample
    console.log('Step 3: Parsing first scenario...');
    const miniStoryMatch = fullText.match(/(Mini-Story.*?)(?=Mini-Story|Role-Play|Tab|\d+\.|\n\n✈|$)/s);

    if (miniStoryMatch) {
      const scenarioText = miniStoryMatch[1].substring(0, 1500);
      console.log('Sample scenario text:');
      console.log('---');
      console.log(scenarioText);
      console.log('---\n');

      // Count blanks
      const blankCount = (scenarioText.match(/________/g) || []).length;
      console.log(`✓ Found ${blankCount} blanks in sample scenario\n`);
    }

    // Step 4: Test answer extraction
    console.log('Step 4: Testing answer extraction...');
    const answerSection = fullText.match(/Answers\s+1\s*⃣(.*?)(?=2\s*⃣|$)/s);
    if (answerSection) {
      const answerText = answerSection[1].substring(0, 300);
      console.log('Sample answer section:');
      console.log('---');
      console.log(answerText);
      console.log('---\n');
    }

    console.log('✨ Test complete! Pipeline ready for full extraction.\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

await main();
