// Teste DIFERENTIALE: aceeasi intrare trece prin functia noastra si prin functia
// ORIGINALA din PDF (rulata de harness/oracle/legacy-runtime.mjs). Iesirile trebuie
// sa fie identice, inclusiv acolo unde originalul intoarce `undefined`, NaN sau un
// numar in loc de boolean.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createForm } from '../../harness/oracle/legacy-runtime.mjs';
import {
  EMAIL_RE,
  IBAN_COUNTRY_CODES,
  PHONE_RE,
  SET_A_RE,
  SET_B_RE,
  invalidChr,
  isCNP,
  isCUI,
  isCnpNif,
  isValidIBANNumber,
  mod97,
  remSpaces,
  roundNumber,
  trimSpaces,
} from '../../src/domain/checksums';
import { schEnt } from '../../src/domain/schEnt';
import type { Message } from '../../src/domain/state';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXTRACTED = path.join(ROOT, 'legacy', 'extracted');
const scriptsAll = readFileSync(path.join(EXTRACTED, 'scripts_all.js'), 'utf8');
const validJs = readFileSync(path.join(EXTRACTED, 'scriptobj_valid.js'), 'utf8');

const { objects } = createForm();
const legacy = objects.valid;
const utile = objects.utile;
const conversii = objects.conversii;

// ---------------------------------------------------------------- seturi de intrari

const CUI_INPUTS = [
  '18597239', '1859723', '18597230', '18597231', '18597232', '18597233', '18597234',
  '18597235', '18597236', '18597237', '18597238', '0', '00', '018597239', '0123456789',
  '', ' ', ' 18597239', '18597239 ', '185 97239', '1a597239', 'RO18597239', '-18597239',
  '1', '11', '12', '13', '19', '2', '4221306', '4221307', '13548146', '13548147',
  '999999999', '1234567890', '12345678901', '123456789012345', '9', '10', '100',
  '1000000000', '8', '4', '1859723.9', '+18597239',
];

const CNP_INPUTS = [
  '1800101410011', '1800101410012', '1800101410013', '2900215410015', '5000101410010',
  '6051231410019', '3800101410017', '4800101410018', '7900101410010', '8900101410011',
  '9000101410012', '0800101410019', '1800001410010', '1801301410010', '1800100410010',
  '1800132410010', '1800229410010', '1800229410011', '1960229410010', '2000229410010',
  '1800231410010', '1809931410010', '180010141001', '18001014100112', '', '1',
  'a800101410010', '1800101410a10', '180010141001a', '1 00101410010', '1800101410010',
  '1800101410019', '1990230410010', '5250101410010', '6991232410010', '9999999999999',
  '0000000000000', '1111111111111', '2222222222222', '7000101410015',
];

const IBAN_INPUTS = [
  'RO49AAAA1B31007593840000', 'RO49AAAA1B31007593840001', 'RO49AAAA1B31007593840002',
  'RO49AAAA1B31007593840003', 'RO49AAAA1B31007593840009', 'ro49aaaa1b31007593840000',
  'RO49 AAAA 1B31 0075 9384 0000', 'RO49-AAAA-1B31-0075-9384-0000',
  ' RO49AAAA1B31007593840000 ', 'RO49AAAA1B3100759384000', 'RO49AAAA1B310075938400000',
  'DE89370400440532013000', 'DE89370400440532013001', 'GB82WEST12345698765432',
  'GB82TEST12345698765432', 'FR1420041010050500013M02606', 'NO9386011117947',
  'NO9386011117948', 'MT84MALT011000012345MTLCAST001S', 'CH9300762011623852957',
  'XK051212012345678906', 'BY13NBRB3600900000002Z00AB00', 'TL380080012345678910157',
  'US64SVBKUS6S3300958879', 'ZZ49AAAA1B31007593840000', 'QQ00', 'RO', 'RO4', '',
  '1234567890123456789012', 'AAAAAAAAAAAAAAAAAAAAAAAA', 'RO49AAAA1B3100759384000@',
  'IT60X0542811101000000123456', 'ES9121000418450200051332', 'PL61109010140000071219812874',
  'SE4550000000058398257466', 'TR330006100519786457841326', 'AL47212110090000000235698741',
  'AD1200012030200359100100', 'MC5811222000010123456789030',
];

