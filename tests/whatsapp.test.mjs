import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { whatsappOptions, whatsappNumber, whatsappLink } from '../src/whatsapp-options.mjs';

test('every contact reason opens the approved number with its exact prepared message', () => {
  assert.equal(whatsappNumber, '526622123568');
  assert.equal(whatsappOptions.length, 4);
  assert.equal(new Set(whatsappOptions.map(item => item.id)).size, 4);
  for (const option of whatsappOptions) {
    const link = new URL(whatsappLink(option.id));
    assert.equal(link.origin, 'https://wa.me');
    assert.equal(link.pathname, '/526622123568');
    assert.equal(link.searchParams.get('text'), option.message);
    assert.deepEqual([...link.searchParams.keys()], ['text']);
  }
  assert.equal(whatsappLink('unknown'), null);
  assert.equal(whatsappLink(''), null);
});

test('initial page includes a closed, accessible chooser with a no-JS fallback', async () => {
  const html = await readFile('dist/client/index.html', 'utf8');
  const widget = html.match(/<details class="wa-contact"[\s\S]*?<\/details>/)?.[0];
  assert.ok(widget);
  assert.doesNotMatch(widget.split('>')[0], /\bopen\b/);
  assert.match(widget, /aria-controls="wa-contact-panel"/);
  assert.match(widget, /aria-labelledby="wa-contact-title"/);
  assert.equal((widget.match(/type="radio"/g) || []).length, 4);
  assert.doesNotMatch(widget, /checked=""/);
  assert.match(widget, /class="wa-send" type="button" disabled=""/);
  assert.match(widget, /Usted decide cuándo enviarlo/);
  const fallback = widget.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
  for (const option of whatsappOptions) assert.ok(fallback.includes(whatsappLink(option.id)));
  assert.equal((fallback.match(/rel="noopener noreferrer"/g) || []).length, 4);
});

test('widget introduces no automatic navigation, tracking, storage or external requests', async () => {
  const source = await readFile('src/WhatsAppContact.jsx', 'utf8');
  assert.doesNotMatch(source, /window\.open|location\.(?:href|assign)|fetch\(|gtag\(|localStorage|setInterval/);
  assert.match(source, /event.key === 'Escape'/);
  assert.match(source, /removeEventListener\('pointerdown'/);
  assert.match(source, /trigger.current.focus\(\)/);
  const css = await readFile('src/whatsapp.css', 'utf8');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /100dvh/);
});
