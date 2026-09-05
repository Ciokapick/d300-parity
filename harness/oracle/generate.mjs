// Generator determinist de deconturi plauzibile, valide si invalide.
//
//   node harness/oracle/generate.mjs --seed 1 --count 300 --out cases/gen
//
// Nimic aleator in sens real: un PRNG mulberry32 pornit din --seed. Acelasi seed
// si acelasi count dau exact aceleasi fisiere.
//
// Doua constrangeri deliberate:
//   - nu generam CNP-uri care incep cu 7, 8 sau 9: pentru ele originalul citeste
//     data curenta (valid.isCNP), deci rezultatul n-ar mai fi reproductibil. Codul
//     de identificare generat e mereu un CUI (8 cifre), valid sau cu cifra de
//     control gresita; CNP/NIF sunt acoperite de cazurile scrise de mana.
//   - randurile primesc numai valori intregi si de cel mult 9 cifre, ca totalurile
//     sa ramana in tipurile IntNeg15 / IntNeg18 din XSD.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createForm } from './legacy-runtime.mjs';
import { formatCase } from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- argumente
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
const seed = Number(arg('seed', '1'));
const count = Number(arg('count', '100'));
const outArg = arg('out', 'cases/gen');
const outDir = path.isAbsolute(outArg) ? outArg : path.resolve(here, outArg);
if (!Number.isInteger(seed) || !Number.isInteger(count) || count < 1) {
  throw new Error('folosire: --seed <intreg> --count <intreg pozitiv> [--out cases/gen]');
}

// ---------------------------------------------------------------- PRNG
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- inventar
const form = createForm();
const { valid } = form.objects;
const inventory = JSON.parse(fs.readFileSync(
  path.resolve(here, '..', '..', 'legacy', 'extracted', 'fields.json'), 'utf8'));
const spec = (p) => inventory.fields.find((f) => f.path === p);
const JUDETE = spec('form1.identifCntr.adresa.judet').itemValues;
const CAEN = spec('form1.identifCntr.caen').itemValues;

// randurile numerice editabile din tabele (fara cele protejate / readOnly, care
// sunt calculate) si fara cele doua coloane care oglindesc alte randuri
const ROWS = inventory.fields
  .filter((f) => f.path.startsWith('form1.date.')
    && f.ui === 'numericEdit'
    && (!f.access || f.access === 'open')
    && /\.(c1|c2|c3)$/.test(f.path))
  .map((f) => f.path);

// coloanele Valoare cu auto-completare de TVA, ca sa putem suprascrie TVA-ul manual
const AUTO_TVA = {
  'form1.date.livrari.r9.c2': 0.21,
  'form1.date.livrari.r10.c2': 0.11,
  'form1.date.livrari.r11.c2': 0.09,
  'form1.date.livrari.r12_1.c2': 0.21,
  'form1.date.livrari.r12_2.c2': 0.11,
  'form1.date.achizitiiIMP.r24.c2': 0.21,
  'form1.date.achizitiiIMP.r25.c2': 0.11,
};

// ---------------------------------------------------------------- ajutoare
const DEN = ['ALFA CONSULT', 'BETA TRADE', 'GAMMA LOGISTIC', 'DELTA SOFT', 'OMEGA IMPEX',
  'NORD DISTRIBUTIE', 'SUD AGRO', 'EST TRANSPORT', 'VEST MEDIA', 'CENTRAL SERVICE'];
const FORMA = ['SRL', 'SA', 'PFA', 'SRL-D'];
const BANCI = ['BANCA EXEMPLU', 'BANCA DE TEST', 'PRIMA BANCA', 'BANCA NORD', 'BANCA SUD'];
const STRAZI = ['CALEA VICTORIEI', 'STR. LUNGA', 'BD. UNIRII', 'STR. SCURTA', 'ALEEA TEILOR'];
const LOC = ['ORADEA', 'CLUJ-NAPOCA', 'IASI', 'TIMISOARA', 'CONSTANTA', 'BRASOV', 'SIBIU'];
const NUME = ['POPESCU', 'IONESCU', 'GEORGESCU', 'DUMITRU', 'STAN'];
const PRENUME = ['ION', 'MARIA', 'ANDREI', 'ELENA', 'RADU'];
const FUNCTII = ['ADMINISTRATOR', 'DIRECTOR ECONOMIC', 'CONTABIL SEF', 'IMPUTERNICIT'];

