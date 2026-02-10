/**
 * PDF Chunker Service
 * Splits 40MB PDF into manageable 20-page chunks while preserving unit boundaries
 * Detects unit structure and estimates dialogue-richness of each chunk
 */

export interface PDFChunk {
  startPage: number;
  endPage: number;
  unitNumber?: number;
  unitTitle?: string;
  estimatedDialogueRichness: number; // 0-100 score
  pageCount: number;
  hasEverydayEnglish: boolean;
  hasListening: boolean;
  hasSpeak: boolean;
  extractedText: string;
}

/**
 * Detect unit boundaries in PDF text
 * New Headway uses "Unit 1", "Unit 2" pattern with consistent formatting
 */
export function detectUnitBoundaries(
  pages: Array<{ pageNum: number; text: string }>
): Array<{ unitNumber: number; pageNum: number; title: string }> {
  const unitBoundaries: Array<{ unitNumber: number; pageNum: number; title: string }> = [];

  for (const page of pages) {
    // Match "Unit X" or "UNIT X" patterns
    const unitMatch = page.text.match(/^\s*(?:UNIT\s+|Unit\s+)(\d+)[:\s]+(.{0,50})?/im);
    if (unitMatch) {
      const unitNum = parseInt(unitMatch[1], 10);
      const title = (unitMatch[2] || '').trim().split('\n')[0]!.substring(0, 50);

      // Avoid duplicates
      if (!unitBoundaries.some(u => u.unitNumber === unitNum)) {
        unitBoundaries.push({
          unitNumber: unitNum,
          pageNum: page.pageNum,
          title
        });
      }
    }
  }

  return unitBoundaries.sort((a, b) => a.pageNum - b.pageNum);
}

/**
 * Estimate dialogue richness of a page chunk (0-100 scale)
 * Looks for dialogue markers: "Person A:", "Speaker 1:", etc.
 */
export function estimateDialogueRichness(text: string): number {
  let score = 0;

  // Count speaker patterns
  const speakerMatches = text.match(/(?:Person\s+[A-Z]|Speaker\s+\d+|[A-Z][a-z]+):\s/g) || [];
  score += Math.min(speakerMatches.length * 5, 30);

  // Look for section headers
  if (/Everyday\s+English/i.test(text)) score += 20;
  if (/Listening/i.test(text)) score += 20;
  if (/(?:Speaking|Speak)/i.test(text)) score += 15;
  if (/Pairwork/i.test(text)) score += 10;

  // Penalize for non-dialogue content
  if (/Grammar|Exercise|Vocabulary|Reading/i.test(text)) score -= 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Chunk PDF while respecting unit boundaries
 * Tries to keep chunks ~20 pages, but respects unit boundaries
 */
export function chunkPDFByUnits(
  pages: Array<{ pageNum: number; text: string }>,
  preferredChunkSize: number = 20
): PDFChunk[] {
  if (pages.length === 0) return [];

  const unitBoundaries = detectUnitBoundaries(pages);
  const chunks: PDFChunk[] = [];

  let currentChunkStart = pages[0]!.pageNum;
  let currentChunkPages: typeof pages = [];
  let currentUnit: (typeof unitBoundaries)[0] | null = null;

  for (const page of pages) {
    currentChunkPages.push(page);

    // Check if we hit a unit boundary
    const unitAtPage = unitBoundaries.find(u => u.pageNum === page.pageNum);
    if (unitAtPage && currentChunkPages.length > 1) {
      // We're at a new unit, close current chunk first
      if (currentChunkPages.length > 0) {
        const prevPage = currentChunkPages[currentChunkPages.length - 2];
        chunks.push(createChunk(currentChunkPages.slice(0, -1), currentUnit));
        currentChunkPages = [page];
        currentChunkStart = page.pageNum;
      }
      currentUnit = unitAtPage;
    }

    // Close chunk if it reaches preferred size
    if (currentChunkPages.length >= preferredChunkSize) {
      chunks.push(createChunk(currentChunkPages, currentUnit));
      currentChunkPages = [];
      currentChunkStart = page.pageNum;
    }
  }

  // Add final chunk
  if (currentChunkPages.length > 0) {
    chunks.push(createChunk(currentChunkPages, currentUnit));
  }

  return chunks;
}

/**
 * Helper to create a PDFChunk from pages
 */
function createChunk(
  pages: Array<{ pageNum: number; text: string }>,
  unitInfo: { unitNumber: number; pageNum: number; title: string } | null
): PDFChunk {
  const extractedText = pages.map(p => p.text).join('\n\n');
  const dialogueRichness = estimateDialogueRichness(extractedText);

  return {
    startPage: pages[0]!.pageNum,
    endPage: pages[pages.length - 1]!.pageNum,
    unitNumber: unitInfo?.unitNumber,
    unitTitle: unitInfo?.title,
    estimatedDialogueRichness: dialogueRichness,
    pageCount: pages.length,
    hasEverydayEnglish: /Everyday\s+English/i.test(extractedText),
    hasListening: /Listening/i.test(extractedText),
    hasSpeak: /(?:Speaking|Speak|Pairwork)/i.test(extractedText),
    extractedText
  };
}

/**
 * Filter chunks by dialogue richness (useful for prioritizing high-content units)
 */
export function filterChunksByRichness(
  chunks: PDFChunk[],
  minRichness: number = 40
): PDFChunk[] {
  return chunks.filter(chunk => chunk.estimatedDialogueRichness >= minRichness);
}

/**
 * Sort chunks by dialogue richness (highest first)
 */
export function sortChunksByRichness(chunks: PDFChunk[]): PDFChunk[] {
  return [...chunks]!.sort((a, b) => b.estimatedDialogueRichness - a.estimatedDialogueRichness);
}
