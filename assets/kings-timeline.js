/* Kings page: timeline and table, both built from data/kings.json so they can never disagree. */
(async function () {
  const getJSON = u => fetch(u + (u.includes('?') ? '&' : '?') + 'v=02f56db6').then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const D = await getJSON('data/kings.json');
  const rows = D.kings;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const COL = { faithful: '#2e8b57', partial: 'var(--j5)', evil: 'var(--j4)' };
  const LBL = { faithful: 'Faithful', partial: 'Partially faithful', evil: 'Evil' };

  // ---- timeline ----
  const MAXBC = Math.ceil(Math.max(...rows.map(r => r.start)) / 50) * 50 + 10;   // oldest
  const MINBC = Math.floor(Math.min(...rows.map(r => r.end)) / 50) * 50 - 10;    // newest
  const SPAN = MAXBC - MINBC;
  const pct = y => (MAXBC - y) / SPAN * 100;
  const LANES = [['United', 'United monarchy'], ['Judah', 'Judah (south)'], ['Israel', 'Israel (north)']];
  let ticks = '';
  for (let y = Math.floor(MAXBC / 50) * 50; y >= MINBC; y -= 50) if (y <= MAXBC) ticks += `<span class="tick" style="left:${pct(y)}%">${y} BC</span>`;
  let h = `<div class="tl-axis"><div></div><div class="ticks">${ticks}</div></div>`;
  LANES.forEach(([key, label]) => {
    const list = rows.filter(r => r.kingdom === key).sort((a, b) => b.start - a.start);
    if (!list.length) return;
    h += `<div class="tl-lane" style="--c:var(--ink)"><span>${label}</span></div>`;
    list.forEach(r => {
      const left = pct(r.start), w = Math.max(r.start - r.end, 2) / SPAN * 100;
      const text = `${r.start}–${r.end} BC`;
      const right = left + w > 82;
      const dt = right ? `right:${100 - left}%;padding:0 8px 0 0` : `left:${left + w}%`;
      h += `<div class="tl-row"><div class="nm" title="${esc(r.name)}">${esc(r.name)}</div><div class="track" style="--spans:${SPAN / 25}">
        <span class="tbar" role="img" style="left:${left}%;width:${w}%;--c:${COL[r.evaluation]};cursor:default" aria-label="${esc(r.name)}, ${text}, ${LBL[r.evaluation]}" title="${esc(r.name)}: ${text} (${LBL[r.evaluation]})"></span>
        <span class="dt" style="${dt}">${text}</span></div></div>`;
    });
  });
  const root = document.getElementById('kingsTimeline');
  root.innerHTML = `<div class="tl" style="--labelw:${innerWidth < 600 ? 120 : 190}px">${h}</div>`;

  // ---- table ----
  const f = { k: '', e: '' };
  const count = document.getElementById('kcount');
  const t = VBTable(document.getElementById('kingsTable'), {
    rows, sortKey: 'start', sortDir: -1,
    filter: r => (!f.k || r.kingdom === f.k) && (!f.e || r.evaluation === f.e),
    onDraw: list => { count.textContent = `Showing ${list.length} of ${rows.length} kings`; },
    columns: [
      { key: 'kingdom', label: 'Kingdom', render: r => `<span class="kgd ${r.kingdom}">${r.kingdom}</span>` },
      { key: 'start', label: 'Reign (BC)', render: r => `${r.start}–${r.end}`, cls: () => 'num' },
      { key: 'name', label: 'King' },
      { key: 'father', label: 'Father / predecessor' },
      { key: 'length', label: 'Years', sort: r => parseFloat(r.length) || 0, cls: () => 'num' },
      { key: 'evaluation', label: 'Evaluation', render: r => `<span class="ev ${r.evaluation}">${LBL[r.evaluation]}</span>` },
      { key: 'notes', label: 'Key notes and acts' },
      { key: 'prophets', label: 'Prophets of the time' },
      { key: 'refs', label: 'Where to read' }
    ]
  });
  const chips = (id, key) => document.getElementById(id).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    f[key] = b.dataset[key];
    document.querySelectorAll('#' + id + ' button').forEach(x => x.setAttribute('aria-pressed', x === b));
    t.refresh();
  });
  chips('kfilter', 'k'); chips('efilter', 'e');
  const s = document.getElementById('globalSearch');
  s.addEventListener('input', () => t.setSearch(s.value));
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0) { s.value = q0; t.setSearch(q0); document.getElementById('kingsTable').scrollIntoView(); }
  document.getElementById('printBtn').addEventListener('click', () => window.print());
})();
