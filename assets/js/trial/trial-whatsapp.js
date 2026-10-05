// Plano B quando o cadastro falha: abre a conversa no WhatsApp já com os dados digitados,
// para o time liberar o acesso à mão. O CPF fica de fora porque iria no link.
const PLAN_NAMES = { gestao: 'Gestão', automacao: 'Automação' };

// `readContext` devolve { values, plan } no momento do clique, para a mensagem sair com os dados atuais.
export function createWhatsAppFallback(link, readContext) {
  const baseUrl = link.getAttribute('href').split('?')[0];
  const refreshHref = () => {
    const { values, plan } = readContext();
    link.href = `${baseUrl}?text=${encodeURIComponent(buildMessage(values, plan))}`;
  };
  link.addEventListener('click', refreshHref);

  return {
    show() { refreshHref(); link.hidden = false; },
    hide() { link.hidden = true; },
  };
}

function buildMessage(values, plan) {
  return [
    'Olá! Tentei começar o teste grátis do Quorretora pelo site e não consegui.',
    `Nome: ${values.nome}`,
    `E-mail: ${values.email}`,
    `Corretora: ${values.corretora}`,
    `CNPJ: ${values.cnpj}`,
    `Endereço: ${values.slug}.quorretora.com`,
    `Plano: ${PLAN_NAMES[plan] || plan}`,
  ].join('\n');
}
