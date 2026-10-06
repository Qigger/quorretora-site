// Pôster atrás do vídeo do hero: cópia estática da fila da seção "O que muda", escalada para a janela.
import { byId } from './dom.js';

const POSTER_WIDTH = 1180;

// Deve rodar antes da fila animada mudar de estado, para o pôster mostrar o estado inicial.
export function setupHeroPoster() {
  copyQueueIntoPoster();
  scalePosterToWindow();
}

function copyQueueIntoPoster() {
  const poster = byId('poster-fila');
  const queue = byId('hero-mock');
  if (!poster || !queue) return;
  const copy = queue.cloneNode(true);
  [copy, ...copy.querySelectorAll('[id], [data-bind]')].forEach((element) => {
    element.removeAttribute('id');
    element.removeAttribute('data-bind');
  });
  poster.appendChild(copy);
}

function scalePosterToWindow() {
  const scaler = byId('poster-scale');
  if (!scaler || !window.ResizeObserver) return;
  const frame = scaler.parentElement;
  new ResizeObserver(() => {
    const width = frame.clientWidth;
    if (width) scaler.style.transform = `scale(${(width / POSTER_WIDTH).toFixed(4)})`;
  }).observe(frame);
}
