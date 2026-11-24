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
      '<button class="navtoggle" aria-expanded="false" aria-controls="navlist">Menu</button><ul id="navlist">' + items + '</ul></div></nav>';
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
})();
