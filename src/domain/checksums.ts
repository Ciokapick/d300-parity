// Algoritmii de cifra de control si utilitarele de text din formularul D300, copiate
// din `legacy/extracted/scriptobj_valid.js` si `scriptobj_utile.js`.
//
// Reguli din registry.ts acoperite aici: `checksums.cui`, `checksums.cnp`,
// `checksums.cnpNif`, `checksums.iban`, `checksums.telefon`, `checksums.email`,
// `checksums.text`.
//
// NIMIC nu e "reparat": defectele originalului (expresia cu `/` din isCNP, valorile
// de retur inconsistente ale lui isCnpNif si isValidIBANNumber, `roundNumber(null)`
// care intoarce `undefined`) sunt reproduse identic, pentru ca oracolul si modelul
// sa dea acelasi raspuns pe orice intrare.

import type { Message } from './state';

// ---------------------------------------------------------------- expresii regulate

/** #115 / #119 (`regTel`), verbatim. */
export const PHONE_RE =
  /^(?:(?:(?:00\s?|\+)40\s?|0)(?:7\d{2}\s?\d{3}\s?\d{3}|(21|31)\d{1}\s?\d{3}\s?\d{3}|((2|3)[3-7]\d{1})\s?\d{3}\s?\d{3}|(8|9)0\d{1}\s?\d{3}\s?\d{3}))$/;

