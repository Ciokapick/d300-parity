// Paritatea butonului VALIDARE fata de fisierele de aur produse de oracol
// (`harness/oracle/golden/*.json`, cele scrise de mana, fara `golden/gen/`).
//
// Pentru fiecare caz reluam starea FINALA din fisierul de aur (deci dupa ce regulile
// de intrare si calculele au rulat in oracol) si aplicam DOAR pasii butonului, in
// ordinea din `rules/registry.ts`. Comparam:
//   - campurile evidentiate, ca multime;
//   - mesajele noastre cu ULTIMELE n intrari din log-ul de aur (n = cate emitem);
//   - continutul lui "Erori si avertizari.txt";
//   - suma de control si XML-ul, octet cu octet.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { createCtx, createInitialFormState, type Ctx } from '../../src/domain/context';
import type { FieldValue } from '../../src/domain/fields';
import type { Message, State } from '../../src/domain/state';
import { genXML } from '../../src/domain/xml';
import {
  checkMandatory,
  execValidate,
  mandatoryMessage,
  sumaControl,
  validForm,
} from '../../src/domain/validate';

interface Golden {
  name: string;
  inputs: [string, string][];
  log: Message[];
  values: Record<string, FieldValue>;
  highlighted: string[];
  xml: string | null;
  erori: string | null;
}

const GOLDEN_DIR = fileURLToPath(new URL('../../harness/oracle/golden/', import.meta.url));

function loadGolden(): Golden[] {
  return readdirSync(GOLDEN_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(GOLDEN_DIR + f, 'utf8')) as Golden);
}

const faraPrefix = (k: string): string => k.replace(/^form1\./, '');

/**
 * Reconstruieste `ctx.mandatory` din starea finala: cele 13 din template, plus
 * `Antet.nr_evid` (calculul #38 il face mereu obligatoriu), plus `Antet.temeiLegal`
 * daca bifa d_rez e altceva decat 0 (#52) si `Antet.cifS` daca d_scc e altceva
 * decat 0 (#55).
 *
 * Pro-rata se reia din `inputs`, nu din `values`: starea de aur e cea de DUPA buton,
 * deci #133 a corectat-o deja la 100 si alertul nu s-ar mai declansa la reluare
 * (cazul `sample-02-erori`). Reluarea e exacta: `identifCntr.proRata` nu are alt
 * script in tot formularul in afara de #133 (validate), deci inainte de buton
 * campul contine fix valoarea tastata, trecuta prin coercitia de `decimal`.
 */
function ctxDinAur(g: Golden): Ctx {
  const ctx = createCtx(createInitialFormState());
  for (const [k, v] of Object.entries(g.values)) ctx.set(faraPrefix(k), v);

  const proRata = g.inputs.filter(([p]) => faraPrefix(p) === 'identifCntr.proRata').pop();
  if (proRata) ctx.set('identifCntr.proRata', proRata[1]);

  ctx.mandatory.add('Antet.nr_evid');
  if (Number(ctx.get('Antet.metaDate.d_rez')) !== 0) ctx.mandatory.add('Antet.temeiLegal');
  if (Number(ctx.get('Antet.metaDate.d_scc')) !== 0) ctx.mandatory.add('Antet.cifS');
  return ctx;
}

interface Rezultat {
  ctx: Ctx;
  erori: string | null;
  xml: string | null;
}

/** Butonul VALIDARE, in ordinea din registry. */
function apasaValidare(ctx: Ctx): Rezultat {
  const missing = checkMandatory(ctx);
  const incomplete = mandatoryMessage(ctx, missing);
  execValidate(ctx);
  if (incomplete) return { ctx, erori: null, xml: null };

  sumaControl(ctx);
  const erori = validForm(ctx);
  const xml = erori === null ? genXML(ctx.values, ctx.editValue) : null;
  return { ctx, erori, xml };
}

/** Ctx pornit de la starea implicita, cu valorile date peste ea. */
function ctxCu(values: Partial<State>): Ctx {
  const ctx = createCtx(createInitialFormState());
  for (const [k, v] of Object.entries(values)) ctx.set(k, v);
  ctx.mandatory.add('Antet.nr_evid');
  return ctx;
}

// ------------------------------------------------------------------ diferentiale

describe('butonul VALIDARE fata de fisierele de aur', () => {
  const aur = loadGolden();

  it('corpusul scris de mana e complet', () => {
    expect(aur.length).toBeGreaterThanOrEqual(116);
  });

  it.each(aur.map((g) => g.name))('%s', (nume) => {
    const g = aur.find((x) => x.name === nume);
    if (!g) throw new Error(`nu gasesc cazul ${nume}`);

    const ctx = ctxDinAur(g);
    const r = apasaValidare(ctx);

    // campurile evidentiate, ca multime
    expect([...ctx.highlighted].sort()).toEqual(g.highlighted.map(faraPrefix).sort());

    // mesajele butonului sunt ultimele din log-ul de aur (inainte de ele stau
    // mesajele emise la introducerea datelor, pe care nu le producem aici)
    expect(ctx.messages).toEqual(g.log.slice(g.log.length - ctx.messages.length));

    expect(r.erori).toBe(g.erori);
    expect(ctx.get('Antet.metaDate.totalPlata_A')).toBe(
      g.values['form1.Antet.metaDate.totalPlata_A'] ?? null,
    );
    expect(r.xml).toBe(g.xml);
  });
});

