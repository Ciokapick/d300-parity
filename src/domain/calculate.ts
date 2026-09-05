// O trecere prin TOATE regulile `calculate` din registry.ts, in ordinea documentului
// (numerele #N din legacy/extracted/scripts_index.txt), exact ca `runAll('calculate')`
// din harness/oracle/legacy-runtime.mjs. Motorul apeleaza `recalculateOnce` pana la
// punct fix (max 12 treceri), la fel ca `recalculate()` din runtime-ul oracol.
//
// Regulile acoperite, in ordinea de executie:
//   #38                     calc.nr_evid
//   #137 #141 #144          calc.c3.null-cand-c2-null (r9, r10, r11)
//   #146 #148               calc.formcalc.sum        (r12)
//   #151 #156               calc.c3.null-cand-c2-null (r12.1, r12.2)
//   #161 #162               calc.formcalc.sum        (r19)
//   #163-#174               calc.formcalc.sum        (r20-r23)
//   #176 #179               calc.c3.null-cand-c2-null (r24, r25)
//   #181-#183 #185          calc.formcalc.sum        (r27, r27.1)
//   #187 #189               calc.formcalc.sum        (r27.2)
//   #192 #193               calc.formcalc.sum        (r31)
//   #195                    calc.r36
//   #196-#201               calc.regularizari
//
// Semantica pastrata verbatim, fara "reparatii":
//   A1 (FormCalc): `$ = a + b + ...` aduna termenii cu null tratat ca 0, iar rezultatul
//      e MEREU numar — un total gol e 0, nu null. Listele de termeni sunt copiate din
//      liniile ACTIVE din legacy/extracted/scripts_all.js; liniile comentate (variantele
//      vechi, cu rd.3.1 / 5.1 / 7.1 in rd.19 col.Baza) raman comentate si aici.
//   Aritmetica JS (#195-#201): `null + 5` e 5 si `null - 5` e -5, deci null se comporta
//      ca 0; `if (suma != null)` e mereu adevarat, pentru ca suma e mereu numar (defect
//      benign, ramura `else this.rawValue = 0` e cod mort).

import type { Ctx } from './context';
import type { CalculateModule } from './contracts';
import type { FieldValue } from './fields';
import { calculateRegistrationNumber, getReferencePeriod } from './nrEvid';

// ----------------------------------------------------------------------- ajutoare

/**
 * Scrie valoarea si spune daca s-a schimbat ceva. Comparatia e cu `===` (nu `Object.is`)
 * ca sa nu se distinga `-0` de `0`: altfel punctul fix nu ar mai converge.
 */
function assign(ctx: Ctx, rule: string, path: string, value: FieldValue): boolean {
  const inainte = ctx.get(path);
  ctx.set(path, value);
  const dupa = ctx.get(path);
  if (inainte === dupa) return false;
  ctx.fire(rule, path);
  return true;
}

/** `rawValue == null ? 0 : Number(rawValue)`, ca in shim-ul FormCalc al oracolului (A1). */
function nr(v: FieldValue): number {
  return v == null ? 0 : Number(v);
}

/** Un pas de calcul: sursa in legacy, regula din registru, efectul. */
interface CalcStep {
  /** #N din scripts_index.txt (ordinea documentului = ordinea de executie) */
  readonly source: number;
  readonly rule: string;
  readonly run: (ctx: Ctx) => boolean;
}

/** #137 #141 #144 #151 #156 #176 #179: `if (c2.rawValue == null) this.rawValue = null;` */
function c3GolCandC2Gol(source: number, c2: string, c3: string): CalcStep {
  return {
    source,
    rule: 'calc.c3.null-cand-c2-null',
    run: (ctx) => (ctx.get(c2) == null ? assign(ctx, 'calc.c3.null-cand-c2-null', c3, null) : false),
  };
}

/** FormCalc `$ = t1 + t2 + ...`: suma cu null = 0, rezultat mereu numar (A1). */
function suma(source: number, tinta: string, termeni: readonly string[]): CalcStep {
  return {
    source,
    rule: 'calc.formcalc.sum',
    run: (ctx) => {
      let total = 0;
      for (const t of termeni) total += nr(ctx.get(t));
      return assign(ctx, 'calc.formcalc.sum', tinta, total);
    },
  };
}