/** IBAN romanesc cu cifra de control corecta, calculata dupa ISO 7064 mod 97. */
function ibanRo(bank, digits) {
  const bban = bank + digits;
  const rearranged = bban + 'RO00';
  const numeric = rearranged.replace(/[A-Z]/g, (l) => String(l.charCodeAt(0) - 55));
  let rest = 0;
  for (const ch of numeric) rest = (rest * 10 + Number(ch)) % 97;
  const check = String(98 - rest).padStart(2, '0');
  return `RO${check}${bban}`;
}

/** CUI de 8 cifre: prefix de 7 cifre + cifra de control cautata cu chiar valid.isCUI. */
function cui(prefix7, wantValid) {
  for (let d = 0; d <= 9; d++) {
    const c = prefix7 + d;
    if (valid.isCUI(c) === wantValid) return c;
  }
  return null;
}

// ---------------------------------------------------------------- generare
function build(rnd, index) {
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  const chance = (p) => rnd() < p;

  const inputs = [];
  const put = (p, v) => inputs.push([`form1.${p}`, String(v)]);
  const note = [];

  // --- perioada -------------------------------------------------------
  const tip = pick(['L', 'L', 'L', 'T', 'T', 'S', 'A']);
  const an = pick([2024, 2025, 2026, 2026, 2026]);
  let luna;
  const perioadaGresita = chance(0.12);
  if (perioadaGresita) {
    luna = int(1, 12);
    note.push('corelatie tip decont - luna posibil incalcata');
  } else if (tip === 'T') luna = pick([2, 3, 5, 6, 8, 9, 11, 12]);
  else if (tip === 'S') luna = pick([6, 12]);
  else if (tip === 'A') luna = 12;
  else luna = an === 2024 ? int(5, 12) : int(1, 12);
  if (an === 2024 && luna < 5 && !perioadaGresita) luna = int(5, 12);

  put('Antet.metaDate.an_r', an);
  put('Antet.metaDate.tipDecont', tip);
  put('Antet.metaDate.luna_r', luna);
  // daca prima incercare a fost respinsa, contribuabilul reintroduce o luna valida
  if (perioadaGresita) put('Antet.metaDate.luna_r', tip === 'A' ? 12 : (tip === 'S' ? pick([6, 12]) : (tip === 'T' ? pick([3, 6, 9, 12]) : luna)));

  // --- bife de antet --------------------------------------------------
  if (chance(0.15)) { put('Antet.opInterne.mtdSimplificata', '1'); note.push('metoda simplificata'); }
  if (chance(0.12)) { put('Antet.metaDate.d_rez', '2'); note.push('dupa anularea rezervei'); }
  if (chance(0.10)) {
    put('Antet.metaDate.d_scc', '1');
    put('Antet.cifS', cui(String(int(1000000, 9999999)), chance(0.8)) ?? '18597239');
    note.push('succesor art.90');
  }
  if (chance(0.08)) put('Antet.d_reprezentant', '1');
  if (chance(0.10)) put('Antet.metaDate.d_rec', '1');

  // --- identificare ---------------------------------------------------
  const cifOk = chance(0.85);
  const cifVal = cui(String(int(1000000, 9999999)), cifOk);
  put('identifCntr.denumire.cif', cifVal ?? '18597239');
  if (!cifOk) note.push('CUI cu cifra de control gresita');

  let den = `${pick(DEN)} ${pick(FORMA)}`;
  if (chance(0.06)) { den = `${den} #${index}`; note.push('caractere nepermise in denumire'); }
  put('identifCntr.denumire.den', den);

  const judet = chance(0.35) ? '40' : pick(JUDETE.filter((j) => j !== '40'));
  put('identifCntr.adresa.judet', judet);
  if (judet === '40') put('identifCntr.adresa.sect', String(int(1, 6)));
  else put('identifCntr.adresa.loc', pick(LOC));
  put('identifCntr.adresa.str', pick(STRAZI));
  put('identifCntr.adresa.nr', String(int(1, 250)));
  if (chance(0.3)) put('identifCntr.adresa.bloc', `${pick(['A', 'B', 'C'])}${int(1, 20)}`);
  if (chance(0.2)) put('identifCntr.adresa.apt', String(int(1, 90)));
  put('identifCntr.adresa.codPst', chance(0.08)
    ? String(int(10000, 99999))
    : String(int(100000, 999999)));

  if (chance(0.6)) put('identifCntr.contact.telefon', chance(0.12) ? String(int(10000, 99999)) : `02${int(10, 69)}${String(int(0, 999999)).padStart(6, '0')}`);
  if (chance(0.5)) put('identifCntr.contact.email', chance(0.12) ? `fara-arond-${index}` : `contact${index}@exemplu.ro`);

  put('identifCntr.banca.den', pick(BANCI));
  const ibanOk = chance(0.88);
  const ib = ibanRo(pick(['AAAA', 'BBBB', 'CCCC', 'DDDD']), String(int(0, 999999999999)).padStart(16, '0'));
  put('identifCntr.banca.iban', ibanOk ? ib : ib.slice(0, -1) + ((Number(ib.slice(-1)) + 1) % 10));
  if (!ibanOk) note.push('IBAN cu cifra de control gresita');

  put('identifCntr.caen', pick(CAEN));
  const proOk = chance(0.9);
  put('identifCntr.proRata', proOk ? String(int(0, 100)) : String(pick([-5, 120, 150, 999])));
  if (!proOk) note.push('pro-rata in afara intervalului 0-100');

  // --- randuri --------------------------------------------------------
  const nRows = int(1, 8);
  const used = new Set();
  for (let i = 0; i < nRows; i++) {
    const p = ROWS[Math.floor(rnd() * ROWS.length)];
    if (used.has(p)) continue;
    used.add(p);
    const neg = chance(0.10);
    const v = int(1, 999999) * pick([1, 1, 1, 10, 100]);
    put(p.replace('form1.', ''), neg ? -v : v);
    // uneori contribuabilul suprascrie manual TVA-ul auto-completat
    if (AUTO_TVA[p] && chance(0.25)) {
      const tvaPath = p.replace(/c2$/, 'c3');
      const cota = AUTO_TVA[p];
      const inToleranta = chance(0.5);
      const t = Math.round(Math.abs(v) * (inToleranta ? cota : cota / 3));
      put(tvaPath.replace('form1.', ''), neg ? -t : t);
      if (!inToleranta) note.push('TVA manual in afara tolerantei de +/-1 punct');
    }
  }
  // rd.38 completat explicit cu 0 in majoritatea cazurilor: altfel exclusivitatea
  // rd.38 / rd.41 pica pe null != 0 (defect al originalului)
  if (chance(0.8)) put('date.regularizari.r39.c3', 0);
  if (chance(0.25)) put('date.regularizari.r42.c3', int(1, 50000));

  // --- bife de tabel si rambursare ------------------------------------
  for (const b of ['bifa_cereale', 'bifa_mob', 'bifa_disp', 'bifa_cons']) {
    if (chance(0.12)) put(`date.bife.caption.${b}`, 'D');
  }
  if (chance(0.30)) put('date.rambursare.bifa_rambursare', 'D');

  // --- facturi si declarant -------------------------------------------
  if (chance(0.5)) {
    put('date.r47.c1', int(1, 500));
    put('date.r47.c2', int(1000, 9999999));
    put('date.r47.c3', int(100, 999999));
  }
  if (chance(0.4)) {
    put('date.r48.c1', int(1, 500));
    put('date.r48.c2', int(1000, 9999999));
    put('date.r48.c3', int(100, 999999));
  }

  const semnaturaLipsa = chance(0.07);
  put('semnatura.nume', pick(NUME));
  put('semnatura.prenume', pick(PRENUME));
  if (!semnaturaLipsa) put('semnatura.smnFnc', pick(FUNCTII));
  else note.push('functia declarantului lipseste');

  const descriere = `Decont generat (seed ${seed}, #${index}): ${tip}, an ${an}, luna ${luna}`
    + (note.length ? `; ${note.join('; ')}` : '; fara abateri intentionate');
  return { name: `gen-${seed}-${String(index).padStart(4, '0')}`, descriere, inputs };
}

// ---------------------------------------------------------------- scriere
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const rnd = mulberry32(seed);
for (let i = 1; i <= count; i++) {
  const c = build(rnd, i);
  fs.writeFileSync(path.join(outDir, `${c.name}.json`), formatCase(c));
}
console.log(`generate ${count} cazuri cu seed ${seed} in ${path.relative(process.cwd(), outDir)}`);
