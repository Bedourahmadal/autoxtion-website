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
    ? ['Platform demo', 'Pricing & packages', 'Training for my organization', 'General inquiry']
    : ['عرض تجريبي للمنصة', 'معرفة الأسعار والباقات', 'تدريب موظفي منشأتي', 'استفسار عام'];
  var PURPOSE_PH = EN ? 'How can we help you?' : 'ما الذي يهمّك؟';
  var PURPOSE_LABEL = EN ? 'How can we help you?' : 'كيف نقدر نساعدك؟';
  var OTHER_VAL = EN ? 'Other' : 'أخرى';
  var NOTES_LABEL = EN ? 'Notes / your inquiry (optional)' : 'ملاحظات أو استفسارك (اختياري)';
  var NOTES_PH = EN ? 'If you chose "Other", write your inquiry here...' : 'إذا اخترت "أخرى" اكتب استفسارك هنا...';

  // Details shown when a sector card or training-scenario is clicked
  var DETAILS = EN ? {
    "Fuel Stations": "We train fuel-station teams on safe fuel handling, fire prevention, and emergency response through realistic simulations that boost readiness and reduce incidents.",
    "Oil & Gas": "Advanced simulation programs for oil & gas facilities covering critical operations, operational safety, and emergency response in a fully safe virtual environment.",
    "Energy": "Training solutions for energy-sector facilities that improve operational efficiency and strengthen a culture of safety through immersive, interactive scenarios.",
    "Private Sector": "Flexible training solutions for private companies and facilities of all sizes, tailored to each organization's needs.",
    "Firefighting": "Realistic simulation of fire outbreaks with hands-on practice on containment, using fire equipment, and safe evacuation.",
    "Pump operation": "Training on the correct and safe operation of fuel pumps, including fault detection and handling.",
    "Tank handling": "Training on safe procedures for handling fuel tanks, inspection, and preventive maintenance.",
    "Fuel leak": "Simulation of fuel-leak situations with practice on rapid containment and environmental safety procedures.",
    "Safety procedures": "Building a strong safety culture through practice on protocols and preventive procedures in the workplace.",
    "Customer service": "Training staff on customer-service skills, professional communication, and handling different situations efficiently."
  } : {
    "محطات الوقود": "نُدرّب فرق محطات الوقود على التعامل الآمن مع الوقود، والوقاية من الحرائق، وإجراءات الطوارئ عبر محاكاة واقعية ترفع الجاهزية وتقلّل الحوادث.",
    "النفط والغاز": "برامج محاكاة متقدمة لمنشآت النفط والغاز تغطّي العمليات الحرجة والسلامة التشغيلية والاستجابة للطوارئ في بيئة افتراضية آمنة تمامًا.",
    "الطاقة": "حلول تدريب لمنشآت قطاع الطاقة ترفع كفاءة التشغيل وتعزّز ثقافة السلامة عبر سيناريوهات تفاعلية غامرة.",
    "القطاع الخاص": "حلول تدريب مرنة تناسب الشركات والمنشآت الخاصة بمختلف أحجامها، ومصمّمة حسب احتياج كل منشأة.",
    "مكافحة الحرائق": "محاكاة واقعية لاندلاع الحرائق والتدرّب على احتوائها واستخدام معدات الإطفاء وإجراءات الإخلاء الآمن.",
    "تشغيل المضخات": "تدريب على التشغيل الصحيح والآمن لمضخات الوقود واكتشاف الأعطال والتعامل معها.",
    "التعامل مع الخزانات": "تدريب على الإجراءات الآمنة للتعامل مع خزانات الوقود، والفحص، والصيانة الوقائية.",
    "تسرب الوقود": "محاكاة حالات تسرّب الوقود والتدرّب على الاحتواء السريع وإجراءات السلامة البيئية.",
    "إجراءات السلامة": "ترسيخ ثقافة السلامة عبر التدرّب على البروتوكولات والإجراءات الوقائية في بيئة العمل.",
    "خدمة العملاء": "تدريب الموظفين على مهارات خدمة العملاء والتواصل الاحترافي والتعامل مع المواقف المختلفة بكفاءة."
  };
  var BULLETS = EN ? {
    "Fuel Stations": ['Safe fuel and product handling', 'Fire and explosion prevention', 'Emergency and evacuation procedures'],
    "Oil & Gas": ['Critical field and refinery operations', 'Operational safety protocols', 'Response to gas leaks and fires'],
    "Energy": ['Operating and maintaining vital equipment', 'Operational risk management', 'Higher readiness and efficiency'],
    "Private Sector": ['Flexible programs by facility size', 'Scenarios tailored to your business', 'Per-employee performance reports'],
    "Firefighting": ['Identifying fire types', 'Using extinguishers and equipment', 'Safe evacuation and containment'],
    "Pump operation": ['Safely starting and stopping pumps', 'Detecting common faults', 'Preventive maintenance procedures'],
    "Tank handling": ['Inspecting and monitoring tanks', 'Safe filling and unloading', 'Leak prevention'],
    "Fuel leak": ['Early leak detection', 'Rapid containment', 'Environmental safety procedures'],
    "Safety procedures": ['Daily safety protocols', 'Using protective equipment', 'Reporting hazards'],
    "Customer service": ['Professional communication', 'Handling complaints', 'Managing difficult situations']
  } : {
    "محطات الوقود": ['التعامل الآمن مع الوقود والمشتقات', 'الوقاية من الحرائق والانفجارات', 'إجراءات الطوارئ والإخلاء'],
    "النفط والغاز": ['العمليات الحرجة في الحقول والمصافي', 'بروتوكولات السلامة التشغيلية', 'الاستجابة لتسرّبات الغاز والحرائق'],
    "الطاقة": ['تشغيل وصيانة المعدات الحيوية', 'إدارة المخاطر التشغيلية', 'رفع الجاهزية والكفاءة'],
    "القطاع الخاص": ['برامج مرنة حسب حجم المنشأة', 'سيناريوهات مخصّصة لنشاطكم', 'تقارير أداء لكل موظف'],
    "مكافحة الحرائق": ['التعرّف على أنواع الحرائق', 'استخدام الطفايات ومعدات الإطفاء', 'الإخلاء الآمن والاحتواء'],
    "تشغيل المضخات": ['بدء وإيقاف المضخات بأمان', 'اكتشاف الأعطال الشائعة', 'إجراءات الصيانة الوقائية'],
    "التعامل مع الخزانات": ['فحص ومراقبة الخزانات', 'التعبئة والتفريغ الآمن', 'الوقاية من التسرّب'],
    "تسرب الوقود": ['الكشف المبكر عن التسرّب', 'الاحتواء السريع', 'إجراءات السلامة البيئية'],
    "إجراءات السلامة": ['بروتوكولات السلامة اليومية', 'استخدام معدات الحماية', 'التبليغ عن المخاطر'],
    "خدمة العملاء": ['التواصل الاحترافي', 'التعامل مع الشكاوى', 'إدارة المواقف الصعبة']
  };
  var LEARN = EN ? 'Learn more →' : 'اعرف أكثر ←';
  function waMsg(t) {
    return EN
      ? ('Hello Autoxtion 👋 I am interested in your training solutions for "' + t + '", and I would like to know more about how they can serve our organization.')
      : ('مرحبًا Autoxtion 👋 أنا مهتم بحلولكم التدريبية في «' + t + '»، وأرغب بمعرفة التفاصيل وكيف يمكن أن تخدم منشأتنا.');
  }

  function injectStyle() {
    if (document.getElementById('ax-enh-style')) return;
    var s = document.createElement('style');
    s.id = 'ax-enh-style';
    s.textContent =
      '[data-axdetail]{transition:transform .2s ease,box-shadow .2s ease;}' +
      '[data-axdetail]:hover{transform:translateY(-4px);}' +
      '.ax-learn{display:block;padding:0 20px 18px;margin-top:-14px;color:#0a7e8f;font-weight:700;font-size:13px;text-align:start;}' +
      '#ax-modal{opacity:0;transition:opacity .2s ease;}' +
      '#ax-modal.ax-open{opacity:1;}' +
      '#ax-modal-box{transform:translateY(14px) scale(.98);transition:transform .28s ease;}' +
      '#ax-modal.ax-open #ax-modal-box{transform:none;}' +
      '#ax-modal-wa:hover,#ax-modal-cta:hover{filter:brightness(1.07);}' +
      '@media(max-width:860px){' +
      '.ax-plat-img{order:-1 !important;margin-bottom:6px;}' +
      '.ax-why-row{justify-content:center !important;}' +
      '.ax-hiw-grid{grid-template-columns:1fr !important;gap:10px !important;max-width:420px !important;margin-left:auto !important;margin-right:auto !important;}' +
      '.ax-hiw-cell{min-height:auto !important;display:flex !important;flex-direction:row !important;align-items:center !important;justify-content:flex-start !important;gap:16px !important;text-align:start !important;padding:10px 10px !important;}' +
      '.ax-hiw-cell>div:first-child{margin:0 !important;flex:0 0 auto !important;}' +
      '}' +
      '@media(max-width:600px){' +
      '#ax-modal{align-items:flex-end !important;padding:0 !important;}' +
      '#ax-modal-box{max-width:100% !important;border-radius:20px 20px 0 0 !important;transform:translateY(100%) scale(1) !important;transition:transform .3s ease !important;max-height:88vh;overflow-y:auto;}' +
      '#ax-modal.ax-open #ax-modal-box{transform:translateY(0) !important;}' +
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

    // Free-text notes -> purpose dropdown (with "Other") + a notes box that appears on "Other"
    var notes = form.querySelector('textarea[name="notes"], textarea[name="message"]');
    if (notes) {
      var fieldStyle = notes.getAttribute('style') || '';
      var ps = document.createElement('select');
      ps.name = 'purpose';
      ps.setAttribute('dir', EN ? 'ltr' : 'rtl');
      ps.style.cssText = fieldStyle + ';background:#fff;color:#2a3b38';
      var o0 = document.createElement('option');
      o0.value = ''; o0.textContent = PURPOSE_PH;
      ps.appendChild(o0);
      PURPOSES.forEach(function (t) {
        var o = document.createElement('option'); o.value = t; o.textContent = t; ps.appendChild(o);
      });
      var oOther = document.createElement('option');
      oOther.value = OTHER_VAL; oOther.textContent = OTHER_VAL;
      ps.appendChild(oOther);

      var purposeLabel = notes.closest('label');
      notes.parentNode.replaceChild(ps, notes);
      if (purposeLabel) {
        for (var i = 0; i < purposeLabel.childNodes.length; i++) {
          var n = purposeLabel.childNodes[i];
          if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = PURPOSE_LABEL; break; }
        }
      }

      // notes box, hidden until "Other" is chosen
      var noteLabel = document.createElement('label');
      noteLabel.style.cssText = (purposeLabel && purposeLabel.getAttribute('style')) || 'display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#2a3b38';
      noteLabel.appendChild(document.createTextNode(NOTES_LABEL));
      var ta = document.createElement('textarea');
      ta.name = 'notes'; ta.rows = 3;
      ta.setAttribute('placeholder', NOTES_PH);
      ta.setAttribute('dir', EN ? 'ltr' : 'rtl');
      ta.style.cssText = fieldStyle;
      noteLabel.appendChild(ta);
      if (purposeLabel && purposeLabel.parentNode) {
        purposeLabel.parentNode.insertBefore(noteLabel, purposeLabel.nextSibling);
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
    grid.classList.add('ax-hiw-grid');
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

  function fixWhyChoose() {
    var sec = findSection(/لماذا تختار|Why Choose/i);
    if (!sec) return;
    var all = sec.querySelectorAll('*'), fr = null;
    for (var j = 0; j < all.length; j++) {
      var cs = getComputedStyle(all[j]);
      if (cs.display === 'flex' && all[j].children.length === 2 && all[j].querySelector('image-slot,img')) { fr = all[j]; break; }
    }
    if (!fr || fr.dataset.axwhy) return;
    fr.dataset.axwhy = '1';
    fr.classList.add('ax-why-row');
    for (var c = 0; c < fr.children.length; c++) {
      if (fr.children[c].querySelector('image-slot,img')) { fr.children[c].classList.add('ax-why-img'); break; }
    }
  }

  function buildModal() {
    var ex = document.getElementById('ax-modal');
    if (ex) return ex;
    var ov = document.createElement('div');
    ov.id = 'ax-modal';
    ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(10,30,28,.55);display:none;align-items:center;justify-content:center;padding:20px;font-family:inherit';
    var box = document.createElement('div');
    box.id = 'ax-modal-box';
    box.setAttribute('dir', EN ? 'ltr' : 'rtl');
    box.style.cssText = 'background:#fff;max-width:470px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);position:relative;text-align:' + (EN ? 'left' : 'right');
    box.innerHTML =
      '<img id="ax-modal-img" alt="" style="width:100%;height:170px;object-fit:cover;display:none">' +
      '<button id="ax-modal-x" aria-label="close" style="position:absolute;top:12px;' + (EN ? 'right' : 'left') + ':12px;border:none;background:rgba(255,255,255,.92);width:34px;height:34px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer;color:#2a3b38;box-shadow:0 2px 8px rgba(0,0,0,.15)">&times;</button>' +
      '<div style="padding:22px 24px 24px">' +
        '<h3 id="ax-modal-title" style="margin:0 0 10px;font-size:20px;font-weight:800;color:#0a7e8f"></h3>' +
        '<p id="ax-modal-desc" style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#3a4d4a"></p>' +
        '<ul id="ax-modal-list" style="list-style:none;margin:0 0 20px;padding:0;display:flex;flex-direction:column;gap:9px"></ul>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<a id="ax-modal-cta" style="flex:1 1 130px;text-align:center;background:#0a7e8f;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer">' + (EN ? 'Request a demo' : 'اطلب عرضًا') + '</a>' +
          '<a id="ax-modal-wa" target="_blank" rel="noopener noreferrer" style="flex:1 1 110px;text-align:center;background:#25D366;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;font-size:14px">' + (EN ? 'WhatsApp' : 'واتساب') + '</a>' +
        '</div>' +
      '</div>';
    ov.appendChild(box);
    document.documentElement.appendChild(ov);
    function close() { ov.classList.remove('ax-open'); setTimeout(function () { ov.style.display = 'none'; }, 260); }
    ov.__close = close;
    box.querySelector('#ax-modal-x').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    box.querySelector('#ax-modal-cta').onclick = function () {
      close();
      var demo = [].slice.call(document.querySelectorAll('a,button')).filter(function (b) { return /اطلب عرض|Request a Demo/i.test(b.textContent); })[0];
      if (demo) setTimeout(function () { demo.click(); }, 280);
    };
    return ov;
  }

  function openDetail(t, img) {
    var d = DETAILS[t];
    if (!d) return;
    var ov = buildModal();
    ov.querySelector('#ax-modal-title').textContent = t;
    ov.querySelector('#ax-modal-desc').textContent = d;
    var im = ov.querySelector('#ax-modal-img');
    if (img) { im.src = img; im.style.display = 'block'; } else { im.style.display = 'none'; }
    var ul = ov.querySelector('#ax-modal-list');
    ul.innerHTML = '';
    (BULLETS[t] || []).forEach(function (v) {
      var li = document.createElement('li');
      li.style.cssText = 'display:flex;gap:9px;align-items:center;font-size:14px;color:#22322f';
      var ck = document.createElement('span'); ck.textContent = '✓'; ck.style.cssText = 'color:#0a7e8f;font-weight:800;flex:none';
      var sp = document.createElement('span'); sp.textContent = v;
      li.appendChild(ck); li.appendChild(sp); ul.appendChild(li);
    });
    ov.querySelector('#ax-modal-wa').href = 'https://wa.me/966562356520?text=' + encodeURIComponent(waMsg(t));
    ov.style.display = 'flex';
    setTimeout(function () { ov.classList.add('ax-open'); }, 10);
  }

  function tagClickables() {
    // Sector cards
    var ssec = findSection(/القطاعات التي نخدمها|Sectors We Serve/i);
    if (ssec && !ssec.dataset.axclick) {
      ssec.dataset.axclick = '1';
      [].slice.call(ssec.querySelectorAll('.ax-card')).forEach(function (card) {
        var txt = (card.textContent || '').replace(/\s+/g, ' ').trim();
        var key = Object.keys(DETAILS).filter(function (k) { return txt.indexOf(k) >= 0; })[0];
        if (!key) return;
        card.setAttribute('data-axdetail', key);
        card.style.cursor = 'pointer';
        var slot = card.querySelector('image-slot,img');
        var src = slot ? (slot.getAttribute('src') || slot.src || '') : '';
        if (src) card.setAttribute('data-aximg', src);
        if (!card.querySelector('.ax-learn')) {
          var lm = document.createElement('span'); lm.className = 'ax-learn'; lm.textContent = LEARN;
          card.appendChild(lm);
        }
      });
    }
    // Scenario cards
    var scsec = findSection(/سيناريوهات التدريب|Training Scenarios/i);
    if (scsec && !scsec.dataset.axclick) {
      scsec.dataset.axclick = '1';
      Object.keys(DETAILS).forEach(function (key) {
        var els = scsec.querySelectorAll('div,span');
        for (var i = 0; i < els.length; i++) {
          if (els[i].children.length === 0 && els[i].textContent.trim() === key) {
            var card = els[i].parentElement || els[i];
            card.setAttribute('data-axdetail', key);
            card.style.cursor = 'pointer';
            break;
          }
        }
      });
    }
  }

  if (!window.__axClickBound) {
    window.__axClickBound = 1;
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-axdetail]');
      if (t) {
        e.preventDefault(); e.stopPropagation();
        var slot = t.querySelector('image-slot,img');
        var img = slot ? (slot.getAttribute('src') || slot.src || '') : '';
        openDetail(t.getAttribute('data-axdetail'), img);
      }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = document.getElementById('ax-modal');
        if (m && m.__close && getComputedStyle(m).display !== 'none') m.__close();
      }
    });
  }

  function run() {
    injectStyle();
    var f = document.querySelector('form');
    if (f) enhanceForm(f);
    fixHowItWorks();
    fixPlatform();
    fixWhyChoose();
    tagClickables();
  }

  var t = null;
  new MutationObserver(function () {
    if (t) return;
    t = setTimeout(function () { t = null; run(); }, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
