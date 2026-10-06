// Gravação do cadastro no celular (seção "Cada documento no lugar certo"): toca só quando visível.
import { byId } from './dom.js';

const RESTART_BEFORE_END_SECONDS = 2;

export function setupPhoneVideo({ animate }) {
  const video = byId('cadastro-video');
  if (!video) return;

  // A gravação termina com alguns segundos parados; reinicia antes deles.
  video.addEventListener('timeupdate', () => {
    if (video.duration && video.currentTime >= video.duration - RESTART_BEFORE_END_SECONDS) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  });

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && animate) {
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, { threshold: 0.3 }).observe(video);
}
