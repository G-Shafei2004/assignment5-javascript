(function () {
'use strict';

/* ===== Task 3: Ticket builder with live validation ===== */

const CODE_LENGTH = 6;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CURRENCY = '₸';

const EVENTS = [
  { id: 'rock',    name: 'Astana Rock Night' },
  { id: 'theatre', name: 'Opera Gala' },
  { id: 'tech',    name: 'Tech Meetup AITU' }
];

// seats left are stored in the array and decrease after a booking
const ticketTypes = [
  { id: 'standard', label: 'Standard', price: 5000,  seats: 10 },
  { id: 'vip',      label: 'VIP',      price: 15000, seats: 3 },
  { id: 'student',  label: 'Student',  price: 2500,  seats: 6 }
];

const SOLD_OUT_DATES = ['2026-11-07', '2026-11-14', '2026-12-31'];
const PROMO_CODES = [
  { code: 'WELCOME10', discount: 0.10 },
  { code: 'STUDENT20', discount: 0.20 },
  { code: 'AITU15',    discount: 0.15 }
];
const BLOCKED_EMAIL_DOMAINS = ['mailinator.com', 'tempmail.com', '10minutemail.com'];
const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)+$/u; // at least two words, letters only

const FIELD_LABELS = {
  event: 'Event', date: 'Date', type: 'Ticket type', quantity: 'Quantity',
  name: 'Full name', email: 'Email', promo: 'Promo code'
};
const FIELD_NAMES = Object.keys(FIELD_LABELS);

// ---- DOM ----
const form = document.getElementById('ticket-form');
form.noValidate = true; // turn off browser messages; checkValidity() still works
const summary = document.getElementById('form-summary');
const result = document.getElementById('result');
const dateHint = document.getElementById('date-hint');
const preview = {
  event: document.getElementById('pv-event'),
  date: document.getElementById('pv-date'),
  type: document.getElementById('pv-type'),
  quantity: document.getElementById('pv-quantity'),
  name: document.getElementById('pv-name'),
  email: document.getElementById('pv-email'),
  discount: document.getElementById('pv-discount'),
  total: document.getElementById('pv-total')
};

const touched = new Set();

// ---------- helpers ----------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBookingCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randInt(0, CODE_ALPHABET.length - 1)];
  }
  return 'TK-' + code;
}

function field(name) { return form.elements[name]; }
function errorEl(name) { return document.getElementById(name + '-error'); }
function getType() { return ticketTypes.find((t) => t.id === field('type').value); }
function getEvent() { return EVENTS.find((e) => e.id === field('event').value); }
function findPromo(value) {
  return PROMO_CODES.find((p) => p.code === value.trim().toUpperCase());
}
function money(value) { return value.toLocaleString('en-US') + ' ' + CURRENCY; }

function fillSelects() {
  for (const ev of EVENTS) {
    const option = document.createElement('option');
    option.value = ev.id;
    option.textContent = ev.name;
    field('event').append(option);
  }
  refreshTypeOptions();
}

// keeps the selected value and shows seats left
function refreshTypeOptions() {
  const select = field('type');
  const selected = select.value;
  while (select.options.length > 1) select.remove(1);
  for (const t of ticketTypes) {
    const option = document.createElement('option');
    option.value = t.id;
    option.textContent = t.label + ' — ' + money(t.price) + ' (' + t.seats + ' left)';
    select.append(option);
  }
  select.value = selected;
}

// ---------- the rules that HTML attributes cannot express ----------
const rules = {
  name(value) {
    return NAME_PATTERN.test(value.trim())
      ? '' : 'Enter first and last name using letters only (e.g. Ali Rahimi).';
  },
  date(value) {
    return SOLD_OUT_DATES.includes(value)
      ? 'Tickets for ' + value + ' are sold out. Choose another date.' : '';
  },
  quantity(value) {
    const type = getType();
    if (!type) return '';
    return Number(value) <= type.seats
      ? '' : 'Only ' + type.seats + ' ' + type.label + ' seats left.';
  },
  promo(value) {
    if (value.trim() === '') return '';
    return findPromo(value) ? '' : 'Unknown promo code.';
  },
  email(value) {
    const domain = (value.split('@')[1] || '').toLowerCase();
    return BLOCKED_EMAIL_DOMAINS.includes(domain)
      ? 'Temporary email addresses are not accepted.' : '';
  }
};

