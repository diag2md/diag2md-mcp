# diag2md-mcp

> Model Context Protocol (MCP) server providing AI coding agents with Draw.io C4 and UML architectural guardrails and diagram conversion capabilities.

[![GitHub Release](https://img.shields.io/github/v/tag/diag2md/diag2md-mcp?label=version&color=blue)](https://github.com/diag2md/diag2md-mcp/releases/tag/v1.0.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

`diag2md-mcp` bridges Draw.io architecture diagrams (`.xml`, `.drawio`) with AI coding agents (such as Antigravity, Cursor, Claude Desktop, and VS Code MCP clients) by converting C4 and UML diagrams into structured Mermaid Markdown in real time.

Powered by [`diag2md`](https://github.com/diag2md/diag2md).

---

## Problem Statement

- **The Problem**: AI coding assistants cannot natively interpret visual architecture diagrams (such as Draw.io files). Without a way to parse these diagrams, AI agents frequently generate code that violates a project's established C4 system and container boundaries.
- **The Impact**: Attempting to solve this by pasting massive, static architectural documents into the AI's prompt severely bloats the context window and reduces the model's performance. As a result, projects suffer from "architectural drift," where the AI-generated codebase slowly misaligns with the intended system design and dependency rules.
- **The Need**: There is a need for a dynamic, on-demand integration (via an MCP server) that translates visual Draw.io C4 diagrams into an AI-readable format (Mermaid Markdown). This solution will serve as a strict, real-time architectural guardrail, ensuring every AI prompt and code change remains aligned with the project's single source of truth.
- **Why the C4 Model?**: The C4 model is the ideal architectural language for this bridge because it caters to both human and machine audiences perfectly. Its hierarchical structure (Context, Containers, Components, Code) provides high-level visual clarity that is easy for non-technical stakeholders and business leaders to understand. Simultaneously, its strict categorization provides the exact deterministic boundaries and structural logic that an AI needs to reason about system architecture, making it the perfect standard for AI-assisted engineering guardrails.

---

## Agent Architectural Guardrails (`AGENTS.md` / `.cursorrules`)

You can enforce strict architectural compliance across your team by adding an architectural rule directive to your project's `AGENTS.md`, `GEMINI.md`, or `.cursorrules`:

```markdown
### ARCHITECTURAL RULES
Before writing any new modules, creating new services, or adding dependencies, you MUST call the `convert_diagrams_read` MCP tool to verify the proposed changes align with the C4 Draw.io architecture. Do not suggest structural changes that violate these boundaries.
```

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

To connect `diag2md-mcp` to your favorite AI assistant or MCP client, add the server to your client configuration file (e.g., `mcp_config.json`, `claude_desktop_config.json`, Cursor, or Antigravity MCP settings).

### Recommended (Globally Installed Package)

```json
{
  "mcpServers": {
    "diag2md-mcp": {
      "command": "diag2md-mcp"
    }
  }
}
```

### Alternative: Local Built Source

```json
{
  "mcpServers": {
    "diag2md-mcp": {
      "command": "node",
      "args": ["/path/to/diag2md-mcp/dist/index.js"]
    }
  }
}
```

### Alternative: On-Demand via `npx`

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

### Configuration Example with `env` Patterns

You can configure custom search patterns directly in your MCP server JSON configuration using the `env` block:

```json
{
  "mcpServers": {
    "diag2md-mcp": {
      "command": "diag2md-mcp",
      "env": {
        "DIAG2MD_PATTERNS": "**/architecture/**/*.xml, **/docs/**/*.drawio",
        "DIAG2MD_IGNORE": "**/tmp/**, **/node_modules/**",
        "DIAG2MD_TYPE": "c4"
      }
    }
  }
}
```

### Dynamic Tool Call Example with `patterns`

AI assistants or tools can also override search patterns dynamically per request:

```json
{
  "name": "convert_diagrams_read",
  "arguments": {
    "patterns": [
      "**/architecture/**/*.xml",
      "**/docs/**/*.drawio"
    ]
  }
}
```

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
