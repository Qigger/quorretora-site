// Lógica da landing page Quorretora — port do componente de design (Site Quorretora v2.dc.html) para vanilla JS.
(() => {
  'use strict';

  // ===== Configuração =====
  const WHATSAPP_NUMBER = '5511984414559'; // Somente dígitos, com DDI. Vazio abre o WhatsApp sem destinatário.
  const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const byId = (id) => document.getElementById(id);

  // ===== Links de WhatsApp =====
  function setupWhatsAppLinks() {
    const message = encodeURIComponent('Olá! Tenho uma corretora e quero ver uma demonstração do Quorretora.');
    const digits = WHATSAPP_NUMBER.replace(/\D/g, '');
    const link = digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
    document.querySelectorAll('.wa-link').forEach((anchor) => { anchor.href = link; });
  }

  // ===== Headline cinética =====
  function setupKineticHeadline() {
    if (REDUCED_MOTION) return;
    const WORDS = ['em planilhas.', 'em grupos de WhatsApp.', 'em portais de Operadoras.'];
    const wordEl = byId('kin-word');
    let index = 0;
    setInterval(() => {
      wordEl.style.opacity = '0';
      wordEl.style.transform = 'translateY(12px)';
      setTimeout(() => {
        index = (index + 1) % WORDS.length;
        wordEl.textContent = WORDS[index];
        wordEl.style.opacity = '1';
        wordEl.style.transform = 'translateY(0)';
      }, 350);
    }, 3400);
  }

  // ===== Demonstração animada do hero =====
  const HERO_SALES = [
    { name: 'Serralheria Monte Azul', code: '5127046', op: 'Amil', tipo: 'Pessoa Jurídica', cor: 'Ana Ribeiro', valor: 'R$ 5.180,00', vidas: '14' },
    { name: 'Padaria Figueira', code: '612033', op: 'SulAmérica', tipo: 'Pessoa Jurídica', cor: 'Carlos Mendes', valor: 'R$ 2.340,00', vidas: '6' },
    { name: 'João Pereira', code: '7159218', op: 'Porto Seguro', tipo: 'Pessoa Física', cor: 'Juliana Prado', valor: 'R$ 1.320,00', vidas: '3' }
  ];
  const HERO_STATUSES = [
    { t: 'Aguardando validação', bg: '#EEF2F6', c: '#44618C' },
    { t: 'Aguardando emissão', bg: '#EEF2F6', c: '#44618C' },
    { t: 'Emitido', bg: '#E4EDFB', c: '#2F6BD6' },
    { t: 'Em análise', bg: '#E4EDFB', c: '#2F6BD6' },
    { t: 'Implantado', bg: '#DCF2E7', c: '#30A46C' }
  ];
  const heroState = { heroIn: false, heroSt: 0, heroToast: false, heroSale: 0, implCount: 85 };

  function renderHero() {
    const s = heroState;
    const sale = HERO_SALES[s.heroSale];
    const status = HERO_STATUSES[s.heroSt];
    byId('hs-name').textContent = sale.name;
    byId('hs-code').textContent = sale.code;
    byId('hs-op').textContent = sale.op;
    byId('hs-tipo').textContent = sale.tipo;
    byId('hs-cor').textContent = sale.cor;
    byId('hs-valor').textContent = sale.valor;
    byId('hs-vidas').textContent = sale.vidas;

    const pill = byId('hero-pill');
    pill.textContent = status.t;
    pill.style.background = status.bg;
    pill.style.color = status.c;

    const row = byId('hero-row');
    row.style.opacity = s.heroIn ? '1' : '0';
    row.style.transform = s.heroIn ? 'translateY(0)' : 'translateY(-14px)';

    const toast = byId('hero-toast');
    toast.style.opacity = s.heroToast ? '1' : '0';
    toast.style.transform = s.heroToast ? 'translateY(0)' : 'translateY(10px)';

    renderHeroCounts();
  }

  function renderHeroCounts() {
    const s = heroState;
    const extra = (cond) => (s.heroIn && cond ? 1 : 0);
    const total = 48 + s.implCount + extra(s.heroSt < 4);
    document.querySelectorAll('.js-todas').forEach((el) => { el.textContent = String(total); });
    byId('ct-cur').textContent = String(12 + extra(s.heroSt === 0));
    byId('ct-val').textContent = String(8 + extra(s.heroSt === 0));
    byId('ct-emi').textContent = String(9 + extra(s.heroSt === 1 || s.heroSt === 2));
    byId('ct-agemi').textContent = String(6 + extra(s.heroSt === 1));
    byId('ct-emit').textContent = String(3 + extra(s.heroSt === 2));
    byId('ct-op').textContent = String(23 + extra(s.heroSt === 3));
    byId('ct-anl').textContent = String(7 + extra(s.heroSt === 3));

    const highlight = s.heroSt === 4 && s.heroToast;
    byId('impl-label').style.color = highlight ? '#30A46C' : '#0D0D0D';
    byId('impl-count').style.color = highlight ? '#30A46C' : '#525252';
    byId('impl-count').textContent = String(s.implCount);
  }

  function runHeroLoop() {
    Object.assign(heroState, { heroIn: false, heroSt: 0, heroToast: false });
    renderHero();
    setTimeout(() => { heroState.heroIn = true; renderHero(); }, 500);
    [[3000, 1], [5800, 2], [8600, 3], [11400, 4]].forEach(([ms, st]) => {
      setTimeout(() => {
        heroState.heroSt = st;
        heroState.heroToast = true;
        if (st === 4) heroState.implCount += 1;
        renderHero();
      }, ms);
      setTimeout(() => { heroState.heroToast = false; renderHero(); }, ms + 1700);
    });
    setTimeout(() => { heroState.heroIn = false; renderHero(); }, 14400);
    setTimeout(() => {
      heroState.heroSale = (heroState.heroSale + 1) % HERO_SALES.length;
      runHeroLoop();
    }, 15200);
  }

  function setupHero() {
    if (REDUCED_MOTION) {
      Object.assign(heroState, { heroIn: true, heroSt: 4, implCount: 86 });
      renderHero();
      return;
    }
    runHeroLoop();
  }

  // ===== Jornada de uma venda (scroll) =====
  const JOURNEY_STATUSES = [
    HERO_STATUSES[0],
    HERO_STATUSES[0],
    HERO_STATUSES[1],
    { t: 'Aguardando assinatura do contrato', bg: '#E3E4F9', c: '#544EC9' },
    HERO_STATUSES[4]
  ];

  function renderJourney(step) {
    const status = JOURNEY_STATUSES[step] || JOURNEY_STATUSES[0];
    byId('j-video').style.opacity = step === 0 ? '1' : '0';
    byId('j-card').style.opacity = step > 0 ? '1' : '0';
    const pill = byId('j-pill');
    pill.textContent = status.t;
    pill.style.background = status.bg;
    pill.style.color = status.c;
    const done = byId('j-done');
    done.style.opacity = step === 4 ? '1' : '0';
    done.style.maxHeight = step === 4 ? '48px' : '0px';
    done.style.marginBottom = step === 4 ? '16px' : '0px';
  }

  function setupJourney() {
    const steps = Array.from(document.querySelectorAll('[data-jstep]'));
    const stackedLayout = window.matchMedia('(max-width: 800px)');
    const stage = byId('j-stage');
    let currentStep = 0;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // No layout empilhado o componente fica fixo no topo; o passo ativo é o mais próximo do centro da área visível abaixo dele.
        let mid = window.innerHeight * 0.5;
        if (stackedLayout.matches && stage) {
          const stageBottom = Math.max(0, stage.getBoundingClientRect().bottom);
          mid = (stageBottom + window.innerHeight) / 2;
        }
        let best = 0;
        let bestDistance = Infinity;
        steps.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - mid);
          if (distance < bestDistance) { bestDistance = distance; best = Number(el.dataset.jstep); }
        });
        if (best !== currentStep) { currentStep = best; renderJourney(currentStep); }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    renderJourney(0);
    setupJourneyVideo();
  }

  function setupJourneyVideo() {
    const video = byId('cadastro-video');
    if (!video) return;
    // Loop antes do fim (mesma regra do design) e retomada se o autoplay for bloqueado.
    video.addEventListener('timeupdate', () => {
      if (video.duration && video.currentTime >= video.duration - 2) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
    setInterval(() => {
      if (video.paused) { video.muted = true; video.defaultMuted = true; video.play().catch(() => {}); }
    }, 900);
  }

  // ===== Whitelabel =====
  const WL_PRESETS = [
    { n: 'Vida Plena', c: '#2C6E8F' },
    { n: 'Grupo Atlas', c: '#7A5EA8' },
    { n: 'Saúde Mais', c: '#3C8F6B' }
  ];
  const wlState = { name: '', preset: 0 };

  function renderWhitelabel() {
    const typed = wlState.name.trim();
    const hash = typed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const preset = typed ? WL_PRESETS[hash % WL_PRESETS.length] : WL_PRESETS[wlState.preset];
    const display = typed || preset.n;
    const slug = display.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 24) || 'suacorretora';
    const accent = preset.c;
    byId('wl-slug-arrow').textContent = slug;
    byId('wl-slug-bar').textContent = slug;
    byId('wl-display').textContent = display;
    byId('wl-chip').textContent = (display[0] || 'C').toUpperCase();
    byId('wl-bar').style.background = accent;
    byId('wl-chip').style.background = accent;
    byId('wl-btn').style.background = accent;
    const nav = byId('wl-nav');
    nav.style.color = accent;
    nav.style.borderBottom = '2px solid ' + accent;
  }

  function setupWhitelabel() {
    byId('wl-input').addEventListener('input', (event) => {
      wlState.name = event.target.value;
      renderWhitelabel();
    });
    if (!REDUCED_MOTION) {
      setInterval(() => {
        if (wlState.name.trim()) return;
        wlState.preset = (wlState.preset + 1) % WL_PRESETS.length;
        renderWhitelabel();
      }, 3600);
    }
    renderWhitelabel();
  }

  // ===== Dashboard: contadores e gráfico =====
  const DASH_METRICS = [
    ['dm-vendas', 133, ''], ['dm-fat', 85400, 'R$'], ['dm-vidas', 918, ''], ['dm-ticket', 642, 'R$'], ['dm-vpv', 6.9, '#']
  ];
  const DASH_GROUPS = [
    ['Aguardando validação', 8, 5100, 34], ['Aguardando correção', 4, 2300, 11], ['Aguardando emissão', 6, 4800, 52], ['Emitido', 3, 2600, 18],
    ['Aguardando aceite do cliente', 4, 4100, 45], ['Em análise', 7, 7900, 88], ['Aguardando avaliação médica', 3, 2200, 16],
    ['Aguardando assinatura do contrato', 4, 5600, 60], ['Aguardando pagamento', 3, 3400, 39], ['Pendente', 2, 1500, 9],
    ['Cancelado', 4, 3900, 41], ['Implantado', 85, 42000, 505]
  ];
  // O gráfico mostra só estes status (recorte legível do funil); os demais de DASH_GROUPS ficam de fora.
  const DASH_CHART_LABELS = new Set([
    'Aguardando validação', 'Aguardando emissão', 'Em análise', 'Aguardando assinatura do contrato', 'Cancelado', 'Implantado'
  ]);
  // Em celulares (≤480px) reduz ainda mais: só o essencial do funil.
  const DASH_MINI_LABELS = new Set(['Aguardando validação', 'Em análise', 'Cancelado', 'Implantado']);

  function formatMetric(value, prefix) {
    if (prefix === '#') return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const text = value.toLocaleString('pt-BR');
    return prefix ? prefix + ' ' + text : text;
  }

  function runDashCounters() {
    if (REDUCED_MOTION) {
      DASH_METRICS.forEach(([id, target, prefix]) => { byId(id).textContent = formatMetric(target, prefix); });
      return;
    }
    const start = performance.now();
    const duration = 1300;
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      DASH_METRICS.forEach(([id, target, prefix]) => {
        const value = prefix === '#' ? target * eased : Math.round(target * eased);
        byId(id).textContent = formatMetric(value, prefix);
      });
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function buildDashChart() {
    const chart = byId('dash-chart');
    const maxes = [85, 42000, 505];
    const colors = ['#161616', '#D9D9D9', '#E0492F'];
    DASH_GROUPS.filter(([label]) => DASH_CHART_LABELS.has(label)).forEach(([label, sales, revenue, lives], groupIndex) => {
      const values = [sales, revenue, lives];
      const labels = [String(sales), revenue >= 1000 ? 'R$ ' + Math.round(revenue / 1000) + 'k' : 'R$ ' + revenue, String(lives)];
      const group = document.createElement('div');
      if (!DASH_MINI_LABELS.has(label)) group.className = 'dash-extra-sm';
      group.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;min-width:0';
      const bars = document.createElement('div');
      bars.style.cssText = 'display:flex;align-items:flex-end;gap:3px;height:132px';
      values.forEach((value, barIndex) => {
        const column = document.createElement('div');
        column.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px';
        const valueLabel = document.createElement('span');
        valueLabel.className = 'dash-val';
        valueLabel.style.cssText = 'font-size:9.5px;color:#A3A3A3;white-space:nowrap';
        valueLabel.textContent = labels[barIndex];
        const bar = document.createElement('div');
        const height = Math.max(3, Math.round((value / maxes[barIndex]) * 108));
        bar.className = 'dash-bar';
        bar.style.cssText = `width:14px;height:${height}px;background:${colors[barIndex]};border-radius:3px 3px 1px 1px;transform:scaleY(0.02);transform-origin:bottom;transition:transform .8s cubic-bezier(.2,.7,.2,1) ${groupIndex * 40}ms`;
        column.append(valueLabel, bar);
        bars.appendChild(column);
      });
      const groupLabel = document.createElement('span');
      groupLabel.style.cssText = 'font-size:9px;color:#A3A3A3;text-align:center;line-height:1.3';
      groupLabel.textContent = label;
      group.append(bars, groupLabel);
      chart.appendChild(group);
    });
  }

  function setupDashboard() {
    buildDashChart();
    const section = byId('dashboard');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.dash-bar').forEach((bar) => { bar.style.transform = 'scaleY(1)'; });
        runDashCounters();
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  // ===== Abas de capacidades =====
  const capState = { tab: 0, progress: 0, auto: true };

  function renderCapTabs() {
    document.querySelectorAll('.cap-tab').forEach((button) => {
      const index = Number(button.dataset.tab);
      const active = index === capState.tab;
      button.classList.toggle('active', active);
      const fillPercent = active ? (REDUCED_MOTION || !capState.auto ? 100 : Math.round(capState.progress * 100)) : 0;
      button.querySelector('.cap-fill').style.width = fillPercent + '%';
      byId('cap-pane-' + index).style.display = active ? 'grid' : 'none';
    });
  }

  function setupCapTabs() {
    document.querySelectorAll('.cap-tab').forEach((button) => {
      button.addEventListener('click', () => {
        Object.assign(capState, { tab: Number(button.dataset.tab), progress: 0, auto: false });
        renderCapTabs();
      });
    });
    if (!REDUCED_MOTION) {
      setInterval(() => {
        if (!capState.auto) return;
        if (capState.progress >= 1) {
          capState.tab = (capState.tab + 1) % 4;
          capState.progress = 0;
        } else {
          capState.progress += 0.02;
        }
        renderCapTabs();
      }, 100);
    }
    renderCapTabs();
  }

  // ===== Inicialização =====
  setupWhatsAppLinks();
  setupKineticHeadline();
  setupHero();
  setupJourney();
  setupWhitelabel();
  setupDashboard();
  setupCapTabs();
})();
