(function(){
  var nav=document.getElementById('nav'),bur=document.getElementById('burger');
  bur.addEventListener('click',function(){var o=nav.classList.toggle('open');bur.setAttribute('aria-expanded',o)});
  nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open')})});
  // filtres STIHL
  document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on')});t.classList.add('on');
    var f=t.dataset.f;document.querySelectorAll('#machines article').forEach(function(a){a.classList.toggle('hide',f!=='all'&&a.dataset.c!==f)});
  })});
  // devis WhatsApp (démonstration : rien n'est envoyé)
  var m=document.getElementById('modal'),msg=document.getElementById('m-msg');
  function open(txt){msg.textContent=txt;m.hidden=false}
  document.getElementById('m-close').addEventListener('click',function(){m.hidden=true});
  m.addEventListener('click',function(e){if(e.target===m)m.hidden=true});
  document.querySelectorAll('[data-devis]').forEach(function(b){b.addEventListener('click',function(){
    var p=b.dataset.devis;
    open('Bonjour SACRI,\nJe souhaite un devis'+(p?' pour : '+p:'')+'.\nMerci de me recontacter.');
  })});
  document.getElementById('devis-form').addEventListener('submit',function(e){
    e.preventDefault();var d=new FormData(e.target);
    open('Bonjour SACRI,\nJe suis '+d.get('nom')+(d.get('soc')?' ('+d.get('soc')+')':'')+'.\nJe souhaite un devis pour :\n'+d.get('besoin'));
  });
})();
