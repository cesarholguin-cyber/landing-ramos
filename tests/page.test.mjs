import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
test('initial HTML includes complete Spanish content and exactly one main heading', () => {
  assert.match(html, /lang="es-MX"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const id of ['inicio','editorial','firma','enfoque','servicios','luis-mario','contacto']) assert.ok(html.includes(`id="${id}"`));
  assert.match(html, /662 212 3568/);
  assert.match(html, /Hermosillo, Sonora/);
  assert.ok(html.indexOf('class="film-hero"') < html.indexOf('class="cinema"'));
});
test('all referenced local images, video, fonts and scripts exist', async () => {
  const refs = [...html.matchAll(/(?:src="|url\(')(\.\/public\/[^"')]+)/g)].map(m=>m[1]);
  for(const ref of new Set(refs)) await access(new URL(`../${ref}`, import.meta.url));
  assert.ok(refs.some(r=>r.endsWith('despacho-2k.mp4')));
  assert.ok(refs.some(r=>r.endsWith('despacho-mobile.mp4')));
});
test('approved contact is consistent across visible links, schema and crawler text', async () => {
  assert.match(html, /href="tel:\+526622123568">662 212 3568/);
  assert.match(html, /href="mailto:ramosyasociadoslegal@gmail\.com">ramosyasociadoslegal@gmail\.com/);
  const whatsappLinks = [...html.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map(match => match[1]);
  assert.ok(whatsappLinks.length >= 4);
  for (const url of whatsappLinks) assert.equal(new URL(url).pathname, '/526622123568');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const firm = schema['@graph'].find(item => item['@type'].includes('LegalService'));
  assert.equal(firm.telephone, '+526622123568');
  assert.equal(firm.email, 'ramosyasociadoslegal@gmail.com');
  const llms = await readFile(new URL('../dist/client/llms.txt', import.meta.url), 'utf8');
  assert.match(llms, /\+52 662 212 3568/);
  assert.match(llms, /ramosyasociadoslegal@gmail\.com/);
  const bundle = await readFile(new URL('../public/site.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html + llms + bundle, /6621739113|662 173 9113|luismarioramosamador@hotmail\.com/);
});
test('SEO metadata identifies the public copy and leaves crawling open', async () => {
  assert.match(html, /rel="canonical" href="https:\/\/ramos-asociados-despacho.cesarholguin.chatgpt.site\/"/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(item=>item['@type'].includes('LegalService')));
  assert.match(await readFile(new URL('../dist/client/robots.txt', import.meta.url),'utf8'), /Allow: \/\n/);
  assert.match(await readFile(new URL('../dist/client/sitemap.xml', import.meta.url),'utf8'), /ramos-asociados-despacho/);
});
