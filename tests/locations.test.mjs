import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
test('location is readable in initial HTML with the supplied address and Maps link', () => {
  assert.match(html, /href="#ubicaciones"[^>]*>Ubicaciones/);
  assert.ok(html.indexOf('id="ubicaciones"') < html.indexOf('id="contacto"'));
  assert.match(html, /Blvd\. Miguel Hidalgo 43/);
  assert.match(html, /Col\. El Centenario, C\.P\. 83260/);
  assert.match(html, /href="https:\/\/maps\.app\.goo\.gl\/WMhXXXcYaHUpb2qm9"/);
  assert.match(html, /Cómo llegar/);
  assert.match(html, /Coordinar una visita/);
});
test('only three selected office images are shipped, lazy-loaded and sized', async () => {
  const dir=new URL('../dist/client/public/assets/oficinas/',import.meta.url);
  assert.deepEqual((await readdir(dir)).sort(), ['despacho.webp','fachada.webp','sala-espera.webp']);
  const images=[...html.matchAll(/<img[^>]+src="\.\/public\/assets\/oficinas\/[^>]+>/g)];
  assert.equal(images.length,3);
  for(const [tag] of images){assert.match(tag,/alt="[^"]+"/);assert.match(tag,/loading="lazy"/);assert.match(tag,/width="720" height="1280"/);}
  for(const file of await readdir(dir)) assert.ok((await stat(new URL(file,dir))).size<220000);
});
test('business structured data matches the supplied pin without invented opening hours', () => {
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const firm=schema['@graph'].find(item=>item['@type'].includes('LegalService'));
  assert.equal(firm.address.streetAddress,'Blvd. Miguel Hidalgo 43, Col. El Centenario');
  assert.equal(firm.address.postalCode,'83260');
  assert.equal(firm.geo.latitude,29.0758715);
  assert.equal(firm.geo.longitude,-110.9601386);
  assert.equal(firm.hasMap,'https://maps.app.goo.gl/WMhXXXcYaHUpb2qm9');
  assert.equal(firm.openingHours,undefined);
});
