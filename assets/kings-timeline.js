/* Kings timeline: built from the table on the page, so the table and chart can never disagree. */
(function () {
  const rows = [...document.querySelectorAll('#kingsTable tbody tr')].map(tr => {
    const td = [...tr.children].map(c => c.textContent.trim());
    const ev = tr.children[6].className.includes('faithful') && !tr.children[6].className.includes('partial') ? 'faithful'
      : tr.children[6].className.includes('partial') ? 'partial' : 'evil';
    return { kingdom: td[0], name: td[1], start: +td[3], end: +td[4], length: td[5], ev };
  }).filter(r => r.start && r.end);
  if (!rows.length) return;
  const MAXBC = Math.ceil(Math.max(...rows.map(r => r.start)) / 50) * 50 + 10;   // oldest
  const MINBC = Math.floor(Math.min(...rows.map(r => r.end)) / 50) * 50 - 10;    // newest
  const SPAN = MAXBC - MINBC;
  const pct = y => (MAXBC - y) / SPAN * 100;
  const COL = { faithful: '#2e8b57', partial: 'var(--j5)', evil: 'var(--j4)' };
  const LBL = { faithful: 'Faithful', partial: 'Partially faithful', evil: 'Evil' };
  const LANES = [['United', 'United monarchy'], ['Judah', 'Judah (south)'], ['Israel', 'Israel (north)']];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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
        <span class="tbar" role="img" style="left:${left}%;width:${w}%;--c:${COL[r.ev]};cursor:default" aria-label="${esc(r.name)}, ${text}, ${LBL[r.ev]}" title="${esc(r.name)}: ${text} (${LBL[r.ev]})"></span>
        <span class="dt" style="${dt}">${text}</span></div></div>`;
    });
  });
  const root = document.getElementById('kingsTimeline');
  root.innerHTML = `<div class="tl" style="--labelw:190px">${h}</div>`;
  if (root.scrollWidth > root.clientWidth) root.scrollLeft = 0;
})();
