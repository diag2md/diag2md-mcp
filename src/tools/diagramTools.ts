import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ServerSettings, loadSettings, getOutputPath } from '../settings.js';
import { findDiagramFiles, convertDiagramFile } from '../services/diagramService.js';

export function registerDiagramTools(server: McpServer, settings: ServerSettings = loadSettings()): void {
  // 1. Tool: list_diagrams
  server.registerTool(
    'list_diagrams',
    {
      description: 'Discover all Draw.io architecture diagram files (.xml, .drawio) in the workspace using glob patterns.',
      inputSchema: {
        patterns: z.array(z.string()).optional().describe('Custom glob patterns to search for diagram files (e.g. ["**/*.drawio"])'),
        ignore: z.array(z.string()).optional().describe('Custom glob patterns to ignore during search'),
      },
    },
    async (args) => {
      const activeSettings: ServerSettings = {
        ...settings,
        diagramPatterns: args.patterns ?? settings.diagramPatterns,
        ignorePatterns: args.ignore ?? settings.ignorePatterns,
      };

      const files = await findDiagramFiles(activeSettings);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: files.length,
                patterns: activeSettings.diagramPatterns,
                files,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 2. Tool: convert_diagrams_write
  server.registerTool(
    'convert_diagrams_write',
    {
      description: 'Batch scan workspace diagrams matching glob patterns and convert them to updated .md files on disk.',
      inputSchema: {
        patterns: z.array(z.string()).optional().describe('Custom glob patterns to scan for diagram files'),
        diagramType: z.enum(['c4', 'uml']).optional().describe('Diagram type: "c4" or "uml" (default: "c4")'),
      },
    },
    async (args) => {
      const activeSettings: ServerSettings = {
        ...settings,
        diagramPatterns: args.patterns ?? settings.diagramPatterns,
      };

      const files = await findDiagramFiles(activeSettings);
      const diagramType = args.diagramType ?? settings.defaultDiagramType;

      const converted: string[] = [];
      const failed: { file: string; error: string }[] = [];

      for (const file of files) {
        const outputPath = getOutputPath(file, settings.outputExtension);
        const res = await convertDiagramFile(file, outputPath, diagramType);
        if (res.success) {
          converted.push(`${file} -> ${outputPath}`);
        } else {
          failed.push({ file, error: res.error || 'Unknown conversion error' });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                scannedCount: files.length,
                convertedCount: converted.length,
                failedCount: failed.length,
                converted,
                failed,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // 3. Tool: convert_diagrams_read
  server.registerTool(
    'convert_diagrams_read',
    {
      description:
        'Batch scan and convert all workspace diagram files (.xml, .drawio) into Mermaid Markdown, returning their content directly as AI context.',
      inputSchema: {
        patterns: z.array(z.string()).optional().describe('Custom glob patterns to scan for diagram files'),
        diagramType: z.enum(['c4', 'uml']).optional().describe('Diagram type: "c4" or "uml" (default: "c4")'),
      },
    },
    async (args) => {
      const activeSettings: ServerSettings = {
        ...settings,
        diagramPatterns: args.patterns ?? settings.diagramPatterns,
      };

      const files = await findDiagramFiles(activeSettings);
      const diagramType = args.diagramType ?? settings.defaultDiagramType;

      if (files.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No diagram files found matching patterns: ${JSON.stringify(activeSettings.diagramPatterns)}`,
            },
          ],
        };
      }

      const results: string[] = [];

      for (const file of files) {
        const outputPath = getOutputPath(file, settings.outputExtension);
        const res = await convertDiagramFile(file, outputPath, diagramType);

        if (res.success && res.mermaidContent) {
          results.push(`### Architecture Diagram: ${file}\n\n${res.mermaidContent}`);
        } else {
          results.push(`### Architecture Diagram: ${file} (Conversion Failed)\n\nError: ${res.error}`);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: results.join('\n\n---\n\n'),
          },
        ],
      };
    }
  );
}
