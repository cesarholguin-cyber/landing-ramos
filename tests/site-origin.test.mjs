import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSiteOrigin } from '../scripts/site-origin.mjs';

test('VPS origin overrides Sites without modifying the source hosting manifest', () => {
  assert.equal(resolveSiteOrigin('https://despacho.example/', 'https://old.example'), 'https://despacho.example');
  assert.equal(resolveSiteOrigin(undefined, 'https://old.example/'), 'https://old.example');
  assert.equal(resolveSiteOrigin('http://127.0.0.1:8080'), 'http://127.0.0.1:8080');
});
test('origin rejects credentials, paths, query parameters and unsafe schemes', () => {
  for (const value of ['https://user:pass@example.com', 'https://example.com/sub/', 'https://example.com/?x=1', 'https://example.com/#x', 'javascript:alert(1)', 'invalid']) {
    assert.throws(() => resolveSiteOrigin(value));
  }
});
