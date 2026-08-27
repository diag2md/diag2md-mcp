# diag2md-mcp

> Model Context Protocol (MCP) server providing AI coding agents with Draw.io C4 and UML architectural guardrails and diagram conversion capabilities.

[![npm version](https://img.shields.io/npm/v/diag2md-mcp.svg)](https://www.npmjs.com/package/diag2md-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

`diag2md-mcp` bridges Draw.io architecture diagrams (`.xml`, `.drawio`) with AI coding agents (such as Antigravity, Cursor, Claude Desktop, and VS Code MCP clients) by converting C4 and UML diagrams into structured Mermaid Markdown in real time.

Powered by [`diag2md`](https://github.com/diag2md/diag2md).

---

## Key Features

- **Automated Workspace Discovery**: Scans project directories for Draw.io diagram files matching configurable glob patterns (`**/architecture/**/*.xml`, `**/*.drawio`).
- **High-Performance In-Memory Conversion**: Converts Draw.io XML models to Mermaid C4 & UML Markdown in-memory without subshell process spawning overhead.
- **AI Context Provider (`convert_diagrams_read`)**: Reads and converts diagrams dynamically to provide rich architectural context directly to AI coding assistants during chat sessions.
- **Batch Diagram Synchronization (`convert_diagrams_write`)**: Keeps architecture documentation up to date by generating `.md` files alongside diagram sources.

---

## Quick Start

### Running via `npx`

You can run the MCP server directly without pre-installing:

```bash
npx -y diag2md-mcp
```

### Installing Globally

```bash
npm install -g diag2md-mcp
```

---

## MCP Server Configuration

To connect `diag2md-mcp` to your favorite AI assistant or MCP client, add the server to your client configuration file (e.g. `mcpServers` in `claude_desktop_config.json`, Cursor, or Antigravity MCP settings):

```json
{
  "mcpServers": {
    "diag2md-mcp": {
      "command": "npx",
      "args": ["-y", "diag2md-mcp"]
    }
  }
}
```

---

## MCP Tools Reference

`diag2md-mcp` exposes 3 core tools to AI coding agents:

| Tool Name | Description | Arguments |
| :--- | :--- | :--- |
| `list_diagrams` | Discovers all Draw.io architecture diagram files (`.xml`, `.drawio`) in the workspace matching glob patterns. | `patterns` *(optional string[])*, `ignore` *(optional string[])* |
| `convert_diagrams_write` | Batch scans workspace diagram files matching glob patterns, converts them, and writes updated `.md` files to disk. | `patterns` *(optional string[])*, `diagramType` *(optional "c4" \| "uml")* |
| `convert_diagrams_read` | Batch scans workspace diagram files and returns converted Mermaid Markdown directly as context for the AI assistant. | `patterns` *(optional string[])*, `diagramType` *(optional "c4" \| "uml")* |

---

## Server Configuration

The MCP server settings can be customized via environment variables:

| Environment Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DIAG2MD_PATTERNS` | Comma-separated glob patterns to discover diagram files. | `**/architecture/**/*.xml, **/architecture/*.xml, **/*.drawio` |
| `DIAG2MD_IGNORE` | Comma-separated glob patterns to ignore during file discovery. | `**/node_modules/**, **/dist/**, **/.git/**` |
| `DIAG2MD_TYPE` | Default conversion diagram type (`c4` or `uml`). | `c4` |

---

## Development

```bash
# Clone the repository
git clone https://github.com/diag2md/diag2md-mcp.git
cd diag2md-mcp

# Install dependencies
npm install

# Build TypeScript to JavaScript dist/
npm run build

# Run unit tests
npm run test

# Run type checker
npm run typecheck
```

---

## License

[MIT](LICENSE) © [polymatic.ventures](https://github.com/diag2md)
