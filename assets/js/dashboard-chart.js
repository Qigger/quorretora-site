// Mock do dashboard: gráfico "Resultado por status" e contadores dos KPIs.
import { byId, setBound } from './dom.js';

// [status, vendas, faturamento (R$), vidas]
const GROUPS = [
  ['Aguardando validação', 20, 12000, 27], ['Aguardando correção', 4, 3000, 9], ['Aguardando emissão', 2, 2000, 5],
  ['Emitido', 5, 9000, 14], ['Aguardando aceite do cliente', 2, 3000, 6], ['Em análise', 3, 6000, 8],
  ['Aguardando assinatura do contrato', 1, 2000, 2], ['Aguardando pagamento', 3, 1000, 7], ['Pendente', 1, 820, 1],
  ['Cancelado', 2, 899, 3], ['Implantado', 4, 2000, 4],
];
const SERIES = [
  { max: 20, color: '#161616', label: (value) => String(value) },
  { max: 12000, color: '#C4C4C4', label: (value) => (value >= 1000 ? `R$ ${Math.round(value / 1000)}k` : `R$ ${value}`) },
  { max: 27, color: '#E0492F', label: (value) => String(value) },
];
const BAR_MAX_PX = 150;
const BAR_MIN_PX = 4;
const STAGGER_MS = 40;
const LABEL_DELAY_MS = 450;
const COUNT_MS = 1400;

const brl = (value) => 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const KPIS = {
  kVendas: [47, (value) => String(Math.round(value))],
  kFat: [40845.85, brl],
  kVidas: [86, (value) => String(Math.round(value))],
  kTicket: [869.06, brl],
  kVpv: [1.8, (value) => value.toFixed(1).replace('.', ',')],
};

export function buildDashboardChart() {
  const chart = byId('dash-chart');
  if (!chart) return;
  chart.append(...GROUPS.map(buildGroup));
}

// Zera os KPIs para a contagem; o HTML traz os valores finais para quem está sem JS.
export function resetDashboardCounters() {
  renderKpis(0);
}

export function playDashboardCounters({ instant }) {
  if (instant) { renderKpis(1); return; }
  const startedAt = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / COUNT_MS);
    renderKpis(1 - Math.pow(1 - progress, 3));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderKpis(eased) {
  Object.entries(KPIS).forEach(([key, [target, format]]) => setBound(key, format(target * eased)));
}

function buildGroup([label, ...values], index) {
  const group = element('div', 'display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0');
  const bars = element('div', 'height:176px;display:flex;align-items:flex-end;justify-content:center;gap:2px');
  values.forEach((value, seriesIndex) => bars.appendChild(buildBar(value, SERIES[seriesIndex], index)));
  const caption = element('div', 'font-size:11px;line-height:1.35;color:#404040;text-align:center;min-height:46px;max-width:100px');
  caption.textContent = label;
  group.append(bars, caption);
  return group;
}

function buildBar(value, series, groupIndex) {
  const column = element('div', 'width:30px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px');
  const valueLabel = element('span', `transition-delay:${groupIndex * STAGGER_MS + LABEL_DELAY_MS}ms`, 'dash-val');
  valueLabel.textContent = series.label(value);
  const height = Math.max(BAR_MIN_PX, Math.round((value / series.max) * BAR_MAX_PX));
  const bar = element('span', `height:${height}px;background:${series.color};transition-delay:${groupIndex * STAGGER_MS}ms`, 'dash-bar');
  column.append(valueLabel, bar);
  return column;
}

function element(tag, cssText, className) {
  const node = document.createElement(tag);
  node.style.cssText = cssText;
  if (className) node.className = className;
  return node;
}
