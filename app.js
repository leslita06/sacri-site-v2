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
