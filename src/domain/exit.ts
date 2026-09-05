// Regulile `exit` din registry.ts: tot ce se intampla la iesirea din camp, DUPA ce
// valoarea a fost scrisa in stare. Ordinea din interiorul fiecarui camp e cea din
// scriptul original (intai `trimSpaces` + salvare, apoi verificarile), iar semantica
// e cea a JavaScript-ului din PDF, cu tot cu ciudateniile ei:
//
//   - `exit.tipDecont.corelatie` are trei `if`-uri secventiale (nu `else if`);
//   - `exit.luna.2024` ruleaza `check_tipDecont` doar pe ramura `else`;
//   - `exit.iban` are DOUA mesaje: `err == false` (deci si restul 0) si `err > 1`;
//   - `exit.tva.auto` are o garda mereu adevarata, deci scrie c3 si cand c2 e null;
//   - `exit.r30.min` goleste campul INAINTE de alert;
//   - `exit.nedeductibil.A` interpoleaza inversat in `A.tva-vs-valoare`.

import {
  EMAIL_RE,
  IBAN_COUNTRY_CODES,
  invalidChr,
  isCUI,
  isCnpNif,
  isValidIBANNumber,
  PHONE_RE,
  remSpaces,
  roundNumber,
  SET_A_RE,
  SET_B_RE,
  trimSpaces,
} from './checksums';
import type { Ctx } from './context';
import type { ExitModule } from './contracts';
import { FIELD_BY_PATH, type FieldValue } from './fields';
import { text, TITLES } from './messages';
import { SET_A_FIELDS, SET_B_FIELDS, TVA_AUTO } from './rules/registry';

// ---------------------------------------------------------------- ajutoare

/** `x == n` din JavaScript pe un `rawValue`: `null` nu e egal cu niciun numar */
function looseEq(v: FieldValue, n: number): boolean {
  return v !== null && Number(v) === n;
}

/** `Math.abs(rawValue)`: `Math.abs(null)` e 0 in JavaScript */
function abs(v: FieldValue): number {
  return Math.abs(v === null ? 0 : Number(v));
}

/** `this.rawValue * cota` cu `null * cota == 0` */
function mul(v: FieldValue, rate: number): number {
  return (v === null ? 0 : Number(v)) * rate;
}

/**
 * `this.formattedValue` pentru un camp `dateTimeEdit`, ca in shim-ul oracolului:
 * o data ISO se afiseaza ZZ.LL.AAAA, orice altceva se intoarce neschimbat. De aceea
 * `rawValue == formattedValue` inseamna „valoarea nu e o data".
 */
function formattedValue(path: string, raw: FieldValue): FieldValue {
  const spec = FIELD_BY_PATH.get(path);
  if (spec?.ui === 'dateTimeEdit' && typeof raw === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  }
  return raw;
}

/**
 * `utile.trimSpaces` + salvare, comuna tuturor campurilor text. Intoarce valoarea
 * salvata; `null` cand campul era gol sau a ramas gol dupa trim (in original,
 * `this.rawValue.length` ar arunca in acest caz — noi ne oprim tacut).
 */
function trimAndStore(ctx: Ctx, path: string): string | null {
  const raw = ctx.get(path);
  if (raw === null) return null;
  ctx.set(path, trimSpaces(String(raw)));
  const stored = ctx.get(path);
  return stored === null ? null : String(stored);
}

// ---------------------------------------------------------------- utile.check_tipDecont

const LUNI_T = [3, 6, 9, 12, 2, 5, 8, 11];

/**
 * `utile.check_tipDecont`. Originalul citeste `luna` si `tiptva` o singura data, la
 * inceput, apoi evalueaza trei `if`-uri independente; cum `tiptva` poate fi doar una
 * dintre T/S/A, cel mult unul se declanseaza.
 */
function checkTipDecont(ctx: Ctx): void {
  const luna = ctx.get('Antet.metaDate.luna_r');
  const tiptva = ctx.get('Antet.metaDate.tipDecont');
  if (luna === null) return;
  const l = Number(luna);

  const cade = (key: 'tipDecont.T' | 'tipDecont.S' | 'tipDecont.A'): void => {
    ctx.say({ kind: 'alert', text: text(key) });
    ctx.set('Antet.metaDate.tipDecont', 'L');
    ctx.set('Antet.metaDate.luna_r', null);
    ctx.fire('exit.tipDecont.corelatie', 'Antet.metaDate.tipDecont');
  };

  if (tiptva === 'T' && !LUNI_T.includes(l)) cade('tipDecont.T');
  if (tiptva === 'S' && l !== 6 && l !== 12) cade('tipDecont.S');
  if (tiptva === 'A' && l !== 12) cade('tipDecont.A');
}

