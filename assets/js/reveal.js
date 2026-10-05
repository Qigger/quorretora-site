// Entrada suave no scroll ([data-rv]) e gatilhos de seção vista ([data-seen]).
//   data-rv="<ms>"  atraso explícito
//   data-rv="a"     atraso pela posição entre irmãos (passo em data-rv-step no pai, padrão 80ms)
import { isInViewport } from './dom.js';

const REVEAL_AT = 0.85;
const SEEN_AT = 0.8;
const POLL_MS = 300;
const DEFAULT_STEP_MS = 80;
const DURATION_MS = 500;

export function setupReveal({ animate, onSeen }) {
  const seenElements = [...document.querySelectorAll('[data-seen]')];
  if (!animate) {
    seenElements.forEach((element) => markSeen(element, true, onSeen));
    return;
  }

  let pendingReveal = [...document.querySelectorAll('[data-rv]')].filter((element) => !isInViewport(element, 1));
  pendingReveal.forEach(hide);
  let pendingSeen = seenElements;

  const check = () => {
    pendingReveal = pendingReveal.filter((element) => !(isInViewport(element, REVEAL_AT) && show(element)));
    pendingSeen = pendingSeen.filter((element) => !(isInViewport(element, SEEN_AT) && markSeen(element, false, onSeen)));
    if (!pendingReveal.length && !pendingSeen.length) stop();
  };
  // O polling cobre mudanças de layout sem scroll (fontes carregando, vídeo ganhando altura).
  const poll = setInterval(check, POLL_MS);
  const stop = () => {
    clearInterval(poll);
    window.removeEventListener('scroll', check);
    window.removeEventListener('resize', check);
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
}

const originals = new WeakMap();

function hide(element) {
  originals.set(element, {
    delay: revealDelay(element),
    opacity: element.style.opacity,
    transform: element.style.transform,
    transition: element.style.transition,
  });
  element.style.transition = 'none';
  element.style.opacity = '0';
  element.style.transform = 'translateY(16px)';
}

function show(element) {
  const original = originals.get(element);
  element.style.transition = `opacity .5s ease ${original.delay}ms, transform .5s cubic-bezier(.2,.7,.2,1) ${original.delay}ms`;
  void element.offsetWidth;
  element.style.opacity = original.opacity;
  element.style.transform = original.transform;
  setTimeout(() => { element.style.transition = original.transition; }, original.delay + DURATION_MS + 60);
  return true;
}

function revealDelay(element) {
  const explicit = parseInt(element.dataset.rv, 10);
  if (!Number.isNaN(explicit)) return explicit;
  const parent = element.parentElement;
  const step = parseInt(parent?.dataset.rvStep, 10);
  const siblings = parent ? [...parent.children].filter((child) => child.dataset.rv === 'a') : [];
  return Math.max(0, siblings.indexOf(element)) * (Number.isNaN(step) ? DEFAULT_STEP_MS : step);
}

function markSeen(element, instant, onSeen) {
  element.classList.add('is-seen');
  onSeen(element.dataset.seen, { instant, element });
  return true;
}
