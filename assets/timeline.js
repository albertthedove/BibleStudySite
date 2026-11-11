/* NT timeline: every New Testament book on one chart, plus Paul's journeys and key events */
(async function () {
  const getJSON = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const [D, CH] = await Promise.all([getJSON('data/books.json'), getJSON('data/churches.json')]);
  const COL = { paul: 'var(--j2)', gospels: 'var(--j5)', general: 'var(--j6)', rev: 'var(--j7)', ev: 'var(--j0)' };
  const MIN = D.min;
  let MAX = D.max, SPAN = MAX - MIN;
  const pct = y => ((y - MIN) / SPAN * 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const yrs = (a, b) => 'AD ' + (a === b ? a : a + '–' + b);
  const lab = it => it.label ? 'AD ' + it.label : yrs(it.start, it.end);
  const state = { filter: 'all', layout: 'grouped', extras: true, sel: null,
    dating: new URLSearchParams(location.search).get('dating') === 'critical' ? 'crit' : 'cons' };
  // One data source (data/books.json). A book's dates depend on the chosen dating view.
  const view = b => state.dating === 'crit' ? Object.assign({}, b, b.crit) : b;
  const TEMPLE = D.events.find(e => e.marker);
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
    const label = lab(item);
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
    MAX = state.dating === 'crit' ? D.maxCrit : D.max; SPAN = MAX - MIN;
    let h = `<div class="tl-axis"><div></div><div class="ticks">${ticks()}</div></div>`;
    if (TEMPLE) h += `<div class="tl-vline" style="--f:${pct(TEMPLE.start) / 100}"></div><span class="tl-vtag" tabindex="0" style="--f:${pct(TEMPLE.start) / 100}" title="No New Testament book explicitly describes the temple’s destruction as already past.">AD ${TEMPLE.start}: temple destroyed</span>`;
    if (state.extras) {
      h += `<div class="tl-lane" style="--c:var(--j0)"><span>Paul’s journeys and key events</span></div>`;
      D.journeys.forEach(j => { h += row(j.name, bar(j, 'journey', COL.ev, '. Opens the map'), false); });
      D.events.slice().sort((a, b) => a.start - b.start || a.end - b.end).forEach(e => { h += row(e.name, bar(e, 'event', COL.ev), false); });
    }
    const books = D.books.map(view);
    const ghost = b => {
      if (state.dating !== 'crit' || !b.critDisputed) return '';
      const o = D.books.find(x => x.slug === b.slug), w = Math.max(o.end - o.start, 1);
      return `<span class="ghost" title="Conservative dating: ${lab(o)}" style="left:${pct(o.start)}%;width:${w / SPAN * 100}%"></span>`;
    };
    const order = (a, b) => a.start - b.start || a.end - b.end || a.canon - b.canon;
    if (state.layout === 'grouped') {
      Object.entries(D.groups).forEach(([g, label]) => {
        const list = books.filter(b => b.group === g).sort(order);
        if (!list.length) return;
        h += `<div class="tl-lane" style="--c:${COL[g]}"><span>${esc(label)}</span></div>`;
        list.forEach(b => { h += row(b.name, ghost(b) + bar(b, 'book', COL[b.group]), state.sel === b.slug); });
      });
    } else {
      h += `<div class="tl-lane" style="--c:var(--ink)"><span>All 27 books, in order of writing</span></div>`;
      books.sort(order).forEach(b => { h += row(b.name, ghost(b) + bar(b, 'book', COL[b.group]), state.sel === b.slug, COL[b.group]); });
    }
    root.innerHTML = `<div class="tl">${h}</div>`;
    renderSummary();
  }

  // Words that follow the data, so the text can never disagree with the chart
  function renderSummary() {
    const bs = D.books.map(view), cut = TEMPLE.start;
    const before = bs.filter(b => b.end <= cut), after = bs.filter(b => b.start >= cut), span = bs.filter(b => b.start < cut && b.end > cut);
    const names = l => l.map(b => b.name).join(', ').replace(/, ([^,]*)$/, ' and $1');
    const g = n => view(D.books.find(b => b.slug === n)), r = n => lab(g(n));
    const crit = state.dating === 'crit';
    document.getElementById('summary').innerHTML = crit
      ? `<strong>Critical dating (mainstream academic view).</strong> Only Paul’s seven undisputed letters and Mark sit before AD ${cut}. Most other books are placed after it: ${after.length} books fall after AD ${cut}, ${span.length} spans it (${names(span) || 'none'}), and ${before.length} end before it. Paul’s seven undisputed letters are dated the same in both views. The dashed outlines show the conservative dates for comparison.`
      : `<strong>Conservative dating (this site’s default).</strong> ${before.length} of 27 books are dated before the temple’s destruction in AD ${cut}. Only ${names(after)} come after${span.length ? ', and ' + names(span) + ' spans it' : ''}. Galatians to Romans (${r('galatians')} to ${r('romans')}) all precede the Gospels. Luke (${r('luke')}) was written before Acts (${r('acts')}), as Acts 1:1 implies. Mark is dated ${r('mark')} and Matthew ${r('matthew')}, and John ${r('john')}. James (${r('james')}) may be earlier than any of Paul’s letters. Dates are approximate.`;
    document.getElementById('method').innerHTML = `<strong>How to read these dates.</strong> <em>Conservative</em> dates accept the traditional authors and place most books before AD ${cut}. <em>Critical</em> dates follow the mainstream academic consensus, which places many books later and treats some letters as written after the apostle’s lifetime. Both are shown so you can compare; neither is certain, and Paul’s seven undisputed letters are the same in both.`;
  }

  function showDetail(slug, scroll) {
    const b = D.books.find(x => x.slug === slug); if (!b) return;
    state.sel = slug; render();
    const cityLinks = (b.cities || []).map(c => `<a href="paulmap.html?city=${c}">${esc(c.charAt(0).toUpperCase() + c.slice(1))}</a>`).join(', ');
    detail.hidden = false; detail.style.setProperty('--c', COL[b.group]);
    detail.innerHTML = `<h2>${esc(b.name)}</h2><p class="meta">${esc(D.groups[b.group])} · book ${b.canon} of 66 · ${b.chapters} chapter${b.chapters > 1 ? 's' : ''}</p>
      <dl><dt>Theme</dt><dd>${esc(b.theme)}</dd><dt>Author</dt><dd>${esc(b.author)}</dd><dt>Written (conservative)</dt><dd>${lab(b)} (approximate)</dd><dt>Written (critical)</dt><dd>${lab(b.crit)}${b.critDisputed ? '' : ' (same: undisputed letter)'}</dd>
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
  const dat = document.getElementById('dating');
  const syncDating = () => dat.querySelectorAll('[data-d]').forEach(x => x.setAttribute('aria-pressed', x.dataset.d === state.dating));
  dat.addEventListener('click', e => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    state.dating = b.dataset.d; syncDating();
    const u = new URL(location.href); state.dating === 'crit' ? u.searchParams.set('dating', 'critical') : u.searchParams.delete('dating');
    history.replaceState(null, '', u); render();
  });
  syncDating();

  // key events and journeys, each with a visible date
  document.getElementById('evbody').innerHTML =
    D.events.concat(D.journeys).sort((a, b) => a.start - b.start || a.end - b.end).map(e =>
      `<tr${e.marker ? ' class="mark"' : ''}><td>${yrs(e.start, e.end)}</td><td>${e.map ? `<a href="${e.map}">${esc(e.name)}</a>` : esc(e.name)}</td><td>${esc(e.note || (e.map ? 'Opens the map.' : ''))}</td></tr>`).join('');
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
