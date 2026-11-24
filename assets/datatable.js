/* Small sortable, searchable table used by the Chronology and Kings pages (replaces jQuery DataTables).
   VBTable(tableEl, { columns: [{ key, label, sort?: row => value, render?: row => html, cls?: row => class }],
                      rows, sortKey, sortDir: 1|-1, rowClass?: row => class, filter?: row => bool })
   Returns { setSearch(text), refresh(), rows } */
window.VBTable = function (table, opt) {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const st = { key: opt.sortKey, dir: opt.sortDir || 1, q: '' };
  const col = k => opt.columns.find(c => c.key === k);
  const val = (c, r) => c.sort ? c.sort(r) : r[c.key];
  const text = r => opt.columns.map(c => r[c.key]).join(' ').toLowerCase();

  table.innerHTML = '<thead><tr>' + opt.columns.map(c =>
    `<th scope="col" data-k="${c.key}" tabindex="0">${esc(c.label)}</th>`).join('') + '</tr></thead><tbody></tbody>';
  const body = table.tBodies[0];

  function draw() {
    const c = col(st.key);
    const terms = st.q.split(/\s+/).filter(Boolean);
    let list = opt.rows.filter(r => (!opt.filter || opt.filter(r)) && terms.every(t => text(r).includes(t)));
    if (c) list = list.slice().sort((a, b) => {
      const x = val(c, a), y = val(c, b);
      const n = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
      return n * st.dir;
    });
    body.innerHTML = list.length ? list.map(r => `<tr class="${opt.rowClass ? opt.rowClass(r) : ''}">` + opt.columns.map(c =>
      `<td class="${c.cls ? c.cls(r) : ''}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('') + '</tr>').join('')
      : `<tr><td colspan="${opt.columns.length}">No matches.</td></tr>`;
    table.querySelectorAll('th').forEach(th => th.setAttribute('aria-sort', th.dataset.k === st.key ? (st.dir > 0 ? 'ascending' : 'descending') : 'none'));
    if (opt.onDraw) opt.onDraw(list);
  }
  const sortBy = k => { if (st.key === k) st.dir = -st.dir; else { st.key = k; st.dir = 1; } draw(); };
  table.tHead.addEventListener('click', e => { const th = e.target.closest('th'); if (th) sortBy(th.dataset.k); });
  table.tHead.addEventListener('keydown', e => { const th = e.target.closest('th'); if (th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sortBy(th.dataset.k); } });
  draw();
  return { setSearch(q) { st.q = (q || '').toLowerCase(); draw(); }, refresh: draw, rows: opt.rows };
};
