// O que acontece quando cada [data-seen] entra na tela pela primeira vez.
// Ícones de confiança e sombra dos planos são só CSS (classe .is-seen posta pelo reveal.js).
import { setBound } from './dom.js';
import { playDashboardCounters } from './dashboard-chart.js';

const DOR_HIGHLIGHT = { startMs: 300, endMs: 1500, staggerMs: 80 };
const NOTIF_INTERVAL_MS = 400;
const POS_VENDA_SWAP_MS = 1500;

const EFFECTS = {
  dor: highlightPainNumbers,
  notif: showNotifications,
  dash: playDashboardCounters,
  pvfila: swapPostSaleStatus,
};

export function handleSeen(key, options) {
  EFFECTS[key]?.(options);
}

// Os números 01–04 dos cards de dor acendem em sequência e apagam.
function highlightPainNumbers({ instant, element }) {
  if (instant) return;
  element.querySelectorAll('.dor-num').forEach((number, index) => {
    const offset = index * DOR_HIGHLIGHT.staggerMs;
    setTimeout(() => number.classList.add('is-hi'), DOR_HIGHLIGHT.startMs + offset);
    setTimeout(() => number.classList.remove('is-hi'), DOR_HIGHLIGHT.endMs + offset);
  });
}

// As notificações chegam uma a uma no sino; depois aparece o e-mail que quem vendeu recebe.
function showNotifications({ instant, element }) {
  const items = [...element.querySelectorAll('.notif-item')];
  const mail = element.querySelector('.notif-mail');
  const showUpTo = (count) => {
    items.forEach((item, index) => item.classList.toggle('is-on', index < count));
    setBound('bellCount', count);
  };
  if (instant) { showUpTo(items.length); mail?.classList.add('is-on'); return; }
  items.forEach((_, index) => setTimeout(() => showUpTo(index + 1), (index + 1) * NOTIF_INTERVAL_MS));
  setTimeout(() => mail?.classList.add('is-on'), (items.length + 1) * NOTIF_INTERVAL_MS);
}

// A solicitação "Alteração de dados cadastrais" sai de "Em análise" para "Em andamento".
function swapPostSaleStatus({ instant }) {
  const swap = () => {
    const pill = document.getElementById('pv-pill');
    if (pill) { pill.textContent = 'Em andamento'; pill.classList.add('is-swapped'); }
    setBound('pvA', 1);
    setBound('pvB', 1);
  };
  if (instant) swap(); else setTimeout(swap, POS_VENDA_SWAP_MS);
}
