// Fila de propostas da seção "O que muda": a primeira venda avança de status enquanto a fila está visível.
import { byId, setBound } from './dom.js';

const STATUSES = [
  { text: 'Aguardando validação', background: '#EEF2F6', color: '#44618C' },
  { text: 'Aguardando emissão', background: '#EEF2F6', color: '#44618C' },
  { text: 'Emitido', background: '#E4EDFB', color: '#2F6BD6' },
  { text: 'Em análise', background: '#E4EDFB', color: '#2F6BD6' },
  { text: 'Implantado', background: '#DCF2E7', color: '#30A46C' },
];
const IMPLANTED = STATUSES.length - 1;
const STEP_MS = 2500;
const TOAST_MS = 1700;
const CYCLE_MS = 12500;

// Contadores da árvore de status: valor base + 1 quando a venda animada está naquele status.
const COUNTERS = {
  cCur: [11, (step) => step === 0],
  cVal: [7, (step) => step === 0],
  cEmi: [9, (step) => step === 1 || step === 2],
  cAgEmi: [6, (step) => step === 1],
  cEmit: [3, (step) => step === 2],
  cOp: [23, (step) => step === 3],
  cAnl: [7, (step) => step === 3],
};
const IMPLANTED_BASE = 85;

export function setupFilaDemo({ animate }) {
  const wrap = byId('fila-wrap');
  if (!wrap) return;
  const view = { pill: byId('fila-pill'), toast: byId('fila-toast'), label: byId('fila-impl-label'), count: byId('fila-impl-count') };
  if (!animate) { render(view, IMPLANTED, false); return; }

  let timers = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; render(view, 0, false); };
  const run = () => {
    render(view, 0, false);
    STATUSES.slice(1).forEach((_, index) => {
      const step = index + 1;
      const at = STEP_MS * step;
      timers.push(setTimeout(() => render(view, step, true), at));
      timers.push(setTimeout(() => render(view, step, false), at + TOAST_MS));
    });
    timers.push(setTimeout(() => { timers = []; run(); }, CYCLE_MS));
  };

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !timers.length) run();
    else if (!entry.isIntersecting) stop();
  }, { threshold: 0.3 }).observe(wrap);
}

function render(view, step, toastOn) {
  const status = STATUSES[step];
  view.pill.textContent = status.text;
  view.pill.style.background = status.background;
  view.pill.style.color = status.color;
  view.toast.classList.toggle('is-on', toastOn);

  Object.entries(COUNTERS).forEach(([key, [base, isActive]]) => setBound(key, base + (isActive(step) ? 1 : 0)));
  const implanted = step === IMPLANTED;
  view.count.textContent = String(IMPLANTED_BASE + (implanted ? 1 : 0));
  view.label.classList.toggle('is-hi', implanted && toastOn);
  view.count.classList.toggle('is-hi', implanted && toastOn);
}
