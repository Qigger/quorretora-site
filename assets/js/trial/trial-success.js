// Tela "Recebemos seu cadastro." com o vídeo de funcionamento do sistema.
import { byId } from '../dom.js';

export function createTrialSuccess({ videoSrc, posterSeconds }) {
  const view = byId('trial-success');
  const sentEmail = byId('trial-sent-email');
  const sentSlug = byId('trial-sent-slug');
  const video = byId('onb-video');
  const playButton = byId('onb-play');

  playButton.addEventListener('click', () => {
    video.muted = false;
    try { video.currentTime = 0; } catch { /* vídeo ainda sem metadados */ }
    playButton.hidden = true;
    video.play().catch(() => {});
  });
  video.addEventListener('play', () => { playButton.hidden = true; });

  return {
    show({ email, slug }) {
      sentEmail.textContent = email || 'seu e-mail';
      sentSlug.textContent = slug || 'suacorretora';
      // O fragmento #t= faz o navegador mostrar um quadro do meio do vídeo como capa.
      const src = `${videoSrc}#t=${posterSeconds}`;
      if (videoSrc && video.getAttribute('src') !== src) video.setAttribute('src', src);
      playButton.hidden = false;
      view.hidden = false;
    },
    hide() {
      video.pause();
      view.hidden = true;
    },
  };
}
