
  'use strict';

  /* SCROLL PROGRESS BAR  */
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    const scrollTop  = document.documentElement.scrollTop || document.body.scrollTop;
    const docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + '%' : '0%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* NAV SCROLL EFFECT */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

  /* MOBILE MENU */
  const hbg = document.getElementById('hamburger');
  const mm  = document.getElementById('mobileMenu');
  let menuOpen = false;
  function closeMobile() {
    menuOpen = false;
    mm.hidden = true;
    mm.classList.remove('open');
    hbg.classList.remove('open');
    hbg.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hbg.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mm.hidden = !menuOpen;
    mm.classList.toggle('open', menuOpen);
    hbg.classList.toggle('open', menuOpen);
    hbg.setAttribute('aria-expanded', String(menuOpen));
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMobile(); });

  /* SMOOTH ANCHOR SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
      }
    });
  });

  /* INTERSECTION OBSERVER — FADE ANIMATIONS  */
  const ioAnim = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ioAnim.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => ioAnim.observe(el));

  /* STATS COUNTER ANIMATION */
  let counted = false;
  const statsGrid = document.getElementById('statsGrid');
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function countUp(el, target, duration) {
    const valEl = el.querySelector('.sv');
    if (!valEl) return;
    const t0 = performance.now();
    const step = now => {
      const progress = Math.min((now - t0) / duration, 1);
      valEl.textContent = Math.floor(easeOutQuart(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else valEl.textContent = target;
    };
    requestAnimationFrame(step);
  }
  const statsIO = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      statsGrid.querySelectorAll('.stat-number').forEach(el => {
        const t = parseInt(el.dataset.target, 10);
        if (!isNaN(t)) countUp(el, t, 2000);
      });
    }
  }, { threshold: 0.35 });
  if (statsGrid) statsIO.observe(statsGrid);

  /* MARQUEE PAUSE ON HOVER */
  const mq = document.getElementById('marqueeTrack');
  if (mq) {
    mq.addEventListener('mouseenter', () => mq.style.animationPlayState = 'paused');
    mq.addEventListener('mouseleave', () => mq.style.animationPlayState = 'running');
  }

  /* BACK TO TOP */
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btt.classList.toggle('show', scrollY > 600), { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /*  FLOATING MOBILE CTA  */
  const mobileCta = document.getElementById('mobile-cta');
  let heroVisible = true;
  const heroObs = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    mobileCta.classList.toggle('show', !heroVisible);
  }, { threshold: 0.1 });
  const heroSec = document.getElementById('home');
  if (heroSec) heroObs.observe(heroSec);

  /* FAQ ACCORDION */
  function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    // Open clicked if it wasn't open
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  /* COOKIE CONSENT (POPIA) */
  (function initCookieBanner() {
    const banner  = document.getElementById('cookie-banner');
    const accept  = document.getElementById('cookieAccept');
    const decline = document.getElementById('cookieDecline');
    const consent = localStorage.getItem('ocfo_cookie_consent');
    if (!consent) { setTimeout(() => banner.classList.add('show'), 1200); }
    function dismiss(choice) {
      localStorage.setItem('ocfo_cookie_consent', choice);
      banner.classList.remove('show');
    }
    accept.addEventListener('click',  () => dismiss('accepted'));
    decline.addEventListener('click', () => dismiss('declined'));
  })();

  /* FORM VALIDATION ENGINE */
  const RULES = {
    required:  { test: v => v.trim().length > 0,            msg: 'This field is required.' },
    minlength: { test: (v, el) => v.trim().length >= parseInt(el.minLength || 2), msg: 'Please enter at least 2 characters.' },
    email:     { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),      msg: 'Please enter a valid email address.' },
    tel:       { test: v => /^[+\d\s\-().]{7,20}$/.test(v.trim()),               msg: 'Please enter a valid phone number.' },
    select:    { test: v => v !== '',                                              msg: 'Please select an option.' },
  };

  function getFieldRules(el) {
    const rules = [];
    if (el.required) rules.push('required');
    if (el.type === 'email') rules.push('email');
    if (el.type === 'tel')   rules.push('tel');
    if (el.tagName === 'SELECT' && el.required) return ['select'];
    if (el.minLength > 0 && el.required) rules.push('minlength');
    return rules;
  }

  function validateField(el) {
    const wrap    = el.closest('.fg');
    if (!wrap) return true;
    const errEl   = wrap.querySelector('.f-err');
    const rules   = getFieldRules(el);
    let   valid   = true;
    let   message = '';

    for (const rule of rules) {
      if (RULES[rule] && !RULES[rule].test(el.value, el)) {
        valid = false;
        message = RULES[rule].msg;
        break;
      }
    }

    wrap.classList.add('touched');
    wrap.classList.toggle('valid',   valid);
    wrap.classList.toggle('invalid', !valid);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.toggle('show', !valid);
    }
    el.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('input:not([type=hidden]):not([name*=bot]), select, textarea');
    let allValid = true;
    let firstInvalid = null;
    fields.forEach(el => {
      const valid = validateField(el);
      if (!valid && !firstInvalid) firstInvalid = el;
      allValid = allValid && valid;
    });
    if (firstInvalid) firstInvalid.focus();
    return allValid;
  }

  // Real-time validation on blur (touch each field)
  document.querySelectorAll('#heroForm input, #heroForm select, #captureForm input, #captureForm select, #captureForm textarea').forEach(el => {
    el.addEventListener('blur', () => {
      if (el.value.trim() !== '' || el.required) validateField(el);
    });
    el.addEventListener('input', () => {
      const wrap = el.closest('.fg');
      if (wrap && wrap.classList.contains('touched')) validateField(el);
    });
  });

  /* NETLIFY FORM SUBMIT */
  function encode(data) {
    return Object.entries(data)
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&');
  }

  async function submitNetlifyForm(formId, formName, wrapId, successId, alertId, btnId) {
    const form    = document.getElementById(formId);
    const btn     = document.getElementById(btnId);
    const alertEl = document.getElementById(alertId);

    if (!validateForm(form)) return;

    // Check honeypot
    const botField = form.querySelector('[name*="bot-field"]');
    if (botField && botField.value !== '') return; // Silently ignore bots

    // Gather data
    const data = { 'form-name': formName };
    form.querySelectorAll('input:not([type=hidden]):not([name*=bot]), select, textarea').forEach(el => {
      if (el.name) data[el.name] = el.value;
    });

    // Loading state
    btn.classList.add('loading');
    btn.disabled = true;
    alertEl.classList.remove('show');

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data),
      });

      if (res.ok) {
        // Show success
        document.getElementById(wrapId).style.display  = 'none';
        document.getElementById(successId).style.display = 'block';
      } else {
        throw new Error('Server responded with ' + res.status);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      alertEl.classList.add('show');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  /*  HERO FORM */
  document.getElementById('heroForm').addEventListener('submit', e => {
    e.preventDefault();
    submitNetlifyForm('heroForm', 'hero-enquiry', 'heroFormWrap', 'heroSuccess', 'heroAlert', 'heroBtn');
  });

  /*  CAPTURE FORM  */
  document.getElementById('captureForm').addEventListener('submit', e => {
    e.preventDefault();
    submitNetlifyForm('captureForm', 'discovery-call', 'captureFormWrap', 'captureSuccess', 'captureAlert', 'captureBtn');
  });

