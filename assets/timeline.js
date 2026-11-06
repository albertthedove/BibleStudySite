/* NT timeline: every New Testament book on one chart, plus Paul's journeys and key events */
(async function () {
  const getJSON = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const [D, CH] = await Promise.all([getJSON('data/books.json'), getJSON('data/churches.json')]);
  const COL = { paul: 'var(--j2)', gospels: 'var(--j5)', general: 'var(--j6)', rev: 'var(--j7)', ev: 'var(--j0)' };
  const MIN = D.min, MAX = D.max, SPAN = MAX - MIN;
  const pct = y => ((y - MIN) / SPAN * 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const yrs = (a, b) => 'AD ' + (a === b ? a : a + '–' + b);
  const state = { filter: 'all', layout: 'grouped', extras: true, sel: null };
  const root = document.getElementById('timeline');
  const detail = document.getElementById('detail');

  function ticks() {
    let h = '';
    for (let y = Math.ceil(MIN / 10) * 10; y <= MAX; y += 10) h += `<span class="tick" style="left:${pct(y)}%">${y}</span>`;
    return h;
  }
  function bar(item, kind, color, extra) {
    const w = Math.max(item.end - item.start, 1);
    const left = pct(item.start), width = w / SPAN * 100;
    const right = left + width > 82;
    const label = yrs(item.start, item.end);
    const dim = state.filter !== 'all' && kind === 'book' && item.group !== state.filter;
    const cls = ['tbar', kind === 'event' ? 'ev' : '', kind === 'journey' ? 'jn' : '', state.sel === item.slug ? 'sel' : '', dim ? 'dim' : ''].filter(Boolean).join(' ');
    const attrs = kind === 'book' ? `data-slug="${item.slug}"` : (kind === 'journey' ? `data-map="${item.map}"` : `data-ev="${esc(item.name)}"`);
    const dt = right ? `right:${100 - left}%;padding:0 8px 0 0` : `left:${left + width}%`;
    return `<button class="${cls}" style="left:${left}%;width:${width}%;--c:${color}" ${attrs} aria-label="${esc(item.name)}, ${label}${extra || ''}"></button><span class="dt" style="${dt}">${label}</span>`;
  }
  function row(name, inner, selected, dot) {
    return `<div class="tl-row${selected ? ' sel' : ''}"><div class="nm" title="${esc(name)}">${dot ? `<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${dot};margin-right:7px"></i>` : ''}${esc(name)}</div><div class="track" style="--spans:${SPAN / 5}">${inner}</div></div>`;
  }
  function render() {
    let h = `<div class="tl-axis"><div></div><div class="ticks">${ticks()}</div></div>`;
    if (state.extras) {
      h += `<div class="tl-lane" style="--c:var(--j0)"><span>Paul’s journeys and key events</span></div>`;
      D.journeys.forEach(j => { h += row(j.name, bar(j, 'journey', COL.ev, '. Opens the map'), false); });
      D.events.forEach(e => { h += row(e.name, bar(e, 'event', COL.ev), false); });
    }
    const books = D.books.slice();
    const order = (a, b) => a.start - b.start || a.end - b.end || a.canon - b.canon;
    if (state.layout === 'grouped') {
      Object.entries(D.groups).forEach(([g, label]) => {
        const list = books.filter(b => b.group === g).sort(order);
        if (!list.length) return;
        h += `<div class="tl-lane" style="--c:${COL[g]}"><span>${esc(label)}</span></div>`;
        list.forEach(b => { h += row(b.name, bar(b, 'book', COL[b.group]), state.sel === b.slug); });
      });
    } else {
      h += `<div class="tl-lane" style="--c:var(--ink)"><span>All 27 books, in order of writing</span></div>`;
      books.sort(order).forEach(b => { h += row(b.name, bar(b, 'book', COL[b.group]), state.sel === b.slug, COL[b.group]); });
    }
    root.innerHTML = `<div class="tl">${h}</div>`;
  }

  function showDetail(slug, scroll) {
    const b = D.books.find(x => x.slug === slug); if (!b) return;
    state.sel = slug; render();
    const cityLinks = (b.cities || []).map(c => `<a href="paulmap.html?city=${c}">${esc(c.charAt(0).toUpperCase() + c.slice(1))}</a>`).join(', ');
    detail.hidden = false; detail.style.setProperty('--c', COL[b.group]);
    detail.innerHTML = `<h2>${esc(b.name)}</h2><p class="meta">${esc(D.groups[b.group])} · book ${b.canon} of 66 · ${b.chapters} chapter${b.chapters > 1 ? 's' : ''}</p>
      <dl><dt>Theme</dt><dd>${esc(b.theme)}</dd><dt>Author</dt><dd>${esc(b.author)}</dd><dt>Written</dt><dd>${yrs(b.start, b.end)} (approximate)</dd>
      ${b.fromPlace ? `<dt>Written from</dt><dd>${esc(b.fromPlace)}</dd>` : ''}${b.toPlace ? `<dt>Written to</dt><dd>${esc(b.toPlace)}</dd>` : ''}
      ${cityLinks ? `<dt>On the map</dt><dd>${cityLinks}</dd>` : ''}</dl>
      <div class="acts"><a class="vbtn" href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(b.name + ' 1')}" target="_blank" rel="noopener">Read ${esc(b.name)}</a>
      <a class="vbtn ghost" href="paulmap.html">Paul’s journeys map</a></div>`;
    history.replaceState(null, '', location.pathname + '?book=' + slug);
    if (scroll) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  root.addEventListener('click', e => {
    const t = e.target.closest('.tbar'); if (!t) return;
    if (t.dataset.slug) showDetail(t.dataset.slug, true);
    else if (t.dataset.map) location.href = t.dataset.map;
  });
  // filters
  const fc = document.getElementById('filters');
  const filters = [['all', 'All books', 'var(--ink)'], ...Object.entries(D.groups).map(([k, v]) => [k, v, COL[k]])];
  fc.innerHTML = filters.map(([k, v, c]) => `<button class="fchip" data-f="${k}" style="--c:${c}" aria-pressed="${k === 'all'}">${k === 'all' ? '' : '<i></i>'}${esc(v)}</button>`).join('');
  fc.addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (!b) return; state.filter = b.dataset.f;
    fc.querySelectorAll('.fchip').forEach(x => x.setAttribute('aria-pressed', x === b)); render();
  });
  const lay = document.getElementById('layout');
  lay.addEventListener('click', e => {
    const b = e.target.closest('[data-l]'); if (!b) return;
    if (b.dataset.l === 'extras') { state.extras = !state.extras; b.setAttribute('aria-pressed', state.extras); }
    else { state.layout = b.dataset.l; lay.querySelectorAll('[data-l]:not([data-l=extras])').forEach(x => x.setAttribute('aria-pressed', x === b)); }
    render();
  });
  render();
  if (root.scrollWidth > root.clientWidth) root.scrollLeft = (root.scrollWidth - 130) * pct(42) / 100;
  const q = new URLSearchParams(location.search).get('book');
  if (q) showDetail(q, true);

  // ---- churches table ----
  const tb = document.querySelector('#churches tbody');
  let rows = CH.map(c => {
    const gap = c.foundedYear && c.letterYear && c.letterYear >= c.foundedYear ? c.letterYear - c.foundedYear : null;
    const before = c.letterYear < 60;
    return { c, gap, before };
  });
  let sortKey = 'letterYear', sortDir = 1, term = '';
  const get = (r, k) => k === 'gap' ? (r.gap == null ? 999 : r.gap) : (k === 'before' ? +!r.before : r.c[k]);
  function drawTable() {
    const t = term.toLowerCase();
    const list = rows.filter(r => !t || JSON.stringify(r.c).toLowerCase().includes(t)).sort((a, b) => {
      const x = get(a, sortKey), y = get(b, sortKey); return (x > y ? 1 : x < y ? -1 : 0) * sortDir; });
    tb.innerHTML = list.map(r => `<tr><td><a href="paulmap.html?city=${r.c.id}"><strong>${esc(r.c.city)}</strong></a></td><td>${esc(r.c.province)}</td><td>${esc(r.c.modern)}</td>
      <td>${esc(r.c.founded)}</td><td>${esc(r.c.letters)}</td><td>AD ${r.c.letterYear}</td><td>${r.gap == null ? '—' : r.gap + ' yr' + (r.gap === 1 ? '' : 's')}</td>
      <td><span class="pill ${r.before ? 'ok' : 'warn'}">${r.before ? 'Before Mark' : 'Overlaps Mark'}</span></td><td>${esc(r.c.from)}</td><td>${esc(r.c.prison)}</td><td>${esc(r.c.notes)}</td></tr>`).join('') || '<tr><td colspan="11">No matches.</td></tr>';
  }
  document.querySelectorAll('#churches th[data-k]').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.k; sortDir = sortKey === k ? -sortDir : 1; sortKey = k;
    document.querySelectorAll('#churches th').forEach(x => x.removeAttribute('aria-sort'));
    th.setAttribute('aria-sort', sortDir > 0 ? 'ascending' : 'descending'); drawTable();
  }));
  document.getElementById('search').addEventListener('input', e => { term = e.target.value; drawTable(); });
  drawTable();
})();
