// Butonul VALIDARE si regulile `validate`, in pasii din `rules/registry.ts`:
//
//   button.obligatorii -> button.obligatorii.mesaj -> button.execValidate
//   -> (numai daca nu lipsesc obligatorii) button.sumaControl -> button.validForm
//   -> (numai daca validForm nu are erori) xml.genXML, apelat de motor, nu de aici.
//
// Sursele: `scriptobj_oblig.js` (CheckForErrors), `scripts_all.js` #18 (mouseUp) si
// #13 (click, cu lista inline a sumei de control), #133 (validate pe pro-rata) si
// `scriptobj_genValid.js` (validForm). Textele sunt VERBATIM, cu spatiile lor duble.
//
// Comparatiile din original sunt slabe (`==`, `<`, `!=`) pe `rawValue`, care poate fi
// null, numar sau sir; le reproducem prin helperele de mai jos, nu prin `==`, ca sa
// ramana explicit ce semantica imitam. Defectul #15 (`null != 0` e adevarat, deci
// exclusivitatea rd.38/rd.41 se declanseaza si cand celalalt rand e gol) rezulta
// direct din helpere si e reprodus intentionat.

import type { ValidateModule } from './contracts';
import type { Ctx } from './context';
import { EXCL_GROUPS, FIELDS, type FieldValue } from './fields';
import { TITLES, text } from './messages';

// ---------------------------------------------------------------- semantica JS

/** `x == null` din original. Valorile noastre nu sunt niciodata `undefined`. */
const esteNull = (v: FieldValue): boolean => v === null;

/** `x < n`: operatorii relationali fac ToNumber (null -> 0, "" -> 0, text -> NaN). */
const maiMicDecat = (v: FieldValue, n: number): boolean => Number(v) < n;

/** `x > 0`. */
const pozitiv = (v: FieldValue): boolean => Number(v) > 0;

/** `x == n` pentru n numar: null nu e egal cu niciun numar, restul trec prin ToNumber. */
const egalCu = (v: FieldValue, n: number): boolean => (v === null ? false : Number(v) === n);

/** `x != n` pentru n numar. ATENTIE: `null != 0` e ADEVARAT (defect #15). */
const diferitDe = (v: FieldValue, n: number): boolean => !egalCu(v, n);

// ---------------------------------------------------------------- suma de control

/**
 * Celulele adunate in `scripts_all.js` #13, in ordinea din sursa. NU e lista din
 * `utile.sumaControl`, care e cod mort si difera (defect #4).
 */
export const SUMA_CONTROL_CELLS: readonly string[] = [
  'date.comert.r1.c2', 'date.comert.r2.c2', 'date.comert.r3.c2', 'date.comert.r3_1.c2',
  'date.comert.r4.c2', 'date.comert.r5.c2', 'date.comert.r5.c3', 'date.comert.r5_1.c2',
  'date.comert.r5_1.c3', 'date.comert.r6.c2', 'date.comert.r6.c3', 'date.comert.r7.c2',
  'date.comert.r7.c3', 'date.comert.r7_1.c2', 'date.comert.r7_1.c3', 'date.comert.r8.c2',
  'date.comert.r8.c3',
  'date.livrari.r9.c2', 'date.livrari.r9.c3', 'date.livrari.r10.c2', 'date.livrari.r10.c3',
  'date.livrari.r11.c2', 'date.livrari.r11.c3', 'date.livrari.r12.c2', 'date.livrari.r12.c3',
  'date.livrari.r12_1.c2', 'date.livrari.r12_1.c3', 'date.livrari.r12_2.c2',
  'date.livrari.r12_2.c3', 'date.livrari.r13.c2', 'date.livrari.r14.c2', 'date.livrari.r15.c2',
  'date.livrari.r16.c2', 'date.livrari.r16.c3', 'date.livrari.r17.c2', 'date.livrari.r17.c3',
  'date.livrari.r18.c2', 'date.livrari.r18.c3', 'date.livrari.r19.c2', 'date.livrari.r19.c3',
  'date.achizitiiRO.r20.c2', 'date.achizitiiRO.r20.c3', 'date.achizitiiRO.r20_1.c2',
  'date.achizitiiRO.r20_1.c3', 'date.achizitiiRO.r21.c2', 'date.achizitiiRO.r21.c3',
  'date.achizitiiRO.r22.c2', 'date.achizitiiRO.r22.c3', 'date.achizitiiRO.r22_1.c2',
  'date.achizitiiRO.r22_1.c3', 'date.achizitiiRO.r23.c2', 'date.achizitiiRO.r23.c3',
  'date.achizitiiIMP.r24.c2', 'date.achizitiiIMP.r24.c3', 'date.achizitiiIMP.r25.c2',
  'date.achizitiiIMP.r25.c3', 'date.achizitiiIMP.r27.c2', 'date.achizitiiIMP.r27.c3',
  'date.achizitiiIMP.r27_1.c2', 'date.achizitiiIMP.r27_1.c3', 'date.achizitiiIMP.r27_2.c2',
  'date.achizitiiIMP.r27_2.c3', 'date.achizitiiIMP.r28.c3', 'date.achizitiiIMP.r29.c3',
  'date.achizitiiIMP.r30.c2', 'date.achizitiiIMP.r30_1.c2', 'date.achizitiiIMP.r31.c2',
  'date.achizitiiIMP.r31.c3', 'date.achizitiiIMP.r32.c3', 'date.achizitiiIMP.r33.c3',
  'date.achizitiiIMP.r34.c2', 'date.achizitiiIMP.r34.c3', 'date.achizitiiIMP.r35.c3',
  'date.achizitiiIMP.r36.c3',
  'date.regularizari.r37.c3', 'date.regularizari.r38.c3', 'date.regularizari.r39.c3',
  'date.regularizari.r40.c3', 'date.regularizari.r41.c3', 'date.regularizari.r42.c3',
  'date.regularizari.r43.c3', 'date.regularizari.r44.c3', 'date.regularizari.r45.c3',
  'date.regularizari.r46.c3',
  'date.r47.c1', 'date.r47.c2', 'date.r47.c3', 'date.r48.c1', 'date.r48.c2', 'date.r48.c3',
];

