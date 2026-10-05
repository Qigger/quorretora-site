// Configuração de integração do site. Textos, preços e links de WhatsApp ficam no próprio HTML.
export const SITE_CONFIG = Object.freeze({
  heroVideoSrc: 'assets/quorretora-hero-720-web.mp4',
  heroVideoStartSeconds: 7,
  explainerVideoSrc: 'assets/quorretora-explicativo-1080-web.mp4',

  // Endpoint que recebe o cadastro do teste grátis (POST JSON, responde 202).
  // Vazio: o formulário não finge sucesso; mostra o erro com o atalho para o WhatsApp.
  trialApiUrl: '',
  trialApiTimeoutMs: 15000,

  // Versões dos documentos que o visitante aceita no cadastro.
  termsVersion: '2026-10',
  privacyVersion: '2026-10',
});