const MOD97_INPUTS = [
  '', '0', '1', '12', '49', '97', '98', '123', '1234567', '12345678', '123456789012',
  '1234567890123', '3214282912345698765432161182', '2611001020000123456789012345',
  '000000', '9999999999999999999999999999', '00', '10', '099', 'abc', 'a1', '1a',
  '12a', '1234567a', ' 12', '12 ', '-12', '+12', '1.5', '1e3', '0012345678901234567890',
  '7593840000RO49AAAA1B3100', '31007593840000RO49', '99', '100', '196', '9797',
];

const TRIM_INPUTS = [
  '', ' ', '  a  ', 'a', ' a', 'a ', '\ta\t', '\na\n', 'a\nb', ' a \n b ', '\r\na\r\n',
  'ABC DEF', '   ', 'a  b', '  ', '\t', '\n', ' \n ', 'linia 1 \n linia 2 ',
  ' \t x \t ', 'Calea Victoriei ', ' Calea Victoriei', 'RO49 AAAA', '  0301 67  ',
  'x\n\ny', ' 1 2 3 ', ' a ', 'ăîâșț ', ' &<>"\' ', 'a\vb', 'a\fb',
  'multi\nline\ntext', '   spatii   multiple   ', 'A', 'Z ',
];

const ROUND_INPUTS: [number | null, number][] = [
  [0, 0], [1, 0], [1.4, 0], [1.5, 0], [1.6, 0], [-1.4, 0], [-1.5, 0], [-1.6, 0],
  [2.5, 0], [-2.5, 0], [0.5, 0], [-0.5, 0], [21000.4, 0], [21000.5, 0], [100000 * 0.21, 0],
  [50000 * 0.11, 0], [50000 * 0.09, 0], [1.005, 2], [1.005, 1], [1.2345, 2], [1.2345, 3],
  [-1.2345, 2], [1234.5678, -1], [1234.5678, -2], [0.1 + 0.2, 2], [1e21, 0], [1e-7, 0],
  [null, 0], [null, 2], [NaN, 0], [Infinity, 0], [-Infinity, 0], [7.005, 2], [123456789.987, 0],
  [0.000001, 6], [99.999, 2],
];

const SCH_ENT_INPUTS = [
  '', 'a', '&', '<', '>', '"', "'", '&<>"\'', 'a&b', 'a<b', 'a>b', 'a"b', "a'b",
  '&amp;', '&&&', '<<<', 'S.C. ALFA & OMEGA S.R.L.', 'Str. "Mihai Viteazul"',
  "L'Oreal", 'a & b < c > d " e \' f', '&#38;', '<tag attr="x">', '</tag>',
  'Calea Victoriei nr. 12', 'ăîâșț', '&lt;', 'x&y&z', '"""', "'''", '><', '&<',
  'AB&CD<EF>GH"IJ\'KL', 'nimic special', '100%', 'a\nb', 'tab\there',
];

const INVALID_CHR_INPUTS = [
  '', 'ABC', 'ABC DEF', 'ABC-DEF', 'ABC.DEF', 'ABC,DEF', 'ABC&DEF', 'ABC+DEF',
  'ABC#DEF', 'ABC@DEF', 'ABC@#DEF', 'ăîâșț', 'S.C. ALFA & OMEGA S.R.L.',
  'STR. MIHAI VITEAZUL NR. 12', 'BL. A1, SC. 2, ET. 3, AP. 4', '030167', '0301 67',
  'A/B', 'A\\B', 'A(B)', 'A[B]', 'A{B}', 'A!B', 'A?B', 'A*B', 'A=B', 'A%B',
  'A$B', 'A^B', 'A~B', 'A`B', 'A|B', 'A;B', 'A:B', 'A<B>C', 'A"B', "A'B", '+40',
];

