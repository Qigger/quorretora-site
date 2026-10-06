// Brilho terracota do CTA final: pulsa só enquanto a seção está na tela.
import { byId } from './dom.js';

export function setupCtaGlow() {
  const section = byId('cta-final');
  const glow = byId('cta-glow');
  if (!section || !glow) return;
  new IntersectionObserver(([entry]) => glow.classList.toggle('is-running', entry.isIntersecting)).observe(section);
}
