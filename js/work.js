/* === WORK: Reverse Peel === */
function bindWorkScroll(handler) {
  var lenis = window.__lenis;
  if (lenis && typeof lenis.on === 'function') lenis.on('scroll', handler);
  else window.addEventListener('scroll', handler, { passive: true });
}
(function () {
  var stack = document.querySelector('#work.work-stack');
  if (!stack) return;
  var sections = Array.from(stack.querySelectorAll('.work-section'));
  var sticky = document.createElement('div');
  sticky.className = 'work-sticky';
  sections.forEach(sec => sticky.appendChild(sec));
  stack.appendChild(sticky);
  stack.style.setProperty('--count', sections.length);
  var vh = () => window.innerHeight || 0;
  var target = 0, current = 0, ease = 0.16;
  var REVEAL_START = 0.60, REVEAL_RANGE = 0.40;
  function measureTarget() {
    var r = stack.getBoundingClientRect();
    target = Math.min(sections.length, Math.max(0, (-r.top) / vh()));
  }
  function render() {
    current += (target - current) * ease;
    var staticLayout = window.matchMedia('(max-width: 1080px)').matches;
    sections.forEach((sec, i) => {
      var reveal = 1;
      if (!staticLayout && i > 0) {
        var u = current - (i - 1);
        var norm = (u - REVEAL_START) / REVEAL_RANGE;
        reveal = Math.max(0, Math.min(1, norm));
      }
      sec.style.setProperty('--reveal', reveal);
      var hidden = !staticLayout && reveal <= 0.001;
      sec.style.pointerEvents = hidden ? 'none' : 'auto';
      sec.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      sec.inert = hidden;
    });
    window.__workProgress = current;
    requestAnimationFrame(render);
  }
  bindWorkScroll(measureTarget);
  window.addEventListener('resize', measureTarget);
  measureTarget(); render();
})();

/* === WORK: Hover Video === */
(function () {
  var heroes = document.querySelectorAll('#work .work-hero');
  var io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      var hero = entry.target, video = hero.querySelector('.work-hover__video');
      if (!video) return;
      if (!entry.isIntersecting) {
        video.pause(); video.currentTime = 0; hero.classList.remove('is-open');
        hero.setAttribute('aria-pressed', 'false');
      }
    });
  }, { threshold: 0.01 });
  heroes.forEach(hero => {
    var video = hero.querySelector('.work-hover__video');
    var file = hero.dataset.video, loaded = false;
    function ensure() { if (!loaded && file) { video.src = 'video/preview/' + file; loaded = true; } }
    function play() {
      ensure(); video.currentTime = 0; video.play().catch(() => { });
      hero.classList.add('is-open');
      hero.setAttribute('aria-pressed', 'true');
    }
    function stop() {
      video.pause(); video.currentTime = 0;
      hero.classList.remove('is-open');
      hero.setAttribute('aria-pressed', 'false');
    }
    function toggle() { hero.classList.contains('is-open') ? stop() : play(); }
    hero.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) play();
    });
    hero.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover)').matches) stop();
    });
    hero.addEventListener('click', e => {
      e.preventDefault();
      toggle();
    });
    hero.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    io.observe(hero);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.querySelectorAll('#work .work-hero').forEach(hero => {
        hero.querySelector('video')?.pause();
        hero.classList.remove('is-open');
        hero.setAttribute('aria-pressed', 'false');
      });
    }
  });
})();

