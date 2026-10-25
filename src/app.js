/* RebotHub: tiny progressive enhancement. No tracking, no external calls. */
(function () {
  'use strict';
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('navigation');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Live filter for any list with data-filter-list, driven by an input with data-filter-input. */
  var input = document.querySelector('[data-filter-input]');
  var list = document.querySelector('[data-filter-list]');
  var count = document.querySelector('[data-filter-count]');
  if (input && list) {
    var items = Array.prototype.slice.call(list.children);
    var empty = document.querySelector('[data-filter-empty]');
    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (el) {
        var hay = (el.getAttribute('data-search') || el.textContent).toLowerCase();
        var hit = !q || hay.indexOf(q) !== -1;
        el.hidden = !hit;
        if (hit) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' result' : ' results');
      if (empty) empty.hidden = shown !== 0;
    };
    input.addEventListener('input', apply);
    apply();
  }

  /* Lite YouTube: load the iframe only on click, nocookie domain. */
  document.querySelectorAll('.lite-yt').forEach(function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-id');
      if (!id || el.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      f.title = el.getAttribute('aria-label') || 'Video';
      el.appendChild(f);
    });
  });

  /* Forms without an endpoint are shown as pending; never fake a submit. */
  document.querySelectorAll('form[data-endpoint=""]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); });
  });
})();
