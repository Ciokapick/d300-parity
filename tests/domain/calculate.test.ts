// Teste diferentiale pentru `recalculateOnce` fata de fisierele de aur produse de
// codul ANAF original rulat in harness/oracle/legacy-runtime.mjs.
//
// Doua directii:
//   1. punct fix — starea finala din fiecare fisier de aur trebuie sa fie stabila:
//      inca o trecere prin regulile `calculate` nu mai schimba nimic;
//   2. recalculare de la zero — golim campurile pe care regulile `calculate` le scriu
//      si le lasam sa reconstruiasca exact valorile de aur.
//
// Plus cateva teste unitare pentru semantica lui null (A1 si aritmetica JS).

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { recalculateOnce } from '../../src/domain/calculate';
import { createCtx, createInitialFormState, type Ctx } from '../../src/domain/context';
import { RULES } from '../../src/domain/rules/registry';
import type { State } from '../../src/domain/state';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GOLDEN = path.join(ROOT, 'harness', 'oracle', 'golden');

interface Golden {
  name: string;
  values: Record<string, string | number | null>;
}

/** Doar fisierele de aur scrise de mana (golden/*.json), nu si corpusul generat. */
const goldenFiles = readdirSync(GOLDEN).filter((f) => f.endsWith('.json')).sort();

const golden: Golden[] = goldenFiles.map((f) => JSON.parse(readFileSync(path.join(GOLDEN, f), 'utf8')) as Golden);

/** Cheile din fisierele de aur poarta prefixul `form1.`; modelul nu-l foloseste. */
function valoriDeAur(g: Golden): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(g.values)) out[k.replace(/^form1\./, '')] = v;
  return out;
}

function ctxDinAur(g: Golden): Ctx {
  const ctx = createCtx(createInitialFormState());
  for (const [k, v] of Object.entries(valoriDeAur(g))) ctx.set(k, v);
  return ctx;
}

/** Campurile enumerate de fiecare regula `calculate` din registru. */
function campuriDeRegula(id: string): readonly string[] {
  const spec = RULES.find((r) => r.id === id);
  if (!spec) throw new Error(`regula lipseste din registru: ${id}`);
  return spec.fields ?? [];
}

/**
 * Campurile pe care regulile `calculate` le scriu NECONDITIONAT, deci singurele pe care
 * o recalculare de la zero le poate reface. Lipsesc de aici cele 7 tinte ale regulii
 * `calc.c3.null-cand-c2-null` (#137 #141 #144 #151 #156 #176 #179): scriptul lor este
 * `if (c2.rawValue == null) this.rawValue = null;`, adica doar GOLESTE. Valoarea lor
 * vine din `exit.tva.auto` (#136/#138 etc.), care nu face parte din `calculate`.
 */
const CAMPURI_RECONSTRUIBILE: readonly string[] = [
  ...campuriDeRegula('calc.formcalc.sum'),
  ...campuriDeRegula('calc.r36'),
  ...campuriDeRegula('calc.regularizari'),
  'Antet.nr_evid',
];

/** Toate tintele regulilor `calc.*`, asa cum le enumera registrul. */
const CAMPURI_CALCULATE: readonly string[] = [
  ...new Set([
    ...campuriDeRegula('calc.nr_evid'),
    ...campuriDeRegula('calc.c3.null-cand-c2-null'),
    ...CAMPURI_RECONSTRUIBILE,
  ]),
];

/** Itereaza pana la punct fix, ca `recalculate()` din legacy-runtime.mjs. */
function panaLaPunctFix(ctx: Ctx, maxTreceri = 12): number {
  for (let trecere = 1; trecere <= maxTreceri; trecere++) {
    if (!recalculateOnce(ctx)) return trecere;
  }
  throw new Error(`calculele nu converg in ${maxTreceri} treceri`);
}

describe('corpusul de fisiere de aur', () => {
  it('are cele 116 cazuri scrise de mana', () => {
    expect(golden.length).toBeGreaterThanOrEqual(116);
  });

  it('acopera toate cele 39 de campuri scrise de regulile calculate', () => {
    expect(CAMPURI_CALCULATE).toHaveLength(39);
    expect(CAMPURI_RECONSTRUIBILE).toHaveLength(32);
  });
});

describe('recalculateOnce: punct fix pe starile de aur', () => {
  for (const g of golden) {
    it(`nu mai schimba nimic in ${g.name}`, () => {
      const ctx = ctxDinAur(g);
      const inainte: State = { ...ctx.values };
      expect(recalculateOnce(ctx)).toBe(false);
      expect(ctx.values).toEqual(inainte);
      expect(ctx.trace).toEqual([]);
    });
  }
});

describe('recalculateOnce: recalculare de la zero', () => {
  for (const g of golden) {
    it(`reface valorile de aur din ${g.name}`, () => {
      const asteptat = valoriDeAur(g);
      const ctx = ctxDinAur(g);
      for (const camp of CAMPURI_RECONSTRUIBILE) ctx.set(camp, null);

      const treceri = panaLaPunctFix(ctx);
      expect(treceri).toBeLessThanOrEqual(12);
      expect(ctx.values).toEqual(asteptat);
    });
  }

  it('marcheaza nr_evid ca obligatoriu (#38)', () => {
    const ctx = createCtx(createInitialFormState());
    expect(ctx.mandatory.has('Antet.nr_evid')).toBe(false);
    recalculateOnce(ctx);
    expect(ctx.mandatory.has('Antet.nr_evid')).toBe(true);
  });
});

