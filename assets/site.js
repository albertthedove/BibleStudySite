/* VizBible shared nav + footer. Pages include: <div id="site-nav"></div> ... <div id="site-footer"></div> */
(function () {
  // Cloudflare Web Analytics: cookieless visit counts. Paste the token from the Cloudflare dashboard
  // between the quotes to switch it on, and update privacy.html at the same time (see the comment there).
  var CF_ANALYTICS_TOKEN = '';
  if (CF_ANALYTICS_TOKEN && location.hostname.indexOf('vizbible.com') > -1) {
    var cf = document.createElement('script');
    cf.defer = true; cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_ANALYTICS_TOKEN }));
    document.head.appendChild(cf);
  }

  var pages = [
    ['index.html', 'Home'],
    ['PaulineChurches.html', 'NT Timeline & Letters'],
    ['paulmap.html', "Paul's Journeys"],
    ['jesusmap.html', "Jesus' Journeys"],
    ['otmap.html', 'OT Journeys'],
    ['KingsJudaIsrael.html', 'Kings'],
    ['BibleChronos.html', 'Chronology'],
    ['BooksGraphs.html', 'Book Graphs']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');
  var nav = document.getElementById('site-nav');
  if (nav) {
    var items = pages.map(function (p) {
      return '<li><a href="' + p[0] + '"' + (p[0].toLowerCase() === here.toLowerCase() ? ' aria-current="page"' : '') + '>' + p[1] + '</a></li>';
    }).join('');
    nav.outerHTML = '<nav class="sitenav" aria-label="Main"><div class="bar"><a class="brand" href="index.html">Viz<span>Bible</span></a>' +
      '<ul id="navlist">' + items + '</ul>' +
      '<button class="searchbtn" type="button" aria-label="Search the site" title="Search (press /)"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>Search</span></button>' +
      '<button class="navtoggle" aria-expanded="false" aria-controls="navlist">Menu</button></div></nav>';
    var bar = document.querySelector('.sitenav'), btn = bar.querySelector('.navtoggle');
    btn.addEventListener('click', function () { var o = bar.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
  }
  var foot = document.getElementById('site-footer');
  if (foot) {
    var compact = foot.hasAttribute('data-compact');
    foot.outerHTML = '<footer class="sitefoot' + (compact ? ' compact' : '') + '">VizBible · Bible study, visualised · © ' + new Date().getFullYear() +
      ' <a href="about.html">About</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a>' +
      '<!-- DONATE_BUTTON: paste the donate link/button inside this span when ready --><span class="donate-slot" id="donate-slot"></span></footer>';
  }

  // ---- site search: data is loaded the first time the search box opens ----
  var IDX = null, dlg = null;
  function getJSON(u) { return fetch(u + (u.indexOf('?') > -1 ? '&' : '?') + 'v=02f56db6').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function strip(t) { return String(t || '').replace(/<[^>]+>/g, ''); }
  function buildIndex() {
    return Promise.all(['books', 'ot-books', 'kings', 'churches', 'paul-journeys', 'jesus-journeys', 'ot-journeys'].map(function (n) { return getJSON('data/' + n + '.json'); }))
      .then(function (d) {
        var out = [], add = function (type, title, sub, text, url) { out.push({ type: type, title: title, sub: sub, text: (title + ' ' + sub + ' ' + text).toLowerCase(), t: title.toLowerCase(), url: url }); };
        pages.forEach(function (p) { add('Page', p[1].replace('NT', 'New Testament').replace('OT', 'Old Testament'), '', p[0], p[0]); });
        var NT = d[0];
        if (NT) {
          NT.books.forEach(function (b) { add('Book', b.name, 'New Testament · AD ' + (b.start === b.end ? b.start : b.start + '–' + b.end) + ' · ' + b.author, b.theme, 'PaulineChurches.html?book=' + b.slug); });
          NT.events.concat(NT.journeys).forEach(function (e) { add('Event', e.name, 'AD ' + (e.start === e.end ? e.start : e.start + '–' + e.end), e.note || '', e.map || 'PaulineChurches.html'); });
        }
        if (d[1]) d[1].books.forEach(function (b) { add('Book', b.name, 'Old Testament · ' + b.date + ' · ' + b.author, b.theme, 'BibleChronos.html?q=' + encodeURIComponent(b.name)); });
        if (d[2]) d[2].kings.forEach(function (k) { add('King', k.name, k.kingdom + ' · ' + k.start + '–' + k.end + ' BC · ' + k.evalText, k.notes + ' ' + k.prophets + ' ' + k.refs, 'KingsJudaIsrael.html?q=' + encodeURIComponent(k.name.split(' /')[0].split(' (')[0])); });
        if (d[3]) d[3].forEach(function (c) { add('Church', c.city, c.modern + (c.letters && c.letters !== '—' ? ' · ' + c.letters : ''), c.province + ' ' + c.notes, 'paulmap.html?city=' + c.id); });
        [['paulmap.html', d[4], "Paul's journeys"], ['jesusmap.html', d[5], "Jesus' journeys"], ['otmap.html', d[6], 'Old Testament journeys']].forEach(function (m) {
          var J = m[1]; if (!J) return;
          Object.keys(J.J).forEach(function (k) { add('Journey', strip(J.J[k].name), m[2] + (J.J[k].years ? ' · ' + J.J[k].years : ''), strip(J.J[k].sum), m[0] + '?journey=' + k); });
          Object.keys(J.C).forEach(function (id) {
            var c = J.C[id], ev = Object.keys(c.e).map(function (k) { return c.e[k][0] + ' ' + c.e[k][1]; }).join(' ');
            add('Place', c.n, m[2] + ' · ' + (J.MODERN[id] || c.m), c.m + ' ' + ev, m[0] + '?city=' + id);
          });
        });
        return out;
      });
  }
  function score(r, terms) {
    for (var i = 0; i < terms.length; i++) if (r.text.indexOf(terms[i]) < 0) return 0;
    var q = terms.join(' ');
    return (r.t === q ? 50 : 0) + (r.t.indexOf(q) === 0 ? 20 : 0) + (r.t.indexOf(q) > -1 ? 10 : 0) + (r.type === 'Book' || r.type === 'King' ? 2 : 0) + 1;
  }
  function openSearch() {
    if (!dlg) {
      dlg = document.createElement('div');
      dlg.className = 'vbsearch'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', 'Search VizBible');
      dlg.innerHTML = '<div class="vbs-box"><div class="vbs-head"><input type="search" placeholder="Search books, places, kings, events…" aria-label="Search VizBible" autocomplete="off"><button type="button" class="vbs-close" aria-label="Close search">Esc</button></div><div class="vbs-res" aria-live="polite"><p class="vbs-hint">Try “Corinth”, “Hezekiah”, “Exodus” or “Romans”.</p></div></div>';
      document.body.appendChild(dlg);
      var input = dlg.querySelector('input'), res = dlg.querySelector('.vbs-res');
      var run = function () {
        var q = input.value.trim().toLowerCase();
        if (!q) { res.innerHTML = '<p class="vbs-hint">Try “Corinth”, “Hezekiah”, “Exodus” or “Romans”.</p>'; return; }
        if (!IDX) { res.innerHTML = '<p class="vbs-hint">Loading…</p>'; return; }
        var terms = q.split(/\s+/), hits = IDX.map(function (r) { return { r: r, s: score(r, terms) }; }).filter(function (x) { return x.s; })
          .sort(function (a, b) { return b.s - a.s; }).slice(0, 40);
        res.innerHTML = hits.length ? '<ul>' + hits.map(function (h) { return '<li><a href="' + h.r.url + '"><span class="vbs-type">' + h.r.type + '</span><b>' + esc(h.r.title) + '</b><small>' + esc(h.r.sub) + '</small></a></li>'; }).join('') + '</ul>'
          : '<p class="vbs-hint">No matches for “' + esc(input.value) + '”.</p>';
      };
      input.addEventListener('input', run);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = res.querySelector('a'); if (a) location.href = a.href; } });
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.vbs-close')) closeSearch(); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });
      buildIndex().then(function (i) { IDX = i; run(); });
    }
    dlg.hidden = false; document.documentElement.classList.add('vbs-open');
    var inp = dlg.querySelector('input'); inp.focus(); inp.select();
  }
  function closeSearch() { if (dlg) { dlg.hidden = true; document.documentElement.classList.remove('vbs-open'); var b = document.querySelector('.searchbtn'); if (b) b.focus(); } }
  var sb = document.querySelector('.searchbtn');
  if (sb) sb.addEventListener('click', openSearch);
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/input|textarea|select/i.test((e.target.tagName || '')) && !e.target.isContentEditable) { e.preventDefault(); openSearch(); }
  });
  window.VBSearch = { open: openSearch };
})();
