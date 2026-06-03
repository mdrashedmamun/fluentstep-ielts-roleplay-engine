/**
 * Extraction Test Runner
 * Tests the PDF extraction pipeline with real data
 */

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

// Import required modules
async function main() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    writeLine('\n📄 FluentStep PDF Extraction Test\n');

    // Step 1: Extract PDF
    writeLine('Step 1: Extracting PDF text...');
    const pdfPath = './Learn w_ J.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBuffer);

    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    writeLine(`✓ Loaded ${pdf.numPages} pages`);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(getTextItemString)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      fullText += `${pageText}\n\n`;
    }

    writeLine(`✓ Extracted full text (${fullText.length} chars)\n`);

    // Step 2: Detect scenario patterns
    writeLine('Step 2: Detecting scenario markers...');
    const miniStoryMatches = (fullText.match(/Mini-Story\s+\d+:/g) || []).length;
    const roleplayMatches = (fullText.match(/Role-?Play:/gi) || []).length;
    const answersMatches = (fullText.match(/^Answers/gm) || []).length;
    const promptMatches = (fullText.match(/Prompt\s+\d+:/g) || []).length;

    writeLine(`  • Mini-Story markers: ${miniStoryMatches}`);
    writeLine(`  • Role-Play markers: ${roleplayMatches}`);
    writeLine(`  • Answers sections: ${answersMatches}`);
    writeLine(`  • Prompt markers: ${promptMatches}`);
    writeLine(`  Total scenarios found: ${miniStoryMatches + roleplayMatches}\n`);

    // Step 3: Extract first scenario as sample
    writeLine('Step 3: Parsing first scenario...');
    const miniStoryMatch = fullText.match(/(Mini-Story.*?)(?=Mini-Story|Role-Play|Tab|\d+\.|\n\n✈|$)/s);

    if (miniStoryMatch) {
      const scenarioText = miniStoryMatch[1].substring(0, 1500);
      writeLine('Sample scenario text:');
      writeLine('---');
      writeLine(scenarioText);
      writeLine('---\n');

      // Count blanks
      const blankCount = (scenarioText.match(/________/g) || []).length;
      writeLine(`✓ Found ${blankCount} blanks in sample scenario\n`);
    }

    // Step 4: Test answer extraction
    writeLine('Step 4: Testing answer extraction...');
    const answerSection = fullText.match(/Answers\s+1\s*⃣(.*?)(?=2\s*⃣|$)/s);
    if (answerSection) {
      const answerText = answerSection[1].substring(0, 300);
      writeLine('Sample answer section:');
      writeLine('---');
      writeLine(answerText);
      writeLine('---\n');
    }

    writeLine('✨ Test complete! Pipeline ready for full extraction.\n');

  } catch (error) {
    writeError(`Error: ${getErrorMessage(error)}`);
    process.exit(1);
  }
}

await main();
