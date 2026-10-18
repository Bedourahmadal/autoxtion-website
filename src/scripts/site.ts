/* AUTOXTION — site behaviour: menus, the request form, the consulting page extras. No dependencies. */

/* header: a shadow once the page scrolls, and dropdowns that close like menus */
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const menus = [...document.querySelectorAll<HTMLDetailsElement>('[data-menu]')];
const closeMenus = (except?: HTMLDetailsElement) => menus.forEach((m) => m !== except && (m.open = false));
menus.forEach((m) => m.addEventListener('toggle', () => m.open && closeMenus(m)));
document.addEventListener('click', (e) => {
  if (!menus.some((m) => m.contains(e.target as Node))) closeMenus();
});
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenus());
menus.forEach((m) => m.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenus())));

/* the request form */
const form = document.querySelector<HTMLFormElement>('#enquiry-form');
const msg = document.querySelector<HTMLElement>('#form-msg');
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

if (form && msg) {
  const codes: [string, string][] = [['+966', '🇸🇦'], ['+971', '🇦🇪'], ['+973', '🇧🇭'], ['+965', '🇰🇼'], ['+974', '🇶🇦'], ['+968', '🇴🇲'], ['+20', '🇪🇬'], ['+962', '🇯🇴'], ['+961', '🇱🇧'], ['+964', '🇮🇶'], ['+90', '🇹🇷'], ['+44', '🇬🇧'], ['+1', '🇺🇸']];
  const codeSelect = form.querySelector<HTMLSelectElement>('[data-phone-codes]')!;
  codeSelect.innerHTML = codes.map(([c, f]) => `<option value="${c}">${f} ${c}</option>`).join('');

  const purpose = form.elements.namedItem('purpose') as HTMLSelectElement;
  const consultant = form.elements.namedItem('consultant') as HTMLSelectElement | null;

  // the service card whose option is chosen in the form is marked
  const services = [...document.querySelectorAll<HTMLElement>('[data-service]')];
  const markService = () => services.forEach((c) => c.classList.toggle('is-selected', c.dataset.service === purpose.value));
  purpose.addEventListener('change', markService);

  // fields say what is wrong under themselves, in the page's language
  const errorEl = (f: Field) => {
    let el = document.getElementById(f.id + '-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'field-error';
      el.id = f.id + '-error';
      (f.closest('[data-field]') ?? f.parentElement)!.append(el);
    }
    return el;
  };
  const clearError = (f: Field) => {
    document.getElementById(f.id + '-error')?.remove();
    f.removeAttribute('aria-invalid');
    f.removeAttribute('aria-describedby');
  };
  const check = (f: Field) => {
    const v = f.value.trim();
    let text = '';
    if (f.required && !v) text = form.dataset[f.tagName === 'SELECT' ? 'pick' : 'required']!;
    else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) text = form.dataset.badEmail!;
    if (!text) {
      clearError(f);
      return true;
    }
    errorEl(f).textContent = text;
    f.setAttribute('aria-invalid', 'true');
    f.setAttribute('aria-describedby', f.id + '-error');
    return false;
  };
  const checked = [...form.querySelectorAll<Field>('[required], [type=email]')];
  checked.forEach((f) => {
    f.addEventListener(f.tagName === 'SELECT' ? 'change' : 'blur', () => (f.value.trim() || f.hasAttribute('aria-invalid')) && check(f));
    f.addEventListener('input', () => f.hasAttribute('aria-invalid') && check(f));
  });

  // buttons with data-open-form bring the visitor here, with the request type (and consultant) chosen
  const openForm = (value: string) => {
    if (value) {
      purpose.value = value;
      markService();
      clearError(purpose);
    }
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    form.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => (form.elements.namedItem('name') as HTMLInputElement).focus({ preventScroll: true }), 450);
  };
  document.querySelectorAll<HTMLElement>('[data-open-form]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenus();
      if (consultant && el.dataset.consultant) consultant.value = el.dataset.consultant;
      openForm(el.dataset.openForm ?? '');
    }),
  );

  // links from other pages can choose the request type: /?purpose=...#contact
  const asked = new URLSearchParams(location.search).get('purpose');
  if (asked && [...purpose.options].some((o) => o.value === asked || o.text === asked)) {
    purpose.value = asked;
    markService();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    if (btn.disabled) return;
    const bad = checked.filter((f) => !check(f));
    if (bad.length) {
      bad[0].focus();
      return;
    }
    btn.disabled = true;
    msg.removeAttribute('data-state');
    msg.textContent = '';
    fetch('https://formsubmit.co/ajax/info@autoxtion.com', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(() => {
        msg.dataset.state = 'ok';
        msg.textContent = form.dataset.ok!;
        form.reset();
        codeSelect.value = '+966';
        markService();
      })
      .catch(() => {
        msg.dataset.state = 'error';
        msg.textContent = form.dataset.error!;
      })
      .finally(() => (btn.disabled = false));
  });
}

