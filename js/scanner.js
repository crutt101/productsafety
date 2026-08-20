// ToxiScan barcode scanner page logic.
// Camera scanning via html5-qrcode, product lookup via Open Food Facts,
// scoring via score.js / toxins.js.

(function () {
  let html5Qrcode = null;
  let scanning = false;

  const statusEl = document.getElementById('scan-status');
  const resultEl = document.getElementById('result');
  const startBtn = document.getElementById('start-scan');

  function setStatus(msg, isError) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status-msg' + (isError ? ' error' : '');
  }

  // ---------- Camera ----------
  async function startScan() {
    if (scanning) { await stopScan(); return; }
    if (typeof Html5Qrcode === 'undefined') {
      setStatus('Scanner library failed to load — use manual entry below.', true);
      return;
    }
    try {
      const formats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128
      ];
      html5Qrcode = new Html5Qrcode('reader', { formatsToSupport: formats });
      setStatus('Starting camera…');
      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 160 } },
        onScanSuccess,
        function () { /* per-frame decode misses are normal */ }
      );
      scanning = true;
      startBtn.textContent = 'Stop camera';
      setStatus('Point the camera at a product barcode.');
    } catch (err) {
      setStatus('Camera unavailable (' + (err && err.message ? err.message : err) + '). Type the barcode digits below instead.', true);
    }
  }

  async function stopScan() {
    if (html5Qrcode && scanning) {
      try { await html5Qrcode.stop(); html5Qrcode.clear(); } catch (e) { /* ignore */ }
    }
    scanning = false;
    startBtn.textContent = 'Start camera scan';
  }

  function onScanSuccess(decodedText) {
    stopScan();
    document.getElementById('barcode-input').value = decodedText;
    lookupBarcode(decodedText);
  }

  // ---------- Open Food Facts lookup ----------
  async function fetchProduct(code) {
    const url = 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code) + '.json';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    return json && json.status === 1 ? json.product : null;
  }

  async function lookupBarcode(code) {
    code = (code || '').replace(/\D/g, '');
    if (code.length < 6) { setStatus('That doesn\'t look like a barcode.', true); return; }
    setStatus('Looking up ' + code + ' on Open Food Facts…');
    try {
      let product = await fetchProduct(code);
      // UPC-A barcodes are sometimes stored with (or without) a leading zero
      if (!product && code.length === 12) product = await fetchProduct('0' + code);
      if (!product && code.length === 13 && code[0] === '0') product = await fetchProduct(code.slice(1));
      if (!product) {
        setStatus('Product ' + code + ' isn\'t in the Open Food Facts database yet. Paste its ingredient list below instead.', true);
        return;
      }
      const ingredients = product.ingredients_text_en || product.ingredients_text || '';
      if (!ingredients) {
        setStatus('Found "' + (product.product_name || code) + '" but it has no ingredient list on file. Paste the ingredients below instead.', true);
        return;
      }
      const analysis = analyzeIngredients(ingredients, {
        additivesTags: product.additives_tags || [],
        labelsTags: product.labels_tags || [],
        categoriesTags: product.categories_tags || []
      });
      setStatus('');
      renderResult(analysis, {
        name: product.product_name || 'Unknown product',
        brand: product.brands || '',
        image: product.image_front_small_url || product.image_front_url || '',
        nova: product.nova_group || null,
        code: code
      });
    } catch (err) {
      setStatus('Lookup failed — check your connection and try again. (' + err.message + ')', true);
    }
  }

  // ---------- Paste-ingredients mode ----------
  function analyzePasted() {
    const text = document.getElementById('ingredients-input').value.trim();
    if (!text) { setStatus('Paste an ingredient list first.', true); return; }
    setStatus('');
    renderResult(analyzeIngredients(text), { name: 'Pasted ingredient list', brand: '', image: '', nova: null, code: null });
  }

  // ---------- Rendering ----------
  function dial(score) {
    const r = 54, c = 2 * Math.PI * r;
    const filled = c * (score / 100);
    const color = scoreColor(score);
    return '' +
      '<div class="score-dial">' +
      '<svg width="128" height="128" viewBox="0 0 128 128">' +
      '<circle cx="64" cy="64" r="' + r + '" fill="none" stroke="var(--panel-2)" stroke-width="11"/>' +
      '<circle cx="64" cy="64" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round" ' +
      'stroke-dasharray="' + filled.toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
      '</svg>' +
      '<div class="dial-num"><strong style="color:' + color + '">' + score + '</strong><span>/ 100</span></div>' +
      '</div>';
  }

  function renderResult(analysis, product) {
    const parts = [];

    parts.push('<div class="result-head">');
    parts.push(dial(analysis.score));
    parts.push('<div class="result-title">');
    parts.push('<h3>' + escapeHtml(product.name) + '</h3>');
    if (product.brand) parts.push('<div class="brand">' + escapeHtml(product.brand) + '</div>');
    parts.push('<div class="verdict">');
    parts.push('<span class="chip ' + (analysis.score >= 75 ? 'chip-ok' : analysis.score >= 60 ? 'chip-warn' : 'chip-danger') + '">Grade ' + analysis.grade + ' — ' + escapeHtml(analysis.verdict) + '</span>');
    if (analysis.carcinogenCount) parts.push('<span class="chip chip-danger">' + analysis.carcinogenCount + ' carcinogen-linked</span>');
    if (analysis.bannedCount) parts.push('<span class="chip chip-warn">' + analysis.bannedCount + ' banned/restricted abroad</span>');
    if (product.nova === 4) parts.push('<span class="chip chip-muted">NOVA 4 — ultra-processed</span>');
    parts.push('</div></div>');
    if (product.image) parts.push('<img class="result-img" src="' + escapeHtml(product.image) + '" alt="">');
    parts.push('</div>');

    if (analysis.hits.length === 0) {
      parts.push('<div class="clean-note">No ingredients from our hazard database were found. Nice.</div>');
    } else {
      parts.push('<div class="flag-list">');
      analysis.hits.forEach(function (h) {
        const t = h.toxin;
        parts.push('<div class="flag-item sev-' + severityClass(t.points) + '">');
        parts.push('<div class="flag-top"><span class="flag-name">' + escapeHtml(t.name) + '</span>');
        parts.push('<span class="flag-pts">-' + t.points + ' pts · ' + severityLabel(t.points) + '</span></div>');
        parts.push('<div class="flag-tags">');
        t.flags.forEach(function (f) {
          const cls = /banned|revoked|carcinogen|iarc|cancer/i.test(f) ? 'chip-danger' : 'chip-warn';
          parts.push('<span class="chip ' + cls + '">' + escapeHtml(f) + '</span>');
        });
        parts.push('</div>');
        parts.push('<div class="flag-note">' + escapeHtml(t.note) + '</div>');
        if (t.id === 'glyphosate_risk') {
          parts.push('<div class="flag-note" style="margin-top:6px"><a href="bread.html">See the bread &amp; glyphosate lab data →</a></div>');
        }
        parts.push('</div>');
      });
      parts.push('</div>');
    }

    if (analysis.highlightedHtml) {
      parts.push('<div class="ingredients-box"><h4>Ingredient list (flags highlighted)</h4>');
      parts.push('<div class="ing-text">' + analysis.highlightedHtml + '</div></div>');
    }

    resultEl.innerHTML = parts.join('');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---------- Wire up ----------
  startBtn.addEventListener('click', startScan);
  document.getElementById('lookup-btn').addEventListener('click', function () {
    lookupBarcode(document.getElementById('barcode-input').value);
  });
  document.getElementById('barcode-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') lookupBarcode(e.target.value);
  });
  document.getElementById('analyze-btn').addEventListener('click', analyzePasted);

  document.querySelectorAll('[data-demo-barcode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.getElementById('barcode-input').value = btn.dataset.demoBarcode;
      lookupBarcode(btn.dataset.demoBarcode);
    });
  });

  const DEMO_INGREDIENTS = 'Enriched bleached wheat flour (flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), water, high fructose corn syrup, partially hydrogenated soybean oil, dextrose, yeast, contains 2% or less of: salt, mono- and diglycerides, DATEM, calcium propionate (preservative), sodium acid pyrophosphate, potassium bromate, artificial flavor, yellow 5, red 40, BHT (to preserve freshness), TBHQ';
  document.getElementById('demo-paste').addEventListener('click', function () {
    document.getElementById('ingredients-input').value = DEMO_INGREDIENTS;
    analyzePasted();
  });
})();