// Cele 7 tinte ale lui `calc.c3.null-cand-c2-null` nu sunt reconstruibile din `calculate`:
// scriptul lor doar goleste. Testul de mai jos codifica asta, ca sa nu treaca drept
// scapare daca cineva incearca ulterior sa le adauge in lista de mai sus.
describe('calc.c3.null-cand-c2-null goleste, nu reconstruieste', () => {
  const tinte = campuriDeRegula('calc.c3.null-cand-c2-null');

  it('are cele 7 tinte din registru', () => {
    expect(tinte).toHaveLength(7);
  });

  it('lasa c3 neatins cand c2 e nenul', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.livrari.r9.c2', 1000);
    ctx.set('date.livrari.r9.c3', 210);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.livrari.r9.c3')).toBe(210);
  });

  it('goleste c3 cand c2 e null si nu-l mai poate reface', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.livrari.r9.c3', 210);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.livrari.r9.c3')).toBeNull();
  });
});

describe('semantica lui null (A1: FormCalc) ', () => {
  it('r12.c2 cu ambii termeni null da 0, nu null', () => {
    const ctx = createCtx(createInitialFormState());
    expect(ctx.get('date.livrari.r12_1.c2')).toBeNull();
    expect(ctx.get('date.livrari.r12_2.c2')).toBeNull();
    recalculateOnce(ctx);
    expect(ctx.get('date.livrari.r12.c2')).toBe(0);
  });

  it('un singur termen nenul da chiar termenul', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.livrari.r12_1.c2', 500);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.livrari.r12.c2')).toBe(500);
    // #183 oglindeste rd.12.1 in rd.26.1
    expect(ctx.get('date.achizitiiIMP.r27_1.c2')).toBe(500);
  });

  it('r19.c2 NU include rd.3.1, rd.5.1 si rd.7.1 (linia activa din #161)', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.comert.r3_1.c2', 111);
    ctx.set('date.comert.r5_1.c2', 222);
    ctx.set('date.comert.r7_1.c2', 333);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.livrari.r19.c2')).toBe(0);
    // dar rd.20.1 si rd.22.1 le preiau (#165, #171)
    expect(ctx.get('date.achizitiiRO.r20_1.c2')).toBe(222);
    expect(ctx.get('date.achizitiiRO.r22_1.c2')).toBe(333);
  });

  it('r31.c3 include rd.28 si rd.29, iar r31.c2 nu (#192 vs #193)', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.achizitiiIMP.r28.c3', 40);
    ctx.set('date.achizitiiIMP.r29.c3', 60);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.achizitiiIMP.r31.c3')).toBe(100);
    expect(ctx.get('date.achizitiiIMP.r31.c2')).toBe(0);
  });
});

describe('semantica lui null (aritmetica JS, #195-#201)', () => {
  it('r37 cu r36 null si r19.c3 = 100 da 0', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.livrari.r16.c3', 100); // intra in r19.c3 fara sa treaca prin TVA automat
    panaLaPunctFix(ctx);
    expect(ctx.get('date.livrari.r19.c3')).toBe(100);
    expect(ctx.get('date.achizitiiIMP.r36.c3')).toBe(0);
    expect(ctx.get('date.regularizari.r37.c3')).toBe(0);
  });

  it('r38 in aceleasi conditii da 100', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.livrari.r16.c3', 100);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.regularizari.r38.c3')).toBe(100);
    // lantul: r41 = r38 + r39 + r40, r44 = r37 + r42 + r43
    expect(ctx.get('date.regularizari.r41.c3')).toBe(100);
    expect(ctx.get('date.regularizari.r44.c3')).toBe(0);
    expect(ctx.get('date.regularizari.r45.c3')).toBe(100);
    expect(ctx.get('date.regularizari.r46.c3')).toBe(0);
  });

  it('r36.c3 aduna rd.31-rd.34 cu null tratat ca 0', () => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.achizitiiIMP.r34.c3', 70);
    panaLaPunctFix(ctx);
    expect(ctx.get('date.achizitiiIMP.r36.c3')).toBe(70);
    expect(ctx.get('date.regularizari.r37.c3')).toBe(70);
    expect(ctx.get('date.regularizari.r44.c3')).toBe(70);
    expect(ctx.get('date.regularizari.r46.c3')).toBe(70);
  });

  it('toate totalurile goale sunt 0, niciunul null', () => {
    const ctx = createCtx(createInitialFormState());
    panaLaPunctFix(ctx);
    for (const camp of [
      ...campuriDeRegula('calc.formcalc.sum'),
      ...campuriDeRegula('calc.r36'),
      ...campuriDeRegula('calc.regularizari'),
    ]) {
      expect(ctx.get(camp), camp).toBe(0);
    }
  });
});

describe('calc.nr_evid (#38)', () => {
  it('e null cat timp lipseste luna', () => {
    const ctx = createCtx(createInitialFormState());
    expect(ctx.get('Antet.metaDate.an_r')).toBe('2026');
    expect(ctx.get('Antet.metaDate.luna_r')).toBeNull();
    panaLaPunctFix(ctx);
    expect(ctx.get('Antet.nr_evid')).toBeNull();
  });

  it('reproduce numarul de evidenta din fisierele de aur', () => {
    const cuNumar = golden.filter((g) => g.values['form1.Antet.nr_evid'] !== null);
    expect(cuNumar.length).toBeGreaterThan(0);
    for (const g of cuNumar) {
      const ctx = ctxDinAur(g);
      ctx.set('Antet.nr_evid', null);
      panaLaPunctFix(ctx);
      expect(ctx.get('Antet.nr_evid'), g.name).toBe(g.values['form1.Antet.nr_evid']);
    }
  });
});