// ------------------------------------------------------------------ unitare

describe('checkMandatory', () => {
  it('trateaza "000" ca lipsa, la fel ca null', () => {
    const ctx = ctxCu({ 'identifCntr.adresa.judet': '000' });
    // judetul e unul dintre cele 13 obligatorii din template
    expect(checkMandatory(ctx)).toBeGreaterThan(0);
    expect(ctx.highlighted.has('identifCntr.adresa.judet')).toBe(true);
  });

  it('nu evidentiaza un camp obligatoriu completat', () => {
    const ctx = ctxCu({ 'identifCntr.adresa.judet': '40' });
    checkMandatory(ctx);
    expect(ctx.highlighted.has('identifCntr.adresa.judet')).toBe(false);
  });

  it('goleste evidentierile de la apasarea anterioara', () => {
    const ctx = ctxCu({});
    checkMandatory(ctx);
    const prima = ctx.highlighted.size;
    checkMandatory(ctx);
    expect(ctx.highlighted.size).toBe(prima);
  });

  it('ignora campurile care nu sunt in ctx.mandatory', () => {
    const ctx = ctxCu({});
    ctx.mandatory.clear();
    expect(checkMandatory(ctx)).toBe(0);
    expect(ctx.highlighted.size).toBe(0);
  });
});

describe('mandatoryMessage', () => {
  it('nu spune nimic cand nu lipseste nimic', () => {
    const ctx = ctxCu({});
    expect(mandatoryMessage(ctx, 0)).toBe(false);
    expect(ctx.messages).toEqual([]);
  });

  it('foloseste singularul pentru un singur camp', () => {
    const ctx = ctxCu({});
    expect(mandatoryMessage(ctx, 1)).toBe(true);
    expect(ctx.messages).toEqual([
      {
        kind: 'messageBox',
        title: 'Date incomplete',
        text: 'Nu ati completat toate campurile obligatorii!\n\nTrebuie sa mai completati 1 camp.'
          + '\nCompletati campul evidentiat cu culoarea rosu! \n\nMultumesc!',
      },
    ]);
  });

  it('foloseste pluralul pentru mai multe campuri', () => {
    const ctx = ctxCu({});
    expect(mandatoryMessage(ctx, 3)).toBe(true);
    expect(ctx.messages[0]?.text).toContain('Trebuie sa mai completati 3 campuri.');
    expect(ctx.messages[0]?.text).toContain('Completati campurile evidentiate');
  });
});

describe('execValidate: pro-rata (#133)', () => {
  it('null declanseaza alertul si pune 100', () => {
    const ctx = ctxCu({ 'identifCntr.proRata': null });
    expect(ctx.get('identifCntr.proRata')).toBeNull();
    execValidate(ctx);
    expect(ctx.messages).toEqual([
      { kind: 'alert', text: 'Pro-rata de deducere trebuie sa fie >= 0 si <= 100' },
    ]);
    expect(ctx.get('identifCntr.proRata')).toBe(100);
  });

  it('valoarea peste 100 se corecteaza', () => {
    const ctx = ctxCu({ 'identifCntr.proRata': 101 });
    execValidate(ctx);
    expect(ctx.get('identifCntr.proRata')).toBe(100);
    expect(ctx.messages).toHaveLength(1);
  });

  it('valoarea negativa se corecteaza', () => {
    const ctx = ctxCu({ 'identifCntr.proRata': -1 });
    execValidate(ctx);
    expect(ctx.get('identifCntr.proRata')).toBe(100);
  });

  it('0 si 100 trec fara mesaj', () => {
    for (const v of [0, 100, 50]) {
      const ctx = ctxCu({ 'identifCntr.proRata': v });
      execValidate(ctx);
      expect(ctx.messages).toEqual([]);
      expect(ctx.get('identifCntr.proRata')).toBe(v);
    }
  });
});

