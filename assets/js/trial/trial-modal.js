// Modal do teste grátis: abertura pelos botões [data-open-trial], foco preso no diálogo e links diretos.
//   ?teste=1 ou #teste abre o modal ao carregar · &plano=automacao já seleciona o plano Automação
import { byId } from '../dom.js';
import { lockScroll, unlockScroll } from '../scroll-lock.js';
import { createTrialFlow } from './trial-flow.js';

const FOCUSABLE = 'button, [href], input, select, textarea, video[controls]';
const OPEN_FOCUS_DELAY_MS = 60;
const DEEP_LINK_DELAY_MS = 250;

export function setupTrialModal({ config }) {
  const overlay = byId('trial-overlay');
  const dialog = byId('trial-modal');
  if (!overlay || !dialog) return;
  const flow = createTrialFlow({ config });
  let opener = null;

  const open = (plan) => {
    opener = document.activeElement;
    flow.prepare({ plan });
    overlay.hidden = false;
    lockScroll('trial');
    setTimeout(() => (dialog.querySelector('input[name="nome"]') || dialog).focus(), OPEN_FOCUS_DELAY_MS);
  };
  const close = ({ fromButton }) => {
    if (overlay.hidden || !flow.canClose({ fromButton })) return;
    overlay.hidden = true;
    unlockScroll('trial');
    flow.afterClose();
    opener?.focus?.();
    opener = null;
  };

  document.querySelectorAll('[data-open-trial]').forEach((trigger) => {
    trigger.addEventListener('click', () => open(trigger.dataset.openTrial || null));
  });
  // Clicar fora não fecha: evita perder o formulário por um clique acidental no fundo.
  dialog.querySelectorAll('[data-trial-close]').forEach((button) => button.addEventListener('click', () => close({ fromButton: true })));
  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') close({ fromButton: false });
    else if (event.key === 'Tab') trapFocus(event, dialog);
  });

  const deepLinkPlan = readDeepLink();
  if (deepLinkPlan !== undefined) setTimeout(() => open(deepLinkPlan), DEEP_LINK_DELAY_MS);
}

function trapFocus(event, dialog) {
  const focusable = [...dialog.querySelectorAll(FOCUSABLE)]
    .filter((element) => !element.disabled && element.getAttribute('tabindex') !== '-1' && element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !dialog.contains(active))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (active === last || !dialog.contains(active))) { event.preventDefault(); first.focus(); }
}

// undefined = sem link direto; null = abrir com o plano padrão.
function readDeepLink() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('teste') !== '1' && window.location.hash !== '#teste') return undefined;
  return params.get('plano') === 'automacao' ? 'automacao' : null;
}
