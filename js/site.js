/* 스크롤 연출 초기화 */
(function () {
  if (typeof Lenis === 'undefined') return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    wheelMultiplier: 1,
    smoothTouch: false,
    gestureDirection: 'vertical'
  });
  window.__lenis = lenis;
  if (reduceMotion) lenis.stop();
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id && id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      lenis.scrollTo(id, { offset: 0, duration: 1.0, force: true });
    }
  });
  window.addEventListener('load', function () {
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(function () { lenis.scrollTo(location.hash, { duration: 0.9 }); }, 0);
    }
  });
})();
"use strict";

/* Hero 보조 요소를 화면 기준 컨테이너로 이동 */
(function () {
  const heroWrap = document.querySelector('.split-intro .split-pin .wrap');
  if (!heroWrap) return;
  for (const selector of ['.scroll-hint', '.scroll-word', '.thumbs']) {
    document.querySelectorAll(selector).forEach(node => heroWrap.appendChild(node));
  }
})();

/* About 사진과 배지 효과 */
(function(){
  const root    = document.documentElement;
  const photo   = document.querySelector('.about-stage__photo');
  const resume  = document.querySelector('.resume');
  const badges  = Array.from(document.querySelectorAll('.about-stage .glass-badge'));
  if (!photo || !resume) return;
  badges.forEach((b, i) => { b.classList.add('pre-wipe'); b.style.setProperty('--i', i); });
  let isWiping = false;
  let wasFullyHidden = true;
  const MAX_DIM = 0.80;
  const WIPE_TRIGGER = 0.60;
  const updateDimByRange = () => {
    const viewportTop    = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    const photoTop       = photo.getBoundingClientRect().top + window.scrollY;
    const resumeBottom   = resume.getBoundingClientRect().bottom + window.scrollY;
    const dimOn = (viewportBottom > photoTop) && (viewportTop < resumeBottom);
    root.style.setProperty('--under-dim', dimOn ? MAX_DIM : 0);
  };
  const startWipe = () => {
    if (isWiping) return;
    isWiping = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      badges.forEach(b => b.classList.add('wiping'));
    }));
  };
  const resetBadges = () => {
    badges.forEach(b => b.classList.remove('wiping'));
    document.body.offsetHeight; isWiping = false;
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ratio = entry.intersectionRatio || 0;
        if (ratio === 0) { wasFullyHidden = true; resetBadges(); }
        else if (ratio >= WIPE_TRIGGER && wasFullyHidden) { wasFullyHidden = false; startWipe(); }
      });
    }, { threshold: [0, 0.01, .2, .4, .6, .8, 1] });
    io.observe(photo);
  } else { startWipe(); }
  updateDimByRange();
  window.addEventListener('scroll', updateDimByRange, {passive: true});
  window.addEventListener('resize', updateDimByRange);
  requestAnimationFrame(updateDimByRange);
})();

/* === 상단 음영(박스 섀도우) : resume 구간에서만 표시 === */
(function(){
  const root   = document.documentElement;
  const resume = document.querySelector('.resume');
  if (!resume) return;
  let shadow = document.querySelector('.top-shadow');
  if (!shadow) {
    shadow = document.createElement('div');
    shadow.className = 'top-shadow mouth-top';
    document.body.appendChild(shadow);
  } else { shadow.classList.add('mouth-top');}
  const FADE_PX = 200;
  const MAX_OPA = 1.0;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  function updateTopShadow(){
    const viewportTop    = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    const rect = resume.getBoundingClientRect();
    const resumeTop    = rect.top + window.scrollY;
    const resumeBottom = rect.bottom + window.scrollY;
    const inRange = (viewportBottom > resumeTop) && (viewportTop < resumeBottom);
    if (!inRange) {root.style.setProperty('--topshadow', '0'); return;}
    let opa = 1;
    const enterDist = viewportBottom - resumeTop;
    if (enterDist < FADE_PX) {opa = clamp(enterDist / FADE_PX, 0, 1);}
    const exitDist = resumeBottom - viewportTop;
    if (exitDist < FADE_PX) {opa = Math.min(opa, clamp(exitDist / FADE_PX, 0, 1));}
    root.style.setProperty('--topshadow', (opa * MAX_OPA).toFixed(3));
  }
  updateTopShadow();
  window.addEventListener('scroll', updateTopShadow, {passive: true});
  window.addEventListener('resize', updateTopShadow);
})();

