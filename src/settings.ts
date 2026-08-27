import path from 'node:path';

export interface ServerSettings {
  // Glob patterns to locate diagram files (.xml, .drawio). Supports nested folders.
  diagramPatterns: string[];

  // Glob patterns to ignore when searching for diagram files.
  ignorePatterns: string[];

  // Default diagram type for diag2md conversion ('c4' or 'uml').
  defaultDiagramType: 'c4' | 'uml';

  // Output file extension/pattern for converted Mermaid markdown files.
  // Defaults to '.md' (same directory as diagram file).
  outputExtension: string;
}

export const DEFAULT_SETTINGS: ServerSettings = {
  diagramPatterns: ['**/architecture/**/*.xml', '**/architecture/*.xml', '**/*.drawio'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  defaultDiagramType: 'c4',
  outputExtension: '.md',
};

/**
 * Loads server settings, overriding defaults with environment variables or custom options.
 */
export function loadSettings(overrides?: Partial<ServerSettings>): ServerSettings {
  const envPatterns = process.env.DIAG2MD_PATTERNS
    ? process.env.DIAG2MD_PATTERNS.split(',').map((p) => p.trim()).filter(Boolean)
    : undefined;

  const envIgnore = process.env.DIAG2MD_IGNORE
    ? process.env.DIAG2MD_IGNORE.split(',').map((p) => p.trim()).filter(Boolean)
    : undefined;

  const envType = process.env.DIAG2MD_TYPE === 'uml' ? 'uml' : process.env.DIAG2MD_TYPE === 'c4' ? 'c4' : undefined;

  return {
    diagramPatterns: overrides?.diagramPatterns ?? envPatterns ?? DEFAULT_SETTINGS.diagramPatterns,
    ignorePatterns: overrides?.ignorePatterns ?? envIgnore ?? DEFAULT_SETTINGS.ignorePatterns,
    defaultDiagramType: overrides?.defaultDiagramType ?? envType ?? DEFAULT_SETTINGS.defaultDiagramType,
    outputExtension: overrides?.outputExtension ?? DEFAULT_SETTINGS.outputExtension,
  };
}

/**
 * Resolves the output markdown file path for a given diagram file.
 * By default, converts `path/to/diagram.drawio` -> `path/to/diagram.md`
 * and `path/to/diagram.xml` -> `path/to/diagram.md`.
 */
export function getOutputPath(inputFilePath: string, outputExtension: string = '.md'): string {
  const ext = path.extname(inputFilePath);
  if (ext) {
    return inputFilePath.slice(0, -ext.length) + outputExtension;
  }
  return inputFilePath + outputExtension;
}
