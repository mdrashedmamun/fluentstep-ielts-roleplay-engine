import fs from "fs";
import path from "path";

type PdfParseResult = {
  numpages: number;
  text: string;
  metadata?: unknown;
};

type PdfParse = (buffer: Buffer) => Promise<PdfParseResult>;

type PdfParseModule = {
  default: PdfParse;
};

const writeOut = (message = ""): void => {
  process.stdout.write(`${message}\n`);
};

const writeErr = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const formatMetadata = (metadata: unknown): string => {
  if (metadata === undefined) {
    return "undefined";
  }

  if (metadata === null) {
    return "null";
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  if (typeof metadata === "number" || typeof metadata === "boolean") {
    return `${metadata}`;
  }

  try {
    return JSON.stringify(metadata, null, 2) ?? `[${typeof metadata}]`;
  } catch {
    return `[unserializable ${typeof metadata}]`;
  }
};

const isPdfParseModule = (module: unknown): module is PdfParseModule => {
  if (typeof module !== "object" || module === null || !("default" in module)) {
    return false;
  }

  return typeof (module as { default?: unknown }).default === "function";
};

async function loadPdfParse(): Promise<PdfParse> {
  const pdfParseModule: unknown = await import("pdf-parse/lib/index.cjs");

  if (!isPdfParseModule(pdfParseModule)) {
    throw new Error("pdf-parse module did not expose a default parser function");
  }

  return pdfParseModule.default;
}

async function tryPdfParse(): Promise<void> {
  try {
    const pdfParse = await loadPdfParse();

    const pdfPath = path.resolve("./Source Materials/New-Headway-Advanced-Student_s-Book.pdf");
    const pdfBuffer = fs.readFileSync(pdfPath);

    writeOut("Attempting extraction with pdf-parse...\n");

    const data = await pdfParse(pdfBuffer);

    writeOut(`Total pages: ${data.numpages}`);
    writeOut(`Total text length: ${data.text.length} characters`);
    writeOut(`Metadata: ${formatMetadata(data.metadata)}\n`);

    // Show first 1000 characters.
    if (data.text.length > 0) {
      writeOut("First 1000 characters:");
      writeOut(data.text.substring(0, 1000));
    } else {
      writeOut("No text extracted.");
    }
  } catch (error) {
    writeErr(`Error: ${getErrorMessage(error)}`);
  }
}

void tryPdfParse();
