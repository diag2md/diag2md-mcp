import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ServerSettings, loadSettings, getOutputPath } from '../settings.js';
import { findDiagramFiles, convertDiagramFile, convertDiagramContent } from '../services/diagramService.js';

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

  // 2. Tool: convert_diagram
  server.registerTool(
    'convert_diagram',
    {
      description: 'Convert a Draw.io diagram file (.xml or .drawio) into Mermaid Markdown.',
      inputSchema: {
        filePath: z.string().describe('Relative or absolute path to the Draw.io diagram file'),
        outputPath: z.string().optional().describe('Target output file path (defaults to same path with .md extension)'),
        diagramType: z.enum(['c4', 'uml']).optional().describe('Diagram type: "c4" or "uml" (default: "c4")'),
      },
    },
    async (args) => {
      const targetOutput = args.outputPath ?? getOutputPath(args.filePath, settings.outputExtension);
      const diagramType = args.diagramType ?? settings.defaultDiagramType;

      const result = await convertDiagramFile(args.filePath, targetOutput, diagramType);

      if (!result.success) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to convert diagram '${args.filePath}': ${result.error}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully converted '${args.filePath}' to '${targetOutput}'.\n\n\`\`\`mermaid\n${result.mermaidContent}\n\`\`\``,
          },
        ],
      };
    }
  );

  // 3. Tool: convert_diagram_content
  server.registerTool(
    'convert_diagram_content',
    {
      description: 'Convert raw Draw.io XML diagram string content into Mermaid Markdown without writing to a file.',
      inputSchema: {
        content: z.string().describe('Raw Draw.io XML or C4 diagram content string'),
        diagramType: z.enum(['c4', 'uml']).optional().describe('Diagram type: "c4" or "uml" (default: "c4")'),
      },
    },
    async (args) => {
      const diagramType = args.diagramType ?? settings.defaultDiagramType;
      const result = await convertDiagramContent(args.content, diagramType);

      if (!result.success) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to convert diagram content: ${result.error}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `\`\`\`mermaid\n${result.mermaidContent}\n\`\`\``,
          },
        ],
      };
    }
  );

  // 4. Tool: sync_diagrams
  server.registerTool(
    'sync_diagrams',
    {
      description: 'Batch scan workspace diagrams matching glob patterns and convert them to updated .md files.',
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

  // 5. Tool: read_diagrams
  server.registerTool(
    'read_diagrams',
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
          results.push(`### Architecture Diagram: ${file}\n\n\`\`\`mermaid\n${res.mermaidContent}\n\`\`\``);
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