// returns an error message, or '' when the field is correct
function getMessage(input) {
  const name = input.name;
  const v = input.validity;
  if (v.valueMissing) return FIELD_LABELS[name] + ' is required.';
  if (v.typeMismatch) return 'Enter a valid email like name@example.com.';
  if (v.tooShort) return FIELD_LABELS[name] + ' is too short.';
  if (v.rangeUnderflow) {
    return name === 'date' ? 'The date cannot be in the past.' : 'Quantity must be at least 1.';
  }
  if (v.rangeOverflow) return 'You can buy at most ' + input.max + ' tickets at once.';
  if (v.stepMismatch || v.badInput) return 'Enter a whole number.';
  if (rules[name]) return rules[name](input.value);
  return '';
}

function validateField(input) {
  const message = getMessage(input);
  errorEl(input.name).textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  input.classList.toggle('is-invalid', message !== '');
  input.classList.toggle('is-valid', message === '' && input.value.trim() !== '');
  return message;
}

function clearFieldState(input) {
  errorEl(input.name).textContent = '';
  input.removeAttribute('aria-invalid');
  input.classList.remove('is-invalid', 'is-valid');
}

// ---------- live preview ----------
function updatePreview() {
  const ev = getEvent();
  const type = getType();
  const qty = Number(field('quantity').value);
  const promo = findPromo(field('promo').value);

  preview.event.textContent = ev ? ev.name : '—';
  preview.date.textContent = field('date').value || '—';
  preview.type.textContent = type ? type.label : '—';
  preview.quantity.textContent = qty > 0 ? qty : '—';
  preview.name.textContent = field('name').value.trim() || '—';
  preview.email.textContent = field('email').value.trim() || '—';
  preview.discount.textContent = promo ? Math.round(promo.discount * 100) + '% (' + promo.code + ')' : '—';

  if (type && qty > 0) {
    const total = type.price * qty * (1 - (promo ? promo.discount : 0));
    preview.total.textContent = money(Math.round(total));
  } else {
    preview.total.textContent = '—';
  }
}

// ---------- events ----------
form.addEventListener('blur', (event) => {
  const input = event.target;
  if (!FIELD_NAMES.includes(input.name)) return;
  touched.add(input.name);
  validateField(input);
}, true); // blur does not bubble, so we listen in the capture phase

form.addEventListener('input', (event) => {
  const input = event.target;
  if (!FIELD_NAMES.includes(input.name)) return;
  if (touched.has(input.name)) validateField(input);
  // quantity depends on the ticket type
  if (input.name === 'type' && touched.has('quantity')) validateField(field('quantity'));
  updatePreview();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  result.replaceChildren();

  let errors = 0;
  let firstInvalid = null;
  for (const name of FIELD_NAMES) {
    touched.add(name);
    const input = field(name);
    if (validateField(input) !== '') {
      errors += 1;
      if (!firstInvalid) firstInvalid = input;
    }
  }

  if (errors > 0) {
    summary.textContent = errors + (errors === 1 ? ' error' : ' errors') + ' found. Please fix the fields marked in red.';
    summary.classList.add('has-errors');
    firstInvalid.focus();
    return;
  }

  summary.textContent = '';
  summary.classList.remove('has-errors');
  buildTicket();
});

function buildTicket() {
  const ev = getEvent();
  const type = getType();
  const qty = Number(field('quantity').value);
  const promo = findPromo(field('promo').value);
  const total = Math.round(type.price * qty * (1 - (promo ? promo.discount : 0)));
  const holder = field('name').value.trim();
  const email = field('email').value.trim();
  const date = field('date').value;

  type.seats -= qty; // seats are really used

  const ticket = document.createElement('article');
  ticket.classList.add('ticket');
  const title = document.createElement('h3');
  title.textContent = '✔ Booking confirmed';
  const code = document.createElement('p');
  code.classList.add('code');
  code.textContent = randomBookingCode();

  const lines = [
    ev.name + ' · ' + date,
    qty + ' × ' + type.label + (promo ? ' (promo ' + promo.code + ')' : ''),
    'Holder: ' + holder + ' · ' + email,
    'Total: ' + money(total)
  ];
  ticket.append(title, code);
  for (const text of lines) {
    const p = document.createElement('p');
    p.textContent = text;
    ticket.append(p);
  }
  result.append(ticket);

  form.reset();
  touched.clear();
  for (const name of FIELD_NAMES) clearFieldState(field(name));
  refreshTypeOptions();
  updatePreview();
}

// ---------- init ----------
function setMinDate() {
  const today = new Date();
  const iso = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  field('date').min = iso;
}

dateHint.textContent = 'Sold out: ' + SOLD_OUT_DATES.join(', ');
setMinDate();
fillSelects();
updatePreview();
})();