const PHONE_INPUTS = [
  '0211234567', '021 123 4567', '+40211234567', '0040211234567', '0721234567',
  '0722 123 456', '0311234567', '0231234567', '0331234567', '0801234567', '0901234567',
  '021123456', '02112345678', '', '1234567890', 'abc', '+40 21 123 4567', '0040 721 234 567',
  '0241234567', '0251234567', '0261234567', '0271234567', '0281234567', '0291234567',
  '0221234567', '0201234567', '0700123456', '0799999999', '+407001234567', '07001234567',
  '0 211234567', '021-123-4567', '(021)1234567', '00 40 211234567', '021.123.4567',
];

const EMAIL_INPUTS = [
  'contact@exemplu.ro', 'a@b.ro', 'a@b.c', 'nume.contribuabil@nume.domeniu.ro',
  'nume_contribuabil@domeniu.ro', 'nume-contribuabil@domeniu.ro', 'a@b.info',
  'a@b.museum', 'a@.ro', '@b.ro', 'a@b', 'a@b.', 'a b@c.ro', 'a@b .ro', '',
  'A@B.RO', 'a..b@c.ro', 'a.b.c@d.e.ro', 'a@b-c.ro', 'a@b_c.ro', 'a1@b2.ro',
  '1@2.ro', 'a@@b.ro', 'a@b..ro', 'ăî@domeniu.ro', 'a@domeniu.romania',
  'foarte.lung.dar.valid@sub.domeniu.exemplu.ro', 'a+b@c.ro', 'a@b.co.uk',
  'test@localhost', 'test@127.0.0.1', 'a@b.rooo', 'a@b.r', "o'brien@mail.ro",
];

// ---------------------------------------------------------------- teste

describe('isCUI', () => {
  it(`da acelasi rezultat ca valid.isCUI pe ${CUI_INPUTS.length} intrari`, () => {
    expect(CUI_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of CUI_INPUTS) {
      expect(`${v} -> ${isCUI(v)}`).toBe(`${v} -> ${legacy.isCUI(v)}`);
    }
  });

  it('emite alertul cui.zero exact cand primul caracter e 0', () => {
    const asteptat =
      'Primul caracter al unui Cod Unic de Identificare nu poate fi 0(zero)!\n\nCorectati valoarea introdusa...';
    // originalul apeleaza app.alert, iar createForm() nu expune log-ul, deci textul
    // se verifica direct fata de sursa
    expect(validJs).toContain('app.alert("' + asteptat.replace(/\n/g, '\\n') + '");');

    for (const v of CUI_INPUTS) {
      const spuse: Message[] = [];
      const rezultat = isCUI(v, (m) => spuse.push(m));
      // originalul alerteaza doar cand sirul e numeric si incepe cu "0"
      const zero = v.charAt(0) === '0' && !/[^0-9]/.test(v);
      expect(spuse.length).toBe(zero ? 1 : 0);
      if (zero) {
        expect(spuse[0]).toEqual({ kind: 'alert', text: asteptat });
        expect(rezultat).toBe(false);
      }
      expect(rezultat).toBe(legacy.isCUI(v));
    }
  });

  it('nu emite nimic cand `say` lipseste', () => {
    expect(isCUI('018597239')).toBe(false);
  });
});

describe('isCNP', () => {
  it(`da acelasi rezultat ca valid.isCNP pe ${CNP_INPUTS.length} intrari`, () => {
    expect(CNP_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of CNP_INPUTS) {
      expect(`${v} -> ${isCNP(v)}`).toBe(`${v} -> ${legacy.isCNP(v)}`);
    }
  });

  it('pastreaza defectul #3: ziua peste numarul de zile din luna nu e respinsa', () => {
    // 32 februarie trece daca cifra de control e buna; ziua 00 e respinsa
    const cuZiua = (zz: string): string => '18000' + zz + '41001';
    for (let d = 0; d <= 99; d++) {
      const zz = String(d).padStart(2, '0');
      for (let c = 0; c <= 9; c++) {
        const cnp = cuZiua(zz) + c;
        expect(isCNP(cnp)).toBe(legacy.isCNP(cnp));
      }
    }
  });
});

