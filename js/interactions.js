/* Skills 카드 포커스와 쌓임 순서 */
(function(){
  const skillsWrap = document.querySelector('.skills');
  if(!skillsWrap) return;
  const cards = Array.from(skillsWrap.querySelectorAll('.skill-oval'));
  if (!cards.length) return;
  cards.forEach(card => {
    const z = window.getComputedStyle(card).zIndex;
    card.dataset.baseZ = (z === 'auto' ? '0' : z);
  });
  let elevated = null;
  const TOP_Z = 9999;
  function lift(card){
    if (elevated && elevated !== card){ restore(elevated); }
    if (elevated === card && card.style.zIndex === String(TOP_Z)) return;
    if (!card.dataset.baseZ){
      const z = window.getComputedStyle(card).zIndex;
      card.dataset.baseZ = (z === 'auto' ? '0' : z);
    }
    card.style.zIndex = String(TOP_Z);
    elevated = card;
  }
  function restore(card){
    const base = card?.dataset?.baseZ ?? '0';
    card.style.zIndex = base;
    if (elevated === card) elevated = null;
  }
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => lift(card));
    card.addEventListener('mouseleave', () => restore(card));
  });
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('focusin',   () => lift(card));
    card.addEventListener('focusout',  () => restore(card));
  });
  skillsWrap.addEventListener('mouseleave', () => { if (elevated) restore(elevated); });
  window.addEventListener('resize', () => {
    cards.forEach(card => {
      if (!card.matches(':hover') && document.activeElement !== card){
        restore(card);
      }
    });
  });
})();

/* Archive 글자 애니메이션 */
document.addEventListener("DOMContentLoaded", () => {
  const archive = document.querySelector("#archive");
  if (!archive) return;
  const wordGroups = archive.querySelectorAll(".word-group");
  if (!wordGroups.length) return;
  wordGroups.forEach(el => { if (!el.hasAttribute("data-text")) el.setAttribute("data-text", el.textContent); });
  let current = 0;
  const DURATION = 500;
  let timer = null;
  const loop = () => {
    wordGroups.forEach(el => el.classList.remove("active"));
    wordGroups[current].classList.add("active");
    timer = setTimeout(() => {
      wordGroups[current].classList.remove("active");
      current = (current + 1) % wordGroups.length;
      loop();
    }, DURATION);
  };
  const start = () => { if (!timer) loop(); };
  const stop = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    wordGroups.forEach(el => el.classList.remove("active"));
  };
  const io = new IntersectionObserver(
    entries => { entries.forEach(entry => (entry.isIntersecting ? start() : stop())); },
    {threshold: 0.2}
  );
  io.observe(archive);
});
(function(){
  const roots = [document.getElementById('archive'), document.getElementById('contact')].filter(Boolean);
  if (!roots.length) return;
  function splitTextNodes(el){
    if (!el || el.dataset.split === '1') return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.replace(/\s+/g,'').length
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const str  = node.nodeValue;
      const frag = document.createDocumentFragment();
      let i = 0;
      for (let ch of str){
        const span = document.createElement('span');
        span.className = 'tchar';
        span.style.setProperty('--i', i++);
        span.textContent = (ch === '\n') ? ' ' : ch;
        frag.appendChild(span);
      }
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.split = '1';
  }
  roots.forEach(root => {
    root.querySelectorAll('.animated-tit, .note-eyebrow, .cv-link').forEach(splitTextNodes);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) el.classList.add('is-inview');
      else if (entry.intersectionRatio === 0) el.classList.remove('is-inview');
    });
  }, { root: null, rootMargin: '-10% 0px -10% 0px', threshold: [0, .2, .6, 1] });
  roots.forEach(root => {
    root.querySelectorAll('.animated-tit, .note-eyebrow, .cv-link, .note-panel.note-default').forEach(el => io.observe(el));
  });
})();