// ------------------------------------------------------------------- #38 nr_evid

/**
 * #38: `this.mandatory = "error"; this.rawValue = ''; utile.manageRegistrationNumber();`
 * Golirea intermediara nu se vede din afara trecerii, deci se scrie direct valoarea neta:
 * numarul de evidenta cand an_r si luna_r sunt nenule, altfel null (`''` -> null la coercitie).
 */
function calcNrEvid(ctx: Ctx): boolean {
  ctx.mandatory.add('Antet.nr_evid');
  const perioada = getReferencePeriod(ctx.get('Antet.metaDate.an_r'), ctx.get('Antet.metaDate.luna_r'));
  const valoare: FieldValue =
    perioada === null ? null : calculateRegistrationNumber(ctx.get('Antet.metaDate.tipDecont'), perioada);
  const changed = assign(ctx, 'calc.nr_evid', 'Antet.nr_evid', valoare);
  // algoritmul numarului de evidenta, in trace doar cand a produs o valoare noua
  if (changed && perioada !== null) ctx.fire('nrEvid.calcul', 'Antet.nr_evid');
  return changed;
}

// ------------------------------------------------------------------ #195 rd.35

/** #195: `var suma = r32.c3 + r33.c3 + r34.c3 + r35.c3; if (suma != null) this.rawValue = suma;` */
function calcR36(ctx: Ctx): boolean {
  const s =
    nr(ctx.get('date.achizitiiIMP.r32.c3')) +
    nr(ctx.get('date.achizitiiIMP.r33.c3')) +
    nr(ctx.get('date.achizitiiIMP.r34.c3')) +
    nr(ctx.get('date.achizitiiIMP.r35.c3'));
  return assign(ctx, 'calc.r36', 'date.achizitiiIMP.r36.c3', s);
}

// ------------------------------------------------- #196-#201 lantul regularizarilor

/** #196: `v37 = r36.c3 - r19.c3; if (v37 > 0) this.rawValue = v37; else this.rawValue = 0;` */
function calcR37(ctx: Ctx): boolean {
  const v = nr(ctx.get('date.achizitiiIMP.r36.c3')) - nr(ctx.get('date.livrari.r19.c3'));
  return assign(ctx, 'calc.regularizari', 'date.regularizari.r37.c3', v > 0 ? v : 0);
}

/** #197: oglinda lui #196, `r19.c3 - r36.c3`. */
function calcR38(ctx: Ctx): boolean {
  const v = nr(ctx.get('date.livrari.r19.c3')) - nr(ctx.get('date.achizitiiIMP.r36.c3'));
  return assign(ctx, 'calc.regularizari', 'date.regularizari.r38.c3', v > 0 ? v : 0);
}

/** #198: `suma = r38.c3 + r39.c3 + r40.c3` (`suma != null` mereu adevarat). */
function calcR41(ctx: Ctx): boolean {
  const s =
    nr(ctx.get('date.regularizari.r38.c3')) +
    nr(ctx.get('date.regularizari.r39.c3')) +
    nr(ctx.get('date.regularizari.r40.c3'));
  return assign(ctx, 'calc.regularizari', 'date.regularizari.r41.c3', s);
}

/** #199: `suma = r37.c3 + r42.c3 + r43.c3`. */
function calcR44(ctx: Ctx): boolean {
  const s =
    nr(ctx.get('date.regularizari.r37.c3')) +
    nr(ctx.get('date.regularizari.r42.c3')) +
    nr(ctx.get('date.regularizari.r43.c3'));
  return assign(ctx, 'calc.regularizari', 'date.regularizari.r44.c3', s);
}

/** #200: `v45 = r41.c3 - r44.c3; if (v45 > 0) ... else 0`. */
function calcR45(ctx: Ctx): boolean {
  const v = nr(ctx.get('date.regularizari.r41.c3')) - nr(ctx.get('date.regularizari.r44.c3'));
  return assign(ctx, 'calc.regularizari', 'date.regularizari.r45.c3', v > 0 ? v : 0);
}

