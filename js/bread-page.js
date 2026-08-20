// Bread & Glyphosate page: stats, source cards, and the sortable/filterable lab table.

(function () {
  const tbody = document.getElementById('bread-tbody');
  const searchEl = document.getElementById('bread-search');
  const sourceEl = document.getElementById('bread-source');
  const sortEl = document.getElementById('bread-sort');
  if (!tbody) return;

  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- Stats strip ----
  const detected = BREAD_TESTS.filter(function (b) { return b.ppb !== null; });
  const aboveEwg = detected.filter(function (b) { return b.ppb >= GLYPHOSATE_REFS.ewgChildBenchmark; });
  const stats = document.getElementById('bread-stats');
  if (stats) {
    const worst = detected.slice().sort(function (a, b) { return b.ppb - a.ppb; })[0];
    stats.innerHTML =
      '<div class="stat"><div class="stat-num">' + BREAD_TESTS.length + '</div><div class="stat-label">breads tested across 3 independent lab reports</div></div>' +
      '<div class="stat"><div class="stat-num amber">' + detected.length + '</div><div class="stat-label">had detectable glyphosate (' + Math.round(100 * detected.length / BREAD_TESTS.length) + '%)</div></div>' +
      '<div class="stat"><div class="stat-num red">' + aboveEwg.length + '</div><div class="stat-label">exceeded EWG’s child-protective benchmark (160 ppb)</div></div>' +
      '<div class="stat"><div class="stat-num red">' + Math.round(worst.ppb).toLocaleString() + '</div><div class="stat-label">ppb — highest tested: ' + esc(worst.brand + ' ' + worst.product) + '</div></div>';
  }

  // ---- Source cards ----
  const srcWrap = document.getElementById('bread-sources');
  if (srcWrap) {
    srcWrap.innerHTML = Object.keys(BREAD_SOURCES).map(function (key) {
      const s = BREAD_SOURCES[key];
      const n = BREAD_TESTS.filter(function (b) { return b.source === key; }).length;
      return '<div class="source-card">' +
        '<div class="src-meta">' + n + ' products tested</div>' +
        '<h4>' + esc(s.name) + '</h4>' +
        '<p>' + esc(s.detail) + '</p>' +
        '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">Read the report →</a>' +
        '</div>';
    }).join('');
  }

  // ---- Table ----
  const maxSqrt = Math.sqrt(1150);

  function render() {
    const q = (searchEl.value || '').toLowerCase();
    const src = sourceEl.value;
    const sort = sortEl.value;

    let rows = BREAD_TESTS.filter(function (b) {
      if (src !== 'all' && b.source !== src) return false;
      if (q && (b.brand + ' ' + b.product).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    rows.sort(function (a, b) {
      if (sort === 'high') return (b.ppb || 0) - (a.ppb || 0);
      if (sort === 'low') return (a.ppb === null ? -1 : a.ppb) - (b.ppb === null ? -1 : b.ppb);
      return (a.brand + a.product).localeCompare(b.brand + b.product);
    });

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:32px">No breads match that filter.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(function (b) {
      const v = breadVerdict(b.ppb);
      const s = BREAD_SOURCES[b.source];
      const ppbCell = b.ppb === null
        ? '<span class="b-ppb green">ND</span>'
        : '<span class="b-ppb ' + (b.ppb >= 160 ? 'red' : 'amber') + '">' + (b.ppb >= 100 ? Math.round(b.ppb).toLocaleString() : b.ppb) + '</span>';
      const width = b.ppb === null ? 0 : Math.max(3, (Math.sqrt(b.ppb) / maxSqrt) * 100);
      const chipCls = v.cls === 'ok' ? 'chip-ok' : v.cls === 'warn' ? 'chip-warn' : 'chip-danger';
      return '<tr>' +
        '<td><span class="b-brand">' + esc(b.brand) + '</span><br><span class="b-product">' + esc(b.product) + '</span></td>' +
        '<td>' + ppbCell + '</td>' +
        '<td><div class="ppb-bar-track"><div class="ppb-bar" style="width:' + width.toFixed(1) + '%;background:' + v.color + '"></div></div></td>' +
        '<td><span class="chip ' + chipCls + '">' + v.label + '</span></td>' +
        '<td class="b-src"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.short) + '</a></td>' +
        '</tr>';
    }).join('');
  }

  searchEl.addEventListener('input', render);
  sourceEl.addEventListener('change', render);
  sortEl.addEventListener('change', render);
  render();
})();
