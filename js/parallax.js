const layers = [];

document.querySelectorAll('.parallax-item').forEach(el => {
  const speed = parseFloat(el.dataset.speed) || 0.5; // default to 0.5 if missing
  layers.push({ el, speed, offset: 0 });
});

function handleScroll(e) {
  const delta = e.deltaY || -e.wheelDelta || e.detail;
  const direction = delta > 0 ? 1 : -1;

  layers.forEach(layer => {
    layer.offset -= layer.speed * direction * 20;
    layer.el.style.transform = `translateX(${layer.offset}px) translateY(-50%)`;
  });
}

window.addEventListener('wheel', handleScroll, { passive: true });
