// Mesajele trebuie sa fie VERBATIM. Verificam pe trei cai:
//   1. fiecare cheie referita in rules/registry.ts exista in MESSAGES;
//   2. texte comparate cu `toBe` fata de sirul extras din sursa legacy;
//   3. texte comparate cu ce emite chiar oracolul cand ruleaza corpusul de cazuri
//      (garantia cea mai tare: acelasi sir la runtime, nu doar in sursa).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createForm } from '../../harness/oracle/legacy-runtime.mjs';
import { loadAll } from '../../harness/oracle/cases.mjs';
import { MESSAGES, TITLES, text, type MessageKey } from '../../src/domain/messages';
import { RULES } from '../../src/domain/rules/registry';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXTRACTED = path.join(ROOT, 'legacy', 'extracted');
const scriptsAll = readFileSync(path.join(EXTRACTED, 'scripts_all.js'), 'utf8');
const utileJs = readFileSync(path.join(EXTRACTED, 'scriptobj_utile.js'), 'utf8');
const validJs = readFileSync(path.join(EXTRACTED, 'scriptobj_valid.js'), 'utf8');
const genValidJs = readFileSync(path.join(EXTRACTED, 'scriptobj_genValid.js'), 'utf8');

/** un literal JavaScript simplu (fara continuari de linie) devine sirul de la runtime */
const unesc = (s: string): string => s.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");

function literal(src: string, re: RegExp): string {
  const m = src.match(re);
  if (!m || m[1] === undefined) throw new Error(`nu gasesc literalul pentru ${String(re)}`);
  return unesc(m[1]);
}

/** toate mesajele pe care oracolul chiar le emite pe corpusul de cazuri scrise de mana */
const emiseDeOracol = (() => {
  const form = createForm();
  const texte = new Set<string>();
  const titluri = new Set<string>();
  for (const { case: c } of loadAll({ gen: false })) {
    const r = form.runCase(c);
    for (const l of r.log) {
      if (l.kind === 'respins') continue;
      texte.add(l.text);
      if (l.title) titluri.add(l.title);
    }
  }
  return { texte, titluri };
})();

describe('acoperirea registrului', () => {
  const cheiDinRegistru = new Set<string>();
  for (const r of RULES) {
    if (r.message === undefined) continue;
    if (typeof r.message === 'string') cheiDinRegistru.add(r.message);
    else for (const k of r.message) cheiDinRegistru.add(k);
  }

  it('registry.ts chiar refera mesaje', () => {
    expect(cheiDinRegistru.size).toBeGreaterThanOrEqual(39);
  });

  it('fiecare cheie referita in registry.ts exista in MESSAGES', () => {
    const lipsa = [...cheiDinRegistru].filter((k) => !(k in MESSAGES));
    expect(lipsa).toEqual([]);
  });

  it('text() intoarce sirul pentru cheile simple si il compune pentru cele interpolate', () => {
    expect(text('an.minim')).toBe(MESSAGES['an.minim']);
    expect(text('caractere.setA', '@,#')).toBe(MESSAGES['caractere.setA']('@,#'));
    expect(text('obligatorii.generic', 3)).toContain('Trebuie sa mai completati 3 campuri.');
    expect(text('A.valoare-vs-A1', 1000, 5000))
      .toBe('EROARE!\n\n Rd.A col.Valoare(1000) nu poate fi mai mic decat Rd.A1 col.Valoare(5000)!');
  });
});

