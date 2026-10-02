/* Site menu: open/close, dark glass over dark sections, halftone edge (after MD.htDraw from docs/menu-desk/v111.js). */
(function(){
  var html = document.documentElement, bar = document.getElementById('mz'), btn = document.getElementById('mz-burger'),
      panel = document.getElementById('mz-panel'), back = document.getElementById('mz-back');
  if (!bar) return;
  var OCHRE = '#EFB01F', INK = '#1F2120', R = 230, P = 10;   /* R – ширина растра; на узкой полосе меньше */
  function isOpen(){ return html.classList.contains('mz-open'); }
  function setH(){ bar.style.setProperty('--mz-h', panel.getBoundingClientRect().height + 'px'); }
  function open(){ setH(); bar.classList.remove('mz-dark'); html.classList.add('mz-open'); btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Закрыть меню'); refit(); }
  function close(){ html.classList.remove('mz-open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Открыть меню'); tone(); }
  btn.addEventListener('click', function(){ isOpen() ? close() : open(); });
  back.addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && isOpen()) { close(); btn.focus(); } });
  panel.addEventListener('click', function(e){ var a = e.target.closest('a'); if (a && (a.getAttribute('href') || '').charAt(0) === '#') close(); });

  /* glass turns dark over dark sections (the black hero, dark panels, footer) */
  function lum(c){ var m = c.match(/[\d.]+/g); if (!m) return -1; if (m.length > 3 && +m[3] < .05) return -1;
    return (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; }
  function tone(){
    if (isOpen() || !document.elementsFromPoint) return;
    var r = bar.getBoundingClientRect(), els = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2), dark = false;
    for (var i = 0; i < els.length; i++) {
      var e = els[i]; if (bar.contains(e) || e === back) continue;
      for (var n = e; n && n.nodeType === 1; n = n.parentElement) { var L = lum(getComputedStyle(n).backgroundColor); if (L >= 0) { dark = L < .35; break; } }
      break;
    }
    bar.classList.toggle('mz-dark', dark);
  }
  var tk = 0;
  window.addEventListener('scroll', function(){ if (!tk) tk = requestAnimationFrame(function(){ tk = 0; tone(); }); }, { passive:true });

  /* halftone: ochre share c = 0..1 in every point; c > .5 solid ochre with black diamond holes, c < .5 single ochre diamonds */
  var cta = bar.querySelector('.mz-cta'), cur = cta.querySelector('.mz-cta-cur'), lab = cta.querySelector('.mz-cta-t'),
      cv = cur.querySelector('canvas'), cx = cv.getContext('2d');
  function ramp(v){ v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); }
  function cov(x){ return ramp((R - x) / R); }
  function dia(x, y, s){ cx.beginPath(); cx.moveTo(x, y - s); cx.lineTo(x + s, y); cx.lineTo(x, y + s); cx.lineTo(x - s, y); cx.closePath(); cx.fill(); }
  function draw(W, H){
    var i, j, x, y, c, s;
    cx.fillStyle = OCHRE;
    for (j = 0; j * P < H + P; j++) for (i = 0; i * P < W + P; i++) {
      x = i * P; y = j * P; c = cov(x); if (c <= .01) continue;
      if (c >= .5) cx.fillRect(x - P / 2, y - P / 2, P, P); else { s = P * Math.sqrt(c / 2); dia(x, y, s); }
    }
    cx.fillStyle = INK;
    for (j = 0; j * P < H + P; j++) for (i = 0; i * P < W + P; i++) {
      x = (i + .5) * P; y = (j + .5) * P; c = cov(x); if (c <= .3 || c >= .995) continue;
      s = Math.min(P / 2, P * Math.sqrt((1 - c) / 2)); dia(x, y, s);
    }
  }
  function place(){
    var sr = cta.getBoundingClientRect(); if (!sr.width) return false;
    var rg = document.createRange(); rg.selectNodeContents(lab);
    var narrow = sr.width < 560, tw = rg.getBoundingClientRect().width;
    R = narrow ? 70 : 230; P = narrow ? 8 : 10;
    cta.style.setProperty('--cl', Math.round(Math.min(tw + (narrow ? 40 : 80), sr.width * (narrow ? .72 : .55))) + 'px');
    return true;
  }
  function refit(){
    if (!place()) return;
    var r = cur.getBoundingClientRect(), W = Math.min(r.width, R + 2 * P), H = r.height, dpr = window.devicePixelRatio || 1;
    if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); draw(W, H);
  }
  window.addEventListener('resize', function(){ refit(); if (isOpen()) setH(); tone(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ refit(); if (isOpen()) setH(); });
  refit(); tone();
})();
