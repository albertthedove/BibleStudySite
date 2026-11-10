/* VizBible journey map engine.
   Shared by paulmap.html and jesusmap.html. Data comes from a JSON file (window.JOURNEY_DATA_URL).
   Offline-safe: draws a built-in Natural Earth land outline first; Esri terrain tiles fade in on top when they load. */
(async function () {
  const base = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/assets\/[^/]*$/, '') : '';
  const getJSON = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
  const D = await getJSON(window.JOURNEY_DATA_URL);
  const [LAND, COUNTRY_LINES, ADMIN_LINES] = await Promise.all([
    getJSON('data/land.json'), getJSON('data/country-lines.json'), getJSON('data/admin-lines.json')]);
  const { J, C, MODERN, R, LABELS, ENDS, ART, WIKI, PLACES } = D;
  const PROVINCE_LINES = D.provinceLines || [];
  const ordered = Object.keys(J);                       // every phase / journey key
  const RK = Object.keys(R).map(Number);                 // keys that have drawn routes
  const LINKS = D.links || {};
  let names = 'ancient';
  const nm = id => names === 'ancient' ? C[id].n : MODERN[id];
  const P = k => C[k].ll;

  const osDark = matchMedia('(prefers-color-scheme: dark)').matches;
  let noHalo = false;   // dark base map: no white halo under routes
  const mapEl = document.getElementById('map');
  const map = L.map('map', { zoomControl: true, worldCopyJump: false, minZoom: 4, maxZoom: 14 });
  // Built-in vector map: always works, even offline
  // Own pane BELOW the tile pane (z 200), so the opaque land fill never covers real map tiles
  map.createPane('fallback').style.zIndex = 150;
  L.geoJSON(LAND, { pane: 'fallback', interactive: false, style: () => ({
    fillColor: getComputedStyle(mapEl).getPropertyValue('--land').trim(),
    fillOpacity: 1, color: getComputedStyle(mapEl).getPropertyValue('--border').trim(), weight: .8 }) }).addTo(map);

const borderLayer = L.layerGroup().addTo(map);
function renderBorders() {
  borderLayer.clearLayers();
  const cs = getComputedStyle(mapEl);
  const ancient = names === 'ancient';
  if (ancient) {
    PROVINCE_LINES.forEach(l => L.polyline(l, { color: cs.getPropertyValue('--prov').trim(), weight: 2.3, opacity: .9,
      dashArray: '9 4 2 4', interactive: false }).addTo(borderLayer));
  } else {
    // modern provinces / regions (thin) under country borders (bold)
    ADMIN_LINES.forEach(l => L.polyline(l, { color: cs.getPropertyValue('--ctry').trim(), weight: 1, opacity: .55,
      dashArray: '3 4', interactive: false }).addTo(borderLayer));
    COUNTRY_LINES.forEach(l => L.polyline(l, { color: cs.getPropertyValue('--ctry').trim(), weight: 2.6, opacity: .95,
      dashArray: '9 4 2 4', interactive: false }).addTo(borderLayer));
  }
  document.querySelector('.key').style.setProperty('--bcol', cs.getPropertyValue(ancient ? '--prov' : '--ctry').trim());
  document.getElementById('bkey').textContent = ancient ? (D.provKey || 'Ancient province borders (approx.)') : 'Modern country and province borders';
}
const placeLayer = L.layerGroup().addTo(map);
function renderPlaces() {
  placeLayer.clearLayers();
  PLACES.forEach(([anc, mod, ll, cls]) => {
    const t = names === 'ancient' ? anc : mod;
    if (!t) return;
    L.marker(ll, { interactive: false, keyboard: false,
      icon: L.divIcon({ className: '', iconSize: [0, 0], html: `<div class="place ${cls.replace('sea', '')}">${t}</div>` }) }).addTo(placeLayer);
  });
}
// ---- base maps: four looks, one default ----
// Esri's label-free basemaps need no API key (CARTO now returns an "API key required" placeholder).
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const NOTILE = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const BASES = {
  clean:     { label: 'Clean',     path: 'Canvas/World_Light_Gray_Base', native: 16, darkUI: false, halo: true,  attr: 'Tiles &copy; Esri' },
  terrain:   { label: 'Terrain',   path: 'World_Terrain_Base',           native: 13, darkUI: false, halo: true,  attr: 'Tiles &copy; Esri' },
  satellite: { label: 'Satellite', path: 'World_Imagery',                native: 19, darkUI: true,  halo: true,  attr: 'Imagery &copy; Esri, Maxar, Earthstar Geographics' },
  dark:      { label: 'Dark',      path: 'Canvas/World_Dark_Gray_Base',  native: 16, darkUI: true,  halo: false, attr: 'Tiles &copy; Esri' }
};
function savedBase() { try { return localStorage.getItem('vb-base'); } catch (e) { return null; } }
const wanted = new URLSearchParams(location.search).get('map') || savedBase();
let baseKey = BASES[wanted] ? wanted : (osDark ? 'dark' : 'clean');   // default: Clean (Dark if the device is in dark mode)
function setBaseClasses(key) {
  const b = BASES[key];
  noHalo = !b.halo;
  mapEl.classList.toggle('base-dark', b.darkUI);
  mapEl.classList.toggle('base-light', !b.darkUI);
}
setBaseClasses(baseKey);
renderPlaces();
renderBorders();
const baseLayers = {}, keyByLabel = {};
Object.entries(BASES).forEach(([key, b]) => {
  const t = L.tileLayer(ESRI + b.path + '/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, maxNativeZoom: b.native, opacity: 0, errorTileUrl: NOTILE, attribution: b.attr + ' &middot; Natural Earth' });
  let ok = false;   // stay see-through until a real tile arrives, so the built-in map shows if tiles are blocked
  t.on('tileload', () => { if (!ok) { ok = true; t.setOpacity(1); } });
  baseLayers[b.label] = t; keyByLabel[b.label] = key;
});
baseLayers[BASES[baseKey].label].addTo(map);
L.control.layers(baseLayers, null, { position: 'topright', collapsed: innerWidth < 700 }).addTo(map);
map.on('baselayerchange', e => {
  baseKey = keyByLabel[e.name];
  setBaseClasses(baseKey);
  try { localStorage.setItem('vb-base', baseKey); } catch (err) { /* private mode */ }
  renderBorders(); render(); syncURL();
});
  const layer = L.layerGroup().addTo(map);
  const arrowLayer = L.layerGroup().addTo(map);
  let sel = 'all';
  const cssVar = v => v.startsWith('var(') ? getComputedStyle(document.documentElement).getPropertyValue(v.slice(4, -1)).trim() : v;
  const isVisible = j => sel === 'all' || String(j) === String(sel);

function bearing(a, b) {            // clockwise degrees from "up", in web-mercator screen space
  const pa = L.CRS.EPSG3857.project(L.latLng(a)), pb = L.CRS.EPSG3857.project(L.latLng(b));
  return Math.atan2(pb.x - pa.x, pb.y - pa.y) * 180 / Math.PI;
}
function drawArrows() {
  arrowLayer.clearLayers();
  if (!map._loaded) return;
  for (const j of RK) {
    if (!isVisible(j)) continue;
    const color = cssVar(J[j].color);
    for (const path of R[j]) {
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const pa = map.latLngToContainerPoint([a[0], a[1]]), pb = map.latLngToContainerPoint([b[0], b[1]]);
        if (pa.distanceTo(pb) < 60) continue;
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        L.marker(mid, { interactive: false, keyboard: false, icon: L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9],
          html: `<div class="arr" style="transform:rotate(${bearing(a, b).toFixed(1)}deg)"><svg viewBox="0 0 18 18"><path d="M9 1 L16 16 L9 12.5 L2 16 Z" fill="${color}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>` }) }).addTo(arrowLayer);
      }
    }
  }
}
function drawBadges() {
  const per = {};
  for (const j of RK) {
    if (!isVisible(j)) continue;
    const [st, en] = ENDS[j];
    if (st === en) (per[st] = per[st] || []).push([j, 'start & end']);
    else { (per[st] = per[st] || []).push([j, 'start']); (per[en] = per[en] || []).push([j, 'end']); }
  }
  for (const [id, list] of Object.entries(per)) {
    list.forEach(([j, what], idx) => {
      const mark = what === 'end' ? '■' : what === 'start' ? '▶' : '⟲';
      L.marker(C[id].ll, { interactive: false, keyboard: false, zIndexOffset: 500,
        icon: L.divIcon({ className: '', iconSize: [0, 0], iconAnchor: [-14, -14 - idx * 22],
          html: `<div class="badge" style="--c:${cssVar(J[j].color)}">${mark} ${J[j].chip}: ${what}</div>` }) }).addTo(layer);
    });
  }
}
let skN = 0;
const hashStr = t => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
function rng(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
function svgWrap(c1, c2, inner, label) {
  const gid = 'sk' + (++skN);
  return `<svg class="ph" viewBox="0 0 160 120" role="img" aria-label="${label}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="160" height="120" fill="url(#${gid})"/>${inner}</svg>`;
}
function ancientArt(motif, label) {
  const S = '#eadfc4', D = '#b8a27a', G = '#c8a56a';
  let o = '<circle cx="128" cy="26" r="12" fill="#fff1b8" opacity=".9"/>';
  if (motif === 'temple') {
    o += `<rect y="96" width="160" height="24" fill="${G}"/><rect x="22" y="90" width="116" height="6" fill="${S}" stroke="${D}"/><rect x="28" y="85" width="104" height="5" fill="${S}" stroke="${D}"/>`;
    for (let i = 0; i < 6; i++) { const x = 34 + i * 18; o += `<rect x="${x}" y="48" width="9" height="37" fill="${S}" stroke="${D}"/><rect x="${x - 2}" y="44" width="13" height="4" fill="${S}" stroke="${D}"/>`; }
    o += `<rect x="28" y="38" width="104" height="6" fill="${S}" stroke="${D}"/><polygon points="24,38 80,16 136,38" fill="${S}" stroke="${D}"/><polygon points="40,36 80,22 120,36" fill="${D}" opacity=".35"/>`;
  } else if (motif === 'theatre') {
    o += `<rect y="96" width="160" height="24" fill="${G}"/>`;
    for (let i = 0; i < 6; i++) o += `<path d="M${10 + i * 9} 96 A${70 - i * 9} ${52 - i * 7} 0 0 1 ${150 - i * 9} 96" fill="none" stroke="${i % 2 ? D : S}" stroke-width="8"/>`;
    o += `<rect x="46" y="92" width="68" height="6" fill="${D}"/>`;
  } else if (motif === 'walls') {
    o += `<rect y="96" width="160" height="24" fill="${G}"/><rect x="12" y="58" width="136" height="38" fill="${S}" stroke="${D}"/>`;
    for (let i = 0; i < 16; i++) o += `<rect x="${12 + i * 8.5}" y="52" width="5" height="6" fill="${S}" stroke="${D}"/>`;
    o += `<rect x="12" y="36" width="24" height="60" fill="${S}" stroke="${D}"/><rect x="124" y="36" width="24" height="60" fill="${S}" stroke="${D}"/>`;
    for (let i = 0; i < 3; i++) o += `<rect x="${12 + i * 9}" y="30" width="6" height="6" fill="${S}" stroke="${D}"/><rect x="${124 + i * 9}" y="30" width="6" height="6" fill="${S}" stroke="${D}"/>`;
    o += `<path d="M68 96 V76 A12 12 0 0 1 92 76 V96 Z" fill="#5b4a2f"/><rect x="21" y="50" width="6" height="12" fill="#5b4a2f"/><rect x="133" y="50" width="6" height="12" fill="#5b4a2f"/>`;
  } else if (motif === 'harbor') {
    o += `<rect y="70" width="160" height="50" fill="#5fa3c7"/><rect y="70" width="160" height="6" fill="#7bb8d6"/>`;
    for (let i = 0; i < 6; i++) o += `<path d="M${6 + i * 28} ${96 + (i % 2) * 8} q7 -5 14 0 t14 0" fill="none" stroke="#e8f4fa" stroke-width="1.6" opacity=".8"/>`;
    o += `<rect y="88" width="42" height="32" fill="${D}"/><rect x="18" y="40" width="10" height="48" fill="${S}" stroke="${D}"/><rect x="16" y="34" width="14" height="6" fill="${D}"/><circle cx="23" cy="30" r="4" fill="#ffd54a"/>`;
    o += `<path d="M62 88 Q90 104 128 88 L120 82 H70 Z" fill="#7a4a24"/><rect x="94" y="44" width="2" height="40" fill="#4b3118"/><path d="M96 46 Q122 62 96 80 Z" fill="#f5efe0" stroke="${D}"/>`;
  } else if (motif === 'arch') {
    o += `<rect y="100" width="160" height="20" fill="${G}"/>`;
    for (let t = 0; t < 2; t++) {
      const y = 28 + t * 36, h = 36;
      o += `<rect x="12" y="${y}" width="136" height="${h}" fill="${S}" stroke="${D}"/>`;
      for (let i = 0; i < 6; i++) { const x = 19 + i * 21; o += `<path d="M${x} ${y + h} V${y + 14} A7 7 0 0 1 ${x + 14} ${y + 14} V${y + h} Z" fill="#6b5a3c"/>`; }
    }
  } else { // island
    o += `<rect y="62" width="160" height="58" fill="#5fa3c7"/><path d="M14 96 Q56 34 100 66 T152 96 Z" fill="#8a7a58"/><path d="M40 72 Q56 52 76 62 Q60 66 40 72Z" fill="#7fa069"/>`;
    o += `<g transform="rotate(-16 112 78)"><path d="M92 82 Q112 96 134 82 L128 76 H98 Z" fill="#7a4a24"/><rect x="112" y="46" width="2" height="32" fill="#4b3118"/><path d="M114 48 Q132 60 114 72 Z" fill="#f5efe0" stroke="${D}"/></g>`;
  }
  return svgWrap('#f4d9a8', '#fbeed6', o, label);
}
function modernArt(type, id, label) {
  const r = rng(hashStr(id)), B = ['#cfd6dc', '#b7c2cb', '#e2d9cc', '#a9b6c2', '#dcd2c0'];
  const bld = (x, w, h, col) => {
    let b = `<rect x="${x}" y="${100 - h}" width="${w}" height="${h}" fill="${col}"/>`;
    for (let yy = 100 - h + 4; yy < 94; yy += 8) for (let xx = x + 3; xx < x + w - 4; xx += 6) b += `<rect x="${xx}" y="${yy}" width="3" height="4" fill="#4e6d86" opacity=".75"/>`;
    return b;
  };
  let o = '<circle cx="30" cy="24" r="11" fill="#fff6c9"/>';
  const hills = '<path d="M0 84 Q30 62 62 80 T120 76 T160 82 V100 H0Z" fill="#9bb58a"/>';
  if (type === 'city') {
    o += `<rect y="100" width="160" height="20" fill="#7f8f86"/><rect y="106" width="160" height="3" fill="#e8e4d4"/>`;
    for (let x = 2; x < 150;) { const w = 14 + r() * 12, h = 30 + r() * 52; o += bld(x, w, h, B[Math.floor(r() * B.length)]); x += w + 1; }
    o += `<rect x="78" y="12" width="3" height="20" fill="#9aa7b2"/>`;
  } else if (type === 'coastcity') {
    o += `<rect x="96" y="82" width="64" height="38" fill="#4f9bc7"/><rect y="100" width="96" height="20" fill="#7f8f86"/>`;
    for (let x = 2; x < 88;) { const w = 12 + r() * 10, h = 24 + r() * 40; o += bld(x, w, h, B[Math.floor(r() * B.length)]); x += w + 1; }
    o += `<path d="M112 98 Q128 108 146 98 L142 92 H116 Z" fill="#fafafa" stroke="#9aa7b2"/><path d="M129 58 V92 L144 92 Z" fill="#fafafa" stroke="#9aa7b2"/>`;
  } else if (type === 'town') {
    o += hills + `<rect y="98" width="160" height="22" fill="#8fae7b"/>`;
    for (let i = 0; i < 6; i++) { const x = 6 + i * 25, h = 14 + r() * 10; o += `<rect x="${x}" y="${98 - h}" width="20" height="${h}" fill="#efe6d6"/><polygon points="${x - 2},${98 - h} ${x + 10},${88 - h} ${x + 22},${98 - h}" fill="#c4673f"/><rect x="${x + 7}" y="${88}" width="6" height="10" fill="#7a5a3a"/>`; }
  } else if (type === 'village') {
    o += hills + `<rect y="96" width="160" height="24" fill="#8fae7b"/>`;
    for (let i = 0; i < 4; i++) { const x = 12 + i * 36 + r() * 6; o += `<rect x="${x}" y="78" width="22" height="18" fill="#efe6d6"/><polygon points="${x - 2},78 ${x + 11},66 ${x + 24},78" fill="#c4673f"/>`; }
    for (let i = 0; i < 5; i++) { const x = 8 + i * 34 + r() * 10; o += `<rect x="${x}" y="96" width="3" height="10" fill="#6a4a2a"/><circle cx="${x + 1.5}" cy="92" r="7" fill="#5f8f55"/>`; }
  } else if (type === 'ruins') {
    o += hills + `<rect y="94" width="160" height="26" fill="#9bb07a"/>`;
    for (let i = 0; i < 6; i++) { const x = 14 + i * 24, h = 14 + r() * 34; o += `<rect x="${x}" y="${94 - h}" width="8" height="${h}" fill="#e7dcc2" stroke="#b8a27a"/>${h > 34 ? `<rect x="${x - 2}" y="${90 - h}" width="12" height="4" fill="#e7dcc2" stroke="#b8a27a"/>` : ''}`; }
    o += `<ellipse cx="40" cy="104" rx="14" ry="4" fill="#d9ccae"/><ellipse cx="118" cy="106" rx="18" ry="4" fill="#d9ccae"/>`;
  } else { // island
    o += `<rect y="66" width="160" height="54" fill="#4f9bc7"/><path d="M12 98 Q56 40 104 74 T154 98 Z" fill="#a9a07a"/><path d="M12 98 Q56 56 104 80 T154 98 Z" fill="#8fae7b"/>`;
    for (let i = 0; i < 4; i++) { const x = 48 + i * 17; o += `<rect x="${x}" y="78" width="11" height="9" fill="#efe6d6"/><polygon points="${x - 1},78 ${x + 5.5},72 ${x + 12},78" fill="#c4673f"/>`; }
    o += `<path d="M118 108 Q132 116 148 108 L144 102 H122 Z" fill="#fafafa" stroke="#9aa7b2"/>`;
  }
  return svgWrap('#8cc8ee', '#e9f6fd', o, label);
}
function artFigures(id) {
  const [motif, today] = ART[id] || ['temple', 'town'];
  const an = C[id].n, mo = MODERN[id];
  return [
    { kind: 'Ancient', html: ancientArt(motif, `Illustration of ancient ${an}`), cap: `${an}, as it might have looked (illustration)` },
    { kind: 'Today', html: modernArt(today, id, `Illustration of ${mo} today`), cap: `${mo} today (illustration)` }
  ].map(f => `<figure data-kind="${f.kind}">${f.html}<figcaption><b>${f.kind}</b>${f.cap}</figcaption></figure>`).join('');
}

const BAD = /flag|coat_of_arms|logo|icon|locator|location|map_of|blank|symbol|emblem|seal|commons-|wiki|button|stub|disambig|\.svg/i;
const OLD = /reconstruct|illustrat|engrav|paint|mosaic|fresco|coin|relief|ancient|roman|byzantine|hellenistic|bust|statue|inscription|artist|drawing|lithograph|model|aerial|ruins|theat|temple|forum|agora|amphitheat|excavat/i;
const imgCache = {};
const fix = u => u.startsWith('//') ? 'https:' + u : u;
const api = (kind, t) => fetch(`https://en.wikipedia.org/api/rest_v1/page/${kind}/${t}`).then(r => { if (!r.ok) throw 0; return r.json(); });
const fileURL = t => 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(t.replace(/ /g, '_')).replace(/%3A/g, ':');
async function leadImg(title) {
  const d = await api('summary', title);
  if (!d.thumbnail) return null;
  return { src: d.thumbnail.source, cap: d.description || '', file: null, page: d.content_urls && d.content_urls.desktop.page };
}
async function oldImg(title, skipSrc) {
  const d = await api('media-list', title);
  const items = (d.items || []).filter(i => i.type === 'image' && i.srcset && i.srcset.length && !BAD.test(i.title));
  const score = i => (OLD.test((i.caption && i.caption.text) || '') ? 2 : 0) + (OLD.test(i.title) ? 1 : 0);
  const pool = items.map(i => ({ i, sc: score(i), src: fix(i.srcset[Math.min(1, i.srcset.length - 1)].src) })).filter(x => x.src !== skipSrc);
  pool.sort((a, b) => b.sc - a.sc);
  const best = pool[0];
  if (!best) return null;
  return { src: best.src, cap: ((best.i.caption && best.i.caption.text) || '').slice(0, 110), file: best.i.title };
}
function loadImages(id) {
  if (imgCache[id]) return imgCache[id];
  const [anc, mod] = WIKI[id] || [];
  imgCache[id] = (async () => {
    if (!anc) return [];
    const [m, a0] = await Promise.all([leadImg(mod).catch(() => null), oldImg(anc, null).catch(() => null)]);
    let a = a0;
    if (a && m && a.src === m.src) a = await oldImg(anc, m.src).catch(() => null);
    const out = [];
    if (a) out.push({ kind: 'Ancient', ...a });
    if (m) out.push({ kind: 'Today', ...m });
    return out;
  })().catch(() => []);
  return imgCache[id];
}
function imgHTML(list) {
  return list.map(x => {
    const link = x.file ? `<a href="${fileURL(x.file)}" target="_blank" rel="noopener">Commons</a>` : (x.page ? `<a href="${x.page}" target="_blank" rel="noopener">Wikipedia</a>` : '');
    return `<figure><img class="ph" src="${x.src}" alt="${x.kind}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').remove()"><figcaption><b>${x.kind}</b>${(x.cap || '').replace(/</g, '&lt;')} ${link}</figcaption></figure>`;
  }).join('');
}


function slugName(s) { return s.replace(/-/g, ' ').replace(/\b[a-z]/g, c => c.toUpperCase()); }
function popupHTML(id) {
  const c = C[id];
  const sub = names === 'ancient' ? c.m : (MODERN[id] === c.n ? c.m : `Ancient name: ${c.n}`);
  let html = `<div class="pp"><h3>${nm(id)}</h3><p class="mod">${sub}</p><div class="imgs" data-city="${id}"></div>`;
  for (const j of ordered) {
    if (!c.e[j] || !isVisible(j)) continue;
    const [text, ref] = c.e[j];
    const links = ref.split(';').map(r => {
      const q = encodeURIComponent(r.trim().replace(/–/g, '-'));
      return `<a class="ref" href="https://www.biblegateway.com/passage/?search=${q}" target="_blank" rel="noopener">${r.trim()}</a>`;
    }).join(' ');
    html += `<section style="--c:${cssVar(J[j].color)}"><h4>${J[j].name}</h4><p>${text}</p>${links}</section>`;
  }
  if (LINKS[id] && D.linkPage) {
    html += `<div class="xl"><b>${D.linkLabel || 'Related'}:</b> ` + LINKS[id].map(s =>
      `<a href="${D.linkPage}?book=${s}">${slugName(s)}</a>`).join(' · ') + '</div>';
  }
  html += `<div class="xl share"><a href="#" data-share="${id}">Copy link to this place</a></div>`;
  return html + '</div>';
}

function render() {
  layer.clearLayers();
  const bounds = [];
  const halo = cssVar('--panel');

  // routes
  for (const j of RK) {
    if (!isVisible(j)) continue;
    const color = cssVar(J[j].color);
    for (const path of R[j]) {
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const seg = [[a[0], a[1]], [b[0], b[1]]];
        L.polyline(seg, { color: '#fff', weight: 7, opacity: noHalo ? 0 : .75, interactive: false }).addTo(layer);
        L.polyline(seg, { color, weight: 4, opacity: .95, dashArray: b[2] ? '8 7' : null, lineCap: 'round', interactive: false }).addTo(layer);
      }
      path.forEach(p => bounds.push([p[0], p[1]]));
    }
    if (!(sel === 'all' && D.compactAll)) {
      const lab = L.marker(LABELS[j], { interactive: false, keyboard: false,
        icon: L.divIcon({ className: '', iconSize: [0, 0], html: `<div class="jl" style="--c:${color}">${J[j].name}</div>` }) });
      lab.addTo(layer);
    }
  }

  // cities
  for (const [id, c] of Object.entries(C)) {
    const js = ordered.filter(j => c.e[j] && isVisible(j));
    if (!js.length) continue;
    const cols = js.map(j => cssVar(J[j].color));
    const step = 100 / cols.length;
    const bg = cols.length === 1 ? cols[0]
      : `conic-gradient(${cols.map((col, i) => `${col} ${i * step}% ${(i + 1) * step}%`).join(',')})`;
    const icon = L.divIcon({ className: '', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12],
      html: `<div class="pin"><span style="background:${bg}"></span></div>` });
    const m = L.marker(c.ll, { icon, title: nm(id), riseOnHover: true });
    m.bindPopup(() => popupHTML(id), { maxWidth: 330, minWidth: 240, autoPanPaddingTopLeft: [20, 20], autoPanPaddingBottomRight: [20, 20] });
    m.bindTooltip(nm(id), { permanent: true, direction: 'right', offset: [9, 0], className: 'lbl' + (c.major ? ' major' : '') });
    m.on('popupopen', e => {
      const slot = e.popup.getElement().querySelector('.imgs');
      if (!slot) return;
      slot.innerHTML = artFigures(id);          // every city always gets two pictures
      e.popup.update();
      // Upgrade to real Wikimedia photos when they can be loaded
      loadImages(id).then(list => list.forEach(x => {
        const probe = new Image();
        probe.onload = () => {
          const fig = slot.querySelector(`figure[data-kind="${x.kind}"]`);
          if (!fig) return;
          fig.innerHTML = imgHTML([x]).replace(/^<figure>|<\/figure>$/g, '');
          e.popup.update();
        };
        probe.referrerPolicy = 'no-referrer';
        probe.src = x.src;
      }));
    });
    m.addTo(layer);
    bounds.push(c.ll);
  }
  if (!(sel === 'all' && D.compactAll)) drawBadges();
  drawArrows();
  setTimeout(declutter, 30);
  return bounds;
}