/** #123 (`reg`), verbatim; originalul il construieste cu `new RegExp(...)`. */
export const EMAIL_RE =
  /^([a-zA-Z0-9]+([_.-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*([.][a-zA-Z]{2,4})+)$/;

/** #67 / #125 (`rgx`), verbatim: denumire si banca. */
export const SET_A_RE = /[^0-9a-zA-Z,.\-& ]/g;

/** #73 / #76 / #80 / #94 / #98 / #102 / #106 / #110 (`rgx`), verbatim: adresa. */
export const SET_B_RE = /[^0-9a-zA-Z,.\-+ ]/g;

/** Lista `CODE` din #128 (NU tabelul `CODE_LENGTHS` din valid.js), verbatim si in ordine. */
export const IBAN_COUNTRY_CODES: readonly string[] = [
  'AL', 'BY', 'TL', 'GE', 'XK', 'VG', 'LC', 'ST',
  'AD', 'AE', 'AT', 'AZ', 'BA', 'BE', 'BG', 'BH', 'BR',
  'CH', 'CR', 'CY', 'CZ', 'DE', 'DK', 'DO', 'EE', 'ES',
  'FI', 'FO', 'FR', 'GB', 'GI', 'GL', 'GR', 'GT', 'HR',
  'HU', 'IE', 'IL', 'IS', 'IT', 'JO', 'KW', 'KZ', 'LB',
  'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MR',
  'MT', 'MU', 'NL', 'NO', 'PK', 'PL', 'PS', 'PT', 'QA',
  'RO', 'RS', 'SA', 'SE', 'SI', 'SK', 'SM', 'TN', 'TR',
];

// ---------------------------------------------------------------- text (utile.js)

/** `utile.trimSpaces`: atentie, regex-ul are flagul `m`, deci taie pe fiecare linie. */
export function trimSpaces(x: string): string {
  return x.replace(/^\s+|\s+$/gm, '');
}

/** `utile.remSpaces`. */
export function remSpaces(x: string): string {
  return x.replace(/\s+/g, '');
}

/**
 * `utile.invalidChr`: originalul intoarce vectorul de potriviri, iar apelantii il
 * interpoleaza intr-un sir (`"... nepermise: " + res`), adica `String(vector)` =
 * elementele unite cu virgula. Intoarcem direct forma interpolata.
 */
export function invalidChr(value: string, re: RegExp): string | null {
  const result = value.match(re);
  return result === null ? null : String(result);
}

/**
 * `utile.roundNumber`: cand `number` e null (sau undefined), `rndedNum` ramane
 * nedeclarat si functia intoarce `undefined` — modelat aici ca `number | undefined`.
 */
export function roundNumber(n: number | null | undefined, digits: number): number | undefined {
  const multiple = Math.pow(10, digits);
  let rndedNum: number | undefined;
  if (n !== null && n !== undefined) rndedNum = Math.round(n * multiple) / multiple;
  return rndedNum;
}

// ---------------------------------------------------------------- CUI (valid.js)

/** `valid.isNumeric`: bucla se opreste la primul caracter din afara lui "0123456789". */
function isNumeric(sText: string): boolean {
  const ValidChars = '0123456789';
  let IsNumber = true;
  for (let i = 0; i < sText.length && IsNumber; i++) {
    const Char = sText.charAt(i);
    if (ValidChars.indexOf(Char) === -1) {
      IsNumber = false;
    }
  }
  return IsNumber;
}

/** `valid.strReverse`. */
function strReverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * `valid.isCUI`. Originalul emite `app.alert(mesajul cui.zero)` INAINTE de a intoarce
 * false cand primul caracter e "0"; aici mesajul pleaca prin `say`, daca e dat.
 *
 * Nota: cand sirul are peste 10 cifre, `key.charAt(i)` devine "" si suma devine NaN,
 * deci rezultatul e false — exact ca in original.
 */
export function isCUI(value: string, say?: (m: Message) => void): boolean {
  if (!isNumeric(value)) {
    return false;
  }
  if (value.charAt(0) === '0') {
    if (say) {
      say({
        kind: 'alert',
        text: 'Primul caracter al unui Cod Unic de Identificare nu poate fi 0(zero)!\n\nCorectati valoarea introdusa...',
      });
    }
    return false;
  }

  let key = '753217532';
  key = strReverse(key);

  let cuirev = strReverse('' + value.valueOf());
  const control = cuirev.substring(0, 1);
  cuirev = cuirev.substring(1);

  const length = cuirev.length;
  let suma = 0;

  for (let i = 0; i < length; i++) {
    suma += parseInt(cuirev.charAt(i), 10) * parseInt(key.charAt(i), 10);
  }
  suma *= 10;
  return ((suma % 11 === 10 && control === '0') || (suma % 11 !== 10 && (suma % 11).toString() === control))
    ? true
    : false;
}

// ---------------------------------------------------------------- CNP / NIF

/** citire fara `!`: dupa buclele de mai jos toate pozitiile 0..12 sunt completate */
const at = (a: readonly number[], i: number): number => a[i] ?? NaN;

/** `valid.getDaysInMonth`; primeste anul pe doua cifre, ca in original. */
export function getDaysInMonth(m: number, y: number): number {
  if (m === 4 || m === 6 || m === 9 || m === 11) {
    return 30;
  } else if (m === 2) {
    if ((!(y % 4) && y % 100) || !(y % 400)) { return 29; } else { return 28; }
  } else { return 31; }
}

/**
 * `valid.isCNP`, cu defectul #3 pastrat intocmai.
 *
 * In original conditia zilei e scrisa `day == 0 / day > getDaysInMonth(month, year)`,
 * cu `/` in loc de `||`. `/` leaga mai strans decat `>` si `>`, mai strans decat
 * `==`, deci expresia se grupeaza ca `day == ((0 / day) > getDaysInMonth(...))`:
 *   - day > 0: `0/day` e 0, `0 > 28..31` e false, iar `day == false` e fals;
 *   - day === 0: `0/0` e NaN, `NaN > 28..31` e false, iar `0 == false` e adevarat.
 * Net, expresia e echivalenta cu `day === 0`: ziua prea mare (32, 31 februarie...)
 * NU e respinsa niciodata, doar ziua 00 e respinsa. registry.ts spune ca expresia e
 * "mereu falsa" — nu e, dar concluzia (verificarea zilei nu se face) ramane.
 * Verificat diferential fata de oracol pe toate zilele 00..99.
 */
export function isCNP(p_cnp: string): boolean {
  let hashResult = 0;
  const cnp: number[] = [];
  const hashTable = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  if (p_cnp.length !== 13) { return false; }
  for (let i = 0; i < 13; i++) {
    cnp[i] = parseInt(p_cnp.charAt(i), 10);
    if (isNaN(at(cnp, i))) { return false; }
    if (i < 12) { hashResult = hashResult + at(cnp, i) * at(hashTable, i); }
  }
  hashResult = hashResult % 11;
  if (hashResult === 10) { hashResult = 1; }
  let year = at(cnp, 1) * 10 + at(cnp, 2);
  const month = at(cnp, 3) * 10 + at(cnp, 4);
  const day = at(cnp, 5) * 10 + at(cnp, 6);
  if (month === 0 || month > 12 || day === Number(0 / day > getDaysInMonth(month, year))
    || (month === 2 && day === 29 && ((year % 4) !== 0
      || ((year % 100) === 0 && (year % 400) !== 0)))) { return false; }
  switch (at(cnp, 0)) {
    case 1: case 2: { year += 1900; } break;
    case 3: case 4: { year += 1800; } break;
    case 5: case 6: { year += 2000; } break;
    // `new Date().getYear()` = anul - 1900 (deci ~126); comparatia e mereu adevarata,
    // asa ca secolul 21 devine intotdeauna secolul 20 pentru prima cifra 7, 8 sau 9
    case 7: case 8: case 9: {
      year += 2000;
      if (year > (parseInt(String(new Date().getFullYear() - 1900), 10) - 14)) { year -= 100; }
    } break;
    default: { return false; }
  }
  if (year < 1800 || year > 2099) { return false; }

  return (at(cnp, 12) === hashResult);
}

/**
 * `valid.isCnpNif`. Pentru prima cifra 9 si hash corect functia originalului
 * "cade" pe langa `return` si intoarce `undefined`; apelantul testeaza
 * `if (test == false)`, iar `undefined == false` e fals, deci nu apare niciun mesaj.
 * Pastram `undefined` ca sa ramanem identici cu originalul, inclusiv la comparatii.
 */
export function isCnpNif(p_cnpNif: string): boolean | undefined {
  let hashResult = 0;
  const cnpNif: number[] = [];
  const hashTable = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  if (p_cnpNif.length !== 13) { return false; }
  const chk = parseInt(p_cnpNif.charAt(0), 10);
  if (isNaN(chk)) { return false; }
  if (chk === 9) {
    for (let i = 0; i < 13; i++) {
      cnpNif[i] = parseInt(p_cnpNif.charAt(i), 10);
      if (isNaN(at(cnpNif, i))) { return false; }
      if (i < 12) { hashResult = hashResult + at(cnpNif, i) * at(hashTable, i); }
    }
    hashResult = hashResult % 11;
    if (hashResult === 10) { hashResult = 1; }
    if (at(cnpNif, 12) !== hashResult) { return false; }
  } else { return isCNP(p_cnpNif); }
  return undefined;
}

// ---------------------------------------------------------------- IBAN

const CODE_LENGTHS: Readonly<Record<string, number>> = {
  AL: 28, BY: 28, TL: 23, GE: 22, XK: 20, VG: 24, LC: 32, ST: 25,
  AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
  FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
  HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
  LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
  MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
  RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26,
};

/**
 * `valid.mod97`. Cand sirul are cel mult 2 caractere bucla nu ruleaza si functia
 * intoarce SIRUL initial, nu un numar — de aici tipul `number | string`.
 */
export function mod97(str: string): number | string {
  let checksum: number | string = str.slice(0, 2);
  let fragment: string;
  for (let offset = 2; offset < str.length; offset += 7) {
    fragment = String(checksum) + str.substring(offset, offset + 7);
    checksum = parseInt(fragment, 10) % 97;
  }
  return checksum;
}

/**
 * `valid.isValidIBANNumber`: intoarce `false` la sintaxa/lungime gresita, altfel
 * restul mod 97 (1 pentru un IBAN corect). NU e o functie booleana, desi registry.ts
 * o descrie asa: in #128 ramura `err > 1` chiar se declanseaza pentru un IBAN cu
 * cifra de control gresita (vezi cazul id-06 din corpus).
 */
export function isValidIBANNumber(input: string): number | string | false {
  const iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/);
  if (!code || iban.length !== CODE_LENGTHS[code[1] ?? '']) {
    return false;
  }
  const digits = ((code[3] ?? '') + (code[1] ?? '') + (code[2] ?? '')).replace(
    /[A-Z]/g,
    (letter) => String(letter.charCodeAt(0) - 55),
  );
  return mod97(digits);
}