// ---------------------------------------------------------------- seturi de caractere

const SET_A = new Set<string>(SET_A_FIELDS);
const SET_B = new Set<string>(SET_B_FIELDS);

function caractereNepermise(ctx: Ctx, path: string, stored: string): boolean {
  const inSetA = SET_A.has(path);
  const res = invalidChr(stored, inSetA ? SET_A_RE : SET_B_RE);
  if (res === null) return false;
  ctx.say({ kind: 'alert', text: inSetA ? text('caractere.setA', res) : text('caractere.setB', res) });
  ctx.fire(inSetA ? 'exit.caractere.setA' : 'exit.caractere.setB', path);
  return true;
}

// ---------------------------------------------------------------- TVA automat

const C2_ROW = new Map(TVA_AUTO.map((t) => [t.c2, t]));
const C3_ROW = new Map(TVA_AUTO.map((t) => [t.c3, t]));

/**
 * Marginile de toleranta sunt literalii din original (0.20/0.22 pentru 21%,
 * 0.10/0.12 pentru 11%, 0.08/0.10 pentru 9%), NU `cota -/+ 0.01`: in virgula
 * mobila `0.09 + 0.01 === 0.09999999999999999`, iar diferenta se vede de la
 * valoarea 5 in sus (vezi raportul).
 */
const TOLERANTA: Readonly<Record<string, readonly [number, number]>> = {
  '0.21': [0.20, 0.22],
  '0.11': [0.10, 0.12],
  '0.09': [0.08, 0.10],
};

function bounds(rate: number): readonly [number, number] {
  const b = TOLERANTA[String(rate)];
  if (!b) throw new Error(`cota fara margini de toleranta: ${rate}`);
  return b;
}

// ---------------------------------------------------------------- rd. A/A1 si B/B1

type AbText = (x: FieldValue, y: FieldValue) => string;

interface AbRow {
  rule: 'exit.nedeductibil.A' | 'exit.nedeductibil.B';
  base: string;
  sub: string;
  /** „rd.X col.Valoare nu poate fi mai mic decat rd.X1 col.Valoare" */
  valoareVsSub: AbText;
  /** „rd.X col.Valoare nu poate fi mai mic decat rd.X col.TVA" */
  valoareVsTva: AbText;
  /** „rd.X col.TVA nu poate fi mai mic decat rd.X1 col.TVA" */
  tvaVsSub: AbText;
  /** „rd.X col.TVA nu poate fi mai mare decat rd.X col.Valoare" (la A, interpolat invers) */
  tvaVsValoare: AbText;
  /** „rd.X1 col.TVA nu poate fi mai mare decat rd.X1 col.Valoare" */
  subTvaVsValoare: AbText;
}

const AB: readonly AbRow[] = [
  {
    rule: 'exit.nedeductibil.A',
    base: 'date.nedeductibil.r50',
    sub: 'date.nedeductibil.r50_1',
    valoareVsSub: (a, a1) => text('A.valoare-vs-A1', a, a1),
    valoareVsTva: (a, tva) => text('A.valoare-vs-tva', a, tva),
    tvaVsSub: (tvaA, tvaA1) => text('A.tva-vs-A1', tvaA, tvaA1),
    tvaVsValoare: (a, tvaA) => text('A.tva-vs-valoare', a, tvaA),
    subTvaVsValoare: (tvaA1, a1) => text('A1.tva-vs-valoare', tvaA1, a1),
  },
  {
    rule: 'exit.nedeductibil.B',
    base: 'date.nedeductibil.r60',
    sub: 'date.nedeductibil.r60_1',
    valoareVsSub: (b, b1) => text('B.valoare-vs-B1', b, b1),
    valoareVsTva: (b, tva) => text('B.valoare-vs-tva', b, tva),
    tvaVsSub: (tvaB, tvaB1) => text('B.tva-vs-B1', tvaB, tvaB1),
    // #211 interpoleaza CORECT (spre deosebire de #205), deci argumentele se inverseaza
    tvaVsValoare: (b, tvaB) => text('B.tva-vs-valoare', tvaB, b),
    subTvaVsValoare: (tvaB1, b1) => text('B1.tva-vs-valoare', tvaB1, b1),
  },
];

