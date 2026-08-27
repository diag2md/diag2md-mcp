import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadSettings, getOutputPath, DEFAULT_SETTINGS } from './settings.js';

describe('Settings Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default settings when no overrides or env vars are set', () => {
    delete process.env.DIAG2MD_PATTERNS;
    delete process.env.DIAG2MD_IGNORE;
    delete process.env.DIAG2MD_TYPE;

    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('should load settings from environment variables', () => {
    process.env.DIAG2MD_PATTERNS = '**/*.drawio, **/diagrams/*.xml';
    process.env.DIAG2MD_IGNORE = '**/tmp/**';
    process.env.DIAG2MD_TYPE = 'uml';

    const settings = loadSettings();
    expect(settings.diagramPatterns).toEqual(['**/*.drawio', '**/diagrams/*.xml']);
    expect(settings.ignorePatterns).toEqual(['**/tmp/**']);
    expect(settings.defaultDiagramType).toBe('uml');
  });

  it('should calculate output path with .md extension by default', () => {
    expect(getOutputPath('docs/architecture.drawio')).toBe('docs/architecture.md');
    expect(getOutputPath('system.xml')).toBe('system.md');
    expect(getOutputPath('nested/folder/c4.xml')).toBe('nested/folder/c4.md');
  });
});