describe('texte verificate cu toBe fata de sursa legacy', () => {
  it('rambursare.prag (#202)', () => {
    expect(MESSAGES['rambursare.prag'])
      .toBe(literal(scriptsAll, /app\.alert\("(Nu puteti solicita rambursare[^"]*)"\);/));
  });

  it('an.minim (#43) si luna.2024 (#47)', () => {
    expect(MESSAGES['an.minim']).toBe(literal(scriptsAll, /app\.alert\("(Anul trebuie[^"]*)"\);/));
    expect(MESSAGES['luna.2024']).toBe(literal(scriptsAll, /app\.alert\("(Daca an = 2024[^"]*)"\);/));
  });

  it('doar.cifre (#62) si codPst.lungime (#110)', () => {
    expect(MESSAGES['doar.cifre'])
      .toBe(literal(scriptsAll, /app\.alert\("(Trebuie sa introduceti numai caractere numerice!)"\);/));
    expect(MESSAGES['codPst.lungime'])
      .toBe(literal(scriptsAll, /var mesaj = "(Trebuie sa introduceti 6\(sase\)[^"]*)";/));
  });

  it('cui.invalid si cnp.invalid (#61, #70)', () => {
    expect(MESSAGES['cui.invalid'])
      .toBe(literal(scriptsAll, /app\.alert\("(Cod de identificare fiscală\(CUI\)[^"]*)"\);/));
    expect(MESSAGES['cnp.invalid'])
      .toBe(literal(scriptsAll, /app\.alert\("(Cod de identificare fiscală\(CNP sau NIF\)[^"]*)"\);/));
  });

  it('cui.zero (valid.isCUI)', () => {
    expect(MESSAGES['cui.zero'])
      .toBe(literal(validJs, /app\.alert\("(Primul caracter al unui Cod Unic[^"]*)"\);/));
  });

  it('tipDecont.T / S / A (utile.check_tipDecont)', () => {
    expect(MESSAGES['tipDecont.T']).toBe(literal(utileJs, /var mesajT = "([^"]*)";/));
    expect(MESSAGES['tipDecont.S']).toBe(literal(utileJs, /var mesajS = "([^"]*)";/));
    expect(MESSAGES['tipDecont.A']).toBe(literal(utileJs, /var mesajA = "([^"]*)";/));
  });

  it('iban.invalid si iban.control (#128)', () => {
    expect(MESSAGES['iban.invalid'])
      .toBe(literal(scriptsAll, /app\.alert\('(Validare lungime si sintaxa:[^']*)'\);/));
    expect(MESSAGES['iban.control'])
      .toBe(literal(scriptsAll, /app\.alert\('(Validare cifra de control:[^']*)'\);/));
  });

  it('telefon.invalid (#115) si nomenclator (#86)', () => {
    expect(MESSAGES['telefon.invalid'])
      .toBe(literal(scriptsAll, /app\.alert\("(Trebuie sa introduceti o valoare corecta pentru telefon![^"]*)"\);/));
    expect(MESSAGES['nomenclator'])
      .toBe(literal(scriptsAll, /app\.alert\("(Valoarea introdusa nu exista in nomenclator![^"]*)"\);/));
  });

  it('data.format, data.ordine.inceput si data.ordine.sfarsit (#48, #49)', () => {
    expect(MESSAGES['data.format'])
      .toBe(literal(scriptsAll, /messageBox\("(Ati introdus un format invalid pentru data\.[^"]*)",/));
    expect(MESSAGES['data.ordine.inceput'])
      .toBe(literal(scriptsAll, /app\.alert\("('Data sfarsit' < 'Data inceput')"\);/));
    expect(MESSAGES['data.ordine.sfarsit'])
      .toBe(literal(scriptsAll, /app\.alert\("('Data sfarsit contract' < 'Data inceput contract')"\);/));
  });

  it('validForm.invalid, validForm.valid si santinela obligatoriilor', () => {
    expect(MESSAGES['validForm.invalid'])
      .toBe(literal(genValidJs, /messageBox\("(Verificati fisierul atasat pentru erori[^"]*)",/));
    expect(MESSAGES['validForm.valid'])
      .toBe(literal(genValidJs, /var mesaj = "(Formularul este valid\.[^"]*)";/));
    expect(MESSAGES['obligatorii.sentinela'])
      .toBe(literal(scriptsAll, /errMsg\.value = "(Nu ati completat toate campurile obligatorii\. [^"]*)";/));
  });

  it('proRata.interval (#133) si r30.min (#191)', () => {
    expect(MESSAGES['proRata.interval'])
      .toBe(literal(scriptsAll, /app\.alert\("(Pro-rata de deducere[^"]*)"\);/));
    expect(MESSAGES['r30.min'])
      .toBe(literal(scriptsAll, /app\.alert\("(Rd\.30 nu poate fi mai mic decat rd\.30\.1!)"\)/));
  });

  it('tva.toleranta (#138) si titlul ei', () => {
    expect(MESSAGES['tva.toleranta'])
      // varianta comentata din #138 contine `(" + this.rawValue + ")`, deci [^"]* nu o prinde
      .toBe(literal(scriptsAll, /xfa\.host\.messageBox\("(ATENTIE![^"]*)", "Atenţie:", 1, 0\);/));
  });
});

describe('texte identice cu ce emite oracolul la rulare', () => {
  const simple: MessageKey[] = [
    'doar.cifre', 'rambursare.prag', 'loc.judet-intai', 'temei.conditie', 'cifS.conditie',
    'an.minim', 'tipDecont.T', 'tipDecont.S', 'tipDecont.A', 'luna.2024',
    'cui.invalid', 'cnp.invalid', 'codPst.lungime', 'nomenclator', 'telefon.invalid',
    'email.invalid', 'iban.control', 'tva.toleranta', 'r30.min', 'proRata.interval',
    'validForm.valid',
  ];

  it.each(simple)('%s', (key) => {
    expect(emiseDeOracol.texte.has(text(key))).toBe(true);
  });

  it('mesajele interpolate', () => {
    expect(emiseDeOracol.texte.has(text('caractere.setA', '#'))).toBe(true);
    expect(emiseDeOracol.texte.has(text('caractere.setB', '@,#'))).toBe(true);
    expect(emiseDeOracol.texte.has(text('obligatorii.generic', 1))).toBe(true);
    expect(emiseDeOracol.texte.has(text('obligatorii.generic', 13))).toBe(true);
    expect(emiseDeOracol.texte.has(text('A.valoare-vs-A1', 1000, 5000))).toBe(true);
    expect(emiseDeOracol.texte.has(text('A.tva-vs-A1', 2100, 5000))).toBe(true);
    expect(emiseDeOracol.texte.has(text('A.tva-vs-valoare', 1000, 5000))).toBe(true);
    expect(emiseDeOracol.texte.has(text('B.valoare-vs-B1', 2000, 8000))).toBe(true);
    expect(emiseDeOracol.texte.has(text('B.tva-vs-valoare', 9000, 2000))).toBe(true);
    expect(emiseDeOracol.texte.has(text('B1.tva-vs-valoare', 5000, 1000))).toBe(true);
    // comparatiile se fac in modul, dar in text apar valorile cu semn
    expect(emiseDeOracol.texte.has(text('A.valoare-vs-A1', -1000, -5000))).toBe(true);
  });
});

describe('titlurile ferestrelor', () => {
  it('sunt verbatim din sursa', () => {
    expect(TITLES.formatEronat).toBe(literal(scriptsAll, /xfa\.host\.messageBox\(mesaj,"(Format eronat)", 0\);/));
    expect(TITLES.conditiePrealabila)
      .toBe(literal(scriptsAll, /xfa\.host\.messageBox\(mesaj,"(Conditie prealabila)", 1\);/));
    expect(TITLES.dateIncomplete)
      .toBe(literal(scriptsAll, /xfa\.host\.messageBox\(errMsg\.value, "(Date incomplete)", 0, 0\);/));
    expect(TITLES.validareFormatData)
      .toBe(literal(scriptsAll, /messageBox\("Ati introdus un format invalid pentru data[^"]*", "([^"]*)"\);/));
    expect(TITLES.d300).toBe(literal(genValidJs, /Formularul nu este valid!","([^"]*)"\);/));
    expect(TITLES.atentie)
      .toBe(literal(scriptsAll, /xfa\.host\.messageBox\("ATENTIE![^"]*", "([^"]*)", 1, 0\);/));
  });

  it('apar in log-ul oracolului', () => {
    for (const t of [TITLES.formatEronat, TITLES.atentie, TITLES.conditiePrealabila, TITLES.dateIncomplete, TITLES.d300]) {
      expect(emiseDeOracol.titluri.has(t)).toBe(true);
    }
  });
});
