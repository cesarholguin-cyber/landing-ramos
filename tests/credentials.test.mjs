import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { credentialGroups, credentialPage } from '../src/credentials.js';

test('only two titles, four pages and both owners are preserved', async () => {
  assert.equal(credentialGroups.length, 2);
  const documents = credentialGroups.flatMap(group => group.documents);
  assert.equal(documents.length, 2);
  assert.equal(documents.reduce((n,d) => n + d.pages.length, 0), 4);
  assert.ok(documents.every(d => d.title.startsWith('Título') && !/c[eé]dula/i.test(JSON.stringify(d))));
  for(const document of documents) for(const page of document.pages) await access(new URL('../' + credentialPage(page), import.meta.url));
});
test('footer includes accessible disclosure and no direct PDF or download links', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url),'utf8');
  assert.ok(html.indexOf('id="cedulas-y-titulos"') > html.indexOf('<footer'));
  assert.match(html, /class="credentials-toggle">Cédulas y títulos /);
  assert.doesNotMatch(html, /Título y cédula/);
  assert.match(html, /José Cuitlahuac Castro Silva/);
  assert.doesNotMatch(html, /href="[^"]*\.pdf|\bdownload=/i);
  const files = await readdir(new URL('../dist/client/public/credentials/',import.meta.url));
  assert.deepEqual(files.sort(), ['jose-titulo-1.jpg','jose-titulo-2.jpg','luis-maestria-titulo-1.jpg','luis-maestria-titulo-2.jpg'].sort());
  assert.ok(files.every(file => /\.jpe?g$/.test(file)));
});
test('license cards contain only approved public fields and the source numbers', async () => {
  assert.deepEqual(credentialGroups.map(g => g.licenses.map(l => l.number)), [['6648774','12931063','PCS295'],['1705996']]);
  for (const group of credentialGroups) for (const license of group.licenses) {
    assert.ok(Object.keys(license).every(key => ['label','number','note'].includes(key)));
    assert.match(license.number, /^(?:\d{7,8}|PCS295)$/);
  }
  const html = await readFile(new URL('../index.html', import.meta.url),'utf8');
  for (const group of credentialGroups) for (const license of group.licenses) assert.ok(html.includes(license.number));
  assert.match(html, /No acredita vigencia actual/);
  assert.match(html, /href="https:\/\/cedulaprofesional\.sep\.gob\.mx\/"/);
  assert.doesNotMatch(html, /luis-estatal-1|luis-federal\.jpeg|luis-maestria-cedula|jose-titulo-cedula/);
  const cards = [...html.matchAll(/<details class="credential-license">([\s\S]*?)<\/details>/g)];
  assert.equal(cards.length, 2);
  for (const [,card] of cards) assert.doesNotMatch(card, /<img|<iframe|<object|\.pdf|CURP|firma|data:/i);
});
