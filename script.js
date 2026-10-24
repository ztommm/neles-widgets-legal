// CutieDesk website: small live demos and the contact form.
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const pad = n => String(n).padStart(2, '0');
  const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // ---- Live clocks (hero mockup + customise demo) ----
  function tick() {
    const d = new Date();
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const date = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    $$('[data-live-time]').forEach(el => { el.textContent = time; });
    $$('[data-live-date]').forEach(el => { el.textContent = date; });
  }
  if ($('[data-live-time]')) { tick(); setInterval(tick, 1000); }

  // ---- Notes card: tick the checklist ----
  $$('.v-notes [data-check]').forEach(btn => {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '☑' : '☐';
      btn.parentElement.classList.toggle('done', on);
    });
  });

  // ---- Countdown card: pick a date ----
  const cdInput = $('#cdDate');
  if (cdInput) {
    const out = $('#cdDays'), label = $('#cdLabel');
    const update = () => {
      if (!cdInput.value) return;
      const [y, m, d] = cdInput.value.split('-').map(Number);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((new Date(y, m - 1, d) - today) / 86400000);
      out.textContent = Math.abs(days);
      label.textContent = days > 0 ? (days === 1 ? 'day to go' : 'days to go') : days === 0 ? 'it’s today! 🎉' : (days === -1 ? 'day ago' : 'days ago');
    };
    cdInput.addEventListener('input', update);
  }

  // ---- Customise playground ----
  const demo = $('#demoWidget');
  if (demo) {
    const stage = $('#demoStage');
    const state = { bg: '#ffffff', accent: '#c2456c', text: 'dark', opacity: 85 };
    const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const isDark = h => { const [r, g, b] = hexToRgb(h); return (r * 299 + g * 587 + b * 114) / 1000 < 128; };
    const apply = () => {
      const [r, g, b] = hexToRgb(state.bg);
      demo.style.setProperty('--w-bg', `rgba(${r}, ${g}, ${b}, ${state.opacity / 100})`);
      demo.style.setProperty('--w-accent', state.accent);
      demo.style.setProperty('--w-text', state.text === 'dark' ? '#2a1a21' : '#fff6f9');
      demo.style.setProperty('--w-muted', state.text === 'dark' ? 'rgba(42, 26, 33, .6)' : 'rgba(255, 246, 249, .7)');
      $('#opacityValue').textContent = `${state.opacity}%`;
    };
    const pick = (group, key) => {
      $$(`[data-${group}]`).forEach(btn => btn.addEventListener('click', () => {
        state[key] = btn.dataset[group];
        $$(`[data-${group}]`).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        if (key === 'bg') { // keep text readable: switch to light text on dark backgrounds
          state.text = isDark(state.bg) ? 'light' : 'dark';
          $$('[data-text]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.text === state.text)));
        }
        apply();
      }));
    };
    pick('bg', 'bg');
    pick('accent', 'accent');
    pick('text', 'text');
    const slider = $('#opacity');
    slider.addEventListener('input', () => { state.opacity = Number(slider.value); slider.style.setProperty('--fill', `${((slider.value - 30) / 70) * 100}%`); apply(); });
    slider.style.setProperty('--fill', `${((slider.value - 30) / 70) * 100}%`);

    // Drag the widget around the mini desktop, like in the app.
    let drag = null;
    demo.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      const r = demo.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      demo.setPointerCapture(e.pointerId);
      demo.classList.add('dragging');
    });
    demo.addEventListener('pointermove', e => {
      if (!drag) return;
      const s = stage.getBoundingClientRect(), w = demo.offsetWidth, h = demo.offsetHeight;
      const x = Math.min(Math.max(0, e.clientX - s.left - drag.dx), s.width - w);
      const y = Math.min(Math.max(0, e.clientY - s.top - drag.dy), s.height - h);
      demo.style.left = `${(x / s.width) * 100}%`;
      demo.style.top = `${(y / s.height) * 100}%`;
    });
    const end = () => { drag = null; demo.classList.remove('dragging'); };
    demo.addEventListener('pointerup', end);
    demo.addEventListener('pointercancel', end);
    // Arrow keys move it too.
    demo.addEventListener('keydown', e => {
      const step = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
      if (!step) return;
      e.preventDefault();
      const left = parseFloat(demo.style.left) || 0, top = parseFloat(demo.style.top) || 0;
      demo.style.left = `${Math.min(Math.max(0, left + step[0]), 100 - (demo.offsetWidth / stage.offsetWidth) * 100)}%`;
      demo.style.top = `${Math.min(Math.max(0, top + step[1]), 100 - (demo.offsetHeight / stage.offsetHeight) * 100)}%`;
    });

    $('#demoReset').addEventListener('click', () => {
      Object.assign(state, { bg: '#ffffff', accent: '#c2456c', text: 'dark', opacity: 85 });
      slider.value = 85; slider.style.setProperty('--fill', `${(55 / 70) * 100}%`);
      $$('[data-bg]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bg === state.bg)));
      $$('[data-accent]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.accent === state.accent)));
      $$('[data-text]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.text === state.text)));
      demo.style.left = ''; demo.style.top = '';
      apply();
    });
    apply();
  }

  // ---- Contact form ----
  const form = $('#contactForm');
  if (form) {
    const topic = $('#topic'), bugOnly = $('#bugOnly'), msg = $('#message'), status = $('#formStatus'), send = $('#sendBtn');
    const fromUrl = new URLSearchParams(location.search).get('topic');
    if (fromUrl && [...topic.options].some(o => o.value === fromUrl)) topic.value = fromUrl;
    const sync = () => {
      bugOnly.hidden = topic.value !== 'Bug report';
      msg.required = topic.value !== 'Launch';
      $('#msgOptional').hidden = msg.required;
      $("#subject").value = `CutieDesk: ${topic.selectedOptions[0].textContent}`;
    };
    topic.addEventListener('change', sync);
    sync();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      send.disabled = true;
      send.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || 'Something went wrong');
        form.reset();
        sync();
        status.className = 'form-status ok';
        status.textContent = 'Thanks! Your message is on its way. If you asked something, you’ll get a reply by email.';
      } catch (err) {
        status.className = 'form-status err';
        status.textContent = 'Sorry, that didn’t send. Please try again in a moment.';
      }
      send.disabled = false;
      send.textContent = 'Send message';
    });
  }
})();
