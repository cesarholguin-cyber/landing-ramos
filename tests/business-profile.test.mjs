import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { businessProfile, confirmedDetails, addConfirmedBusinessSchema } from '../src/business-profile.mjs';
import { startAnalytics } from '../src/analytics.mjs';

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
test('current public build contains no draft details or analytics requests', async () => {
  const html = await readFile('index.html', 'utf8');
  const js = await readFile('public/site.js', 'utf8');
  assert.doesNotMatch(html, /openingHoursSpecification|Área de prueba|HORARIO DE ATENCIÓN|POR CONFIRMAR/);
  assert.doesNotMatch(html + js, /googletagmanager\.com|google-analytics\.com/);
});
test('analytics adapter requires activation, consent and valid ID; initializes only once', () => {
  const scripts = [];
  const doc = { getElementById: id => scripts.find(s => s.id === id), createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  const win = { location: { origin: 'https://example.test', pathname: '/', search: '?private=value', hash: '#private' } };
  assert.equal(startAnalytics({ win, doc, consent: true }), false);
  const config = { enabled: true, measurementId: 'G-TEST123' };
  assert.equal(startAnalytics({ config, win, doc }), false);
  assert.equal(scripts.length, 0);
  assert.throws(() => startAnalytics({ config: { enabled: true }, consent: true, win, doc }));
  assert.equal(startAnalytics({ config, consent: true, win, doc }), true);
  assert.equal(startAnalytics({ config, consent: true, win, doc }), true);
  assert.equal(scripts.length, 1);
  const settings = Array.from(win.dataLayer[1])[2];
  assert.equal(settings.page_location, 'https://example.test/');
  assert.equal(settings.page_referrer, '');
});
