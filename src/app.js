/* RebotHub: progressive enhancement only. No tracking, no third-party calls.
   JS-owned CSS classes: js, is-scrolled, is-open, tilting, reveal, in, paused. Keep in sync with styles.css.
   Markup contract checked by `node build.js --check`: .header .nav-toggle .search-toggle .nav-item[data-mega] .searchbox .results */
(function () {
  'use strict';
  var CONFIG = {
    mobileBreakpoint: 900,   /* keep equal to the max-width media queries in styles.css */
    hoverCloseMs: 160,       /* delay before a hover-opened menu closes */
    hoverClickGuardMs: 350,  /* a click this soon after hover-open must not toggle it shut */
    blurCloseMs: 150,        /* search results stay open long enough for a tap to land */
    scrolledOn: 24, scrolledOff: 4,  /* hysteresis so the header does not flicker */
    resultsMax: 7, popularMax: 4,
    tiltX: 7, tiltY: 9,
    revealFallbackMs: 2500
  };
  var doc = document, root = doc.documentElement;
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mobile = function () { return window.matchMedia && matchMedia('(max-width: ' + CONFIG.mobileBreakpoint + 'px)').matches; };

  /* ---- header: compact + shadow on scroll, drawer toggle ---- */
  var header = doc.querySelector('.header');
  var toggle = doc.querySelector('.nav-toggle');
  var searchToggle = doc.querySelector('.search-toggle');
  if (header) {
    var scrolled = false;
    var onScroll = function () {
      var y = window.scrollY;
      if (!scrolled && y > CONFIG.scrolledOn) scrolled = true;
      else if (scrolled && y < CONFIG.scrolledOff) scrolled = false;
      header.classList.toggle('is-scrolled', scrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  function setDrawer(open) {
    if (!header) return;
    header.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle) toggle.addEventListener('click', function () { setDrawer(!header.classList.contains('is-open')); });
  if (searchToggle) searchToggle.addEventListener('click', function () {
    setDrawer(true);
    var i = doc.getElementById('q-drw'); if (i) i.focus();
  });

  /* ---- mega menus ---- */
  var items = Array.prototype.slice.call(doc.querySelectorAll('.nav-item[data-mega]'));
  var closeTimer = null;
  function setOpen(item, open) {
    var btn = item.querySelector('.nav-link'), panel = item.querySelector('.mega');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }
  function closeAll(except) { items.forEach(function (it) { if (it !== except) setOpen(it, false); }); }
  function anyOpen() { return !!doc.querySelector('.nav-link[aria-expanded="true"]'); }
  items.forEach(function (item) {
    var btn = item.querySelector('.nav-link');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      if (!open && item._hoverAt && Date.now() - item._hoverAt < CONFIG.hoverClickGuardMs) return; /* hover just opened it */
      closeAll(item); setOpen(item, open);
    });
    item.addEventListener('pointerenter', function (e) {
      if (!fine || mobile() || e.pointerType === 'touch') return;
      clearTimeout(closeTimer); closeAll(item); setOpen(item, true); item._hoverAt = Date.now();
    });
    item.addEventListener('pointerleave', function (e) {
      if (!fine || mobile() || e.pointerType === 'touch') return;
      closeTimer = setTimeout(function () { setOpen(item, false); }, CONFIG.hoverCloseMs);
    });
    item.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) setOpen(item, false);
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.nav-item[data-mega]')) closeAll(null);
  });
  /* Escape closes any open menu (hover or focus), WCAG 1.4.13; then the drawer if no menu was open. */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (anyOpen()) {
      var openBtn = doc.querySelector('.nav-link[aria-expanded="true"]');
      var inside = openBtn && openBtn.closest('.nav-item').contains(doc.activeElement);
      closeAll(null);
      if (inside && openBtn) openBtn.focus();
    } else if (header && header.classList.contains('is-open')) {
      setDrawer(false); if (toggle && toggle.offsetParent !== null) toggle.focus();
    }
  });

  /* ---- live search (combobox) ---- */
  var sc = doc.currentScript || doc.querySelector('script[data-search]');
  var indexUrl = sc && sc.getAttribute('data-search');
  var INDEX = null, FAILED = false, loading = null;
  function loadIndex() {
    if (INDEX || loading || !indexUrl) return loading;
    loading = fetch(indexUrl).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (j) { INDEX = j; })
      .catch(function () { INDEX = []; FAILED = true; });
    return loading;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { return typeof u === 'string' && u.charAt(0) === '/' && u.charAt(1) !== '/' ? u : '/'; }
  function score(entry, terms) {
    var hay = entry.x, s = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], at = hay.indexOf(t);
      if (at < 0) return 0;
      s += entry.t.toLowerCase().indexOf(t) >= 0 ? 6 : 2;
      if (at === 0) s += 1;
    }
    return s;
  }
  function wireSearch(box) {
    var input = box.querySelector('input[type="search"]'), form = box.querySelector('form'), list = box.querySelector('.results'), live = box.querySelector('.sr');
    if (!input || !list) return;
    var active = -1, shown = [], blurTimer = null;
    function announce(t) { if (live) live.textContent = t; }
    function li(e, i) {
      return '<li role="option" id="' + list.id + '-o' + i + '" aria-selected="false"><a href="' + esc(safeUrl(e.u)) + '"><span><span class="t">' + esc(e.t) + '</span><span class="s">' + esc(e.s) + '</span></span><span class="k">' + esc(e.k) + '</span></a></li>';
    }
    function show(html) { list.innerHTML = html; list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
    function render(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      active = -1; input.removeAttribute('aria-activedescendant');
      if (!INDEX) { close(); return; }
      if (FAILED) { shown = []; show('<li class="none" role="presentation">Search is unavailable right now. <a href="' + esc(safeUrl(form.getAttribute('action'))) + '">Browse all robots</a>.</li>'); announce('Search is unavailable'); return; }
      if (!terms.length) {
        shown = INDEX.filter(function (e) { return e.p; }).slice(0, CONFIG.popularMax);
        if (!shown.length) { close(); return; }
        show('<li class="none label" role="presentation">Common starting points</li>' + shown.map(li).join(''));
        announce(shown.length + ' suggestions'); return;
      }
      shown = INDEX.map(function (e) { return { e: e, s: score(e, terms) }; }).filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; }).slice(0, CONFIG.resultsMax).map(function (r) { return r.e; });
      if (shown.length) { show(shown.map(li).join('')); announce(shown.length + (shown.length === 1 ? ' result' : ' results')); }
      else { show('<li class="none" role="presentation">No match. <a href="' + esc(safeUrl(form.getAttribute('action'))) + '">Browse all robots</a> or <a href="' + esc(safeUrl(indexUrl.replace('search.json', 'report/'))) + '">tell us what is missing</a>.</li>'); announce('No results'); }
    }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
    function mark(i) {
      var opts = list.querySelectorAll('[role="option"]');
      opts.forEach(function (o, n) { o.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
      if (opts[i]) input.setAttribute('aria-activedescendant', opts[i].id); else input.removeAttribute('aria-activedescendant');
    }
    /* Keep focus in the input while the pointer is pressed on a result (Safari does not focus links on click). */
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    input.addEventListener('focus', function () { var p = loadIndex(); if (p) p.then(function () { render(input.value); }); else render(input.value); });
    input.addEventListener('input', function () { var p = loadIndex(); if (p) p.then(function () { render(input.value); }); else render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !list.hidden) { close(); e.stopPropagation(); return; }
      if (list.hidden) { if (e.key === 'ArrowDown') { render(input.value); } return; }
      var n = list.querySelectorAll('[role="option"]').length;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, n - 1); mark(active); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); mark(active); }
      else if (e.key === 'Enter' && active >= 0 && shown[active]) { e.preventDefault(); window.location.href = safeUrl(shown[active].u); }
    });
    doc.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    box.addEventListener('focusout', function () {
      clearTimeout(blurTimer);
      blurTimer = setTimeout(function () { if (!box.contains(doc.activeElement)) close(); }, CONFIG.blurCloseMs);
    });
  }
  doc.querySelectorAll('.searchbox').forEach(wireSearch);

  /* chips fill the hero search */
  doc.querySelectorAll('[data-fill]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var input = doc.querySelector('.hero .searchbox input'); if (!input) return;
      e.preventDefault(); input.value = a.getAttribute('data-fill'); input.focus(); input.dispatchEvent(new Event('input'));
    });
  });

  /* ---- list filter (robots/guides pages), with ?q= prefill ---- */
  var input = doc.querySelector('[data-filter-input]');
  var list = doc.querySelector('[data-filter-list]');
  var count = doc.querySelector('[data-filter-count]');
  if (input && list) {
    var qp = new URLSearchParams(window.location.search).get('q');
    if (qp) input.value = qp;
    var els = Array.prototype.slice.call(list.children);
    var empty = doc.querySelector('[data-filter-empty]');
    var apply = function () {
      var q = input.value.trim().toLowerCase(), shown = 0;
      els.forEach(function (el) {
        var hay = (el.getAttribute('data-search') || el.textContent).toLowerCase();
        var hit = !q || q.split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
        el.hidden = !hit; if (hit) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' result' : ' results');
      if (empty) empty.hidden = shown !== 0;
    };
    input.addEventListener('input', apply); apply();
  }

  /* ---- 3D tilt + glare on pointer devices ---- */
  if (fine && !calm) {
    doc.querySelectorAll('.card, .tile, .how > div').forEach(function (el) {
      var raf = 0;
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.add('tilting');
          el.style.setProperty('--rx', ((0.5 - y) * CONFIG.tiltX).toFixed(2) + 'deg');
          el.style.setProperty('--ry', ((x - 0.5) * CONFIG.tiltY).toFixed(2) + 'deg');
          el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf); el.classList.remove('tilting');
        el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
      });
    });
  }

  /* ---- scroll reveal (content stays visible without JS or IntersectionObserver) ---- */
  var targets = doc.querySelectorAll('main .section, main .page-head, main .trustbar, main .hero');
  if (!calm && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.04, rootMargin: '0px 0px -30px 0px' });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
    /* safety net: never leave content hidden if the observer does not fire (background tab, odd renderer) */
    setTimeout(function () { targets.forEach(function (t) { t.classList.add('in'); }); }, CONFIG.revealFallbackMs);
  }

  /* pause decorative animation when the tab is hidden */
  doc.addEventListener('visibilitychange', function () { root.classList.toggle('paused', doc.hidden); });

  /* Lite YouTube: load the iframe only on click, nocookie domain. */
  doc.querySelectorAll('.lite-yt').forEach(function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-id');
      if (!id || el.querySelector('iframe')) return;
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true; f.title = el.getAttribute('aria-label') || 'Video';
      el.appendChild(f);
    });
  });

  /* Forms without an endpoint are shown as pending; never fake a submit. */
  doc.querySelectorAll('form[data-endpoint=""]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); });
  });
})();
