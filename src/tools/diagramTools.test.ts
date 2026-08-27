import { describe, it, expect, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerDiagramTools } from './diagramTools.js';
import { loadSettings } from '../settings.js';

describe('MCP Diagram Tools Registration', () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({
      name: 'test-diag2md',
      version: '1.0.0',
    });
  });

  it('should register all diagram tools on McpServer', () => {
    const settings = loadSettings();
    expect(() => registerDiagramTools(server, settings)).not.toThrow();
  });
});