describe('isCnpNif', () => {
  it(`da acelasi rezultat ca valid.isCnpNif pe ${CNP_INPUTS.length} intrari`, () => {
    for (const v of CNP_INPUTS) {
      expect(`${v} -> ${String(isCnpNif(v))}`).toBe(`${v} -> ${String(legacy.isCnpNif(v))}`);
    }
  });

  it('intoarce undefined (nu true) pentru NIF corect cu prima cifra 9', () => {
    let gasit = false;
    for (let c = 0; c <= 9; c++) {
      const nif = '900010141001' + c;
      const noastra = isCnpNif(nif);
      expect(noastra).toBe(legacy.isCnpNif(nif));
      if (noastra === undefined) gasit = true;
    }
    expect(gasit).toBe(true);
  });
});

describe('isValidIBANNumber si mod97', () => {
  it(`da acelasi rezultat ca valid.isValidIBANNumber pe ${IBAN_INPUTS.length} intrari`, () => {
    expect(IBAN_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of IBAN_INPUTS) {
      expect(`${v} -> ${String(isValidIBANNumber(v))}`)
        .toBe(`${v} -> ${String(legacy.isValidIBANNumber(v))}`);
    }
  });

  it('acopera si tari din afara listei CODE din #128', () => {
    const inAfara = IBAN_INPUTS.filter((v) => !IBAN_COUNTRY_CODES.includes(v.substring(0, 2)));
    expect(inAfara.length).toBeGreaterThan(3);
    for (const v of inAfara) {
      expect(String(isValidIBANNumber(v))).toBe(String(legacy.isValidIBANNumber(v)));
    }
  });

  it(`da acelasi rezultat ca valid.mod97 pe ${MOD97_INPUTS.length} intrari`, () => {
    expect(MOD97_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of MOD97_INPUTS) {
      expect(`${v} -> ${String(mod97(v))}`).toBe(`${v} -> ${String(legacy.mod97(v))}`);
    }
  });

  it('IBAN-ul de referinta din corpus da 1, nu true', () => {
    expect(isValidIBANNumber('RO49AAAA1B31007593840000')).toBe(1);
  });
});

describe('trimSpaces si remSpaces', () => {
  it(`dau acelasi rezultat ca utile.* pe ${TRIM_INPUTS.length} intrari`, () => {
    expect(TRIM_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of TRIM_INPUTS) {
      expect(trimSpaces(v)).toBe(utile.trimSpaces(v));
      expect(remSpaces(v)).toBe(utile.remSpaces(v));
    }
  });

  it('trimSpaces are flagul m, deci taie pe fiecare linie', () => {
    expect(trimSpaces(' a \n b ')).toBe(utile.trimSpaces(' a \n b '));
    expect(trimSpaces(' a \n b ')).toBe('a\nb');
  });
});

describe('invalidChr', () => {
  it(`da acelasi rezultat ca utile.invalidChr pe ${INVALID_CHR_INPUTS.length} intrari (setul A si B)`, () => {
    expect(INVALID_CHR_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of INVALID_CHR_INPUTS) {
      for (const re of [SET_A_RE, SET_B_RE]) {
        const original = utile.invalidChr(v, re);
        expect(invalidChr(v, re)).toBe(original === null ? null : String(original));
      }
    }
  });
});

