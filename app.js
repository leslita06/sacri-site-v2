(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // menu
  var nav = $('#nav'), bur = $('#burger');
  bur.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    bur.setAttribute('aria-expanded', o);
    bur.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); bur.setAttribute('aria-expanded', false); }); });

  // en-tête au défilement
  var top = $('#top');
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // rubrique active dans le menu
  var links = $$('#nav a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secObs.observe(s); });
  }

  // apparitions sobres
  var rv = $$('.rv');
  function countUp(el) {
    var end = +el.dataset.count; if (!end || el.dataset.plain) return;
    var t0 = null, dur = 900;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(countUp);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { obs.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // filtres STIHL
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.tab').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('on'); t.setAttribute('aria-selected', 'true');
      var f = t.dataset.f;
      $$('#machines article').forEach(function (a) {
        var show = f === 'all' || a.dataset.c === f;
        a.classList.toggle('hide', !show);
        a.classList.remove('pop'); if (show) { void a.offsetWidth; a.classList.add('pop'); }
      });
    });
  });

  // demande de devis : le message est préparé, la personne l'envoie elle-même
  var m = $('#modal'), msg = $('#m-msg'), mail = $('#m-mail'), copy = $('#m-copy');
  function open(txt) {
    msg.textContent = txt;
    mail.href = 'mailto:commercial@sacri-ci.com?subject=' + encodeURIComponent('Demande de devis') + '&body=' + encodeURIComponent(txt);
    copy.lastChild.textContent = 'Copier';
    m.hidden = false;
  }
  function close() { m.hidden = true; }
  $('#m-close').addEventListener('click', close);
  m.addEventListener('click', function (e) { if (e.target === m) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  copy.addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(msg.textContent).then(function () { copy.lastChild.textContent = 'Copié'; });
  });
  $$('[data-devis]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.dataset.devis;
      open('Bonjour SACRI,\nJe souhaite un devis' + (p ? ' pour : ' + p : '') + '.\nMerci de me recontacter.');
    });
  });
  $('#devis-form').addEventListener('submit', function (e) {
    e.preventDefault(); var d = new FormData(e.target);
    open('Bonjour SACRI,\nJe suis ' + d.get('nom') + (d.get('soc') ? ' (' + d.get('soc') + ')' : '') + '.\nJe souhaite un devis pour :\n' + d.get('besoin'));
  });
})();
