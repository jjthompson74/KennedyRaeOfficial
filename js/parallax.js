const layers = [
  { el: document.querySelector('.layer-1'), speed: 0.2, offset: 0 },
  { el: document.querySelector('.layer-2'), speed: 0.4, offset: 0 },
  { el: document.querySelector('.layer-3'), speed: 0.6, offset: 0 },
  { el: document.querySelector('.layer-4'), speed: 0.8, offset: 0 },
  { el: document.querySelector('.layer-5'), speed: 1.0, offset: 0 }
];

let scrollDirection = 0;

function handleScroll(e) {
  const delta = e.deltaY || -e.wheelDelta || e.detail;
  scrollDirection = delta > 0 ? 1 : -1;

  layers.forEach(layer => {
    layer.offset -= layer.speed * scrollDirection * 20;
    layer.el.style.transform = `translateX(${layer.offset}px) translateY(-50%)`;
  });
}

window.addEventListener('wheel', handleScroll, { passive: true });
