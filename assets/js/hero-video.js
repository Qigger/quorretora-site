// Vídeo mudo do hero: começa em `startSeconds`, volta para lá no fim e só toca enquanto está visível.
import { byId } from './dom.js';

const LOOP_GUARD_MS = 300;
const END_TOLERANCE_SECONDS = 0.1;

export function createHeroVideo({ src, startSeconds, autoplay }) {
  const video = byId('hero-video');
  if (!video || !src) return { suspend() {}, resume() {} };

  let visible = true;
  let suspended = false;
  let looping = false;
  let startApplied = false;

  const seek = (seconds) => { try { video.currentTime = seconds; } catch { /* metadados ainda não carregados */ } };
  const applyStart = () => {
    if (startApplied || video.readyState < 1) return;
    if (video.duration > startSeconds) seek(startSeconds);
    startApplied = true;
  };
  const play = () => {
    if (!autoplay || suspended || !visible) return;
    applyStart();
    video.play().catch(() => {});
  };
  const loop = () => {
    if (looping) return;
    looping = true;
    seek(video.duration > startSeconds ? startSeconds : 0);
    play();
    setTimeout(() => { looping = false; }, LOOP_GUARD_MS);
  };

  video.muted = true;
  video.defaultMuted = true;
  video.addEventListener('loadedmetadata', play);
  video.addEventListener('playing', () => video.classList.add('is-on'));
  video.addEventListener('timeupdate', () => {
    if (video.duration && video.currentTime >= video.duration - END_TOLERANCE_SECONDS) loop();
  });
  video.addEventListener('ended', loop);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play(); else video.pause();
  }, { threshold: 0.1 }).observe(video);
  video.src = src;

  return {
    suspend() { suspended = true; video.pause(); },
    resume() { suspended = false; play(); },
  };
}