/** #203 / #209: iesirea din rd.A col.Valoare */
function abBaseC2(ctx: Ctx, row: AbRow): void {
  const a = ctx.get(`${row.base}.c2`);
  const a1 = ctx.get(`${row.sub}.c2`);
  const tva = ctx.get(`${row.base}.c3`);
  if (a !== null && a1 !== null && abs(a) < abs(a1)) {
    ctx.say({ kind: 'alert', text: row.valoareVsSub(a, a1) });
    ctx.fire(row.rule, `${row.base}.c2`);
  }
  if (a !== null && tva !== null && abs(a) < abs(tva)) {
    ctx.say({ kind: 'alert', text: row.valoareVsTva(a, tva) });
    ctx.fire(row.rule, `${row.base}.c2`);
  }
}

/** #205 / #211: iesirea din rd.A col.TVA (a doua interpolare e inversata la A) */
function abBaseC3(ctx: Ctx, row: AbRow): void {
  const a = ctx.get(`${row.base}.c2`);
  const tvaA = ctx.get(`${row.base}.c3`);
  const tvaA1 = ctx.get(`${row.sub}.c3`);
  if (tvaA !== null && tvaA1 !== null && abs(tvaA1) > abs(tvaA)) {
    ctx.say({ kind: 'alert', text: row.tvaVsSub(tvaA, tvaA1) });
    ctx.fire(row.rule, `${row.base}.c3`);
  }
  if (a !== null && tvaA !== null && abs(a) < abs(tvaA)) {
    // la rd.A originalul pune valoarea pe pozitia TVA si invers; argumentele raman
    // in ordinea sursei (vezi `A.tva-vs-valoare` din messages.ts)
    ctx.say({ kind: 'alert', text: row.tvaVsValoare(a, tvaA) });
    ctx.fire(row.rule, `${row.base}.c3`);
  }
}

/** #206 / #212: iesirea din rd.A1 col.Valoare */
function abSubC2(ctx: Ctx, row: AbRow): void {
  const a1 = ctx.get(`${row.sub}.c2`);
  const a = ctx.get(`${row.base}.c2`);
  if (a !== null && a1 !== null && abs(a) < abs(a1)) {
    ctx.say({ kind: 'alert', text: row.valoareVsSub(a, a1) });
    ctx.fire(row.rule, `${row.sub}.c2`);
  }
}

/** #207 / #213: iesirea din rd.A1 col.TVA */
function abSubC3(ctx: Ctx, row: AbRow): void {
  const a1 = ctx.get(`${row.sub}.c2`);
  const tvaA = ctx.get(`${row.base}.c3`);
  const tvaA1 = ctx.get(`${row.sub}.c3`);
  if (tvaA !== null && tvaA1 !== null && abs(tvaA1) > abs(tvaA)) {
    ctx.say({ kind: 'alert', text: row.tvaVsSub(tvaA, tvaA1) });
    ctx.fire(row.rule, `${row.sub}.c3`);
  }
  if (a1 !== null && tvaA1 !== null && abs(a1) < abs(tvaA1)) {
    ctx.say({ kind: 'alert', text: row.subTvaVsValoare(tvaA1, a1) });
    ctx.fire(row.rule, `${row.sub}.c3`);
  }
}

// ---------------------------------------------------------------- onExit

