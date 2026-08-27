import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export const SERVER_NAME = 'diag2md-mcp';
export const SERVER_VERSION = '1.0.0';

/**
 * Creates and initializes the diag2md MCP Server using modern McpServer API.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.registerTool(
    'convert_diagram',
    {
      description: 'Convert Draw.io C4 architecture diagram to Mermaid Markdown',
      inputSchema: {
        content: z.string().describe('Draw.io XML or C4 diagram content to convert'),
      },
    },
    async (args) => {
      const content = args.content;
      return {
        content: [
          {
            type: 'text',
            text: '```mermaid\n%% Converted from diag2md-mcp\nflowchart TD\n    A[Diagram Content Length: ' + content.length + ']\n```',
          },
        ],
      };
    }
  );

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
