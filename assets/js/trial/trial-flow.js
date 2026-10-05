// Fluxo do cadastro de teste: passo 1 (dados) → passo 2 (plano e aceite) → envio → confirmação.
import { byId } from '../dom.js';
import { onlyDigits, normalizeCnpj } from './trial-validation.js';
import { createTrialFields } from './trial-fields.js';
import { sendTrialRequest } from './trial-api.js';
import { createTrialSuccess } from './trial-success.js';
import { createWhatsAppFallback } from './trial-whatsapp.js';

const PLAN_CODES = { gestao: 'TIER_1', automacao: 'TIER_2' };
const STEP_ONE_ERRORS = ['nome', 'email', 'wa', 'cpf', 'corretora', 'cnpj', 'slug', 'corretores'];
const ERROR_ORDER = [...STEP_ONE_ERRORS, 'plano', 'aceite'];
// Falhas que não dependem do que a pessoa digitou: a saída é o WhatsApp.
const WHATSAPP_FALLBACK_ERRORS = ['generic', 'rate'];
const SUBMIT_LABELS = { idle: 'Começar meu teste grátis', sending: 'Liberando seu acesso…', err: 'Tentar de novo' };

export function createTrialFlow({ config }) {
  const form = byId('trial-form');
  const fields = createTrialFields(form);
  const success = createTrialSuccess({ videoSrc: config.explainerVideoSrc, posterSeconds: config.heroVideoStartSeconds });
  const ui = {
    stepForm: byId('trial-step-form'), stepPlan: byId('trial-step-plan'),
    chips: [...form.querySelectorAll('[data-plan]')], aceite: form.elements.namedItem('aceite'),
    honeypot: form.elements.namedItem('empresa_site'), submit: byId('trial-submit-btn'), submitLabel: byId('trial-submit-label'),
    note: form.querySelector('.trial-note'),
  };
  const utm = readUtm();
  const state = { step: 'form', plan: 'gestao', status: 'idle', errorKind: null, acceptedAt: null };
  const whatsapp = createWhatsAppFallback(byId('trial-whatsapp'), () => ({ values: fields.values(), plan: state.plan }));

  const render = () => {
    const sending = state.status === 'sending';
    const locked = !ui.aceite.checked;
    ui.submit.disabled = sending || locked;
    ui.submit.classList.toggle('is-sending', sending);
    ui.submit.querySelector('.spinner').hidden = !sending;
    ui.submitLabel.textContent = SUBMIT_LABELS[state.status] || SUBMIT_LABELS.idle;
    if (locked) ui.submit.title = 'Aceite os Termos de Uso para continuar.'; else ui.submit.removeAttribute('title');
    form.querySelectorAll('[data-alert]').forEach((alert) => { alert.hidden = alert.dataset.alert !== state.errorKind; });
    const offerWhatsApp = state.status === 'err' && WHATSAPP_FALLBACK_ERRORS.includes(state.errorKind);
    if (offerWhatsApp) whatsapp.show(); else whatsapp.hide();
    ui.submit.classList.toggle('btn-submit--secondary', offerWhatsApp);
    ui.note.hidden = offerWhatsApp; // "o acesso chega por e-mail" não vale quando o envio falhou
    ui.chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.plan === state.plan)));
  };

  const showStep = (step) => {
    state.step = step;
    const onPlan = step === 'plan';
    ui.stepForm.hidden = onPlan; ui.stepForm.disabled = onPlan;
    ui.stepPlan.hidden = !onPlan; ui.stepPlan.disabled = !onPlan;
    if (!onPlan) return;
    const values = fields.values();
    byId('trial-summary-corretora').textContent = values.corretora;
    byId('trial-summary-contact').textContent = `${values.nome} · ${values.email}`;
  };
  const goToPlan = () => {
    if (!fields.validateIdentity()) return;
    showStep('plan');
    fields.focus('plano');
  };
  const goToForm = () => { showStep('form'); fields.focus('nome'); };

  const showSuccess = () => {
    const values = fields.values();
    state.status = 'ok';
    form.closest('[role="dialog"]').querySelectorAll('[data-trial-view="form"]').forEach((view) => { view.hidden = true; });
    success.show({ email: values.email, slug: values.slug });
  };

  const handleResult = (result) => {
    if (result.kind === 'ok') { showSuccess(); return; }
    if (result.kind !== 'invalid') { state.status = 'err'; state.errorKind = result.kind; render(); return; }
    state.status = 'idle';
    state.errorKind = result.termsOutdated ? 'terms' : null;
    fields.setErrors(result.fieldErrors);
    const first = ERROR_ORDER.find((key) => result.fieldErrors[key]);
    if (first === 'slug') fields.touchSlug();
    showStep(first && STEP_ONE_ERRORS.includes(first) ? 'form' : 'plan');
    render();
    if (first) fields.focus(first);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (state.status === 'sending') return;
    // Robôs preenchem o campo escondido: recebem a tela de sucesso sem nada ser enviado.
    if (ui.honeypot.value) { showSuccess(); return; }
    if (state.step !== 'plan') { goToPlan(); return; }
    if (!ui.aceite.checked || !state.acceptedAt) return;
    state.status = 'sending';
    state.errorKind = null;
    render();
    handleResult(await sendTrialRequest({ url: config.trialApiUrl, payload: buildPayload(), timeoutMs: config.trialApiTimeoutMs }));
  };

  const buildPayload = () => {
    const values = fields.values();
    return {
      fullName: values.nome, email: values.email, phoneNumber: values.whatsapp, cpf: onlyDigits(values.cpf),
      brokerageName: values.corretora, subdomain: values.slug, cnpj: normalizeCnpj(values.cnpj),
      teamSize: values.corretores, planCode: PLAN_CODES[state.plan],
      legalAcceptance: { termsVersion: config.termsVersion, privacyPolicyVersion: config.privacyVersion, acceptedAt: state.acceptedAt },
      ...utm,
    };
  };

  byId('trial-continue').addEventListener('click', goToPlan);
  byId('trial-back').addEventListener('click', goToForm);
  ui.chips.forEach((chip) => chip.addEventListener('click', () => { state.plan = chip.dataset.plan; fields.clearError('plano'); render(); }));
  ui.aceite.addEventListener('change', () => {
    state.acceptedAt = ui.aceite.checked ? new Date().toISOString() : null;
    fields.clearError('aceite');
    render();
  });
  form.addEventListener('submit', submit);
  render();

  return {
    prepare({ plan }) {
      if (plan) state.plan = plan;
      showStep('form');
      render();
    },
    // Enviando, não fecha. Na confirmação, só fecha pelo botão (Esc é ignorado).
    canClose: ({ fromButton }) => state.status !== 'sending' && (state.status !== 'ok' || fromButton),
    afterClose() {
      if (state.status === 'ok') { resetAll(); return; }
      if (state.status === 'err') state.status = 'idle';
      state.errorKind = null;
      render();
    },
  };

  function resetAll() {
    fields.reset();
    success.hide();
    form.closest('[role="dialog"]').querySelectorAll('[data-trial-view="form"]').forEach((view) => { view.hidden = false; });
    Object.assign(state, { step: 'form', status: 'idle', errorKind: null, acceptedAt: null });
    showStep('form');
    render();
  }
}

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const read = (key) => params.get(key) || null;
  return {
    utmSource: read('utm_source'), utmMedium: read('utm_medium'), utmCampaign: read('utm_campaign'),
    utmTerm: read('utm_term'), utmContent: read('utm_content'),
  };
}
