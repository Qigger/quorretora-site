// Segunda linha do H1 do hero: alterna as frases e mantém a mais longa em uma linha só.
import { byId } from './dom.js';

const PHRASES = ['da proposta ao pós-venda.', 'do cadastro à implantação.', 'em todas as Operadoras.'];
const CYCLE_MS = 2800;
const FADE_MS = 350;
const FIT_SAFETY = 0.98;

export function setupKineticHeadline({ animate }) {
  setupHeadlineFit();
  const word = byId('kin-word');
  if (!word || !animate) return;

  let index = 0;
  setInterval(() => {
    word.classList.add('is-out');
    setTimeout(() => {
      index = (index + 1) % PHRASES.length;
      word.textContent = PHRASES[index];
      word.classList.remove('is-out');
    }, FADE_MS);
  }, CYCLE_MS);
}

// A linha é nowrap; o #kin-sizer invisível tem a frase mais longa e define quanto a fonte precisa encolher.
function setupHeadlineFit() {
  const headline = byId('hero-h1');
  const line = byId('kin-line');
  const sizer = byId('kin-sizer');
  if (!headline || !line || !sizer) return;

  const baseFontSize = headline.style.fontSize;
  const fit = () => {
    headline.style.removeProperty('font-size');
    headline.style.fontSize = baseFontSize;
    const available = line.clientWidth;
    const needed = sizer.scrollWidth;
    if (!available || !needed || needed <= available) return;
    const current = parseFloat(getComputedStyle(headline).fontSize);
    headline.style.setProperty('font-size', (current * available / needed * FIT_SAFETY).toFixed(2) + 'px', 'important');
  };

  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener('resize', fit);
}
