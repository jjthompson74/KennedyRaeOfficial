(function(){
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isNarrow = () => matchMedia('(max-width: 768px)').matches;

  const root = document.documentElement;
  const stage = document.getElementById('stage');
  const track = document.getElementById('track');
  const panels = Array.from(track.querySelectorAll('.panel'));
  const spacer = document.getElementById('spacer');
  const nav = document.querySelector('.nav');
  const links = Array.from(nav.querySelectorAll('a[data-panel]'));
  const idByIndex = panels.map(p => '#' + p.id);
  const progressEl = document.getElementById('progressBar');

  root.style.setProperty('--panel-count', panels.length);

  let maxX = 0;        // total horizontal distance in px
  let totalScroll = 0; // vertical scroll range mapping to maxX (desktop)
  let currentIndex = 0;

  function measure(){
    const vw = window.innerWidth;
    maxX = Math.max(0, (panels.length * vw) - vw);
    totalScroll = maxX; // 1:1 mapping for desktop
    if (spacer) spacer.style.height = (totalScroll + window.innerHeight) + 'px';
  }

  function clamp(v, a, b){ return Math.min(b, Math.max(a, v)); }

  // --- DESKTOP scroll mapping (window scroll → horizontal translate) ---
  let ticking = false;
  function onScroll(){
    if (isNarrow() || prefersReduced) return; // mobile/reduced-motion uses native stacking
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      const progress = totalScroll ? clamp(y / totalScroll, 0, 1) : 0;
      const x = -progress * maxX;
      track.style.transform = `translate3d(${x}px,0,0)`;
      if (progressEl) progressEl.style.width = (progress * 100) + '%';
      const idx = Math.round(progress * (panels.length - 1));
      if (idx !== currentIndex){ currentIndex = idx; updateNav(idx); setHash(idByIndex[idx], false); }
      ticking = false;
    });
  }

  // --- MOBILE snap progress (track scroll → progress/nav) ---
  function onTrackScroll(){
    if (!isNarrow() || prefersReduced) return;
    const max = track.scrollHeight - track.clientHeight;
    const st = track.scrollTop;
    const progress = max ? clamp(st / max, 0, 1) : 0;
    if (progressEl) progressEl.style.width = (progress * 100) + '%';
    const panelH = track.clientHeight || 1;
    const idx = clamp(Math.round(st / panelH), 0, panels.length - 1);
    if (idx !== currentIndex){ currentIndex = idx; updateNav(idx); setHash(idByIndex[idx], false); }
  }

  function updateNav(activeIndex){
    links.forEach(a => a.removeAttribute('aria-current'));
    const active = links.find(a => Number(a.dataset.panel) === activeIndex);
    if (active) active.setAttribute('aria-current','page');
  }

  function setHash(id, push){
    if (!id || id === window.location.hash) return;
    try{ push ? history.pushState(null,'',id) : history.replaceState(null,'',id); }
    catch(e){ window.location.hash = id; }
  }

  function scrollToPanel(index){
    if (isNarrow() && !prefersReduced){
      // mobile: scroll the track
      const y = (track.clientHeight * index);
      track.scrollTo({ top: y, behavior: 'smooth' });
      return;
    }
    // desktop: map to window scroll
    const targetProgress = (panels.length > 1) ? index / (panels.length - 1) : 0;
    const y = targetProgress * totalScroll;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function gotoHash(){
    const hash = decodeURIComponent(window.location.hash||'');
    if (!hash || hash === '#') return;
    const id = hash.replace('#','');
    const index = panels.findIndex(p => p.id === id);
    if (index < 0) return;
    scrollToPanel(index);
  }

  function bindNav(){
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-panel]');
      if (!a) return;
      const index = Number(a.dataset.panel);
      if (!Number.isFinite(index)) return;
      e.preventDefault();
      const id = a.getAttribute('href');
      setHash(id, true); // create history entry
      scrollToPanel(index);
    });

    // keyboard helpers
    addEventListener('keydown', (e) => {
      if (['ArrowRight','PageDown'].includes(e.key)) { e.preventDefault(); scrollToPanel(clamp(currentIndex+1,0,panels.length-1)); }
      if (['ArrowLeft','PageUp'].includes(e.key))   { e.preventDefault(); scrollToPanel(clamp(currentIndex-1,0,panels.length-1)); }
      if (e.key === 'Home') { e.preventDefault(); scrollToPanel(0); }
      if (e.key === 'End')  { e.preventDefault(); scrollToPanel(panels.length-1); }
    });

    // track scroll listener for mobile snap progress
    track.addEventListener('scroll', onTrackScroll, { passive: true });
  }

  function refresh(){
    if (prefersReduced){
      track.style.transform = 'none';
      if (spacer) spacer.style.display = 'none';
      if (progressEl) progressEl.style.width = '0%';
      return;
    }
    if (isNarrow()){
      // mobile: stacked + snap; no desktop measurements needed
      track.style.transform = 'none';
      if (spacer) spacer.style.display = 'none';
      if (progressEl) progressEl.style.width = '0%';
    } else {
      // desktop
      if (spacer) spacer.style.display = '';
      measure();
      onScroll();
    }
  }

  bindNav();
  addEventListener('resize', refresh);
  addEventListener('orientationchange', refresh);
  addEventListener('load', () => { refresh(); gotoHash(); });
  addEventListener('hashchange', gotoHash);
  addEventListener('scroll', onScroll, { passive:true });
})();