let select = function (key, fit = true) {
  sel = key;
  map.closePopup();
  document.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === String(key)));
  const bounds = render();
  const desc = key === 'all'
    ? D.allSummary
    : J[key].sum;
  document.getElementById('summary').innerHTML = desc;
  if (fit && key === 'all' && D.allBounds) map.fitBounds(D.allBounds, { paddingTopLeft: [24, 24], paddingBottomRight: [24, 70] });
  else if (fit && bounds.length) map.fitBounds(bounds, { paddingTopLeft: [24, 24], paddingBottomRight: [24, 70], maxZoom: D.fitMaxZoom || 9 });
}


// Hide city labels that would overlap a more important one
function declutter() {
  const els = [...mapEl.querySelectorAll('.leaflet-tooltip.lbl')];
  els.forEach(e => { e.style.visibility = ''; });
  const placed = [];
  els.sort((a, b) => (b.classList.contains('major') - a.classList.contains('major')));
  for (const e of els) {
    if (e.offsetParent === null) continue;
    const r = e.getBoundingClientRect();
    const hit = placed.some(p => !(r.right + 2 < p.left || r.left - 2 > p.right || r.bottom + 1 < p.top || r.top - 1 > p.bottom));
    if (hit) e.style.visibility = 'hidden'; else placed.push(r);
  }
}
map.on('zoomend moveend', () => setTimeout(declutter, 30));

