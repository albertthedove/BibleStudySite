// Opens every page in headless Chrome and checks:
//  - no JavaScript errors
//  - every New Testament book shows the same date on the chronology table, the NT timeline
//    and Book Graphs, in both the conservative and critical views
// Usage: serve the site on port 8099 (python3 -m http.server 8099), then: node tools/browser-check.js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8099/';
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const D = JSON.parse(fs.readFileSync('data/books.json'));
const fmt = o => o.start === o.end ? '' + o.start : o.start + '–' + o.end;
const norm = t => t.toLowerCase().replace(/[^a-z0-9]/g, '');
const find = n => D.books.find(x => norm(x.name) === norm(n));
const wait = ms => new Promise(r => setTimeout(r, ms));
const problems = [];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'], headless: 'new' });
  const open = async (url, width = 1280) => {
    const pg = await browser.newPage();
    await pg.setViewport({ width, height: 900 });
    pg.on('pageerror', e => problems.push(`${url}: script error: ${e.message}`));
    pg.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load resource/.test(m.text())) problems.push(`${url}: ${m.text()}`); });
    await pg.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    await wait(1200);
    return pg;
  };

  // every page, desktop and phone width
  const pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
  for (const p of pages) for (const w of [1280, 390]) await (await open(p, w)).close();
  for (const q of ['paulmap.html?journey=0', 'jesusmap.html?map=dark', 'PaulineChurches.html?dating=critical']) await (await open(q)).close();

  // chronology table
  const pg = await open('BibleChronos.html');
  await pg.click('#nt-tab'); await wait(500);
  for (const mode of ['cons', 'crit']) {
    if (mode === 'crit') { await pg.click('#ntView [data-d=crit]'); await wait(300); }
    const rows = await pg.$$eval('#ntBody tr:not(.d70)', t => t.map(r => [...r.cells].map(c => c.textContent.replace(/spans AD \d+/, '').trim())));
    if (rows.length !== 27) problems.push(`Chronology (${mode}): ${rows.length} rows, expected 27`);
    rows.forEach(c => {
      const b = find(c[2]); if (!b) return problems.push(`Chronology: unknown book ${c[2]}`);
      if (c[4] !== fmt(b) + ' CE') problems.push(`Chronology: ${b.name} conservative shows ${c[4]}, data says ${fmt(b)}`);
      if (c[5] !== (b.crit.label || fmt(b.crit)) + ' CE') problems.push(`Chronology: ${b.name} critical shows ${c[5]}`);
    });
  }

  // Book Graphs
  const bg = await open('BooksGraphs.html');
  const nt = await bg.evaluate(() => bibleBooks.filter(x => x.testament === 'nt').map(x => [x.name, x.years]));
  nt.forEach(([n, y]) => { const b = find(n); if (!b || y !== fmt(b) + ' CE') problems.push(`Book Graphs: ${n} shows ${y}`); });

  // NT timeline, both views
  for (const q of ['', '?dating=critical']) {
    const t = await open('PaulineChurches.html' + q);
    const bars = await t.$$eval('.tbar:not(.ev):not(.jn)', x => x.map(e => e.getAttribute('aria-label')));
    if (bars.length !== 27) problems.push(`Timeline${q}: ${bars.length} book bars, expected 27`);
    bars.forEach(l => {
      const m = l.match(/^(.*), AD (.*)$/); const b = find(m[1]); const o = q ? b.crit : b;
      if (m[2] !== (o.label || fmt(o))) problems.push(`Timeline${q}: ${m[1]} shows ${m[2]}`);
    });
    if (!(await t.$('.tl-vline'))) problems.push(`Timeline${q}: AD 70 marker missing`);
  }

  // site search finds things from every data file
  const sp = await open('index.html');
  await sp.click('.searchbtn'); await wait(1500);
  for (const [q, want] of [['romans', 'Book'], ['hezekiah', 'King'], ['sinai', 'Place'], ['corinth', 'Church']]) {
    await sp.$eval('.vbsearch input', (e, q) => { e.value = q; e.dispatchEvent(new Event('input')); }, q); await wait(150);
    const types = await sp.$$eval('.vbs-res .vbs-type', x => x.map(e => e.textContent));
    if (!types.includes(want)) problems.push(`Search for "${q}" found no ${want}`);
  }

  await browser.close();
  if (problems.length) { console.log('Problems found:\n - ' + problems.join('\n - ')); process.exit(1); }
  console.log(`All good: ${pages.length} pages loaded without errors; all 27 books match on all three pages in both views.`);
})();
