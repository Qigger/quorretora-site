// Utilitários de DOM compartilhados pelos módulos da landing.

export const byId = (id) => document.getElementById(id);

export function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Atualiza todos os textos marcados com data-bind="<key>".
export function setBound(key, value) {
  document.querySelectorAll(`[data-bind="${key}"]`).forEach((element) => { element.textContent = String(value); });
}

// Topo do elemento acima de `fraction` da altura da janela e base ainda visível.
export function isInViewport(element, fraction) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
  return rect.top < viewportHeight * fraction && rect.bottom > 0;
}

export function onEscape(handler) {
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') handler(event); });
}