function zoomClass() { mapEl.classList.toggle('z-low', map.getZoom() < 6); }
map.on('zoomend', zoomClass);
map.on('zoomend moveend', drawArrows);

// chips
const chips = document.getElementById('chips');
[['all', D.allChip || 'All', 'var(--ink)'], ...ordered.map(j => [String(j), J[j].chip, J[j].color])].forEach(([k, label, col]) => {
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.k = k; b.style.setProperty('--c', col);
  b.innerHTML = k === 'all' ? label : `<i></i>${label}`;
  b.addEventListener('click', () => select(k));
  chips.appendChild(b);
});

let setNames = function (mode) {
  names = mode;
  document.getElementById('nmA').setAttribute('aria-pressed', mode === 'ancient');
  document.getElementById('nmM').setAttribute('aria-pressed', mode === 'modern');
  map.closePopup(); renderPlaces(); renderBorders(); render();
}
document.getElementById('nmA').addEventListener('click', () => setNames('ancient'));
document.getElementById('nmM').addEventListener('click', () => setNames('modern'));

// ---- step-through: walk the selected journey stop by stop ----
function stopsFor(j) {
  const seen = [], key = p => p[0].toFixed(2) + ',' + p[1].toFixed(2);
  const byLL = {}; Object.entries(C).forEach(([id, c]) => { if (c.e[j]) byLL[key(c.ll)] = id; });
  (R[j] || []).forEach(path => path.forEach(p => { const id = byLL[key(p)]; if (id && !seen.includes(id)) seen.push(id); }));
  Object.entries(C).forEach(([id, c]) => { if (c.e[j] && !seen.includes(id)) seen.push(id); });
  return seen;
}
let stepIdx = -1, stepList = [];
const stepper = document.getElementById('stepper');
function openCity(id) {
  const c = C[id]; map.setView(c.ll, Math.max(map.getZoom(), 7), { animate: true });
  layer.eachLayer(m => { if (m.getLatLng && m.getPopup && m.getPopup() && m.getLatLng().lat === c.ll[0] && m.getLatLng().lng === c.ll[1]) m.openPopup(); });
}
function updateStepper() {
  if (!stepper) return;
  if (sel === 'all') { stepper.hidden = true; return; }
  stepList = stopsFor(sel); stepIdx = -1; stepper.hidden = false;
  stepper.querySelector('.lbl2').textContent = stepList.length + ' stops';
}
function step(dir) {
  if (!stepList.length) return;
  stepIdx = (stepIdx + dir + stepList.length) % stepList.length;
  const id = stepList[stepIdx];
  stepper.querySelector('.lbl2').textContent = `Stop ${stepIdx + 1} of ${stepList.length}: ${nm(id)}`;
  openCity(id); syncURL(id);
}
if (stepper) {
  stepper.querySelector('[data-dir="-1"]').addEventListener('click', () => step(-1));
  stepper.querySelector('[data-dir="1"]').addEventListener('click', () => step(1));
}

