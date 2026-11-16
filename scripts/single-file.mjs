// Turns dist/ (built with SINGLE=1) into one self-contained dist/index.single.html.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const read = (ext) => readdirSync('dist/assets').filter((f) => f.endsWith(ext)).map((f) => readFileSync('dist/assets/' + f, 'utf8')).join('\n');
let html = readFileSync('dist/index.html', 'utf8');
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '').replace(/<script type="module"[^>]*><\/script>/g, '');
html = html.replace('</head>', () => `<style>${read('.css')}</style></head>`);
html = html.replace('</body>', () => `<script type="module">${read('.js').replace(/<\/script/g, '<\\/script')}</script></body>`);
writeFileSync('dist/index.single.html', html);
console.log('dist/index.single.html', html.length, 'bytes');
