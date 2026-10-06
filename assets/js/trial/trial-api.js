// Envio do cadastro de teste para a API e tradução da resposta.
//   202 → ok · 400 → erros por campo (ou termos desatualizados) · 429 → muitas tentativas · resto → erro genérico

const API_FIELD_TO_FORM = {
  fullname: 'nome', email: 'email', phonenumber: 'wa', cpf: 'cpf', brokeragename: 'corretora',
  subdomain: 'slug', cnpj: 'cnpj', teamsize: 'corretores', plancode: 'plano',
  'legalacceptance.acceptedat': 'aceite',
};
const TERMS_VERSION_FIELDS = ['legalacceptance.termsversion', 'legalacceptance.privacypolicyversion'];

export async function sendTrialRequest({ url, payload, timeoutMs }) {
  if (!url) {
    console.warn('[Quorretora] trialApiUrl não configurada em assets/js/config.js; cadastro não enviado.');
    return { kind: 'generic' };
  }
  try {
    const response = await postJson(url, payload, timeoutMs);
    if (response.status === 202) return { kind: 'ok' };
    if (response.status === 429) return { kind: 'rate' };
    if (response.status === 400) return parseValidationErrors(await response.json().catch(() => null));
    return { kind: 'generic' };
  } catch {
    return { kind: 'generic' };
  }
}

async function postJson(url, payload, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// Formato ASP.NET (ProblemDetails): { errors: { "FullName": ["..."], "$.LegalAcceptance.TermsVersion": [...] } }
function parseValidationErrors(body) {
  const apiErrors = body && body.errors;
  if (!apiErrors || typeof apiErrors !== 'object') return { kind: 'generic' };
  const fieldErrors = {};
  let termsOutdated = false;
  Object.entries(apiErrors).forEach(([apiField, messages]) => {
    const normalized = apiField.toLowerCase().replace(/^\$\./, '');
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (TERMS_VERSION_FIELDS.includes(normalized)) termsOutdated = true;
    else if (API_FIELD_TO_FORM[normalized] && message) fieldErrors[API_FIELD_TO_FORM[normalized]] = String(message);
  });
  if (!termsOutdated && !Object.keys(fieldErrors).length) return { kind: 'generic' };
  return { kind: 'invalid', fieldErrors, termsOutdated };
}
