// Menu em tela cheia do header no celular (≤840px).
import { byId, onEscape } from './dom.js';
import { lockScroll, unlockScroll } from './scroll-lock.js';

export function setupMobileMenu() {
  const menu = byId('mobile-menu');
  const trigger = byId('menu-btn');
  if (!menu || !trigger) return;

  const open = () => {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    lockScroll('menu');
    menu.querySelector('[data-menu-close]')?.focus();
  };
  const close = ({ restoreFocus = false } = {}) => {
    if (menu.hidden) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    unlockScroll('menu');
    if (restoreFocus) trigger.focus();
  };

  trigger.addEventListener('click', open);
  // Links de âncora e o "Testar grátis" do menu também fecham o menu.
  menu.querySelectorAll('[data-menu-close], [data-open-trial]').forEach((element) => {
    element.addEventListener('click', () => close());
  });
  onEscape(() => close({ restoreFocus: true }));
}
