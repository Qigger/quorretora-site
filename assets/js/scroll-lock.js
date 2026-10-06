// Trava o scroll da página enquanto alguma camada (menu, vídeo, modal de teste) estiver aberta.
const owners = new Set();

export function lockScroll(owner) {
  owners.add(owner);
  document.body.style.overflow = 'hidden';
}

export function unlockScroll(owner) {
  owners.delete(owner);
  if (!owners.size) document.body.style.overflow = '';
}
