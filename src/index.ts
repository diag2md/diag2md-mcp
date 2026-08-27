import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadSettings, ServerSettings } from './settings.js';
import { registerDiagramTools } from './tools/diagramTools.js';

export const SERVER_NAME = 'diag2md-mcp';
export const SERVER_VERSION = '1.0.0';

/**
 * Creates and initializes the diag2md MCP Server with tools and settings.
 */
export function createServer(customSettings?: Partial<ServerSettings>): McpServer {
  const settings = loadSettings(customSettings);

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register diagram conversion, discovery, and sync tools
  registerDiagramTools(server, settings);

  return server;
}

/**
 * Main execution function starting the stdio server transport.
 */
export async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    console.error('Fatal error starting diag2md-mcp server:', err);
    process.exit(1);
  });
}
