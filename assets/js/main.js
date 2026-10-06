// Ponto de entrada da landing Quorretora (port do design "Site Quorretora v4" para JS sem framework).
import { SITE_CONFIG } from './config.js';
import { prefersReducedMotion } from './dom.js';
import { setupMobileMenu } from './mobile-menu.js';
import { setupKineticHeadline } from './kinetic-headline.js';
import { setupHeroPoster } from './hero-poster.js';
import { createHeroVideo } from './hero-video.js';
import { setupVideoModal } from './video-modal.js';
import { setupFilaDemo } from './fila-demo.js';
import { setupPhoneVideo } from './phone-video.js';
import { buildDashboardChart, resetDashboardCounters } from './dashboard-chart.js';
import { setupReveal } from './reveal.js';
import { handleSeen } from './seen-effects.js';
import { setupModuleGrid } from './module-grid.js';
import { setupBrandPreview } from './brand-preview.js';
import { setupCtaGlow } from './cta-glow.js';
import { setupTrialModal } from './trial/trial-modal.js';

const animate = !prefersReducedMotion();

setupMobileMenu();
setupKineticHeadline({ animate });
setupHeroPoster();
const heroVideo = createHeroVideo({ src: SITE_CONFIG.heroVideoSrc, startSeconds: SITE_CONFIG.heroVideoStartSeconds, autoplay: animate });
setupVideoModal({ src: SITE_CONFIG.explainerVideoSrc, heroVideo });
setupFilaDemo({ animate });
setupPhoneVideo({ animate });
buildDashboardChart();
if (animate) resetDashboardCounters();
setupReveal({ animate, onSeen: handleSeen });
setupModuleGrid();
setupBrandPreview({ animate });
setupCtaGlow();
setupTrialModal({ config: SITE_CONFIG });
