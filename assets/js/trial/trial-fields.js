// Campos do passo 1 do cadastro: máscaras, sugestão de endereço, mensagens de erro e validação.
import {
  hasFullName, slugify, sanitizeSlugInput, slugError, whatsappDigits,
  maskWhatsApp, maskCpf, maskCnpj, cpfError, cnpjError,
} from './trial-validation.js';

const MIN_PHONE_DIGITS = 10;

// CPF e CNPJ: tamanho com máscara (número completo) e regra de dígitos verificadores.
const DOCUMENT_FIELDS = {
  cpf: { maskedLength: 14, error: cpfError },
  cnpj: { maskedLength: 18, error: cnpjError },
};

// Chave de erro (a mesma devolvida pela API) → seletor do controle que recebe o foco.
const FOCUS_TARGETS = {
  nome: '[name="nome"]', email: '[name="email"]', wa: '[name="whatsapp"]', cpf: '[name="cpf"]',
  corretora: '[name="corretora"]', cnpj: '[name="cnpj"]', slug: '#trial-slug', corretores: '[name="corretores"]',
  plano: '#plan-cards [aria-pressed="true"]', aceite: '[name="aceite"]',
};
// Campos cujo erro some ao digitar (CPF e CNPJ têm regra própria em bindDocumentFeedback).
const INPUT_ERROR_KEYS = { nome: 'nome', email: 'email', whatsapp: 'wa', corretora: 'corretora', corretores: 'corretores' };
const IDENTITY_ERROR_ORDER = ['nome', 'wa', 'cpf', 'cnpj', 'slug'];
const AUTOFILL_SELECTORS = [':autofill', ':-webkit-autofill'];

function isAutofilled(input) {
  return AUTOFILL_SELECTORS.some((selector) => {
    try { return input.matches(selector); } catch { return false; } // seletor não suportado pelo navegador
  });
}

export function createTrialFields(form) {
  const control = (name) => form.elements.namedItem(name);
  const slugInput = form.querySelector('#trial-slug');
  const slugBox = form.querySelector('#trial-slug-box');
  const errors = {};
  let slugEdited = false;
  let slugTouched = false;

  const renderErrors = () => {
    form.querySelectorAll('[data-error-for]').forEach((slot) => {
      const key = slot.dataset.errorFor;
      const message = key === 'slug' ? currentSlugError() : errors[key];
      slot.textContent = message || '';
      slot.hidden = !message;
      const input = key === 'slug' ? null : form.querySelector(`.field${FOCUS_TARGETS[key]}`);
      input?.setAttribute('aria-invalid', String(!!message));
    });
    const slugBad = !!currentSlugError();
    slugBox.classList.toggle('is-bad', slugBad);
    slugInput.setAttribute('aria-invalid', String(slugBad));
  };
  const currentSlugError = () => errors.slug || (slugTouched ? slugError(slugInput.value) : '');
  const clearError = (key) => { if (errors[key]) { delete errors[key]; renderErrors(); } };
  const setErrors = (map) => { Object.assign(errors, map); renderErrors(); };

  // O erro aparece ao completar o número ou ao sair do campo, e some assim que o valor é corrigido.
  const bindDocumentFeedback = (key, { maskedLength, error }) => {
    const input = control(key);
    input.addEventListener('input', () => {
      const message = input.value.length === maskedLength ? error(input.value) : '';
      if (message) setErrors({ [key]: message }); else clearError(key);
    });
    input.addEventListener('blur', () => {
      const message = error(input.value);
      if (message) setErrors({ [key]: message });
    });
  };

  const applyMask = (name, mask) => control(name).addEventListener('input', (event) => {
    event.target.value = mask(event.target.value);
  });
  applyMask('whatsapp', maskWhatsApp);
  applyMask('cpf', maskCpf);
  applyMask('cnpj', maskCnpj);
  Object.entries(DOCUMENT_FIELDS).forEach(([key, rule]) => bindDocumentFeedback(key, rule));

  Object.entries(INPUT_ERROR_KEYS).forEach(([name, key]) => control(name).addEventListener('input', () => clearError(key)));
  control('corretora').addEventListener('input', (event) => {
    if (!slugEdited) { slugInput.value = slugify(event.target.value); renderErrors(); }
  });
  // Endereço ainda ligado ao nome: ao sair do nome, já avisa se a sugestão ficou curta ou indisponível.
  control('corretora').addEventListener('blur', () => {
    if (!slugEdited && slugInput.value) { slugTouched = true; renderErrors(); }
  });
  // Rede de segurança: se o navegador ainda preencher o endereço postal aqui, volta a sugestão pelo nome da corretora.
  const discardAutofilledSlug = () => {
    slugEdited = false;
    slugInput.value = slugify(control('corretora').value);
    renderErrors();
  };
  slugInput.addEventListener('input', () => {
    const autofilled = isAutofilled(slugInput);
    slugInput.value = sanitizeSlugInput(slugInput.value);
    slugEdited = true;
    delete errors.slug;
    renderErrors();
    // Conforme a versão, o Chrome marca o campo como preenchido antes ou logo depois de disparar o input.
    if (autofilled) discardAutofilledSlug();
    else setTimeout(() => { if (isAutofilled(slugInput)) discardAutofilledSlug(); }, 0);
  });
  slugInput.addEventListener('blur', () => { slugTouched = true; renderErrors(); });
  slugBox.addEventListener('click', (event) => { if (event.target !== slugInput) slugInput.focus(); });

  const identityErrors = () => {
    const found = {};
    if (!hasFullName(control('nome').value)) found.nome = 'Informe nome e sobrenome.';
    if (whatsappDigits(control('whatsapp').value).length < MIN_PHONE_DIGITS) found.wa = 'Informe o DDD e o número.';
    Object.entries(DOCUMENT_FIELDS).forEach(([key, rule]) => {
      const message = rule.error(control(key).value);
      if (message) found[key] = message;
    });
    const slugMessage = slugError(slugInput.value);
    if (slugMessage) found.slug = slugMessage;
    return found;
  };

  return {
    values: () => ({
      nome: control('nome').value.trim(),
      email: control('email').value.trim().toLowerCase(),
      whatsapp: whatsappDigits(control('whatsapp').value),
      cpf: control('cpf').value,
      corretora: control('corretora').value.trim(),
      cnpj: control('cnpj').value,
      slug: slugInput.value,
      corretores: control('corretores').value,
    }),
    setErrors,
    clearError,
    clearErrors: () => { Object.keys(errors).forEach((key) => delete errors[key]); renderErrors(); },
    touchSlug: () => { slugTouched = true; renderErrors(); },
    focus: (key) => setTimeout(() => form.closest('[role="dialog"]').querySelector(FOCUS_TARGETS[key] || 'form')?.focus(), 80),
    // Regras próprias primeiro (nome, WhatsApp, CPF, CNPJ, endereço); depois a validação nativa do navegador.
    validateIdentity() {
      const found = identityErrors();
      const first = IDENTITY_ERROR_ORDER.find((key) => found[key]);
      if (first) { slugTouched = true; setErrors(found); this.focus(first); return false; }
      const stepOne = form.querySelector('#trial-step-form');
      if (!stepOne.checkValidity()) { stepOne.reportValidity(); return false; }
      return true;
    },
    reset() {
      form.reset();
      slugEdited = false;
      slugTouched = false;
      Object.keys(errors).forEach((key) => delete errors[key]);
      renderErrors();
    },
  };
}
