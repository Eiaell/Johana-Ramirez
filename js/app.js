/* ============================================
   Johana Ramirez — scroll storytelling
   ============================================ */

(function () {
  'use strict';

  // ===== Force scroll to top on reload (a menos que el URL tenga #hash) =====
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  // ===== Entrada directa (sin loader) =====
  const hero = document.querySelector('.hero');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Revelar el hero de inmediato. Dos frames para que su entrada (opacity/translate)
  // se anime suavemente en lugar de aparecer de golpe.
  function revealHero() { hero && hero.classList.add('is-ready'); }
  if (prefersReduced) {
    revealHero();
  } else {
    requestAnimationFrame(() => requestAnimationFrame(revealHero));
  }

  // ===== Hero video — reproducir solo cuando conviene =====
  (function () {
    const heroVideo = document.querySelector('.hero__video');
    if (!heroVideo) return;
    const saveData = navigator.connection && navigator.connection.saveData;
    const tooSmall = window.matchMedia('(max-width: 700px)').matches;
    if (prefersReduced || saveData || tooSmall) {
      // Mostrar solo el poster: no descargar ni reproducir el loop pesado.
      heroVideo.removeAttribute('autoplay');
      heroVideo.preload = 'none';
      try { heroVideo.pause(); } catch (e) {}
    } else {
      const tryPlay = () => heroVideo.play().catch(function () {});
      tryPlay();
      heroVideo.addEventListener('canplay', tryPlay, { once: true });
    }
  })();

  // ===== Línea de marcas — efecto lupa: crece en el centro, decrece hacia los lados =====
  (function () {
    const strip = document.querySelector('.herostrip');
    if (!strip || prefersReduced) return;            // reduce-motion: escala uniforme (CSS)
    const logos = Array.from(strip.querySelectorAll('.herostrip__logo'));
    if (!logos.length) return;

    const MAX = 1.5;    // escala en el centro de la pantalla
    const MIN = 0.68;   // escala en los extremos
    const SIGMA = 0.24; // ancho del "lente" como fracción del viewport

    let raf = null;
    function frame() {
      const cx = window.innerWidth / 2;
      const sigma = window.innerWidth * SIGMA;
      // batch: leer todas las posiciones y luego escribir (evita thrash de layout)
      const out = logos.map(function (el) {
        const r = el.getBoundingClientRect();
        const d = (r.left + r.width / 2 - cx) / sigma;
        const g = Math.exp(-d * d);                  // 1 en el centro → 0 en los extremos
        return { s: MIN + (MAX - MIN) * g, o: 0.5 + 0.5 * g };
      });
      for (let i = 0; i < logos.length; i++) {
        logos[i].style.transform = 'scale(' + out[i].s.toFixed(3) + ')';
        logos[i].style.opacity = out[i].o.toFixed(3);
      }
      raf = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 });
    io.observe(strip);
  })();

  // ===== Nav scrolled state =====
  const nav = document.querySelector('.nav');
  const fab = document.querySelector('.whatsapp-fab');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) nav && nav.classList.add('scrolled');
    else nav && nav.classList.remove('scrolled');
  }, { passive: true });
  // WhatsApp disponible desde el arranque (con un respiro tras la entrada del hero).
  setTimeout(function () { fab && fab.classList.add('show'); }, prefersReduced ? 600 : 1400);

  // ===== Identity — auto-cycle words (not scroll-driven) =====
  const identitySection  = document.querySelector('.identity');
  const identitySticky   = document.querySelector('.identity__sticky');
  const identityWordsEl  = document.querySelector('.identity__words');
  const identityType     = document.querySelector('.identity__type');
  const identityMemories = document.querySelectorAll('.identity__memory');
  const identityBottom   = document.querySelector('.identity__bottomline');
  const identityCount    = document.querySelector('.identity__count');

  const identityWords = identityWordsEl
    ? (identityWordsEl.dataset.words || '').split('|').map(s => s.trim()).filter(Boolean)
    : [];

  // Ritmo del typewriter
  const TYPE_MIN  = 60;   // escribir: 60–140 ms por letra (irregular = más humano)
  const TYPE_VAR  = 80;
  const DELETE_MS = 38;   // borrar: parejo y un poco más rápido (como mantener backspace)
  const HOLD_MS   = 1500; // pausa con la palabra completa
  const GAP_MS    = 380;  // pausa con el campo vacío, antes de la próxima palabra

  let identityIdx = 0;            // índice de la palabra actual
  let identityChars = 0;          // letras visibles ahora mismo
  let identityPhase = 'typing';   // 'typing' | 'holding' | 'deleting'
  let identityTimer = null;
  let identityRunning = false;

  // La memoria (imagen) + contador acompañan a la palabra que empieza
  function identitySetMeta(idx) {
    const n = identityWords.length;
    identityMemories.forEach((m, i) => m.classList.toggle('is-active', i === idx));
    if (identityCount) {
      identityCount.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
    if (identityBottom) identityBottom.classList.add('show');
  }

  function identityRender() {
    if (identityType) identityType.textContent = identityWords[identityIdx].slice(0, identityChars);
  }

  function identitySchedule(ms) { identityTimer = setTimeout(identityStep, ms); }

  function identityStep() {
    const word = identityWords[identityIdx];
    if (identityPhase === 'typing') {
      if (identityChars === 0) identitySetMeta(identityIdx); // la memoria aparece al iniciar la palabra
      if (identityChars < word.length) {
        identityWordsEl.classList.add('is-busy');             // cursor solido mientras escribe
        identityChars++;
        identityRender();
        identitySchedule(TYPE_MIN + Math.random() * TYPE_VAR);
      } else {
        identityPhase = 'holding';
        identityWordsEl.classList.remove('is-busy');          // cursor parpadea en la pausa
        identitySchedule(HOLD_MS);
      }
    } else if (identityPhase === 'holding') {
      identityPhase = 'deleting';
      identitySchedule(0);
    } else { // deleting
      if (identityChars > 0) {
        identityWordsEl.classList.add('is-busy');             // cursor solido mientras borra
        identityChars--;
        identityRender();
        if (identityChars === 0) {
          identityWordsEl.classList.remove('is-busy');        // parpadea en el hueco vacio
          identitySchedule(GAP_MS);
        } else {
          identitySchedule(DELETE_MS);
        }
      } else {
        identityIdx = (identityIdx + 1) % identityWords.length;
        identityPhase = 'typing';
        identitySchedule(0);
      }
    }
  }

  function identityStart() {
    if (identityRunning || !identityWords.length) return;
    identityRunning = true;
    identityStep();
  }
  function identityStop() {
    identityRunning = false;
    if (identityTimer) { clearTimeout(identityTimer); identityTimer = null; }
    if (identityWordsEl) identityWordsEl.classList.remove('is-busy');
  }

  if (identitySection && identityWords.length) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (identitySticky) identitySticky.classList.add('is-ready');
        if (prefersReduced) {
          // Con reduce-motion: estado estatico "Soy Johana.", sin animacion.
          identityIdx = identityWords.length - 1;
          identityChars = identityWords[identityIdx].length;
          identityRender();
          identitySetMeta(identityIdx);
        } else {
          identityIdx = 0; identityChars = 0; identityPhase = 'typing';
          identityRender();
          identitySetMeta(0);
        }
      });
    });
    if (!prefersReduced) {
      // Arranca/para solo cuando la seccion esta a la vista (no malgasta ciclos fuera de pantalla)
      const visIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) identityStart();
          else identityStop();
        });
      }, { threshold: 0.3 });
      visIO.observe(identitySection);
    }
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
      const inView = rect.bottom > 0 && rect.top < viewport;

      const n = slides.length;
      const idx = Math.min(n - 1, Math.floor(progress * n * 0.999));

      slides.forEach((s, i) => {
        const active = i === idx;
        s.classList.toggle('is-active', active);
        // Background videos only run while their slide is visible (saves CPU/battery)
        const v = s.querySelector('video');
        if (v) {
          if (active && inView) { if (v.paused) v.play().catch(() => {}); }
          else if (!v.paused) { v.pause(); }
        }
      });
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

  // ===== About video — retrato vivo (reproducir solo en viewport) =====
  (function () {
    const v = document.querySelector('.about__media');
    if (!v) return;
    const saveData = navigator.connection && navigator.connection.saveData;
    const tooSmall = window.matchMedia('(max-width: 700px)').matches;
    if (prefersReduced || saveData || tooSmall) {
      v.removeAttribute('autoplay');
      v.preload = 'none';
      try { v.pause(); } catch (e) {}
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { v.play().catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.25 });
    io.observe(v);
  })();

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

      const text =
        `Hola Johana 👋, me gustaría cotizar un evento.\n\n` +
        `Nombre: ${name}\n` +
        (email   ? `Email: ${email}\n`            : '') +
        (phone   ? `Teléfono: ${phone}\n`         : '') +
        (type    ? `Tipo de evento: ${type}\n`    : '') +
        (message ? `\nMensaje:\n${message}\n`     : '');

      const wa = 'https://wa.me/51956971495?text=' + encodeURIComponent(text);
      window.open(wa, '_blank', 'noopener');

      const btn = form.querySelector('.btn-primary');
      if (btn) { btn.textContent = 'Abriendo WhatsApp…'; btn.disabled = true; }
      let note = form.querySelector('.form-note');
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-note';
        note.setAttribute('role', 'status');
        note.setAttribute('aria-live', 'polite');
        form.appendChild(note);
      }
      note.textContent = 'Te respondo personalmente en menos de 24 h. Si WhatsApp no se abrió, escríbeme al +51 956 971 495 o a jrodriguez@creaktivo.com.pe.';
    });
  }
})();