// ---------------------------------------------------------------- validForm

/**
 * Verificarile din `genValid.validForm`, in ordinea EXACTA din functie. Fiecare
 * intrare adevarata produce "EROARE - <text>\r\n". Textele sunt copiate verbatim,
 * inclusiv spatiile duble ("Luna este element  obligatoriu", "Randul 43  este
 * element obligatoriu", "Suma de control  este element obligatoriu").
 */
const VERIFICARI: readonly { text: string; cand: (ctx: Ctx) => boolean }[] = [
  { text: 'Anul este element obligatoriu', cand: (c) => esteNull(c.get('Antet.metaDate.an_r')) },
  { text: 'Luna este element  obligatoriu', cand: (c) => esteNull(c.get('Antet.metaDate.luna_r')) },
  {
    text: 'Anul trebuie sa fie mai mare sau egal cu 2024',
    cand: (c) => maiMicDecat(c.get('Antet.metaDate.an_r'), 2024),
  },
  {
    text: 'Pentru an = 2024 luna trebuie sa fie >= 5',
    cand: (c) =>
      egalCu(c.get('Antet.metaDate.an_r'), 2024) && maiMicDecat(c.get('Antet.metaDate.luna_r'), 5),
  },
  {
    text: 'Bifa Declaratie depusa dupa anularea rezervei verificarii ulterioare este element  obligatoriu',
    cand: (c) => esteNull(c.get('Antet.metaDate.d_rez')),
  },
  {
    text: "Ati bifat 'Declaratie depusa dupa anularea rezervei verificarii ulterioare' si nu ati completat temeiul legal",
    cand: (c) => egalCu(c.get('Antet.metaDate.d_rez'), 2) && esteNull(c.get('Antet.temeiLegal')),
  },
  {
    text: "'Se aplica metoda simplificata pentru operatiuni interne' este element obligatoriu",
    cand: (c) => esteNull(c.get('Antet.opInterne.mtdSimplificata')),
  },
  { text: 'Nume declarant este element obligatoriu', cand: (c) => esteNull(c.get('semnatura.nume')) },
  { text: 'Prenume declarant este element obligatoriu', cand: (c) => esteNull(c.get('semnatura.prenume')) },
  { text: 'Functie declarant este element obligatoriu', cand: (c) => esteNull(c.get('semnatura.smnFnc')) },
  {
    text: 'Cod de identificare fiscala in scopuri de TVA este element obligatoriu',
    cand: (c) => esteNull(c.get('identifCntr.denumire.cif')),
  },
  {
    text: 'Denumirea persoanei impozabile este element obligatoriu',
    cand: (c) => esteNull(c.get('identifCntr.denumire.den')),
  },
  { text: 'Banca este element obligatoriu', cand: (c) => esteNull(c.get('identifCntr.banca.den')) },
  { text: 'Cont bancar este element obligatoriu', cand: (c) => esteNull(c.get('identifCntr.banca.iban')) },
  {
    // originalul citeste caen1 in `caen2` si testeaza si `== ""`, desi coercitia
    // transforma sirul gol in null; pastram ambele ramuri, ca in sursa
    text: 'Cod CAEN este element obligatoriu',
    cand: (c) => {
      const caen = c.get('identifCntr.caen');
      const caen2 = c.get('identifCntr.caen1');
      return (caen2 === null || caen2 === '') && (caen === null || caen === '');
    },
  },
  {
    text: 'Perioada de raportare este element obligatoriu',
    cand: (c) => esteNull(c.get('Antet.metaDate.tipDecont')),
  },
  { text: 'Pro-rata este element obligatoriu', cand: (c) => esteNull(c.get('identifCntr.proRata')) },
  {
    text: 'Bifa livrare de cereale si plante tehnice este element obligatoriu',
    cand: (c) => esteNull(c.get('date.bife.caption.bifa_cereale')),
  },
  {
    text: 'Bifa livrare de telefoane mobile este element obligatoriu',
    cand: (c) => esteNull(c.get('date.bife.caption.bifa_mob')),
  },
  {
    text: 'Bifa livrare de dispozitive cu circuite integrate inainte de integrarea lor in produse destinate utilizatorului final este element obligatoriu',
    cand: (c) => esteNull(c.get('date.bife.caption.bifa_disp')),
  },
  {
    text: 'Bifa livrare de console de jocuri, tablete PC si laptopuri este element obligatoriu',
    cand: (c) => esteNull(c.get('date.bife.caption.bifa_cons')),
  },
  {
    text: 'Bifa Solicitati rambursarea soldului sumei negative de TVA este element obligatoriu',
    cand: (c) => esteNull(c.get('date.rambursare.bifa_rambursare')),
  },
  {
    text: 'Numarul de evidenta a platii este element obligatoriu',
    cand: (c) => esteNull(c.get('Antet.nr_evid')),
  },
  { text: 'Randul 19 coloana 1 este element obligatoriu', cand: (c) => esteNull(c.get('date.livrari.r19.c2')) },
  { text: 'Randul 19 coloana 2 este element obligatoriu', cand: (c) => esteNull(c.get('date.livrari.r19.c3')) },
  {
    text: 'Randul 30 coloana 1 este element obligatoriu',
    cand: (c) => esteNull(c.get('date.achizitiiIMP.r31.c2')),
  },
  {
    text: 'Randul 30 coloana 2 este element obligatoriu',
    cand: (c) => esteNull(c.get('date.achizitiiIMP.r31.c3')),
  },
  {
    text: 'Randul 35 coloana 2 este element obligatoriu',
    cand: (c) => esteNull(c.get('date.achizitiiIMP.r36.c3')),
  },
  { text: 'Randul 36 este element obligatoriu', cand: (c) => esteNull(c.get('date.regularizari.r37.c3')) },
  { text: 'Randul 37 este element obligatoriu', cand: (c) => esteNull(c.get('date.regularizari.r38.c3')) },
  {
    // defect #15: `R35_2 != 0` e adevarat si cand rd.38 e gol (null != 0)
    text: 'Daca R41 > 0 , atunci R38 = 0',
    cand: (c) =>
      pozitiv(c.get('date.regularizari.r42.c3')) && diferitDe(c.get('date.regularizari.r39.c3'), 0),
  },
  {
    text: 'Daca R38 > 0 , atunci R41 = 0',
    cand: (c) =>
      pozitiv(c.get('date.regularizari.r39.c3')) && diferitDe(c.get('date.regularizari.r42.c3'), 0),
  },
  { text: 'Randul 40 este element obligatoriu', cand: (c) => esteNull(c.get('date.regularizari.r41.c3')) },
  { text: 'Randul 43  este element obligatoriu', cand: (c) => esteNull(c.get('date.regularizari.r44.c3')) },
  { text: 'Randul 44 este element obligatoriu', cand: (c) => esteNull(c.get('date.regularizari.r45.c3')) },
  { text: 'Randul 45 este element obligatoriu', cand: (c) => esteNull(c.get('date.regularizari.r46.c3')) },
  {
    text: 'Suma de control  este element obligatoriu',
    cand: (c) => esteNull(c.get('Antet.metaDate.totalPlata_A')),
  },
];

