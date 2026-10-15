import { build } from 'esbuild';
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { addConfirmedBusinessSchema } from '../src/business-profile.mjs';
import { resolveSiteOrigin } from './site-origin.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const hosting = JSON.parse(await readFile('.openai/hosting.json', 'utf8'));
const origin = resolveSiteOrigin(process.env.SITE_URL, hosting.site_url);
// Bundle the renderer and template together so they share a React hook dispatcher.
const ssr = await build({stdin:{contents:'import React from "react"; import {renderToString} from "react-dom/server"; import {App} from "./src/App.jsx"; export const html=renderToString(React.createElement(App));',resolveDir:root,loader:'jsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',minify:true});
const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const module = {exports:{}};
new Function('require','module','exports',ssr.outputFiles[0].text)(require,module,module.exports);
const markup = module.exports.html;
const browser = await build({entryPoints:['src/main.jsx'],bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',minify:true,define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'inline-css-separately',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'js'}));}}]});
const css = (await Promise.all(['styles','identity','cinema','video','credentials','locations'].map(name=>readFile(`src/${name}.css`,'utf8')))).join('\n').replaceAll("url('assets/", "url('./public/assets/").replace(/@font-face\{[^}]*jost-semibold[^}]*\}/g,'');
await writeFile('public/site.js', browser.outputFiles[0].text);
let html = (await readFile('src/document.html','utf8')).replace('<html lang="en">','<html lang="es-MX">').replace(/\s*<noscript>[\s\S]*?<\/noscript>/,'').replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`).replace('<script type="module" src="/src/main.jsx"></script>', '<script defer src="./public/site.js"></script>').replace('</head>',() => `<style>${css}</style>\n</head>`).replaceAll('content="/assets/', 'content="./public/assets/');
// Visible content and search metadata use the same approved business details.
html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
  (_, start, json, end) => start + JSON.stringify(addConfirmedBusinessSchema(JSON.parse(json))).replaceAll('<', '\\u003c') + end);
if (origin) {
  html = html.replace('</head>', `<link rel="canonical" href="${origin}/" />\n<meta property="og:url" content="${origin}/" />\n</head>`).replaceAll('content="./public/assets/',`content="${origin}/public/assets/`).replaceAll('"@id":"#',`"@id":"${origin}/#`);
}
// Only replace this generated output directory, never source or user assets.
await rm(path.join(root, 'dist/client'), {recursive:true, force:true});
await mkdir('dist/client', {recursive:true});
await writeFile('index.html',html);
await writeFile('dist/client/index.html',html);
await cp('public','dist/client/public',{recursive:true});
let robots = 'User-agent: *\nAllow: /\n';
if (origin) robots += `\nSitemap: ${origin}/sitemap.xml\n`;
await writeFile('public/robots.txt', robots);
await writeFile('dist/client/robots.txt', robots);
await cp('public/llms.txt','dist/client/llms.txt');
if(origin) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`;
  await writeFile('public/sitemap.xml',sitemap);
  await writeFile('dist/client/sitemap.xml',sitemap);
}
console.log('Generated complete HTML with inline styles and progressive interactivity for file and web preview.');
