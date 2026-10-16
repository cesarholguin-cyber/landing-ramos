import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { businessProfile, confirmedDetails, addConfirmedBusinessSchema } from '../src/business-profile.mjs';
import { runInNewContext } from 'node:vm';

const schema = { '@graph': [{ '@type': ['LegalService', 'Organization'], name: 'Ramos & Asociados' }] };
// Datos ficticios exclusivos de pruebas; nunca se importan en la aplicación.
const fixture = {
  hours: { approved: true, entries: [{ days: ['Monday', 'Wednesday'], opens: '09:00', closes: '13:30' }] },
  practiceAreas: { approved: true, entries: [{ name: 'Área de prueba', description: 'Descripción de prueba.' }] },
};
test('unconfirmed details are absent even if draft entries exist', () => {
  assert.deepEqual(confirmedDetails(), { hours: [], practiceAreas: [] });
  const draft = structuredClone(fixture);
  draft.hours.approved = draft.practiceAreas.approved = false;
  assert.deepEqual(addConfirmedBusinessSchema(schema, draft), schema);
  assert.deepEqual(addConfirmedBusinessSchema(schema), schema);
});
test('approved details populate schema without mutating the source', () => {
  const firm = addConfirmedBusinessSchema(schema, fixture)['@graph'][0];
  assert.deepEqual(firm.openingHoursSpecification[0], { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday'], opens: '09:00', closes: '13:30' });
  assert.equal(firm.hasOfferCatalog.itemListElement[0].itemOffered.name, fixture.practiceAreas.entries[0].name);
  assert.equal(schema['@graph'][0].openingHoursSpecification, undefined);
});
test('invalid approved hours and empty services stop publication', () => {
  for (const entry of [{ days: ['Invalid'], opens: '09:00', closes: '12:00' }, { days: ['Monday'], opens: '28:00', closes: '29:00' }, { days: ['Monday'], opens: '13:00', closes: '09:00' }]) {
    assert.throws(() => confirmedDetails({ ...businessProfile, hours: { approved: true, entries: [entry] } }));
  }
  assert.throws(() => confirmedDetails({ ...businessProfile, practiceAreas: { approved: true, entries: [{ name: '', description: '' }] } }));
});
test('approved components are present in initial HTML; defaults render nothing', async () => {
  const bundled = await build({ stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import {OfficeHours, PracticeAreas} from './src/BusinessDetails.jsx'; export const render = profile => renderToStaticMarkup(<><OfficeHours profile={profile}/><PracticeAreas profile={profile}/></>);`, resolveDir: process.cwd(), loader: 'jsx' }, bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic' });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', bundled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
  assert.equal(module.exports.render(businessProfile), '');
  const html = module.exports.render(fixture);
  assert.match(html, /Lunes, Miércoles/);
  assert.match(html, /09:00/);
  assert.match(html, /Área de prueba/);
});
test('current public build contains no draft business details', async () => {
  const html = await readFile('index.html', 'utf8');
  assert.doesNotMatch(html, /openingHoursSpecification|Área de prueba|HORARIO DE ATENCIÓN|POR CONFIRMAR/);
});
test('published HTML initializes exactly one GA4 tag without a consent gate', async () => {
  const js = await readFile('public/site.js', 'utf8');
  assert.doesNotMatch(js, /googletagmanager\.com|G-M7SWYXSLL0/);
  for (const file of ['src/document.html', 'index.html', 'dist/client/index.html']) {
    const html = await readFile(file, 'utf8');
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
    assert.equal((html.match(/src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-M7SWYXSLL0"/g) || []).length, 1);
    assert.doesNotMatch(html + js, /G-RYM6J65LP2/);
    const inline = [...head.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(([, code]) => code.includes("gtag('config'"))[1];
    const sandbox = { location: { origin: 'https://example.test', pathname: '/', search: '?private=value', hash: '#private' } };
    sandbox.window = sandbox;
    runInNewContext(inline, sandbox);
    const commands = sandbox.dataLayer.map(args => Array.from(args));
    assert.equal(commands.length, 2);
    assert.equal(commands[0][0], 'js');
    assert.equal(commands[1][0], 'config');
    assert.equal(commands[1][1], 'G-M7SWYXSLL0');
    assert.equal(commands[1][2].page_location, 'https://example.test/');
    assert.equal(commands[1][2].page_referrer, '');
    assert.equal(commands[1][2].allow_google_signals, false);
    assert.equal(commands[1][2].allow_ad_personalization_signals, false);
    assert.notEqual(commands[1][2].send_page_view, false);
  }
});