// ---------------------------------------------------------------- modulul

/**
 * `oblig.CheckForErrors(form1)`, chemat din #18 (mouseUp), deci INAINTE de click.
 *
 * Parcurge campurile in ordinea documentului; un camp cu `nullTest != "disabled"`
 * (adica prezent in `ctx.mandatory`) si `rawValue === null || === "000"` devine
 * evidentiat. Bifele obligatorii cu `rawValue === 0` si grupurile radio obligatorii
 * cu `rawValue === ""` intra la fel in numaratoare (nu exista asa ceva in template,
 * dar originalul le trateaza si le pastram).
 *
 * Intoarce `errCount.value.length`: originalul aduna `1` peste un SIR, deci sirul
 * creste cu un caracter la fiecare camp lipsa si lungimea lui e numarul de campuri.
 */
function checkMandatory(ctx: Ctx): number {
  ctx.highlighted.clear();
  let errCount = '';

  for (const f of FIELDS) {
    if (!ctx.mandatory.has(f.path)) continue;
    const v = ctx.get(f.path);
    if (v === null || v === '000') {
      ctx.highlighted.add(f.path);
      ctx.fire('button.obligatorii', f.path);
      errCount += 1;
    }
    if (f.ui === 'checkButton' && v === 0) {
      ctx.highlighted.add(f.path);
      ctx.fire('button.obligatorii', f.path);
      errCount += 1;
    }
  }

  for (const g of EXCL_GROUPS) {
    if (!ctx.mandatory.has(g.path)) continue;
    if (ctx.get(g.path) === '') {
      ctx.highlighted.add(g.path);
      ctx.fire('button.obligatorii', g.path);
      errCount += 1;
    }
  }

  return errCount.length;
}