function onExit(ctx: Ctx, path: string): void {
  // ---------------------------------------------------- TVA automat (#136 etc.)
  const c2row = C2_ROW.get(path);
  if (c2row) {
    ctx.set(c2row.c3, roundNumber(mul(ctx.get(path), c2row.rate), 0) ?? null);
    ctx.fire('exit.tva.auto', path);
    return;
  }
  const c3row = C3_ROW.get(path);
  if (c3row) {
    const vv = abs(ctx.get(c3row.c2));
    const [lo, hi] = bounds(c3row.rate);
    const vv1 = roundNumber(vv * lo, 0) ?? 0;
    const vv3 = roundNumber(vv * hi, 0) ?? 0;
    const here = abs(ctx.get(path));
    if (vv1 > here || here > vv3) {
      ctx.say({ kind: 'messageBox', title: TITLES.atentie, text: text('tva.toleranta') });
      ctx.fire('exit.tva.toleranta', path);
    }
    return;
  }

  // ---------------------------------------------------- seturile de caractere
  if (SET_A.has(path) || SET_B.has(path)) {
    const stored = trimAndStore(ctx, path);
    if (stored === null) return;
    caractereNepermise(ctx, path, stored);
    // #110: verificarea de lungime vine DUPA cea de caractere, in acelasi script
    if (path === 'identifCntr.adresa.codPst' && stored.length !== 6) {
      ctx.say({ kind: 'messageBox', title: TITLES.formatEronat, text: text('codPst.lungime') });
      ctx.fire('exit.codPst.lungime', path);
    }
    return;
  }

  switch (path) {
    // -------------------------------------------------- #43
    case 'Antet.metaDate.an_r': {
      const an = ctx.get(path);
      if (an !== null && Number(an) < 2024) {
        ctx.say({ kind: 'alert', text: text('an.minim') });
        ctx.fire('exit.an.minim', path);
      }
      return;
    }

    // -------------------------------------------------- #45
    case 'Antet.metaDate.tipDecont':
      checkTipDecont(ctx);
      return;

    // -------------------------------------------------- #47
    case 'Antet.metaDate.luna_r': {
      const luna = ctx.get(path);
      const an = ctx.get('Antet.metaDate.an_r');
      if (looseEq(an, 2024) && luna !== null && Number(luna) < 5) {
        ctx.say({ kind: 'alert', text: text('luna.2024') });
        ctx.fire('exit.luna.2024', path);
      } else {
        checkTipDecont(ctx);
      }
      return;
    }

    // -------------------------------------------------- #48
    case 'Antet.metaDate.perioada.dataInceput': {
      const raw = ctx.get(path);
      if (raw === formattedValue(path, raw)) {
        ctx.say({ kind: 'messageBox', title: TITLES.validareFormatData, text: text('data.format') });
        ctx.set(path, null);
        ctx.fire('exit.perioada.data', path);
      } else {
        const sfarsit = ctx.get('Antet.metaDate.perioada.dataSfarsit');
        if (sfarsit !== null && raw !== null && String(raw) > String(sfarsit)) {
          ctx.say({ kind: 'alert', text: text('data.ordine.inceput') });
          ctx.set(path, null);
          ctx.fire('exit.perioada.data', path);
        }
      }
      return;
    }

    // -------------------------------------------------- #49
    case 'Antet.metaDate.perioada.dataSfarsit': {
      const raw = ctx.get(path);
      if (raw === formattedValue(path, raw)) {
        ctx.say({ kind: 'messageBox', title: TITLES.validareFormatData, text: text('data.format') });
        ctx.set(path, null);
        ctx.fire('exit.perioada.data', path);
      } else {
        const inceput = ctx.get('Antet.metaDate.perioada.dataInceput');
        if (inceput !== null && raw !== null && String(raw) < String(inceput)) {
          ctx.say({ kind: 'alert', text: text('data.ordine.sfarsit') });
          ctx.set(path, null);
          ctx.fire('exit.perioada.data', path);
        }
      }
      return;
    }

    // -------------------------------------------------- #60
    case 'Antet.temeiLegal': {
      if (looseEq(ctx.get('Antet.metaDate.d_rez'), 1)) {
        ctx.set(path, 2);
        ctx.fire('exit.temeiLegal.fortat', path);
      }
      if (looseEq(ctx.get(path), 1)) {
        ctx.set(path, 2);
        ctx.fire('exit.temeiLegal.fortat', path);
      }
      return;
    }

    // -------------------------------------------------- #61 / #70
    case 'Antet.cifS':
    case 'identifCntr.denumire.cif': {
      const stored = trimAndStore(ctx, path);
      if (stored === null) return;
      if (stored.length <= 10) {
        // isCUI emite singur `cui.zero` inainte de a intoarce false
        const ok = isCUI(stored, (m) => ctx.say(m));
        if (!ok) {
          ctx.say({ kind: 'alert', text: text('cui.invalid') });
          ctx.fire('exit.cif.identificare', path);
        }
      } else if (stored.length <= 13) {
        // `undefined == false` e fals, deci NIF-ul corect nu produce mesaj
        if (isCnpNif(stored) === false) {
          ctx.say({ kind: 'alert', text: text('cnp.invalid') });
          ctx.fire('exit.cif.identificare', path);
        }
      }
      return;
    }

    // -------------------------------------------------- #86
    case 'identifCntr.adresa.judet': {
      const spec = FIELD_BY_PATH.get(path);
      const lista = spec?.itemValues ?? spec?.items ?? [];
      const raw = ctx.get(path);
      if (raw !== null && !lista.includes(String(raw))) {
        ctx.set(path, null);
        ctx.say({ kind: 'alert', text: text('nomenclator') });
        ctx.fire('exit.judet', path);
      }
      if (looseEq(ctx.get(path), 40)) {
        ctx.set('identifCntr.adresa.loc', 'BUCURESTI');
        ctx.readOnly.delete('identifCntr.adresa.sect');
      } else {
        ctx.readOnly.add('identifCntr.adresa.sect');
        ctx.set('identifCntr.adresa.sect', null);
      }
      ctx.fire('exit.judet', path);
      return;
    }

    // -------------------------------------------------- #115 / #119
    case 'identifCntr.contact.telefon':
    case 'identifCntr.contact.fax': {
      const sir = ctx.get(path);
      if (sir !== null && !PHONE_RE.test(String(sir))) {
        ctx.say({ kind: 'alert', text: text('telefon.invalid') });
        ctx.fire('exit.telefon', path);
      }
      return;
    }

    // -------------------------------------------------- #123
    case 'identifCntr.contact.email': {
      const raw = ctx.get(path);
      if (raw !== null && !EMAIL_RE.test(String(raw))) {
        ctx.say({ kind: 'messageBox', title: '', text: text('email.invalid') });
        ctx.set(path, null);
        ctx.fire('exit.email', path);
      }
      return;
    }

    // -------------------------------------------------- #128
    case 'identifCntr.banca.iban': {
      const raw = ctx.get(path);
      if (raw !== null) ctx.set(path, remSpaces(String(raw).replace(/ /g, '')));
      const fieldValue = ctx.get(path);
      if (fieldValue === null) return;
      const iban = String(fieldValue);
      if (!IBAN_COUNTRY_CODES.includes(iban.substring(0, 2))) return;
      const err = isValidIBANNumber(iban);
      // `err == false` e adevarat si pentru restul 0
      if (err === false || Number(err) === 0) {
        ctx.say({ kind: 'alert', text: text('iban.invalid') });
        ctx.fire('exit.iban', path);
      }
      if (Number(err) > 1) {
        ctx.say({ kind: 'alert', text: text('iban.control') });
        ctx.fire('exit.iban', path);
      }
      return;
    }

    // -------------------------------------------------- #131 / #132
    case 'identifCntr.caen': {
      if (ctx.get('identifCntr.caen1') !== null) {
        ctx.set('identifCntr.caen1', null);
        ctx.fire('exit.caen.exclusiv', path);
      }
      return;
    }
    case 'identifCntr.caen1': {
      if (ctx.get('identifCntr.caen') !== null) {
        ctx.set('identifCntr.caen', null);
        ctx.fire('exit.caen.exclusiv', path);
      }
      return;
    }

    // -------------------------------------------------- #191
    case 'date.achizitiiIMP.r30.c2': {
      const gt = ctx.get(path);
      const lt = ctx.get('date.achizitiiIMP.r30_1.c2');
      if (gt !== null && lt !== null && Math.abs(Number(gt)) < Math.abs(Number(lt))) {
        ctx.set(path, null); // golirea vine INAINTE de alert
        ctx.say({ kind: 'alert', text: text('r30.min') });
        ctx.fire('exit.r30.min', path);
      }
      return;
    }

    default:
      break;
  }

  // -------------------------------------------------- #203..#213
  for (const row of AB) {
    if (path === `${row.base}.c2`) { abBaseC2(ctx, row); return; }
    if (path === `${row.base}.c3`) { abBaseC3(ctx, row); return; }
    if (path === `${row.sub}.c2`) { abSubC2(ctx, row); return; }
    if (path === `${row.sub}.c3`) { abSubC3(ctx, row); return; }
  }
}

export { onExit };

export default { onExit } satisfies ExitModule;