/** #201: oglinda lui #200, `r44.c3 - r41.c3`. */
function calcR46(ctx: Ctx): boolean {
  const v = nr(ctx.get('date.regularizari.r44.c3')) - nr(ctx.get('date.regularizari.r41.c3'));
  return assign(ctx, 'calc.regularizari', 'date.regularizari.r46.c3', v > 0 ? v : 0);
}

// ------------------------------------------------------------- ordinea documentului

/**
 * Pasii in ordinea numerelor # din scripts_index.txt. `runAll('calculate')` din oracol
 * parcurge scripturile in ordinea in care au fost citite din template, adica exact asta.
 */
export const CALC_STEPS: readonly CalcStep[] = [
  { source: 38, rule: 'calc.nr_evid', run: calcNrEvid },

  c3GolCandC2Gol(137, 'date.livrari.r9.c2', 'date.livrari.r9.c3'),
  c3GolCandC2Gol(141, 'date.livrari.r10.c2', 'date.livrari.r10.c3'),
  c3GolCandC2Gol(144, 'date.livrari.r11.c2', 'date.livrari.r11.c3'),

  // #146 `$ = r12_1.c2 + r12_2.c2`
  suma(146, 'date.livrari.r12.c2', ['date.livrari.r12_1.c2', 'date.livrari.r12_2.c2']),
  // #148 `$ = r12_1.c3 + r12_2.c3`
  suma(148, 'date.livrari.r12.c3', ['date.livrari.r12_1.c3', 'date.livrari.r12_2.c3']),

  c3GolCandC2Gol(151, 'date.livrari.r12_1.c2', 'date.livrari.r12_1.c3'),
  c3GolCandC2Gol(156, 'date.livrari.r12_2.c2', 'date.livrari.r12_2.c3'),

  // #161, linia activa: rd.1-rd.8 din comert plus rd.9-rd.18 din livrari, col. Baza.
  // Linia comentata de deasupra adauga r9_1/r10_1/r11_1 (nu exista ca rd.3.1/5.1/7.1
  // in suma) — nu se implementeaza.
  suma(161, 'date.livrari.r19.c2', [
    'date.comert.r1.c2', 'date.comert.r2.c2', 'date.comert.r3.c2', 'date.comert.r4.c2',
    'date.comert.r5.c2', 'date.comert.r6.c2', 'date.comert.r7.c2', 'date.comert.r8.c2',
    'date.livrari.r9.c2', 'date.livrari.r10.c2', 'date.livrari.r11.c2', 'date.livrari.r12.c2',
    'date.livrari.r13.c2', 'date.livrari.r14.c2', 'date.livrari.r15.c2', 'date.livrari.r16.c2',
    'date.livrari.r17.c2', 'date.livrari.r18.c2',
  ]),
  // #162: doar rd.5-rd.8 din comert, rd.9-rd.12 si rd.16-rd.18 din livrari, col. TVA
  suma(162, 'date.livrari.r19.c3', [
    'date.comert.r5.c3', 'date.comert.r6.c3', 'date.comert.r7.c3', 'date.comert.r8.c3',
    'date.livrari.r9.c3', 'date.livrari.r10.c3', 'date.livrari.r11.c3', 'date.livrari.r12.c3',
    'date.livrari.r16.c3', 'date.livrari.r17.c3', 'date.livrari.r18.c3',
  ]),

  // #163-#174: preluari 1:1 din tabelul comert
  suma(163, 'date.achizitiiRO.r20.c2', ['date.comert.r5.c2']),
  suma(164, 'date.achizitiiRO.r20.c3', ['date.comert.r5.c3']),
  suma(165, 'date.achizitiiRO.r20_1.c2', ['date.comert.r5_1.c2']),
  suma(166, 'date.achizitiiRO.r20_1.c3', ['date.comert.r5_1.c3']),
  suma(167, 'date.achizitiiRO.r21.c2', ['date.comert.r6.c2']),
  suma(168, 'date.achizitiiRO.r21.c3', ['date.comert.r6.c3']),
  suma(169, 'date.achizitiiRO.r22.c2', ['date.comert.r7.c2']),
  suma(170, 'date.achizitiiRO.r22.c3', ['date.comert.r7.c3']),
  suma(171, 'date.achizitiiRO.r22_1.c2', ['date.comert.r7_1.c2']),
  suma(172, 'date.achizitiiRO.r22_1.c3', ['date.comert.r7_1.c3']),
  suma(173, 'date.achizitiiRO.r23.c2', ['date.comert.r8.c2']),
  suma(174, 'date.achizitiiRO.r23.c3', ['date.comert.r8.c3']),

  c3GolCandC2Gol(176, 'date.achizitiiIMP.r24.c2', 'date.achizitiiIMP.r24.c3'),
  c3GolCandC2Gol(179, 'date.achizitiiIMP.r25.c2', 'date.achizitiiIMP.r25.c3'),

  // #181 #182
  suma(181, 'date.achizitiiIMP.r27.c2', ['date.achizitiiIMP.r27_1.c2', 'date.achizitiiIMP.r27_2.c2']),
  suma(182, 'date.achizitiiIMP.r27.c3', ['date.achizitiiIMP.r27_1.c3', 'date.achizitiiIMP.r27_2.c3']),
  // #183 #185 #187 #189: oglindirea taxarii inverse din tabelul livrari
  suma(183, 'date.achizitiiIMP.r27_1.c2', ['date.livrari.r12_1.c2']),
  suma(185, 'date.achizitiiIMP.r27_1.c3', ['date.livrari.r12_1.c3']),
  suma(187, 'date.achizitiiIMP.r27_2.c2', ['date.livrari.r12_2.c2']),
  suma(189, 'date.achizitiiIMP.r27_2.c3', ['date.livrari.r12_2.c3']),

  // #192, linia activa (varianta comentata adauga r24_1/r25_1/r26)
  suma(192, 'date.achizitiiIMP.r31.c2', [
    'date.achizitiiRO.r20.c2', 'date.achizitiiRO.r21.c2', 'date.achizitiiRO.r22.c2',
    'date.achizitiiRO.r23.c2', 'date.achizitiiIMP.r24.c2', 'date.achizitiiIMP.r25.c2',
    'date.achizitiiIMP.r27.c2',
  ]),
  // #193: fata de #192, coloana TVA adauga rd.28 si rd.29
  suma(193, 'date.achizitiiIMP.r31.c3', [
    'date.achizitiiRO.r20.c3', 'date.achizitiiRO.r21.c3', 'date.achizitiiRO.r22.c3',
    'date.achizitiiRO.r23.c3', 'date.achizitiiIMP.r24.c3', 'date.achizitiiIMP.r25.c3',
    'date.achizitiiIMP.r27.c3', 'date.achizitiiIMP.r28.c3', 'date.achizitiiIMP.r29.c3',
  ]),

  { source: 195, rule: 'calc.r36', run: calcR36 },
  { source: 196, rule: 'calc.regularizari', run: calcR37 },
  { source: 197, rule: 'calc.regularizari', run: calcR38 },
  { source: 198, rule: 'calc.regularizari', run: calcR41 },
  { source: 199, rule: 'calc.regularizari', run: calcR44 },
  { source: 200, rule: 'calc.regularizari', run: calcR45 },
  { source: 201, rule: 'calc.regularizari', run: calcR46 },
];

/**
 * O singura trecere prin toate regulile `calculate`. Intoarce true daca vreo valoare
 * s-a schimbat; motorul reia trecerea pana cand raspunsul e false (punct fix).
 */
export function recalculateOnce(ctx: Ctx): boolean {
  let schimbat = false;
  for (const pas of CALC_STEPS) {
    // fara scurtcircuit: fiecare pas trebuie sa ruleze, ca in `runAll('calculate')`
    if (pas.run(ctx)) schimbat = true;
  }
  return schimbat;
}

/** Contractul din contracts.ts, verificat la compilare. */
export const calculateModule = { recalculateOnce } satisfies CalculateModule;
