/* ============================================
   Johana Ramirez — scroll storytelling
   ============================================ */

(function () {
  'use strict';

  // ===== Loader =====
  const loader = document.querySelector('.loader');
  const hero   = document.querySelector('.hero');

  function spawnDust() {
    const wrap = document.querySelector('.loader__wrap');
    if (!wrap) return;
    for (let i = 0; i < 18; i++) {
      const d = document.createElement('span');
      d.className = 'dust';
      const size = 2 + Math.random() * 4;
      d.style.width  = size + 'px';
      d.style.height = size + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist  = 40 + Math.random() * 140;
      d.style.left = '50%';
      d.style.top  = '50%';
      d.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      d.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      d.style.animation = `dust-out ${1.4 + Math.random() * 0.8}s ease-out ${0.6 + Math.random() * 0.6}s forwards`;
      wrap.appendChild(d);
    }
  }
  spawnDust();

  // Dust keyframes injected
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes dust-out {
      0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
      30%  { opacity: 0.9; }
      100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);

  window.addEventListener('load', () => {
    const minDelay = 3200;
    setTimeout(() => {
      loader && loader.classList.add('hidden');
      hero && hero.classList.add('is-ready');
    }, minDelay);
  });

  // ===== Nav scrolled state =====
  const nav = document.querySelector('.nav');
  const fab = document.querySelector('.whatsapp-fab');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      nav && nav.classList.add('scrolled');
      fab && fab.classList.add('show');
    } else {
      nav && nav.classList.remove('scrolled');
      fab && fab.classList.remove('show');
    }
  }, { passive: true });

  // ===== Identity — auto-cycle words (not scroll-driven) =====
  const identitySection  = document.querySelector('.identity');
  const identitySticky   = document.querySelector('.identity__sticky');
  const identityWords    = document.querySelectorAll('.identity__word');
  const identityMemories = document.querySelectorAll('.identity__memory');
  const identityBottom   = document.querySelector('.identity__bottomline');
  const identityCount    = document.querySelector('.identity__count');

  let identityIdx = 0;
  let identityTimer = null;
  const IDENTITY_INTERVAL = 2800; // ms per word (typewriter needs hold time)

  // Split each word into per-letter spans for staggered reveal
  function splitWordIntoChars(wordEl) {
    const counter = { i: 0 };
    function process(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const ch of node.textContent) {
          const span = document.createElement('span');
          span.className = 'char';
          span.style.setProperty('--i', counter.i++);
          span.textContent = ch === ' ' ? ' ' : ch;
          frag.appendChild(span);
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(process);
      }
    }
    process(wordEl);
  }
  identityWords.forEach(splitWordIntoChars);

  function setIdentity(idx) {
    const n = identityWords.length;
    identityWords.forEach((w, i) => {
      w.classList.toggle('is-active', i === idx);
      w.classList.toggle('is-past',   i <  idx);
    });
    identityMemories.forEach((m, i) => {
      m.classList.toggle('is-active', i === idx);
    });
    if (identityCount) {
      identityCount.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
    if (identityBottom) {
      identityBottom.classList.add('show');
    }
  }

  function tickIdentity() {
    const n = identityWords.length;
    identityIdx = (identityIdx + 1) % n;
    setIdentity(identityIdx);
  }

  // Start cycling only when the section is visible (saves cycles + avoids ticking offscreen)
  if (identitySection && identityWords.length) {
    // Wait two animation frames so the browser paints the initial char state
    // (opacity 0) before we flip the active class — that way the transition fires.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (identitySticky) identitySticky.classList.add('is-ready');
        setIdentity(0);
      });
    });
    const visIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!identityTimer) identityTimer = setInterval(tickIdentity, IDENTITY_INTERVAL);
        } else {
          if (identityTimer) { clearInterval(identityTimer); identityTimer = null; }
        }
      });
    }, { threshold: 0.3 });
    visIO.observe(identitySection);
  }

  // ===== Reels (corporate + personal) =====
  function setupReel(reelEl) {
    const slides = reelEl.querySelectorAll('.reel__slide');
    const panels = reelEl.querySelectorAll('.reel__panel');
    const pips   = reelEl.querySelectorAll('.reel__counter .pip');

    function update() {
      const rect = reelEl.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = reelEl.offsetHeight - viewport;
      let progress = (-rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));

      const n = slides.length;
      const idx = Math.min(n - 1, Math.floor(progress * n * 0.999));

      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      panels.forEach((p, i) => {
        p.classList.toggle('is-active', i === idx);
        p.classList.toggle('is-past',   i <  idx);
      });
      pips.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    }
    return update;
  }

  const reelUpdaters = [];
  document.querySelectorAll('.reel').forEach(r => reelUpdaters.push(setupReel(r)));

  // initial state
  document.querySelectorAll('.reel').forEach(r => {
    const firstSlide = r.querySelector('.reel__slide');
    const firstPanel = r.querySelector('.reel__panel');
    const firstPip   = r.querySelector('.reel__counter .pip');
    firstSlide && firstSlide.classList.add('is-active');
    firstPanel && firstPanel.classList.add('is-active');
    firstPip   && firstPip.classList.add('is-active');
  });

  // ===== rAF scroll loop =====
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        reelUpdaters.forEach(fn => fn());
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ===== fade-up via IntersectionObserver =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

  // ===== Video play =====
  const videoEl     = document.querySelector('.about__video video');
  const videoOverlay= document.querySelector('.about__video__overlay');
  const playBtn     = document.querySelector('.about__play');
  if (playBtn && videoEl && videoOverlay) {
    playBtn.addEventListener('click', () => {
      videoEl.play();
      videoEl.setAttribute('controls', '');
      videoOverlay.classList.add('playing');
    });
  }

  // ===== Form (mailto fallback) =====
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name    = data.get('name')    || '';
      const email   = data.get('email')   || '';
      const phone   = data.get('phone')   || '';
      const type    = data.get('type')    || '';
      const message = data.get('message') || '';

      const subject = encodeURIComponent('Cotización de evento — ' + (name || 'Nuevo contacto'));
      const body = encodeURIComponent(
        `Hola Johana,\n\n` +
        `Me gustaría conversar sobre un evento.\n\n` +
        `Nombre: ${name}\n` +
        `Email: ${email}\n` +
        `Teléfono: ${phone}\n` +
        `Tipo de evento: ${type}\n\n` +
        `Mensaje:\n${message}\n`
      );
      window.location.href = `mailto:jrodriguez@creaktivo.com.pe?subject=${subject}&body=${body}`;
    });
  }
})();