// ---- permalinks: ?journey=2&names=modern&city=corinth ----
function syncURL(city) {
  const q = new URLSearchParams();
  if (sel !== 'all') q.set('journey', sel);
  if (names !== 'ancient') q.set('names', names);
  if (baseKey !== (osDark ? 'dark' : 'clean')) q.set('map', baseKey);
  if (city) q.set('city', city);
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
}
mapEl.addEventListener('click', e => {
  const a = e.target.closest('[data-share]'); if (!a) return;
  e.preventDefault(); syncURL(a.dataset.share);
  (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => { a.textContent = 'Link copied'; }, () => { a.textContent = 'Copy the address bar'; });
});
const _select = select;
select = function (key, fit) { _select(key, fit); updateStepper(); syncURL(); };
const _setNames = setNames;
setNames = function (mode) { _setNames(mode); syncURL(); };

// ---- start ----
const qs = new URLSearchParams(location.search);
if (qs.get('names') === 'modern') setNames('modern');
select(qs.get('journey') && J[qs.get('journey')] ? qs.get('journey') : 'all');
zoomClass();
const cityQ = qs.get('city');
if (cityQ && C[cityQ]) setTimeout(() => openCity(cityQ), 400);
addEventListener('resize', () => map.invalidateSize());
document.body.classList.add('map-ready');
})();
