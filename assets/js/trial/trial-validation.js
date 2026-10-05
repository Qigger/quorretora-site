// Regras puras do cadastro de teste: máscaras, CPF/CNPJ e endereço (subdomínio) da corretora.

export const onlyDigits = (value) => (value || '').replace(/\D/g, '');
const stripAccents = (text) => (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '');

const SLUG_MIN_LENGTH = 6;
const SLUG_MAX_LENGTH = 30;
const COMPANY_SUFFIXES = ['ltda', 'me', 'epp', 'eireli', 'sa'];
const RESERVED_SLUGS = ['portal', 'status', 'static', 'suporte', 'staging', 'qigger', 'quorretora'];
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const hasFullName = (name) => name.trim().split(/\s+/).filter(Boolean).length >= 2;

// Sugestão de endereço a partir do nome da corretora, sem sufixos societários ("Vida Plena Ltda" → "vida-plena").
// Acompanha desde a primeira letra; o mínimo de caracteres é cobrado por slugError, não aqui.
export function slugify(brokerageName) {
  const words = stripAccents(brokerageName).toLowerCase().replace(/\./g, '').split(/[^a-z0-9]+/).filter(Boolean);
  while (words.length > 1 && COMPANY_SUFFIXES.includes(words[words.length - 1])) words.pop();
  return words.join('-').slice(0, SLUG_MAX_LENGTH).replace(/-+$/, '');
}

export function sanitizeSlugInput(value) {
  return stripAccents(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, SLUG_MAX_LENGTH);
}

export function slugError(slug) {
  if (slug.length < SLUG_MIN_LENGTH) return 'Use pelo menos 6 caracteres.';
  if (slug.length > SLUG_MAX_LENGTH || !SLUG_PATTERN.test(slug)) return 'Use só letras minúsculas, números e hífen.';
  if (RESERVED_SLUGS.includes(slug)) return 'Esse endereço não está disponível. Escolha outro.';
  return '';
}

// Aceita número colado com DDI 55; guarda só DDD + número (10 ou 11 dígitos).
export function whatsappDigits(value) {
  let digits = onlyDigits(value);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  return digits.slice(0, 11);
}

export function maskWhatsApp(value) {
  const digits = whatsappDigits(value);
  if (digits.length <= 2) return digits.length ? '(' + digits : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCpf(value) {
  return onlyDigits(value).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

const CPF_LENGTH = 11;

// Mensagem de erro do CPF digitado; vazio quando não há nada digitado (o "obrigatório" é nativo) ou quando é válido.
export function cpfError(value) {
  const digits = onlyDigits(value);
  if (!digits) return '';
  if (digits.length < CPF_LENGTH) return 'Informe os 11 números do CPF.';
  return isValidCpf(digits) ? '' : 'CPF inválido. Confira os números.';
}

export function isValidCpf(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  const checkDigit = (length) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

// CNPJ alfanumérico (Receita Federal, emitido desde julho de 2026): 12 posições com letras maiúsculas ou números
// + 2 dígitos verificadores numéricos. CNPJs só com números continuam válidos pela mesma regra.
const CNPJ_LENGTH = 14;
const CNPJ_BASE_LENGTH = 12;
const CNPJ_FORMAT = /^[0-9A-Z]{12}\d{2}$/;
const CNPJ_WEIGHTS = { 12: [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], 13: [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] };
const ASCII_ZERO = 48;

// Só letras e números, em maiúsculas; nas duas últimas posições só entram números.
export function normalizeCnpj(value) {
  const chars = (value || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const checkDigits = chars.slice(CNPJ_BASE_LENGTH).replace(/\D/g, '').slice(0, CNPJ_LENGTH - CNPJ_BASE_LENGTH);
  return chars.slice(0, CNPJ_BASE_LENGTH) + checkDigits;
}

export function maskCnpj(value) {
  return normalizeCnpj(value)
    .replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
    .replace(/\.([0-9A-Z]{3})([0-9A-Z])/, '.$1/$2')
    .replace(/([0-9A-Z]{4})(\d{1,2})$/, '$1-$2');
}

// Mensagem de erro do CNPJ digitado; vazio quando não há nada digitado (o "obrigatório" é nativo) ou quando é válido.
export function cnpjError(value) {
  const cnpj = normalizeCnpj(value);
  if (!cnpj) return '';
  if (cnpj.length < CNPJ_LENGTH) return 'Informe o CNPJ completo.';
  return isValidCnpj(cnpj) ? '' : 'CNPJ inválido. Confira o que foi digitado.';
}

// Cada posição vale o código ASCII menos 48: números valem 0 a 9 e letras vão de A (17) a Z (42).
export function isValidCnpj(value) {
  const cnpj = normalizeCnpj(value);
  if (!CNPJ_FORMAT.test(cnpj) || /^(.)\1+$/.test(cnpj)) return false;
  const checkDigit = (length) => {
    const sum = CNPJ_WEIGHTS[length].reduce((total, weight, i) => total + (cnpj.charCodeAt(i) - ASCII_ZERO) * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return checkDigit(12) === Number(cnpj[12]) && checkDigit(13) === Number(cnpj[13]);
}
