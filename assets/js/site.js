/* AUTOXTION — site behaviour. No dependencies.
   Carried over from the current site: the enquiry form (same receiver, same fields),
   the WhatsApp link, the country codes, Esc / backdrop to close. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var AR = (root.lang || 'ar').slice(0, 2) === 'ar';

  /* header: the dropdown menus and the mobile panel */
  var header = document.querySelector('.site-header');
  var menus = [].slice.call(document.querySelectorAll('.has-menu'));
  var burger = header && header.querySelector('.burger');
  // setMenu(false) closes every dropdown; opening one closes the others.
  function setMenu(open, which) {
    menus.forEach(function (m) {
      var on = open && m === which;
      on ? m.setAttribute('data-open', '') : m.removeAttribute('data-open');
      m.querySelector('button').setAttribute('aria-expanded', on);
    });
  }
  function setPanel(open) {
    if (!header) return;
    open ? header.setAttribute('data-open', '') : header.removeAttribute('data-open');
    burger.setAttribute('aria-expanded', open);
  }
  menus.forEach(function (m) {
    m.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); setMenu(!m.hasAttribute('data-open'), m); });
  });
  if (burger) burger.addEventListener('click', function () { setPanel(!header.hasAttribute('data-open')); });
  document.addEventListener('click', function (e) { if (!menus.some(function (m) { return m.contains(e.target); })) setMenu(false); });
  // Following an in-page link closes whatever was open.
  [].forEach.call(document.querySelectorAll('.nav-links a[href^="#"], .menu a[href^="#"]'), function (a) {
    a.addEventListener('click', function () { setMenu(false); setPanel(false); });
  });

  /* enquiry dialog */
  var ovl = document.getElementById('enquiry');
  var form = document.getElementById('enquiry-form');
  var msg = document.getElementById('form-msg');
  var lastFocus = null;
  // The consulting page: the card whose service is chosen in the form is marked.
  var services = document.querySelectorAll('[data-service]');
  function markService() {
    [].forEach.call(services, function (c) { c.classList.toggle('is-selected', c.getAttribute('data-service') === form.purpose.value); });
  }
  if (form && services.length) form.purpose.addEventListener('change', markService);

  // Forms marked data-validate check their fields here and say what is wrong under each one.
  var validate = form && form.hasAttribute('data-validate');
  function errorEl(f) {
    var id = f.id + '-error', el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.className = 'field-error'; el.id = id;
      f.closest('.field').appendChild(el);
    }
    return el;
  }
  function clearError(f) {
    if (!validate || !f.id) return;
    var el = document.getElementById(f.id + '-error');
    if (el) el.remove();
    f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby');
  }
  function checkField(f) {
    var v = f.value.trim(), text = '';
    if (f.required && !v) text = form.getAttribute(f.tagName === 'SELECT' ? 'data-pick' : 'data-required');
    else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) text = form.getAttribute('data-bad-email');
    if (!text) { clearError(f); return true; }
    errorEl(f).textContent = text;
    f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', f.id + '-error');
    return false;
  }
  if (validate) [].forEach.call(form.querySelectorAll('[required], [type=email]'), function (f) {
    f.addEventListener(f.tagName === 'SELECT' ? 'change' : 'blur', function () { if (f.value.trim() || f.hasAttribute('aria-invalid')) checkField(f); });
    f.addEventListener('input', function () { if (f.hasAttribute('aria-invalid')) checkField(f); });
  });

  // The homepage carries the form on the page; other pages still open it in a dialog.
  function openForm(purpose) {
    setPanel(false);
    if (purpose) { form.purpose.value = purpose; markService(); clearError(form.purpose); }
    if (!ovl) {
      var calm = document.visibilityState !== 'visible' || matchMedia('(prefers-reduced-motion: reduce)').matches;
      form.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { form.elements.namedItem('name').focus({ preventScroll: true }); }, 450);
      return;
    }
    lastFocus = document.activeElement;
    ovl.classList.add('open');
    document.body.style.overflow = 'hidden';
    form.elements.namedItem('name').focus();
  }
  function closeForm() {
    ovl.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  if (form) [].forEach.call(document.querySelectorAll('[data-open-form]'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (el.hasAttribute('data-consultant') && form.consultant) form.consultant.value = el.getAttribute('data-consultant');
      openForm(el.getAttribute('data-open-form'));
    });
  });
  if (ovl) {
    ovl.querySelector('.x').addEventListener('click', closeForm);
    ovl.addEventListener('click', function (e) { if (e.target === ovl) closeForm(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (ovl && ovl.classList.contains('open')) closeForm();
    setMenu(false); setPanel(false);
  });

  /* sector tabs: click, or arrow keys along the row (direction-aware) */
  [].forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
    var tabs = [].slice.call(box.querySelectorAll('[role=tab]'));
    function select(i, focus) {
      current = i;
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on);
        on ? t.removeAttribute('tabindex') : t.setAttribute('tabindex', '-1');
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    // Advance on their own, like pixaera.com: pause while the reader is on the tabs, off screen or
    // on another tab; stop for good once they choose a tab; never move for readers who asked for less motion.
    var every = parseInt(box.getAttribute('data-autoplay'), 10), current = 0, timer = null, stopped = false, hover = false, seen = false;
    if (every) box.style.setProperty('--tab-dur', every + 'ms');
    function canRun() { return every && !stopped && !hover && seen && document.visibilityState === 'visible' && !matchMedia('(prefers-reduced-motion: reduce)').matches; }
    function schedule() {
      clearTimeout(timer); box.removeAttribute('data-running');
      if (!canRun()) return;
      void box.offsetWidth;            // restart the progress line
      box.setAttribute('data-running', '');
      timer = setTimeout(function () { select((current + 1) % tabs.length); schedule(); }, every);
    }
    if (every) {
      box.addEventListener('mouseenter', function () { hover = true; schedule(); });
      box.addEventListener('mouseleave', function () { hover = false; schedule(); });
      box.addEventListener('focusin', function () { hover = true; schedule(); });
      box.addEventListener('focusout', function () { hover = false; schedule(); });
      document.addEventListener('visibilitychange', schedule);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(box);
      else { seen = true; schedule(); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stopped = true; select(i); schedule(); });
      t.addEventListener('keydown', function (e) {
        var fwd = AR ? 'ArrowLeft' : 'ArrowRight', back = AR ? 'ArrowRight' : 'ArrowLeft';
        if (e.key === fwd) { e.preventDefault(); stopped = true; select((i + 1) % tabs.length, true); schedule(); }
        if (e.key === back) { e.preventDefault(); stopped = true; select((i - 1 + tabs.length) % tabs.length, true); schedule(); }
      });
    });
  });

  // Pages without the form (the solution pages) link to the homepage's form instead.
  if (form) {
  var codes = [['+966','🇸🇦'],['+971','🇦🇪'],['+973','🇧🇭'],['+965','🇰🇼'],['+974','🇶🇦'],['+968','🇴🇲'],['+20','🇪🇬'],['+962','🇯🇴'],['+961','🇱🇧'],['+964','🇮🇶'],['+90','🇹🇷'],['+44','🇬🇧'],['+1','🇺🇸']];
  form.phone_code.innerHTML = codes.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + ' ' + c[0] + '</option>'; }).join('');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('[type=submit]');
    if (btn.disabled) return;
    if (validate) {
      var bad = [].filter.call(form.querySelectorAll('[required], [type=email]'), function (f) { return !checkField(f); });
      if (bad.length) { bad[0].focus(); return; }
    }
    btn.disabled = true;
    msg.removeAttribute('data-state'); msg.textContent = '';
    fetch('https://formsubmit.co/ajax/info@autoxtion.com', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () {
        msg.setAttribute('data-state', 'ok');
        msg.textContent = form.getAttribute('data-ok') || (AR ? 'وصل طلبك، وسنتواصل معك قريبا.' : 'Your request has been received. We will be in touch shortly.');
        form.reset(); form.phone_code.value = '+966';
        if (services.length) markService();
      })
      .catch(function () {
        msg.setAttribute('data-state', 'error');
        msg.textContent = form.getAttribute('data-error') || (AR ? 'تعذر الإرسال. حاول مرة أخرى أو راسلنا عبر واتساب.' : 'Sending failed. Please try again or message us on WhatsApp.');
      })
      .then(function () { btn.disabled = false; });
  });
  }

  /* consulting page on phones: consultant details on demand, and a request button kept at hand */
  [].forEach.call(document.querySelectorAll('.person-more'), function (b) {
    b.addEventListener('click', function () {
      var open = b.closest('.person').classList.toggle('is-open');
      b.setAttribute('aria-expanded', open);
      b.textContent = b.getAttribute(open ? 'data-less' : 'data-more');
    });
  });
  // Shown once the opening button has scrolled away, and hidden again when the form itself is on screen.
  var sticky = document.querySelector('.sticky-cta'), hero = document.querySelector('.case-head'), request = document.getElementById('request');
  if (sticky && hero && request && 'IntersectionObserver' in window) {
    var heroSeen = true, formSeen = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.target === hero) heroSeen = e.isIntersecting; else formSeen = e.isIntersecting; });
      document.body.classList.toggle('show-sticky', !heroSeen && !formSeen);
    }).observe(hero);
    new IntersectionObserver(function (es) {
      formSeen = es[0].isIntersecting;
      document.body.classList.toggle('show-sticky', !heroSeen && !formSeen);
    }).observe(request);
  }

  /* WhatsApp */
  var wa = document.getElementById('wa');
  if (wa) wa.href = 'https://wa.me/966562356520?text=' + encodeURIComponent(AR ? 'مرحبا AUTOXTION، أرغب بالتعرف على خدماتكم.' : 'Hello AUTOXTION, I would like to learn more about your work.');

  /* quiet arrival */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    [].forEach.call(document.querySelectorAll('.reveal'), function (el) { io.observe(el); });
  } else {
    [].forEach.call(document.querySelectorAll('.reveal'), function (el) { el.classList.add('in'); });
  }
})();
