// Vídeo explicativo com som, aberto pelo hero ("Ver o sistema funcionando").
import { byId, onEscape } from './dom.js';
import { lockScroll, unlockScroll } from './scroll-lock.js';

export function setupVideoModal({ src, heroVideo }) {
  const modal = byId('video-modal');
  const video = byId('modal-video');
  if (!modal || !video || !src) return;
  let opener = null;

  const open = () => {
    opener = document.activeElement;
    heroVideo.suspend();
    modal.hidden = false;
    lockScroll('video');
    if (video.getAttribute('src') !== src) video.setAttribute('src', src);
    video.muted = false;
    video.play().catch(() => {});
    modal.querySelector('[data-close-video]')?.focus();
  };
  const close = () => {
    if (modal.hidden) return;
    video.pause();
    try { video.currentTime = 0; } catch { /* vídeo ainda sem metadados */ }
    modal.hidden = true;
    unlockScroll('video');
    heroVideo.resume();
    opener?.focus?.();
  };

  document.querySelectorAll('[data-open-video]').forEach((element) => element.addEventListener('click', open));
  modal.querySelectorAll('[data-close-video]').forEach((element) => element.addEventListener('click', close));
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  onEscape(close);
}
