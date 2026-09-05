// Testul de paritate pe XML: aceeasi stare intra in `genXML` din src/domain/xml.ts
// si in `genValid.genXML` din PDF; sirurile trebuie sa fie identice octet cu octet
// (`toBe`, nu comparatie pe arbore parsat).
//
// Cazul 1: `sample-01` din corpus, rulat integral prin oracol (reguli + buton).
// Cazul 2: o stare construita aici, care atinge ce nu se poate atinge prin `runCase`:
//   ambele coduri CAEN completate (originalul emite atributul "caen" de doua ori),
//   `&`, `<` si `"` in denumire si adresa, judet diferit de 40, fara sector,
//   toate bifele pe "D".

import { describe, expect, it } from 'vitest';

import { createForm } from '../../harness/oracle/legacy-runtime.mjs';
import { loadAll, loadCase } from '../../harness/oracle/cases.mjs';
import { FIELD_BY_PATH, type FieldValue } from '../../src/domain/fields';
import type { State } from '../../src/domain/state';
import { genXML } from '../../src/domain/xml';

/** `editValue` ca in Ctx: textul afisat pentru campurile cu lista, valoarea bruta altfel. */
function editValueDin(values: State): (path: string) => FieldValue {
  return (path) => {
    const f = FIELD_BY_PATH.get(path);
    const raw = values[path] ?? null;
    if (!f || !f.items || raw === null) return raw;
    const valori = f.itemValues ?? f.items;
    const i = valori.indexOf(String(raw));
    return i >= 0 ? (f.items[i] ?? raw) : raw;
  };
}

/** scoate prefixul `form1.` din cheile intoarse de oracol */
function faraPrefix(values: Record<string, FieldValue>): State {
  const out: State = {};
  for (const [k, v] of Object.entries(values)) out[k.replace(/^form1\./, '')] = v;
  return out;
}

/** pune starea direct in arborele oracolului si cere XML-ul, fara sa treaca prin reguli */
function xmlDinOracol(values: State): string {
  const form = createForm();
  for (const [p, v] of Object.entries(values)) {
    const node = form.byPath.get('form1.' + p);
    if (node) node.rawValue = v;
  }
  form.objects.genValid.genXML();
  const xml = form.objects.event.target.getDataObjectContents('D300.xml');
  if (xml === undefined) throw new Error('genXML nu a atasat D300.xml');
  return xml;
}

describe('genXML pe sample-01', () => {
  const form = createForm();
  const rezultat = form.runCase(loadCase('sample-01'));
  const values = faraPrefix(rezultat.values);

  it('oracolul chiar a produs un XML', () => {
    expect(rezultat.xml).not.toBeNull();
  });

  it('da acelasi sir, octet cu octet', () => {
    expect(genXML(values, editValueDin(values))).toBe(rezultat.xml);
  });

  it('trece judetul prin editValue, nu prin rawValue', () => {
    expect(values['identifCntr.adresa.judet']).toBe('40');
    expect(genXML(values, editValueDin(values))).toContain('judet: B--Bucuresti');
  });
});

describe('genXML pe o stare construita: doua CAEN, caractere speciale, alt judet', () => {
  const form = createForm();
  const baza = faraPrefix(form.runCase(loadCase('sample-01')).values);

  const values: State = {
    ...baza,
    'identifCntr.denumire.den': 'ALFA & OMEGA <SRL> "TEST"',
    'identifCntr.adresa.str': 'STR. A&B <NR "1">',
    'identifCntr.adresa.nr': '12"',
    'identifCntr.adresa.loc': "CLUJ-NAPOCA 'CENTRU'",
    'identifCntr.adresa.judet': '12',
    'identifCntr.adresa.sect': null,
    'identifCntr.adresa.bloc': 'A&1',
    'identifCntr.adresa.scara': '<B>',
    'identifCntr.adresa.etaj': '3',
    'identifCntr.adresa.apt': '7&8',
    'identifCntr.adresa.codPst': '400001',
    'identifCntr.banca.den': 'BANCA & CO <SA>',
    'identifCntr.caen': '6201',
    'identifCntr.caen1': '6202',
    'date.bife.caption.bifa_cereale': 'D',
    'date.bife.caption.bifa_mob': 'D',
    'date.bife.caption.bifa_disp': 'D',
    'date.bife.caption.bifa_cons': 'D',
    'date.rambursare.bifa_rambursare': 'D',
  };

  const asteptat = xmlDinOracol(values);

  it('da acelasi sir, octet cu octet', () => {
    expect(genXML(values, editValueDin(values))).toBe(asteptat);
  });

  it('emite atributul caen de doua ori (defect #2)', () => {
    const ale_noastre = genXML(values, editValueDin(values));
    expect(ale_noastre.split(' caen="').length - 1).toBe(2);
    expect(ale_noastre).toContain(' caen="6201" caen="6202"');
  });

  it('escapeaza dublu adresa si o data restul atributelor', () => {
    const ale_noastre = genXML(values, editValueDin(values));
    // den e escapat o singura data
    expect(ale_noastre).toContain('den="ALFA &amp; OMEGA &lt;SRL&gt; &quot;TEST&quot;"');
    // adresa e escapata inca o data peste partile deja escapate
    expect(ale_noastre).toContain('adresa="strada: STR. A&amp;amp;B &amp;lt;NR &amp;quot;1&amp;quot;&amp;gt;');
  });

  it('foloseste judetul din nomenclator si sare sectorul lipsa', () => {
    const ale_noastre = genXML(values, editValueDin(values));
    expect(ale_noastre).toContain('judet: CJ--Cluj');
    expect(ale_noastre).not.toContain('sector:');
    expect(ale_noastre).toContain('cod postal: 400001"');
  });

  it('scrie toate bifele pe D', () => {
    const ale_noastre = genXML(values, editValueDin(values));
    for (const attr of ['bifa_cereale', 'bifa_mob', 'bifa_disp', 'bifa_cons', 'solicit_ramb']) {
      expect(ale_noastre).toContain(` ${attr}="D"`);
    }
  });
});

describe('genXML pe tot corpusul de cazuri scrise de mana', () => {
  const form = createForm();
  const cazuri = loadAll({ gen: false })
    .map(({ case: c }) => ({ nume: c.name, rezultat: form.runCase(c) }))
    .filter((x) => x.rezultat.xml !== null)
    .map((x) => ({ nume: x.nume, xml: x.rezultat.xml, values: faraPrefix(x.rezultat.values) }));

  it('corpusul chiar produce XML-uri', () => {
    // restul cazurilor din corpus se opresc la campuri obligatorii sau la validForm
    expect(cazuri.length).toBeGreaterThanOrEqual(16);
  });

  it.each(cazuri.map((c) => c.nume))('%s da acelasi XML', (nume) => {
    const caz = cazuri.find((c) => c.nume === nume);
    if (!caz) throw new Error(`nu gasesc cazul ${nume}`);
    expect(genXML(caz.values, editValueDin(caz.values))).toBe(caz.xml);
  });
});

describe('genXML fara cod postal', () => {
  it('pastreaza virgula si spatiul de la coada, ca originalul', () => {
    const form = createForm();
    const baza = faraPrefix(form.runCase(loadCase('sample-01')).values);
    const values: State = { ...baza, 'identifCntr.adresa.codPst': null };
    const ale_noastre = genXML(values, editValueDin(values));
    expect(ale_noastre).toBe(xmlDinOracol(values));
    expect(ale_noastre).toContain('sector: 3, "');
  });
});
