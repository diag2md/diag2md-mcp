import { describe, it, expect } from 'vitest';
import { createServer, SERVER_NAME, SERVER_VERSION } from './index.js';

describe('diag2md-mcp Server', () => {
  it('should instantiate the server correctly', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('should export correct server metadata', () => {
    expect(SERVER_NAME).toBe('diag2md-mcp');
    expect(SERVER_VERSION).toBe('1.0.0');
  });
});