describe('roundNumber', () => {
  it(`da acelasi rezultat ca utile.roundNumber pe ${ROUND_INPUTS.length} intrari`, () => {
    expect(ROUND_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const [n, d] of ROUND_INPUTS) {
      expect(roundNumber(n, d)).toBe(utile.roundNumber(n, d));
    }
  });

  it('intoarce undefined pentru null, ca originalul', () => {
    expect(roundNumber(null, 0)).toBeUndefined();
    expect(utile.roundNumber(null, 0)).toBeUndefined();
  });
});

describe('schEnt', () => {
  it(`da acelasi rezultat ca conversii.schEnt pe ${SCH_ENT_INPUTS.length} intrari`, () => {
    expect(SCH_ENT_INPUTS.length).toBeGreaterThanOrEqual(30);
    for (const v of SCH_ENT_INPUTS) {
      expect(schEnt(v)).toBe(conversii.schEnt(v));
    }
  });

  it('escapeaza dublu la fel ca in adresa din genXML', () => {
    const o = 'ALFA & OMEGA';
    expect(schEnt(schEnt(o))).toBe(conversii.schEnt(conversii.schEnt(o)));
    expect(schEnt(schEnt(o))).toBe('ALFA &amp;amp; OMEGA');
  });
});

describe('expresiile regulate copiate verbatim', () => {
  it('PHONE_RE e regTel din #115 si #119', () => {
    expect(scriptsAll).toContain('var regTel = ' + String(PHONE_RE) + ';');
    expect(scriptsAll.split('var regTel = ' + String(PHONE_RE) + ';').length - 1).toBe(2);
  });

  it('EMAIL_RE e reg din #123', () => {
    const m = scriptsAll.match(/var reg = new RegExp\("(.+?)"\);/);
    expect(m).not.toBeNull();
    expect(new RegExp(m?.[1] ?? '').source).toBe(EMAIL_RE.source);
  });

  it('SET_A_RE e rgx din #67 si #125, SET_B_RE e rgx din #73 si urmatoarele', () => {
    expect(scriptsAll).toContain('var rgx = ' + String(SET_A_RE) + ';');
    expect(scriptsAll).toContain('var rgx = ' + String(SET_B_RE) + ';');
    expect(String(SET_A_RE)).toBe('/[^0-9a-zA-Z,.\\-& ]/g');
    expect(String(SET_B_RE)).toBe('/[^0-9a-zA-Z,.\\-+ ]/g');
  });

  it('PHONE_RE si EMAIL_RE dau acelasi verdict ca in original', () => {
    // expresiile se reconstruiesc din sursa legacy, nu din constantele noastre
    const t = scriptsAll.match(/var regTel = \/(.+?)\/;/);
    expect(t).not.toBeNull();
    const regTel = new RegExp(t?.[1] ?? '');
    for (const v of PHONE_INPUTS) expect(PHONE_RE.test(v)).toBe(regTel.test(v));

    const m = scriptsAll.match(/var reg = new RegExp\("(.+?)"\);/);
    const reg = new RegExp(m?.[1] ?? '');
    for (const v of EMAIL_INPUTS) expect(EMAIL_RE.test(v)).toBe(reg.test(v));
    expect(PHONE_INPUTS.length).toBeGreaterThanOrEqual(30);
    expect(EMAIL_INPUTS.length).toBeGreaterThanOrEqual(30);
  });

  it('IBAN_COUNTRY_CODES e lista CODE din #128, nu tabelul din valid.js', () => {
    const bloc = scriptsAll.match(/var CODE = \[([\s\S]*?)\];/);
    expect(bloc).not.toBeNull();
    const coduri = [...(bloc?.[1] ?? '').matchAll(/"([A-Z]{2})"/g)].map((m) => m[1]);
    expect(IBAN_COUNTRY_CODES).toEqual(coduri);
    expect(IBAN_COUNTRY_CODES).toHaveLength(71);
    // tabelul CODE_LENGTHS din valid.js are aceleasi tari, dar lista din #128 e
    // singura folosita la validarea campului
    expect(IBAN_COUNTRY_CODES.includes('US')).toBe(false);
  });
});
