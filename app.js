(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CAT = window.SACRI_CAT || 'https://leslita06.github.io/sacri-catalogue/';
  var WA = 'https://wa.me/?text=';

  /* ---------- en-tête, menu mobile et méga-menus ---------- */
  var nav = $('#nav'), bur = $('#burger'), top = $('#top');
  function closeMegas(except) { $$('.mi-btn').forEach(function (b) { if (b !== except) { b.setAttribute('aria-expanded', 'false'); b.parentNode.classList.remove('open'); } }); }
  $$('.mi-btn').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var o = b.getAttribute('aria-expanded') !== 'true';
      closeMegas(b); b.setAttribute('aria-expanded', o); b.parentNode.classList.toggle('open', o);
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.mi-item')) closeMegas(); if (!e.target.closest('#hs')) closeSugg(); });
  bur.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    bur.setAttribute('aria-expanded', o); bur.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('nav-open', o);
    if (!o) closeMegas();
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); document.body.classList.remove('nav-open'); bur.setAttribute('aria-expanded', 'false'); closeMegas(); }); });
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- recherche de pièce dans l'en-tête, branchée sur le catalogue ---------- */
  var IDX = window.SACRI_IDX || [];
  var hs = $('#hs'), hq = $('#hq'), sg = $('#hs-sugg');
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function closeSugg() { if (sg) { sg.hidden = true; hq.setAttribute('aria-expanded', 'false'); } }
  function catUrl(q) { return CAT + '#/catalogue?q=' + encodeURIComponent(q).replace(/%20/g, '+'); }
  function itemUrl(id) { return id.indexOf('m:') === 0 ? CAT + '#/machine/' + id.slice(2) : CAT + '#/article/' + id; }
  if (hs) {
    hq.addEventListener('input', function () {
      var q = norm(hq.value);
      if (q.length < 2) { closeSugg(); return; }
      var words = q.split(' ');
      var res = IDX.map(function (r) { var t = norm(r[1] + ' ' + r[0].replace('m:', '') + ' ' + r[2]); var sc = 0; words.forEach(function (w) { if (t.indexOf(w) > -1) sc += (t.indexOf(w) === 0 ? 3 : 2); else if (w.length > 3 && t.indexOf(w.slice(0, 4)) > -1) sc += 1; }); return [sc, r]; })
        .filter(function (x) { return x[0] >= words.length; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 6);
      sg.innerHTML = res.map(function (x) { var r = x[1]; return '<a class="sg" role="option" href="' + itemUrl(r[0]) + '"><b>' + esc(r[1]) + '</b><small>' + esc(r[2]) + (r[0].indexOf('m:') ? ', réf. ' + esc(r[0]) : '') + '</small></a>'; }).join('') +
        '<a class="sg sg-all" role="option" href="' + catUrl(hq.value.trim()) + '">Voir tous les résultats pour « ' + esc(hq.value.trim()) + ' »</a>';
      sg.hidden = false; hq.setAttribute('aria-expanded', 'true');
    });
    hq.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSugg(); });
    hs.addEventListener('submit', function (e) { e.preventDefault(); var q = hq.value.trim(); location.href = q ? catUrl(q) : CAT; });
  }

  /* ---------- onglets (métiers et usages) ---------- */
  function tabs(sel, attr, prefix) {
    var bs = $$(sel);
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        bs.forEach(function (o) { var on = o === b; o.classList.toggle('on', on); o.setAttribute('aria-selected', on); var p = $('#' + prefix + o.dataset[attr]); if (p) p.hidden = !on; });
      });
      b.addEventListener('keydown', function (e) {
        var i = bs.indexOf(b), n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -9;
        if (n === -9) return; n = (n + bs.length) % bs.length; bs[n].focus(); bs[n].click(); e.preventDefault();
      });
    });
  }
  tabs('[data-tab]', 'tab', 'met-');
  tabs('[data-use]', 'use', 'use-');
  $$('.use-p').forEach(function (p) {
    $$('[data-show]', p).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-show]', p).forEach(function (o) { o.classList.toggle('on', o === b); o.setAttribute('aria-pressed', o === b); });
        $$('.feat', p).forEach(function (f) { f.hidden = f.dataset.m !== b.dataset.show; });
      });
    });
  });

  /* ---------- fenêtres ---------- */
  function openM(m) { m.hidden = false; var f = $('.x', m); if (f) f.focus(); }
  function closeM(m) { m.hidden = true; }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) closeM(m); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $$('.modal').forEach(closeM); closeMegas(); } });

  /* ---------- demande de devis : message préparé, la personne l'envoie ---------- */
  var m = $('#modal');
  function devis(txt) {
    if (!m) return;
    $('#m-msg').textContent = txt;
    $('#m-mail').href = 'mailto:commercial@sacri-ci.com?subject=' + encodeURIComponent('Demande de devis') + '&body=' + encodeURIComponent(txt);
    $('#m-wa').href = WA + encodeURIComponent(txt);
    $('#m-copy span').textContent = 'Copier';
    openM(m);
  }
  if (m) $('#m-copy').addEventListener('click', function () {
    var t = $('#m-msg').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { $('#m-copy span').textContent = 'Copié'; });
  });
  $$('[data-devis]').forEach(function (b) { b.addEventListener('click', function () { devis('Bonjour SACRI,\nJe souhaite un devis pour : ' + b.dataset.devis + '.\nMerci de me recontacter.'); }); });
  var df = $('#devis-form');
  if (df) df.addEventListener('submit', function (e) {
    e.preventDefault(); var d = new FormData(df);
    var dest = d.get('dest'); dest = dest && dest !== 'Je ne sais pas' ? ' (société concernée : ' + dest + ')' : '';
    devis('Bonjour SACRI,\nJe suis ' + d.get('nom') + (d.get('soc') ? ', ' + d.get('soc') : '') + '.\nJe souhaite un devis' + dest + ' pour :\n' + d.get('besoin'));
  });

  /* ---------- atelier : dépôt de machine, confirmé par WhatsApp ---------- */
  var af = $('#at-form');
  function pad(n) { return ('000' + n).slice(-4); }
  function fmtDate(v) { if (!v) return ''; var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  var store = { get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  if (af) {
    var jour = af.elements.jour, JS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    for (var di = 1, nb = 0; nb < 12 && di < 20; di++) {
      var t = new Date(); t.setDate(t.getDate() + di);
      if (t.getDay() === 0) continue;
      var o = document.createElement('option');
      o.value = t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate());
      o.textContent = JS[t.getDay()] + ' ' + p2(t.getDate()) + '/' + p2(t.getMonth() + 1) + '/' + t.getFullYear();
      jour.appendChild(o); nb++;
    }
    jour.options[0].textContent = 'Choisir un jour';
    af.elements.photo.addEventListener('change', function () { var f = this.files[0]; $('#at-file').textContent = f ? f.name + ', à joindre dans WhatsApp' : "facultatif, à joindre ensuite dans WhatsApp"; });
    af.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(af), miss = [];
      if (!d.get('machine')) miss.push('la machine'); if (!d.get('pb')) miss.push('le problème');
      if (!d.get('jour')) miss.push('le jour'); if (!d.get('creneau')) miss.push('le créneau');
      if (!String(d.get('nom') || '').trim()) miss.push('votre nom'); if (!String(d.get('tel') || '').trim()) miss.push('votre téléphone');
      var err = $('#at-err');
      if (miss.length) { err.textContent = 'Il manque ' + miss.join(', ') + '.'; err.hidden = false; return; }
      err.hidden = true;
      var n = 'AT-26-' + pad(Math.floor(200 + Math.random() * 9700));
      var txt = 'Bonjour SACRI,\nJe souhaite déposer ma machine à l\'atelier.\nDossier : ' + n + '\nMachine : ' + d.get('machine') + '\nProblème : ' + d.get('pb') + (String(d.get('detail')).trim() ? ', ' + String(d.get('detail')).trim() : '') +
        '\nDépôt : ' + fmtDate(d.get('jour')) + ', ' + d.get('creneau').toLowerCase() + '\nNom : ' + d.get('nom') + '\nTéléphone : ' + d.get('tel') + (d.get('photo') && d.get('photo').name ? '\nPhoto : je la joins à ce message.' : '');
      store.set('sacri-at', { n: n, machine: d.get('machine'), pb: d.get('pb'), jour: fmtDate(d.get('jour')) });
      $('#ok-n').textContent = n; $('#ok-msg').textContent = txt; $('#ok-wa').href = WA + encodeURIComponent(txt);
      openM($('#at-ok'));
    });
    $('#ok-track').addEventListener('click', function () { closeM($('#at-ok')); $('#tr-n').value = $('#ok-n').textContent; track(); $('#suivi').scrollIntoView({ block: 'center' }); });
  }

  /* ---------- suivi de réparation (démonstration) ---------- */
  var DEMO = { 'AT-26-0142': { machine: 'STIHL MS 661 C-M', pb: 'Perte de puissance', jour: '18/11/2026', step: 2, note: 'Diagnostic fait : filtre à air colmaté et bougie usée. Pièces en stock.' } };
  var STEPS = ['Machine reçue', 'Diagnostic', 'Réparation', 'Prête à retirer'];
  function track() {
    var v = $('#tr-n').value.trim().toUpperCase().replace(/\s+/g, ''), out = $('#tr-out');
    var own = store.get('sacri-at'), r = DEMO[v] || (own && own.n === v ? { machine: own.machine, pb: own.pb, jour: own.jour, step: -1, note: 'Dossier préparé. Il sera ouvert quand l\'atelier aura reçu votre message et votre machine.' } : null);
    if (!v) { out.innerHTML = ''; return; }
    if (!r) { out.innerHTML = '<p class="tr-no">Aucun dossier « ' + esc(v) + ' » dans cette démonstration. Vérifiez le numéro, ou essayez AT-26-0142.</p>'; return; }
    out.innerHTML = '<div class="tr-card"><div class="tr-h"><b>' + esc(v) + '</b><span>' + esc(r.machine) + '</span></div>' +
      '<ol class="tl">' + STEPS.map(function (s, i) { return '<li class="' + (i < r.step ? 'done' : i === r.step ? 'cur' : '') + '"><span></span>' + s + '</li>'; }).join('') + '</ol>' +
      '<p class="tr-note">' + esc(r.note) + '</p><small>' + esc(r.pb) + (r.jour ? ', dépôt du ' + esc(r.jour) : '') + '</small></div>';
  }
  var tf = $('#tr-form');
  if (tf) {
    tf.addEventListener('submit', function (e) { e.preventDefault(); track(); });
    $$('[data-try]').forEach(function (b) { b.addEventListener('click', function () { $('#tr-n').value = b.dataset.try; track(); }); });
  }

  /* ---------- v7 : pause de la vidéo et du mur de logos ---------- */
  var hv = $('#hero-v'), hp = $('#hero-pp');
  if (hv && hp) {
    var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function setV(paused) { hp.setAttribute('aria-pressed', paused); hp.setAttribute('aria-label', paused ? 'Relancer la vidéo' : 'Mettre la vidéo en pause'); }
    if (rm) { hv.removeAttribute('autoplay'); hv.pause(); setV(true); }
    hp.addEventListener('click', function () { if (hv.paused) { hv.play(); setV(false); } else { hv.pause(); setV(true); } });
  }
  var mq = $('#marquee'), mp = $('#mq-pp');
  if (mq && mp) mp.addEventListener('click', function () { var on = !mq.classList.contains('paused'); mq.classList.toggle('paused', on); mp.setAttribute('aria-pressed', on); $('span', mp).textContent = on ? 'Relancer le défilement' : 'Arrêter le défilement'; });
})();
