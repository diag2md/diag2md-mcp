import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { ConverterController } from 'diag2md';
import { ServerSettings } from '../settings.js';

export interface DiagramConversionResult {
  success: boolean;
  inputPath?: string;
  outputPath?: string;
  mermaidContent?: string;
  error?: string;
}

/**
 * Discovers Draw.io diagram files (.xml, .drawio) matching configured glob patterns.
 */
export async function findDiagramFiles(
  settings: ServerSettings,
  baseDir: string = process.cwd()
): Promise<string[]> {
  const matches = await fg(settings.diagramPatterns, {
    ignore: settings.ignorePatterns,
    cwd: baseDir,
    onlyFiles: true,
    caseSensitiveMatch: false,
  });

  return matches.map((filepath) => filepath.replace(/\\/g, '/'));
}

/**
 * Converts a Draw.io architecture diagram file (.xml or .drawio) into Mermaid Markdown (.md).
 */
export async function convertDiagramFile(
  inputPath: string,
  outputPath: string,
  diagramType: 'c4' | 'uml' = 'c4',
  baseDir: string = process.cwd()
): Promise<DiagramConversionResult> {
  const absInput = path.isAbsolute(inputPath) ? inputPath : path.resolve(baseDir, inputPath);
  const absOutput = path.isAbsolute(outputPath) ? outputPath : path.resolve(baseDir, outputPath);

  try {
    // Ensure parent directory for output exists
    await fs.mkdir(path.dirname(absOutput), { recursive: true });

    // Execute conversion programmatically via diag2md ConverterController
    const controller = new ConverterController({
      input: absInput,
      output: absOutput,
      type: diagramType,
    });

    const mermaidContent = controller.execute();

    return {
      success: true,
      inputPath,
      outputPath,
      mermaidContent,
    };
  } catch (err: any) {
    return {
      success: false,
      inputPath,
      outputPath,
      error: err?.stderr || err?.message || String(err),
    };
  }
}

/**
 * Converts raw Draw.io XML diagram content into Mermaid Markdown directly in-memory.
 */
export async function convertDiagramContent(
  xmlContent: string,
  diagramType: 'c4' | 'uml' = 'c4'
): Promise<DiagramConversionResult> {
  try {
    const controller = new ConverterController({
      input: xmlContent,
      type: diagramType,
    });

    const mermaidContent = controller.execute();

    return {
      success: true,
      mermaidContent,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}
