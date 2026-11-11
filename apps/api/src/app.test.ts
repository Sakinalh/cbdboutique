import { describe, test, expect } from 'vitest';
import { createApp } from './app';

describe('GET /health', () => {
  test('responds 200 with status ok', async () => {
    const app = createApp();
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
