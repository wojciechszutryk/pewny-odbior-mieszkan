// /static/slider.js
(function () {
  const sliders = document.querySelectorAll('.slider');
  if (!sliders.length) return;

  sliders.forEach((root, sliderIndex) => {
    const track = root.querySelector('.slider-track');
    const slides = Array.from(root.querySelectorAll('.slide'));
    const prevBtn = root.querySelector('.slider-btn.prev');
    const nextBtn = root.querySelector('.slider-btn.next');
    const dotsWrap = root.querySelector('.slider-dots');

    let i = 0;
    let autoplayMs = Number(root.getAttribute('data-autoplay')) || 0;
    let autoplayTimer = null;
    let isPointerDown = false;
    let startX = 0;
    let currentX = 0;
    let deltaX = 0;
    let width = root.clientWidth;

    function setSize() { width = root.clientWidth; goTo(i, false); }
    window.addEventListener('resize', setSize, { passive: true });

    // Dots
    const dots = slides.map((_, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Przejdź do slajdu ${idx + 1}`);
      b.addEventListener('click', () => goTo(idx));
      dotsWrap.appendChild(b);
      return b;
    });

    function updateDots() {
      dots.forEach((d, idx) => d.setAttribute('aria-current', idx === i ? 'true' : 'false'));
    }

    function goTo(idx, animate = true) {
      i = (idx + slides.length) % slides.length;
      track.style.transition = animate ? 'transform .35s ease' : 'none';
      track.style.transform = `translateX(${-i * width}px)`;
      updateDots();
      manageButtons();
    }

    function manageButtons() {
      // pozostawiamy aktywne (pętla) — jeśli chcesz zablokować na skrajach, możesz dodać disabled
    }

    function next() { goTo(i + 1); }
    function prev() { goTo(i - 1); }

    // Autoplay
    function startAutoplay() {
      if (!autoplayMs || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stopAutoplay();
      autoplayTimer = setInterval(next, autoplayMs);
    }
    function stopAutoplay() { if (autoplayTimer) clearInterval(autoplayTimer); autoplayTimer = null; }

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay(); else startAutoplay();
    });

    // Keyboard
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { prev(); e.preventDefault(); }
    });

    // Buttons
    nextBtn?.addEventListener('click', next);
    prevBtn?.addEventListener('click', prev);

    // Pointer / Touch (swipe)
    function onDown(x) {
      isPointerDown = true; startX = x; deltaX = 0;
      track.style.transition = 'none';
    }
    function onMove(x) {
      if (!isPointerDown) return;
      currentX = x; deltaX = currentX - startX;
      track.style.transform = `translateX(${-i * width + deltaX}px)`;
    }
    function onUp() {
      if (!isPointerDown) return;
      isPointerDown = false;
      const threshold = width * 0.2;
      if (deltaX > threshold) prev(); else if (deltaX < -threshold) next(); else goTo(i);
    }

    // Mouse
    track.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(e.clientX); });
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);

    // Touch
    track.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend', onUp);

    // Init
    goTo(0, false);
    startAutoplay();
  });
})();
