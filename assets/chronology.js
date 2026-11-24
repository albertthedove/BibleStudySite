/* Chronology page: Old Testament table from data/ot-books.json, New Testament table from data/books.json
   (the same source as the NT timeline and Book Graphs). */
(async function () {
  const getJSON = u => fetch(u + (u.includes('?') ? '&' : '?') + 'v=02f56db6').then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const [OT, NT] = await Promise.all([getJSON('data/ot-books.json'), getJSON('data/books.json')]);
  const search = document.getElementById('globalSearch');

  // Tabs (also via #nt in the address)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const show = id => tabs.forEach(t => {
    const on = t.getAttribute('aria-controls') === id;
    t.setAttribute('aria-selected', on); t.setAttribute('aria-pressed', on);
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach(t => t.addEventListener('click', () => { show(t.getAttribute('aria-controls')); history.replaceState(null, '', '#' + t.getAttribute('aria-controls')); }));
  if (location.hash === '#nt') show('nt');

  // Old Testament
  const ot = VBTable(document.getElementById('otTable'), {
    rows: OT.books, sortKey: 'order', sortDir: 1,
    columns: [
      { key: 'order', label: 'Order', cls: () => 'num' },
      { key: 'canon', label: 'Canon', cls: () => 'num' },
      { key: 'name', label: 'Book' },
      { key: 'author', label: 'Author(s)' },
      { key: 'date', label: 'Approx. date', sort: r => -r.start },
      { key: 'chapters', label: 'Chapters', cls: () => 'num' },
      { key: 'theme', label: 'Key theme / note' }
    ]
  });

  // New Testament (keeps the AD 70 divider, so it is drawn by hand)
  let mode = 'cons';
  const CUT = NT.events.find(e => e.marker).start;
  const lab = o => (o.label || (o.start === o.end ? o.start : o.start + '–' + o.end)) + ' CE';
  function drawNT() {
    const term = search.value.trim().toLowerCase(), crit = mode === 'crit';
    const rows = NT.books.map(b => Object.assign({ b }, crit ? b.crit : { start: b.start, end: b.end }))
      .sort((x, y) => x.start - y.start || x.end - y.end || x.b.canon - y.b.canon);
    let html = '', n = 0, done = false;
    rows.forEach(r => {
      const b = r.b, text = [b.name, b.author, lab(b), lab(b.crit), b.theme].join(' ').toLowerCase();
      if (!done && r.start >= CUT) {
        done = true;
        if (!term) html += `<tr class="d70"><td colspan="8">AD ${CUT}: Jerusalem temple destroyed. Books above were written before it (or begin before it); books below after. No New Testament book explicitly describes the destruction as past.</td></tr>`;
      }
      n++;
      if (term && !term.split(/\s+/).every(t => text.includes(t))) return;
      const spans = r.start < CUT && r.end > CUT ? '<span class="sp">spans AD ' + CUT + '</span>' : '';
      html += `<tr><td class="num">${n}</td><td class="num">${b.canon}</td><td>${esc(b.name)}${spans}</td><td>${esc(b.author)}</td>
        <td class="${crit ? '' : 'on'}">${lab(b)}</td><td class="${crit ? 'on' : ''}">${lab(b.crit)}</td><td class="num">${b.chapters}</td><td>${esc(b.theme)}</td></tr>`;
    });
    document.getElementById('ntBody').innerHTML = html || '<tr><td colspan="8">No matches.</td></tr>';
  }
  const before = NT.books.filter(b => b.end <= CUT).length;
  document.getElementById('ntMethod').innerHTML = `<strong>Conservative</strong> dates (the default) accept traditional authorship and place ${before} of 27 books before AD ${CUT}. <strong>Critical</strong> dates follow the mainstream academic consensus, which dates many books later. Paul’s seven undisputed letters are the same in both columns. <a href="about.html#dating">Sources and method</a>.`;
  document.getElementById('ntView').addEventListener('click', e => {
    const t = e.target.closest('[data-d]'); if (!t) return;
    mode = t.dataset.d;
    document.querySelectorAll('#ntView [data-d]').forEach(x => x.setAttribute('aria-pressed', x === t));
    drawNT();
  });
  drawNT();

  search.addEventListener('input', () => { ot.setSearch(search.value); drawNT(); });
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0) { search.value = q0; ot.setSearch(q0); drawNT(); if (!OT.books.some(b => b.name.toLowerCase().includes(q0.toLowerCase()))) show('nt'); }
  document.getElementById('printBtn').addEventListener('click', () => window.print());
})();
