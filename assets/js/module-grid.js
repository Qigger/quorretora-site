// Seção "Nove módulos": letreiro contínuo e, no celular, carrossel com toque para abrir o card e pontos de posição.
import { byId } from './dom.js';

const MOBILE_QUERY = '(max-width:767px)';
const GRID_GAP_PX = 12;

export function setupModuleGrid() {
  duplicateMarqueeGroup();
  const grid = byId('mod-grid');
  const dotsHost = byId('mod-dots');
  if (!grid || !dotsHost) return;

  const items = [...grid.children];
  const dots = items.map(() => {
    const dot = document.createElement('span');
    dot.className = 'mod-dot';
    return dot;
  });
  dotsHost.append(...dots);
  setActiveDot(dots, 0);

  const mobile = window.matchMedia(MOBILE_QUERY);
  items.forEach((item) => item.addEventListener('click', () => {
    if (!mobile.matches) return;
    const willOpen = !item.classList.contains('is-open');
    items.forEach((other) => other.classList.remove('is-open'));
    item.classList.toggle('is-open', willOpen);
  }));
  mobile.addEventListener('change', () => items.forEach((item) => item.classList.remove('is-open')));
  grid.addEventListener('scroll', () => setActiveDot(dots, visibleIndex(grid, items)), { passive: true });
}

function visibleIndex(grid, items) {
  const step = items[0].getBoundingClientRect().width + GRID_GAP_PX;
  const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 2;
  const index = atEnd ? items.length - 1 : Math.round(grid.scrollLeft / step);
  return Math.max(0, Math.min(items.length - 1, index));
}

function setActiveDot(dots, activeIndex) {
  dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
}

// O loop do letreiro anda -50%: precisa de duas cópias idênticas da lista lado a lado.
function duplicateMarqueeGroup() {
  const track = document.querySelector('#mod-marquee .marquee-track');
  const group = track?.firstElementChild;
  if (group) track.appendChild(group.cloneNode(true));
}
