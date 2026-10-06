// Seção "Sua marca": o visitante digita o nome da corretora e a prévia do sistema troca nome, endereço e cor.
import { byId, setBound } from './dom.js';

const PALETTE = ['#3D6E8F', '#2F7A5B', '#6B4FA3', '#B8742A', '#1F6F8B', '#A83A5C', '#4C6B2F', '#2E5EAA'];
const DEMO = { name: 'Vida Plena', slug: 'vidaplena', initial: 'V' };
const CYCLE_MS = 3000;
const APP_WIDTH = 1100;
const MOBILE_MAX_WIDTH = 640;

export function setupBrandPreview({ animate }) {
  const input = byId('marca-input');
  const frame = byId('marca-fit');
  if (!input || !frame) return;

  let colorIndex = 0;
  const render = () => {
    const name = input.value.trim();
    const color = name ? PALETTE[charSum(name) % PALETTE.length] : PALETTE[colorIndex];
    applyColor(frame, color);
    setBound('slugDemo', toSlug(name) || DEMO.slug);
    setBound('marcaDisplay', name || DEMO.name);
    setBound('marcaInicial', initialOf(name) || DEMO.initial);
  };

  input.addEventListener('input', render);
  if (animate) {
    setInterval(() => {
      if (input.value.trim()) return;
      colorIndex = randomOtherIndex(colorIndex, PALETTE.length);
      render();
    }, CYCLE_MS);
  }
  render();
  fitAppToFrame(frame, byId('marca-app'));
}

const stripAccents = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');
const toSlug = (name) => stripAccents(name).toLowerCase().replace(/[^a-z0-9]/g, '');
const initialOf = (name) => (stripAccents(name).match(/[A-Za-z0-9]/) || [''])[0].toUpperCase();
const charSum = (text) => [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);

function randomOtherIndex(current, size) {
  let next = current;
  while (next === current) next = Math.floor(Math.random() * size);
  return next;
}

function applyColor(frame, hex) {
  const value = parseInt(hex.slice(1), 16);
  frame.style.setProperty('--mc', hex);
  frame.style.setProperty('--mcl', `rgba(${value >> 16},${(value >> 8) & 255},${value & 255},.12)`);
}

// A prévia é desenhada em 1100px e escalada para caber; no celular ela vira layout fluido (CSS).
function fitAppToFrame(frame, app) {
  if (!app || !window.ResizeObserver) return;
  const fit = () => {
    if (window.innerWidth <= MOBILE_MAX_WIDTH) {
      app.style.transform = '';
      frame.style.height = '';
      return;
    }
    const scale = frame.clientWidth / APP_WIDTH;
    app.style.transform = `scale(${scale.toFixed(4)})`;
    frame.style.height = Math.ceil(app.offsetHeight * scale) + 'px';
  };
  const observer = new ResizeObserver(fit);
  observer.observe(frame);
  observer.observe(app);
  fit();
}
