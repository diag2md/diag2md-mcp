import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { findDiagramFiles, convertDiagramFile, convertDiagramContent } from './diagramService.js';
import { loadSettings } from '../settings.js';

describe('Diagram Service', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'diag2md-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should locate diagram files matching glob patterns', async () => {
    await fs.mkdir(path.join(tmpDir, 'docs/architecture'), { recursive: true });
    await fs.writeFile(path.join(tmpDir, 'arch.drawio'), '<xml>Drawio Diagram</xml>');
    await fs.writeFile(path.join(tmpDir, 'docs/architecture/c4.xml'), '<xml>C4 Diagram</xml>');
    await fs.writeFile(path.join(tmpDir, 'random.xml'), '<xml>Random XML</xml>');
    await fs.writeFile(path.join(tmpDir, 'readme.txt'), 'Not a diagram');

    const settings = loadSettings();
    const files = await findDiagramFiles(settings, tmpDir);

    expect(files.sort()).toEqual(['arch.drawio', 'docs/architecture/c4.xml'].sort());
  });

  it('should ignore files matching ignore patterns', async () => {
    await fs.mkdir(path.join(tmpDir, 'node_modules/pkg'), { recursive: true });
    await fs.writeFile(path.join(tmpDir, 'node_modules/pkg/diagram.xml'), '<xml></xml>');
    await fs.writeFile(path.join(tmpDir, 'system.drawio'), '<xml></xml>');

    const settings = loadSettings();
    const files = await findDiagramFiles(settings, tmpDir);

    expect(files).toEqual(['system.drawio']);
  });

  it('should convert raw XML content directly in memory', async () => {
    const sampleXml = `<mxfile><diagram name="System Architecture"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="sys" value="API System&#10;[Software System]" style="shape=mxgraph.c4.system;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="100" height="100" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

    const result = await convertDiagramContent(sampleXml, 'c4');

    expect(result.success).toBe(true);
    expect(result.mermaidContent).toContain('C4Context');
    expect(result.mermaidContent).toContain('System(sys, "API System"');
  });

  it('should convert diagram file and save output .md file', async () => {
    const sampleXml = `<mxfile><diagram name="System Architecture"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="sys" value="API System&#10;[Software System]" style="shape=mxgraph.c4.system;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="100" height="100" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

    const inputPath = path.join(tmpDir, 'docs/architecture/c4.xml');
    const outputPath = path.join(tmpDir, 'docs/architecture/c4.md');

    await fs.mkdir(path.dirname(inputPath), { recursive: true });
    await fs.writeFile(inputPath, sampleXml, 'utf-8');

    const result = await convertDiagramFile(inputPath, outputPath, 'c4');

    expect(result.success).toBe(true);
    expect(result.mermaidContent).toContain('C4Context');

    const fileContent = await fs.readFile(outputPath, 'utf-8');
    expect(fileContent).toBe(result.mermaidContent);
  });
});
