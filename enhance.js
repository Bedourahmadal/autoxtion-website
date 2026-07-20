/* Autoxtion site enhancements — form UX + mobile layout tidy.
   Injected after the page's own runtime renders; re-applies on re-render via MutationObserver. */
(function () {
  var EN = /EN\.html/i.test(location.pathname);

  var COUNTRIES = [
    ['+966','🇸🇦'], ['+971','🇦🇪'], ['+973','🇧🇭'],
    ['+965','🇰🇼'], ['+974','🇶🇦'], ['+968','🇴🇲'],
    ['+20','🇪🇬'], ['+962','🇯🇴'], ['+961','🇱🇧'],
    ['+964','🇮🇶'], ['+970','🇵🇸'], ['+963','🇸🇾'],
    ['+249','🇸🇩'], ['+212','🇲🇦'], ['+213','🇩🇿'],
    ['+216','🇹🇳'], ['+90','🇹🇷'], ['+44','🇬🇧'],
    ['+1','🇺🇸']
  ];
  var PURPOSES = EN
    ? ['Platform demo', 'Pricing & packages', 'Training for my organization', 'Partnership / reseller', 'General inquiry']
    : ['عرض تجريبي للمنصة', 'معرفة الأسعار والباقات', 'تدريب موظفي منشأتي', 'شراكة أو توزيع', 'استفسار عام'];
  var PURPOSE_PH = EN ? 'How can we help you?' : 'ما الذي يهمّك؟';
  var PURPOSE_LABEL = EN ? 'How can we help you?' : 'كيف نقدر نساعدك؟';

  function injectStyle() {
    if (document.getElementById('ax-enh-style')) return;
    var s = document.createElement('style');
    s.id = 'ax-enh-style';
    s.textContent =
      '@media(max-width:860px){' +
      '.ax-plat-img{order:-1 !important;margin-bottom:6px;}' +
      '.ax-hiw-cell{min-height:150px !important;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:flex-start !important;}' +
      '}';
    document.head.appendChild(s);
  }

  function enhanceForm(form) {
    if (!form || form.dataset.axf) return;
    var phone = form.querySelector('input[name="phone"]');
    if (!phone) return;
    form.dataset.axf = '1';

    // Country code selector combined into the phone number on submit
    if (!form.querySelector('select.ax-code')) {
      phone.value = '';
      phone.setAttribute('placeholder', '5X XXX XXXX');
      var sel = document.createElement('select');
      sel.className = 'ax-code';
      sel.name = 'phone_code';
      sel.setAttribute('dir', 'ltr');
      sel.setAttribute('aria-label', 'Country code');
      sel.style.cssText = 'padding:11px 8px;border:1.5px solid #dbe3e1;border-radius:10px;font-size:14px;font-family:inherit;background:#fff;color:#2a3b38;flex:0 0 auto;max-width:122px;outline:none';
      COUNTRIES.forEach(function (c) {
        var o = document.createElement('option');
        o.value = c[0]; o.textContent = c[1] + ' ' + c[0];
        sel.appendChild(o);
      });
      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:8px;align-items:stretch';
      phone.parentNode.insertBefore(wrap, phone);
      wrap.appendChild(sel); wrap.appendChild(phone);
      phone.style.flex = '1 1 auto'; phone.style.width = 'auto'; phone.style.minWidth = '0';
    }

    // Notes free-text -> clear purpose dropdown
    var notes = form.querySelector('textarea[name="notes"], textarea[name="message"]');
    if (notes) {
      var ps = document.createElement('select');
      ps.name = notes.getAttribute('name') || 'notes';
      ps.setAttribute('dir', EN ? 'ltr' : 'rtl');
      ps.style.cssText = (notes.getAttribute('style') || '') + ';background:#fff;color:#2a3b38';
      var o0 = document.createElement('option');
      o0.value = ''; o0.textContent = PURPOSE_PH;
      ps.appendChild(o0);
      PURPOSES.forEach(function (t) {
        var o = document.createElement('option'); o.value = t; o.textContent = t; ps.appendChild(o);
      });
      notes.parentNode.replaceChild(ps, notes);
      var lab = ps.closest('label');
      if (lab) {
        for (var i = 0; i < lab.childNodes.length; i++) {
          var n = lab.childNodes[i];
          if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = PURPOSE_LABEL; break; }
        }
      }
    }
  }

  function findSection(re) {
    var heads = document.querySelectorAll('h1,h2,h3');
    for (var i = 0; i < heads.length; i++) {
      if (re.test(heads[i].textContent)) return heads[i].closest('section');
    }
    return null;
  }

  function fixHowItWorks() {
    var sec = findSection(/طريقة العمل|How We Work|How it works/i);
    if (!sec) return;
    var all = sec.querySelectorAll('*'), grid = null;
    for (var j = 0; j < all.length; j++) {
      var cs = getComputedStyle(all[j]);
      if (cs.display === 'grid' && all[j].children.length >= 4) { grid = all[j]; break; }
    }
    if (!grid || grid.dataset.axhiw) return;
    grid.dataset.axhiw = '1';
    for (var k = 0; k < grid.children.length; k++) grid.children[k].classList.add('ax-hiw-cell');
  }

  function fixPlatform() {
    var sec = findSection(/منصة تدريب|Smart Training Platform/i);
    if (!sec) return;
    var all = sec.querySelectorAll('*'), fr = null;
    for (var j = 0; j < all.length; j++) {
      var cs = getComputedStyle(all[j]);
      if (cs.display === 'flex' && all[j].children.length === 2 && all[j].querySelector('image-slot,img')) { fr = all[j]; break; }
    }
    if (!fr || fr.dataset.axplat) return;
    fr.dataset.axplat = '1';
    for (var c = 0; c < fr.children.length; c++) {
      if (fr.children[c].querySelector('image-slot,img')) { fr.children[c].classList.add('ax-plat-img'); break; }
    }
  }

  function run() {
    injectStyle();
    var f = document.querySelector('form');
    if (f) enhanceForm(f);
    fixHowItWorks();
    fixPlatform();
  }

  var t = null;
  new MutationObserver(function () {
    if (t) return;
    t = setTimeout(function () { t = null; run(); }, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