/* consulting page: consultant details on demand */
document.querySelectorAll<HTMLButtonElement>('[data-more]').forEach((b) =>
  b.addEventListener('click', () => {
    const card = b.closest('[data-person]')!;
    const open = card.toggleAttribute('data-open');
    b.setAttribute('aria-expanded', String(open));
    b.textContent = (open ? b.dataset.less : b.dataset.moreLabel) ?? '';
  }),
);

/* phones: a request button that stays at hand until the form is on screen */
const sticky = document.querySelector<HTMLElement>('[data-sticky-cta]');
const hero = document.querySelector('[data-hero]');
const request = document.getElementById('request');
if (sticky && hero && request && 'IntersectionObserver' in window) {
  let heroSeen = true;
  let formSeen = false;
  const sync = () => document.body.toggleAttribute('data-show-sticky', !heroSeen && !formSeen);
  new IntersectionObserver(([e]) => ((heroSeen = e.isIntersecting), sync())).observe(hero);
  new IntersectionObserver(([e]) => ((formSeen = e.isIntersecting), sync())).observe(request);
}

/* quiet arrival */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (es) => es.forEach((x) => x.isIntersecting && (x.target.classList.add('in'), io.unobserve(x.target))),
    { threshold: 0.12 },
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));

export {};

/* sector tabs: click, or arrow keys along the row (direction-aware). They move on by themselves,
   pausing while the reader is on them, off screen or on another tab; they stop for good once a
   tab is chosen, and never move for readers who asked for less motion. */
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((box) => {
  const tabs = [...box.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  const rtl = document.documentElement.dir === 'rtl';
  const every = parseInt(box.dataset.autoplay ?? '', 10);
  let current = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let hover = false;
  let seen = false;
  const select = (i: number, focus = false) => {
    current = i;
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      on ? t.removeAttribute('tabindex') : t.setAttribute('tabindex', '-1');
      document.getElementById(t.getAttribute('aria-controls')!)!.hidden = !on;
    });
    if (focus) tabs[i].focus();
  };
  const canRun = () => every && !stopped && !hover && seen && document.visibilityState === 'visible' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const schedule = () => {
    clearTimeout(timer);
    box.removeAttribute('data-running');
    if (!canRun()) return;
    void box.offsetWidth; // restart the progress line
    box.setAttribute('data-running', '');
    timer = setTimeout(() => {
      select((current + 1) % tabs.length);
      schedule();
    }, every);
  };
  if (every) {
    box.style.setProperty('--tab-dur', every + 'ms');
    box.addEventListener('mouseenter', () => ((hover = true), schedule()));
    box.addEventListener('mouseleave', () => ((hover = false), schedule()));
    box.addEventListener('focusin', () => ((hover = true), schedule()));
    box.addEventListener('focusout', () => ((hover = false), schedule()));
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(([e]) => ((seen = e.isIntersecting), schedule()), { threshold: 0.35 }).observe(box);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => ((stopped = true), select(i), schedule()));
    t.addEventListener('keydown', (e) => {
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key !== fwd && e.key !== back) return;
      e.preventDefault();
      stopped = true;
      select((i + (e.key === fwd ? 1 : tabs.length - 1)) % tabs.length, true);
      schedule();
    });
  });
});