/* === WORK: Heading Split === */
(function () {
  var root = document.querySelector('#work.work-stack');
  if (!root) return;
  function splitKeepBr(h) {
    if (h.dataset.split === '1') return;
    var frag = document.createDocumentFragment(), i = 0;
    h.childNodes.forEach(node => {
      if (node.nodeType === 3) {
        for (let ch of node.nodeValue) {
          var span = document.createElement('span');
          span.className = 'tchar'; span.textContent = ch;
          span.style.setProperty('--i', i++);
          if (ch === ' ') { span.style.display = 'inline-block'; span.style.width = '.33em'; }
          frag.appendChild(span);
          frag.appendChild(document.createTextNode('\u200B'));
        }
      } else if (node.nodeName === 'BR') { frag.appendChild(document.createElement('br')); i += 2; }
      else frag.appendChild(node.cloneNode(true));
    });
    h.innerHTML = ''; h.appendChild(frag); h.dataset.split = '1';
  }
  var headings = Array.from(root.querySelectorAll('.work-heading'));
  headings.forEach(splitKeepBr);
  var sections = Array.from(root.querySelectorAll('.work-section'));
  function tick() {
    sections.forEach(sec => {
      var h = sec.querySelector('.work-heading'); if (!h) return;
      var r = parseFloat(getComputedStyle(sec).getPropertyValue('--reveal')) || 0;
      if (r >= 0.35) h.classList.add('is-inview');
      else if (r <= 0.20) h.classList.remove('is-inview');
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* === Section Peek (fix: work-btn opens & not auto-closed) === */
(function () {
  const peeks = document.querySelectorAll('#work .section-peek');
  if (!peeks.length) return;
  const panels = new Map([...peeks].map(el => [el, el.querySelector('.section-peek__panel')]));
  const placePanels = () => {
    const mobile = window.matchMedia('(max-width: 1080px)').matches;
    peeks.forEach(el => {
      const panel = panels.get(el);
      if (!panel) return;
      if (mobile) {
        if (panel.parentElement !== document.body) document.body.appendChild(panel);
        panel.setAttribute('popover', 'manual');
      } else {
        if (panel.matches(':popover-open')) panel.hidePopover();
        panel.removeAttribute('popover');
        if (panel.parentElement !== el) el.appendChild(panel);
      }
    });
  };
  placePanels();
  window.addEventListener('resize', placePanels);
  const setOpen = (el, open) => {
    el.classList.toggle('is-open', open);
    el.setAttribute('aria-expanded', open ? 'true' : 'false');
    const tab = el.querySelector('.section-peek__tab');
    if (tab) tab.setAttribute('aria-expanded', open ? 'true' : 'false');
    const panel = panels.get(el);
    if (panel) {
      panel.classList.toggle('is-open', open);
      panel.inert = !open;
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (panel.hasAttribute('popover')) {
        if (open && !panel.matches(':popover-open')) panel.showPopover();
        if (!open && panel.matches(':popover-open')) panel.hidePopover();
      }
    }
    const btn = el.closest('.work-section')?.querySelector('.work-btn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  const closeAllExcept = keep => {
    peeks.forEach(p => { if (p !== keep) setOpen(p, false); });
  };
  peeks.forEach(peek => {
    const tab = peek.querySelector('.section-peek__tab');
    const panel = panels.get(peek);
    if (!tab) return;
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !peek.classList.contains('is-open');
      closeAllExcept(willOpen ? peek : null);
      setOpen(peek, willOpen);
    });
    panel?.querySelector('.section-peek__close')?.addEventListener('click', e => {
      e.stopPropagation();
      setOpen(peek, false);
      peek.closest('.work-section')?.querySelector('.work-btn')?.focus();
    });
    setOpen(peek, false);
  });
  document.querySelectorAll('#work .work-section .work-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const section = btn.closest('.work-section');
      const peek = section && section.querySelector('.section-peek');
      if (peek) {
        closeAllExcept(peek);
        setOpen(peek, true);
        panels.get(peek)?.querySelector('.section-peek__close')?.focus();
      }
    });
  });
  document.addEventListener('click', (e) => {
    const insidePanel = e.target.closest('.section-peek__panel');
    const insideTab = e.target.closest('.section-peek__tab');
    const insideBtn = e.target.closest('.work-btn');
    if (!insidePanel && !insideTab && !insideBtn) {
      closeAllExcept(null);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const peek = document.activeElement.closest?.('.section-peek');
      closeAllExcept(null);
      if (peek) peek.querySelector('.section-peek__tab')?.focus();
    }
  });
})();
