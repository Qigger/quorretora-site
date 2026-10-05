// Configuração de integração do site. Textos, preços e links de WhatsApp ficam no próprio HTML.
export const SITE_CONFIG = Object.freeze({
  heroVideoSrc: 'assets/quorretora-hero-720-web.mp4',
  heroVideoStartSeconds: 7,
  explainerVideoSrc: 'assets/quorretora-explicativo-1080-web.mp4',

  // Endpoint que recebe o cadastro do teste grátis (POST JSON, responde 202).
  // A API só aceita o site quando a origem dele estiver liberada na CORS dela. Até lá, o envio
  // falha e o formulário mostra o atalho para o WhatsApp.
  trialApiUrl: 'https://api.quorretora.com/public/trial-signups',
  trialApiTimeoutMs: 15000,

  // Versões dos documentos que o visitante aceita no cadastro.
  termsVersion: '2026-10',
  privacyVersion: '2026-10',
});