/* 이력 인뷰 애니메이션 */
(function(){
  const resume = document.querySelector('.resume');
  if(!resume) return;
  const titles = resume.querySelectorAll('.resume-sec-title');
  titles.forEach(title => {
    if (title.dataset.split === '1') return;
    const raw = title.textContent;
    const frag = document.createDocumentFragment();
    let i = 0;
    for (const ch of raw) {
      const span = document.createElement('span');
      span.className = 'tchar';
      span.style.setProperty('--i', i++);
      span.textContent = ch;
      frag.appendChild(span);
    }
    title.textContent = ''; title.appendChild(frag); title.dataset.split = '1';
  });
  const sections = resume.querySelectorAll('.resume-section');
  sections.forEach(section => {
    const items = section.querySelectorAll('.resume-item');
    items.forEach((li, idx) => { li.style.setProperty('--d', idx); });
  });
  const opts = { root: null, rootMargin: '-12% 0px -12% 0px', threshold: [0, 0.15, 0.35, 0.6, 1] };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) el.classList.add('is-inview');
        else el.classList.remove('is-inview');
      });
    }, opts);
    sections.forEach(sec => io.observe(sec));
  } else {
    const onScroll = () => {
      const vh = window.innerHeight;
      sections.forEach(sec => {
        const r = sec.getBoundingClientRect();
        const midVisible = r.top < vh * 0.65 && r.bottom > vh * 0.35;
        sec.classList.toggle('is-inview', midVisible);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
  }
})();

/* 탐색 메뉴 진행 표시 */
(function(){
  const root    = document.documentElement;
  const about   = document.getElementById('about');
  const work    = document.getElementById('work');
  const archive = document.getElementById('archive');
  const contact = document.getElementById('contact');
  if (!about || !work || !archive || !contact) return;
function sectionProgress(section){
  const vh = window.innerHeight;
  const r  = section.getBoundingClientRect();
  const top = section.offsetTop;
  const height = section.offsetHeight;

  if (height <= vh) {
    const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    return Math.min(1, visible / Math.max(1, Math.min(height, vh)));
  }

  const docTop = window.scrollY;
  const bottom = top + height;
  const viewTop = docTop;
  const viewBottom = docTop + vh;
  if (viewBottom <= top)  return 0;
  if (viewTop >= bottom)  return 1;
  const totalScrollable = Math.max(height - vh, 1);
  const scrolledInside  = Math.min(Math.max(viewTop - top, 0), totalScrollable);
  return scrolledInside / totalScrollable;
}
  function overlapsViewport(section){
    const vh = window.innerHeight;
    const viewTop = window.scrollY;
    const viewBottom = viewTop + vh;
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    return (viewBottom > top) && (viewTop < bottom);
  }
  function updateGauges(){
    let infoP    = sectionProgress(about);
    let workP    = sectionProgress(work);
    let archiveP = sectionProgress(archive);
    let contactP = sectionProgress(contact);
    const inWork    = overlapsViewport(work);
    const inArchive = overlapsViewport(archive);
    const inContact = overlapsViewport(contact);
    if (inWork || inArchive || inContact) infoP = 0;
    if (inArchive || inContact)           workP = 0;
    if (inContact)                        archiveP = 0; 
    root.style.setProperty('--nav-info-p',    infoP.toFixed(4));
    root.style.setProperty('--nav-work-p',    workP.toFixed(4));
    root.style.setProperty('--nav-archive-p', archiveP.toFixed(4));
    root.style.setProperty('--nav-contact-p', contactP.toFixed(4));
  }
  updateGauges();
  window.addEventListener('scroll', updateGauges, {passive:true});
  window.addEventListener('resize', updateGauges);
  window.addEventListener('load', updateGauges);
  setTimeout(updateGauges, 0);
})(); 

/* 화면 구역에 따른 UI 색상 */
(function(){
  const body    = document.body;
  const hero    = document.querySelector('.split-intro');
  const archive = document.getElementById('archive');
  const contact = document.getElementById('contact');
  if (!hero || !archive || !contact) return;

  function inView(el, topPad=0.15, botPad=0.15){
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const topZone = vh * topPad, botZone = vh * (1 - botPad);
    return r.top < botZone && r.bottom > topZone;
  }
  function applyTone(){
    const isDarkText =
      inView(hero, 0.00, 0.70) ||
      inView(archive) ||
      inView(contact);
    body.classList.toggle('ui-light', !!isDarkText);
  }
  const lenis = window.__lenis;
  if (lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', applyTone);
  } else {
    window.addEventListener('scroll', applyTone, { passive:true });
  }
  window.addEventListener('resize', applyTone);
  window.addEventListener('load', applyTone);
  applyTone();
})();

