import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerDiagramTools } from './diagramTools.js';
import { loadSettings } from '../settings.js';
import { findDiagramFiles, convertDiagramFile } from '../services/diagramService.js';

describe('MCP Diagram Tools Registration', () => {
  let server: McpServer;
  let tmpDir: string;

  beforeEach(async () => {
    server = new McpServer({
      name: 'test-diag2md',
      version: '1.0.0',
    });
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'diag2md-tools-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should register all diagram tools on McpServer', () => {
    const settings = loadSettings();
    expect(() => registerDiagramTools(server, settings)).not.toThrow();
  });

  it('should read and convert diagram files for AI context', async () => {
    const sampleXml = `<mxfile><diagram name="Architecture Context"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="sys" value="Order Service&#10;[Software System]" style="shape=mxgraph.c4.system;" vertex="1" parent="1"><mxGeometry x="100" y="100" width="100" height="100" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

    const diagramPath = path.join(tmpDir, 'architecture.drawio');
    const outputPath = path.join(tmpDir, 'architecture.md');
    await fs.writeFile(diagramPath, sampleXml, 'utf-8');

    const result = await convertDiagramFile(diagramPath, outputPath, 'c4');

    expect(result.success).toBe(true);
    expect(result.mermaidContent).toContain('C4Context');
    expect(result.mermaidContent).toContain('Order Service');
  });
});
