// Incarcatorul comun de cazuri pentru oracolul 1.
//
// Un caz e {name, descriere, inputs: [[cale, valoare], ...]}. Valorile pot contine
// patru substituenti, expandati aici o singura data si DETERMINIST (fara aleator),
// ca sa nu apara in corpus coduri reale ale unor firme reale:
//
//   {{CUI}}          un CUI care trece prin valid.isCUI (algoritmul original)
//   {{CUI_INVALID}}  acelasi prefix, cifra de control gresita
//   {{IBAN}}         un IBAN romanesc care trece prin valid.isValidIBANNumber
//   {{IBAN_INVALID}} acelasi IBAN cu ultima cifra schimbata, cifra de control gresita
//
// Substituentii se rezolva chiar cu functiile din PDF, nu cu o reimplementare.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createForm } from './legacy-runtime.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const CASES_DIR = path.join(here, 'cases');
export const GEN_DIR = path.join(CASES_DIR, 'gen');

// prefix fix: parcurgem cifra de control 0..9 si luam prima valida / prima invalida
const CUI_PREFIX = '1859723';
// IBAN de referinta (fictiv, structura valida); ultima cifra se roteste pentru varianta invalida
const IBAN_SEED = 'RO49AAAA1B31007593840000';

let cache = null;

/** Valorile celor patru substituenti, calculate o singura data. */
export function placeholders() {
  if (cache) return cache;
  const { valid } = createForm().objects;
  let CUI = null;
  let CUI_INVALID = null;
  for (let d = 0; d <= 9; d++) {
    const c = CUI_PREFIX + d;
    if (valid.isCUI(c)) { if (CUI === null) CUI = c; } else if (CUI_INVALID === null) CUI_INVALID = c;
  }
  if (!CUI || !CUI_INVALID) throw new Error('nu pot construi perechea CUI valid/invalid');

  // isValidIBANNumber intoarce restul mod 97; 1 inseamna corect (originalul compara cu false)
  if (valid.isValidIBANNumber(IBAN_SEED) !== 1) throw new Error(`IBAN de referinta respins: ${IBAN_SEED}`);
  let IBAN_INVALID = null;
  for (let d = 0; d <= 9; d++) {
    const c = IBAN_SEED.slice(0, -1) + d;
    if (c !== IBAN_SEED && valid.isValidIBANNumber(c) !== 1) { IBAN_INVALID = c; break; }
  }
  if (!IBAN_INVALID) throw new Error('nu pot construi un IBAN invalid');

  cache = { CUI, CUI_INVALID, IBAN: IBAN_SEED, IBAN_INVALID };
  return cache;
}

const TOKEN = /\{\{(CUI|CUI_INVALID|IBAN|IBAN_INVALID)\}\}/g;

/** Inlocuieste substituentii intr-un caz si intoarce o copie. */
export function expand(c, ph = placeholders()) {
  const inputs = c.inputs.map(([p, v]) => {
    const s = String(v);
    return [p, s.replace(TOKEN, (_, k) => ph[k])];
  });
  return { ...c, inputs };
}

function readCase(file) {
  const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!c || typeof c.name !== 'string' || !Array.isArray(c.inputs)) {
    throw new Error(`caz invalid: ${file}`);
  }
  const base = path.basename(file, '.json');
  if (c.name !== base) throw new Error(`numele cazului (${c.name}) difera de fisier (${base})`);
  for (const pair of c.inputs) {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string') {
      throw new Error(`intrare invalida in ${file}: ${JSON.stringify(pair)}`);
    }
    if (!pair[0].startsWith('form1.')) throw new Error(`calea nu incepe cu form1.: ${pair[0]} (${file})`);
  }
  return c;
}

const jsonFiles = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  : []);

/** Un singur caz scris de mana, dupa nume. */
export function loadCase(name, ph = placeholders()) {
  return expand(readCase(path.join(CASES_DIR, `${name}.json`)), ph);
}

/**
 * Toate cazurile: intai cele scrise de mana din cases/, apoi cele generate din
 * cases/gen/. Fiecare intrare e {case, gen}.
 */
export function loadAll({ gen = true } = {}) {
  const ph = placeholders();
  const out = jsonFiles(CASES_DIR).map((f) => ({ case: expand(readCase(path.join(CASES_DIR, f)), ph), gen: false }));
  if (gen) {
    for (const f of jsonFiles(GEN_DIR)) out.push({ case: expand(readCase(path.join(GEN_DIR, f)), ph), gen: true });
  }
  return out;
}

/** Serializare compacta: o intrare pe linie, ca diff-urile pe corpus sa fie citibile. */
export function formatCase(c) {
  const rows = c.inputs.map((p) => `    ${JSON.stringify(p)}`).join(',\n');
  return `{\n  "name": ${JSON.stringify(c.name)},\n  "descriere": ${JSON.stringify(c.descriere ?? '')},\n`
    + `  "inputs": [\n${rows}\n  ]\n}\n`;
}