describe('sumaControl', () => {
  it('aduna cu semantica JS: toate null dau 0', () => {
    const ctx = ctxCu({});
    sumaControl(ctx);
    expect(ctx.get('Antet.metaDate.totalPlata_A')).toBe(0);
  });

  it('aduna doar celulele din lista inline din #13', () => {
    const ctx = ctxCu({ 'date.comert.r1.c2': 1000, 'date.r48.c3': 7 });
    sumaControl(ctx);
    expect(ctx.get('Antet.metaDate.totalPlata_A')).toBe(1007);
  });

  it('nu aduna celulele din afara listei inline', () => {
    // rd.28 col.1 si rd.30.1 col.2 exista in formular, dar lipsesc din suma din #13
    const ctx = ctxCu({ 'date.achizitiiIMP.r28.c2': 500, 'date.achizitiiIMP.r30_1.c3': 900 });
    sumaControl(ctx);
    expect(ctx.get('Antet.metaDate.totalPlata_A')).toBe(0);
  });
});

describe('validForm: exclusivitatea rd.38 / rd.41', () => {
  it('rd.41 > 0 cu rd.38 GOL da eroare (defect #15: null != 0)', () => {
    const ctx = ctxCu({
      'date.regularizari.r42.c3': 5000,
      'date.regularizari.r39.c3': null,
    });
    const erori = validForm(ctx) ?? '';
    expect(erori).toContain('EROARE - Daca R41 > 0 , atunci R38 = 0\r\n');
    expect(erori).not.toContain('EROARE - Daca R38 > 0 , atunci R41 = 0');
  });

  it('rd.41 > 0 cu rd.38 = 0 EXPLICIT nu da eroare', () => {
    const ctx = ctxCu({
      'date.regularizari.r42.c3': 5000,
      'date.regularizari.r39.c3': 0,
    });
    const erori = validForm(ctx) ?? '';
    expect(erori).not.toContain('atunci R38 = 0');
    expect(erori).not.toContain('atunci R41 = 0');
  });

  it('ambele > 0 dau ambele erori, in ordinea din original', () => {
    const ctx = ctxCu({
      'date.regularizari.r42.c3': 5000,
      'date.regularizari.r39.c3': 10000,
    });
    const erori = validForm(ctx) ?? '';
    const i = erori.indexOf('EROARE - Daca R41 > 0 , atunci R38 = 0\r\n');
    const j = erori.indexOf('EROARE - Daca R38 > 0 , atunci R41 = 0\r\n');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(j).toBeGreaterThan(i);
  });
});

describe('validForm: ordinea si forma mesajului', () => {
  it('pastreaza ordinea din genValid.validForm pentru doua erori', () => {
    // formularul implicit: an = 2026 si tipDecont = L sunt completate, luna lipseste
    const ctx = ctxCu({ 'Antet.metaDate.tipDecont': null });
    const erori = validForm(ctx) ?? '';
    const iLuna = erori.indexOf('EROARE - Luna este element  obligatoriu\r\n');
    const iDecont = erori.indexOf('EROARE - Perioada de raportare este element obligatoriu\r\n');
    expect(iLuna).toBeGreaterThanOrEqual(0);
    expect(iDecont).toBeGreaterThan(iLuna);
  });

  it('pastreaza spatiile duble din original', () => {
    const ctx = ctxCu({});
    const erori = validForm(ctx) ?? '';
    expect(erori).toContain('EROARE - Randul 43  este element obligatoriu\r\n');
    expect(erori).toContain('EROARE - Suma de control  este element obligatoriu\r\n');
    expect(erori).toContain('EROARE - Luna este element  obligatoriu\r\n');
  });

  it('emite messageBox-ul de formular invalid si intoarce mesajul', () => {
    const ctx = ctxCu({});
    const erori = validForm(ctx);
    expect(erori).not.toBeNull();
    expect(ctx.messages).toEqual([
      {
        kind: 'messageBox',
        title: 'D300',
        text: 'Verificati fisierul atasat pentru erori si avertizari!\n\nFormularul nu este valid!',
      },
    ]);
  });

  it('an = 2024 cu luna < 5 da eroarea de perioada', () => {
    const ctx = ctxCu({ 'Antet.metaDate.an_r': '2024', 'Antet.metaDate.luna_r': '4' });
    const erori = validForm(ctx) ?? '';
    expect(erori).toContain('EROARE - Pentru an = 2024 luna trebuie sa fie >= 5\r\n');
    expect(erori).not.toContain('EROARE - Anul trebuie sa fie mai mare sau egal cu 2024');
  });

  it('an lipsa declanseaza si "obligatoriu" si "mai mare sau egal cu 2024" (null < 2024)', () => {
    const ctx = ctxCu({ 'Antet.metaDate.an_r': null });
    const erori = validForm(ctx) ?? '';
    expect(erori).toContain('EROARE - Anul este element obligatoriu\r\n');
    expect(erori).toContain('EROARE - Anul trebuie sa fie mai mare sau egal cu 2024\r\n');
  });

  it('un singur cod CAEN e de ajuns', () => {
    const ctx = ctxCu({ 'identifCntr.caen1': '6201' });
    expect(validForm(ctx) ?? '').not.toContain('EROARE - Cod CAEN este element obligatoriu');
  });
});
