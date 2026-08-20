// Lander: render the "Top toxic breads" leaderboard from the lab data.

(function () {
  const el = document.getElementById('top-breads');
  if (!el) return;

  const ranked = BREAD_TESTS
    .filter(function (b) { return b.ppb !== null; })
    .sort(function (a, b) { return b.ppb - a.ppb; })
    .slice(0, 10);

  const maxSqrt = Math.sqrt(ranked[0].ppb);

  el.innerHTML = ranked.map(function (b, i) {
    const v = breadVerdict(b.ppb);
    const width = Math.max(4, (Math.sqrt(b.ppb) / maxSqrt) * 100);
    const src = BREAD_SOURCES[b.source];
    return '' +
      '<div class="lb-row">' +
      '<div class="lb-rank' + (i < 3 ? ' top' : '') + '">' + (i + 1) + '</div>' +
      '<div class="lb-info">' +
      '<div class="lb-name">' + escapeHtmlLb(b.brand) + ' <small>' + escapeHtmlLb(b.product) + '</small></div>' +
      '<div class="lb-bar-track"><div class="lb-bar" style="width:' + width.toFixed(1) + '%"></div></div>' +
      '<div class="lb-src">' + escapeHtmlLb(src.short) + '</div>' +
      '</div>' +
      '<div class="lb-ppb"><strong style="color:' + v.color + '">' + formatPpb(b.ppb) + '</strong><span>ppb glyphosate</span></div>' +
      '</div>';
  }).join('');

  function formatPpb(n) {
    return n >= 100 ? Math.round(n).toLocaleString() : n.toLocaleString();
  }
  function escapeHtmlLb(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
