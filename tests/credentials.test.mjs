import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { credentialGroups } from '../src/credentials.js';

test('both owners retain only license cards, without academic documents', () => {
  assert.equal(credentialGroups.length, 2);
  for (const group of credentialGroups) assert.deepEqual(Object.keys(group).sort(), ['licenses', 'name']);
});
test('footer includes accessible disclosure and no direct PDF or download links', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url),'utf8');
  assert.ok(html.indexOf('id="cedulas-y-titulos"') > html.indexOf('<footer'));
  assert.match(html, /class="credentials-toggle">Cédulas /);
  assert.doesNotMatch(html, /Cédulas y títulos|Título de maestría|Título de licenciatura|credential-dialog|credential-document/);
  assert.match(html, /José Cuitlahuac Castro Silva/);
  assert.doesNotMatch(html, /href="[^"]*\.pdf|\bdownload=/i);
  for (const directory of ['public/credentials/', 'dist/client/public/credentials/']) {
    const files = await readdir(new URL('../' + directory, import.meta.url)).catch(error => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    assert.deepEqual(files, []);
  }
  for (const file of ['index.html', 'public/site.js', 'dist/client/index.html', 'dist/client/public/site.js']) {
    const output = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    assert.doesNotMatch(output, /jose-titulo|luis-maestria-titulo|credential-dialog|Ver documento/);
  }
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