/** Primele linii din #13: mesajul generic, cu titlul "Date incomplete". */
function mandatoryMessage(ctx: Ctx, missing: number): boolean {
  if (missing > 0) {
    ctx.fire('button.obligatorii.mesaj');
    ctx.say({
      kind: 'messageBox',
      title: TITLES.dateIncomplete,
      text: text('obligatorii.generic', missing),
    });
    return true;
  }
  return false;
}

/**
 * `execValidate()` din #13: ruleaza regulile `validate`. Singura vie e #133, pe
 * pro-rata; conditia e negata, deci si `null` declanseaza alertul si corectia la 100.
 */
function execValidate(ctx: Ctx): void {
  ctx.fire('button.execValidate');
  const v = ctx.get('identifCntr.proRata');
  if (!(v !== null && Number(v) >= 0 && Number(v) <= 100)) {
    ctx.fire('validate.proRata', 'identifCntr.proRata');
    ctx.say({ kind: 'alert', text: text('proRata.interval') });
    ctx.set('identifCntr.proRata', 100);
  }
}

/** Suma de control inline din #13, cu semantica JS a lui `+` (null se aduna ca 0). */
function sumaControl(ctx: Ctx): void {
  ctx.fire('button.sumaControl', 'Antet.metaDate.totalPlata_A');
  let suma = 0;
  for (const cale of SUMA_CONTROL_CELLS) suma += Number(ctx.get(cale) ?? 0);
  ctx.set('Antet.metaDate.totalPlata_A', suma);
}

/**
 * `genValid.validForm()`. Intoarce continutul lui "Erori si avertizari.txt" cand
 * exista erori (si emite messageBox-ul "nu e valid"), altfel null (si emite
 * messageBox-ul "e valid"). XML-ul il genereaza motorul, nu functia asta.
 */
function validForm(ctx: Ctx): string | null {
  ctx.fire('button.validForm');
  let mesaj = '';
  for (const v of VERIFICARI) if (v.cand(ctx)) mesaj += 'EROARE - ' + v.text + '\r\n';

  if (mesaj !== '') {
    ctx.say({ kind: 'messageBox', title: TITLES.d300, text: text('validForm.invalid') });
    return mesaj;
  }
  ctx.say({ kind: 'messageBox', title: TITLES.d300, text: text('validForm.valid') });
  return null;
}

export { checkMandatory, mandatoryMessage, execValidate, sumaControl, validForm };

export default {
  checkMandatory,
  mandatoryMessage,
  execValidate,
  sumaControl,
  validForm,
} satisfies ValidateModule;