/* 첫 화면 프로젝트 미리보기 */
(function(){
  const overlay = document.getElementById('workOverlay') || document.querySelector('.work-overlay');
  if(!overlay) return;
  const layers = overlay.querySelectorAll('.work-layer');
  const thumbsWrap = document.querySelector('.thumbs');
  const thumbs = document.querySelectorAll('.thumb-item');
  const titles = document.querySelectorAll('.work-title');
  const getTitle = (idx) => document.querySelector(`.work-title[data-work="${idx}"]`);
  const getLayer = (idx) => overlay.querySelector(`.work-layer[data-work="${idx}"]`);
  function anyActive(){ return Array.from(layers).some(l => l.classList.contains('is-active')); }
  function showWork(idx){
    const layer = getLayer(idx);
    const title = getTitle(idx);
    if(!layer || !title) return;
    layers.forEach(l => l.classList.toggle('is-active', l === layer));
    titles.forEach(t => t.classList.toggle('is-active', t === title));
    document.body.classList.add('overlay-on');
  }
  function hideWork(idx){
    const layer = getLayer(idx);
    const title = getTitle(idx);
    if(layer) layer.classList.remove('is-active');
    if(title) title.classList.remove('is-active');
    if(!anyActive()) document.body.classList.remove('overlay-on');
  }
  function hideAll(){
    layers.forEach(l => l.classList.remove('is-active'));
    titles.forEach(t => t.classList.remove('is-active'));
    document.body.classList.remove('overlay-on');
    thumbs.forEach(i=>i.classList.remove('is-hover'));
  }
  thumbs.forEach(item => {
    const idx = item.dataset.work;
    item.addEventListener('mouseenter', () => { item.classList.add('is-hover'); showWork(idx); });
    item.addEventListener('mouseleave', () => { item.classList.remove('is-hover'); hideWork(idx); });
    item.addEventListener('focus', () => { item.classList.add('is-hover'); showWork(idx); });
    item.addEventListener('blur',  () => { item.classList.remove('is-hover'); hideWork(idx); });
  });
  if (thumbsWrap) { thumbsWrap.addEventListener('mouseleave', hideAll); }
})();

/* 고정 탐색 메뉴를 Hero 마스크 밖으로 이동 */
(function(){
  const ui = document.querySelector('.ui');
  if (!ui || ui.__ported) return;
  let portal = document.getElementById('ui-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'ui-portal';
    portal.style.position = 'fixed';
    portal.style.inset = '0';
    portal.style.pointerEvents = 'none';
    portal.style.zIndex = '2000';
    document.body.appendChild(portal);
  }
  portal.appendChild(ui);
ui.style.pointerEvents = 'none';
ui.style.width = '0'; 
ui.style.height = '0';
ui.style.overflow = 'visible';
  ui.__ported = true;
})();
/* 첫 화면 썸네일에서 프로젝트로 이동 */
(function heroThumbsRouter(){
  const work   = document.getElementById('work');
  const thumbs = document.querySelectorAll('.thumbs .thumb-item[data-work]');
  if (!work || !thumbs.length) return;

  const lenis = window.__lenis;
  const vh = () => window.innerHeight || 0;
  const FIRST = 0.06;
  const HIT   = 0.58;
  const SHIFT = 1;
  function desiredProgress(k){
    return (k === 1) ? FIRST : ((k - 1 - SHIFT) + HIT);
  }
  function yForProgress(p){
    const workTop = work.getBoundingClientRect().top + window.scrollY;
    return workTop + p * vh();
  }
  function scrollToY(y, duration){
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(y, { duration: duration ?? 0.9, easing: t => t, force: true, lock: true });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
  function goTo(k){
    if (window.matchMedia('(max-width: 1080px)').matches) {
      const section = work.querySelector(`.work-section[data-layer="${k}"]`);
      if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
      return;
    }
    const p  = desiredProgress(k);
    const y0 = yForProgress(p);
    scrollToY(y0, 0.8);
    if (k !== 1) return;
    let tries = 0;
    const MAX  = 24;
    const EPS  = 0.02;
    const STEP = 0.08;
    (function correct(){
      const prog = window.__workProgress;
      if (typeof prog !== 'number') { if (tries++ < MAX) requestAnimationFrame(correct); return; }
      const delta = prog - p;
      if (Math.abs(delta) <= EPS) return;
      const next = prog - Math.sign(delta) * Math.min(Math.abs(delta), STEP);
      scrollToY(yForProgress(next), 0.22);
      if (tries++ < MAX) requestAnimationFrame(correct);
    })();
  }
  thumbs.forEach((el) => {
    el.style.cursor = 'pointer';
    function act(e){
      e.preventDefault();
      e.stopPropagation();
      const k = Number(e.currentTarget.dataset.work);
      if (!k) return;
      goTo(k);
    }
    el.addEventListener('click', act);
  });
})();
(function brandToAbsoluteTop(){
  const brand = document.querySelector('a.brand[href="#hero"]');
  if (!brand) return;
  const lenis = window.__lenis;
  function goTop(e){
    e.preventDefault(); 
    e.stopPropagation();
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { duration: 0.9, easing: t => t, force: true, lock: true });
      setTimeout(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, 950);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, 950);
    }
    try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  }
  brand.addEventListener('click', goTop);
  brand.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') goTop(e);
  });
})();

/* Archive 카드의 설명을 터치와 키보드로도 선택할 수 있게 한다. */
(function archiveStrengthSelection(){
  const grid = document.getElementById('strengthsGrid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.strength-card[data-key]')];
  function select(card) {
    const shouldOpen = !card.classList.contains('is-active');
    cards.forEach(item => {
      const active = shouldOpen && item === card;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(hover: hover)').matches) return;
      cards.forEach(item => {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });
    });
    card.addEventListener('click', () => select(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(card);
      }
    });
  });
})();
