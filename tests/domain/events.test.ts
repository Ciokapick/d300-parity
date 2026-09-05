// Teste diferentiale pentru change.ts / enter.ts / exit.ts fata de oracolul 1
// (`harness/oracle/legacy-runtime.mjs`, adica scripturile ANAF rulate neschimbate).
//
// Motorul care compune modulele nu exista inca, deci `replay` reproduce aici secventa
// din comentariul "ORDINEA DE EXECUTIE" al registrului, FARA recalculare:
//
//   checkButton / exclGroup: set -> afterChange
//   altfel:                  onEnter -> applyChange (respins => sarim intrarea)
//                            -> set -> onExit
//
// Comparatia: mesajele noastre trebuie sa fie EGALE cu prefixul `log`-ului oracolului,
// iar primul mesaj ramas (daca exista) trebuie sa vina de la butonul VALIDARE. Cazurile
// sunt alese ca sa nu depinda de valori calculate (modulul `calculate` se scrie separat).

import { describe, expect, it } from 'vitest';

import { createForm } from '../../harness/oracle/legacy-runtime.mjs';
import { loadAll } from '../../harness/oracle/cases.mjs';
import { afterChange, applyChange } from '../../src/domain/change';
import { createCtx, createInitialFormState, type Ctx } from '../../src/domain/context';
import { onEnter } from '../../src/domain/enter';
import { onExit } from '../../src/domain/exit';
import { EXCL_GROUPS, FIELD_BY_PATH, type FieldValue } from '../../src/domain/fields';
import { text, TITLES } from '../../src/domain/messages';
import type { Message } from '../../src/domain/state';

const form = createForm();

type Input = readonly [string, string];

/** Campurile pe care motorul le trateaza cu `set` + `afterChange` (fara `applyChange`). */
const TOGGLES = new Set<string>([
  ...EXCL_GROUPS.map((g) => g.path),
  ...[...FIELD_BY_PATH.values()].filter((f) => f.ui === 'checkButton').map((f) => f.path),
]);

function replay(inputs: readonly Input[], seed: Readonly<Record<string, FieldValue>> = {}): Ctx {
  const ctx = createCtx(createInitialFormState());
  for (const [p, v] of Object.entries(seed)) ctx.set(p, v);
  for (const [full, value] of inputs) {
    const path = full.replace(/^form1\./, '');
    if (TOGGLES.has(path)) {
      ctx.set(path, value);
      afterChange(ctx, path);
      continue;
    }
    onEnter(ctx, path);
    const { value: v, rejected } = applyChange(ctx, path, value);
    if (rejected) {
      // respingerea o face motorul; aici o simulam ca sa avem acelasi log ca oracolul
      ctx.say({ kind: 'respins', field: full, text: value });
      continue;
    }
    ctx.set(path, v);
    onExit(ctx, path);
  }
  return ctx;
}

/** Mesajele emise de butonul VALIDARE, adica tot ce urmeaza dupa faza de intrari. */
function isButtonMessage(m: { title?: string; text: string }): boolean {
  return m.title === TITLES.dateIncomplete
    || m.title === TITLES.d300
    || m.text.startsWith('Pro-rata');
}

/**
 * Ruleaza acelasi caz prin oracol si prin module si cere identitate pe prefix.
 * `values` se verifica in AMBELE (cheile se dau fara prefixul `form1.`).
 */
function diff(
  name: string,
  inputs: readonly Input[],
  values: Readonly<Record<string, FieldValue>> = {},
  seed: Readonly<Record<string, FieldValue>> = {},
): { mine: Message[]; oracle: ReturnType<typeof form.runCase> } {
  const oracle = form.runCase({ name, inputs: inputs.map(([p, v]) => [p, v]) });
  const ctx = replay(inputs, seed);
  const n = ctx.messages.length;
  expect(ctx.messages, `mesajele cazului ${name}`).toEqual(oracle.log.slice(0, n));
  const next = oracle.log[n];
  if (next !== undefined) {
    expect(isButtonMessage(next), `log[${n}] din ${name} nu e mesaj de buton: ${JSON.stringify(next)}`)
      .toBe(true);
  }
  for (const [path, expected] of Object.entries(values)) {
    expect(ctx.values[path], `modelul: ${path}`).toEqual(expected);
    expect(oracle.values[`form1.${path}`], `oracolul: ${path}`).toEqual(expected);
  }
  return { mine: ctx.messages, oracle };
}

const alert = (t: string): Message => ({ kind: 'alert', text: t });
const box = (title: string, t: string): Message => ({ kind: 'messageBox', title, text: t });

// campuri folosite des
const AN = 'form1.Antet.metaDate.an_r';
const LUNA = 'form1.Antet.metaDate.luna_r';
const TIP = 'form1.Antet.metaDate.tipDecont';
const DEN = 'form1.identifCntr.denumire.den';
const CIF = 'form1.identifCntr.denumire.cif';
const JUDET = 'form1.identifCntr.adresa.judet';
const LOC = 'form1.identifCntr.adresa.loc';
const IBAN = 'form1.identifCntr.banca.iban';

const CUI_VALID = '18597239';
const CUI_INVALID = '18597230';

// ==================================================================== change

describe('change: majuscule (#68 #74 ... #216)', () => {
  it('transforma valoarea intreaga in majuscule (A3)', () => {
    const { mine } = diff('u-den-minuscule', [[DEN, 'Exemplu Software Srl']], {
      'identifCntr.denumire.den': 'EXEMPLU SOFTWARE SRL',
    });
    expect(mine).toEqual([]);
  });

  it('nu atinge un camp din afara listei (CIF ramane cum a fost tastat)', () => {
    diff('u-cif-nemajusculat', [[CIF, CUI_VALID]], { 'identifCntr.denumire.cif': CUI_VALID });
  });
});

describe('change: filtrele numerice (#42 #62 #71 #111 #116 #120)', () => {
  it('#42 respinge tacut anul cu litere', () => {
    const { mine } = diff('u-an-litere', [[AN, '20a6']], { 'Antet.metaDate.an_r': '2026' });
    expect(mine).toEqual([{ kind: 'respins', field: AN, text: '20a6' }]);
  });

  it('#42 accepta anul numeric', () => {
    const { mine } = diff('u-an-numeric', [[AN, '2025']], { 'Antet.metaDate.an_r': '2025' });
    expect(mine).toEqual([]);
  });

  it('#116 avertizeaza si respinge telefonul cu litere', () => {
    const { mine } = diff('u-telefon-litere', [['form1.identifCntr.contact.telefon', '021123456a']], {
      'identifCntr.contact.telefon': null,
    });
    expect(mine).toEqual([alert(text('doar.cifre')), { kind: 'respins', field: 'form1.identifCntr.contact.telefon', text: '021123456a' }]);
  });

  it('#111 codul postal cu litere: messageBox "Format eronat" si respingere', () => {
    const { mine } = diff('u-codpst-litere', [['form1.identifCntr.adresa.codPst', '0301a6']], {
      'identifCntr.adresa.codPst': null,
    });
    expect(mine).toEqual([
      box(TITLES.formatEronat, text('doar.cifre')),
      { kind: 'respins', field: 'form1.identifCntr.adresa.codPst', text: '0301a6' },
    ]);
  });

  it('#111 codul postal numeric trece', () => {
    diff('u-codpst-numeric', [['form1.identifCntr.adresa.codPst', '030167']], {
      'identifCntr.adresa.codPst': '030167',
    });
  });
});

describe('change: judetul goleste localitatea (#87)', () => {
  it('judet nou => localitatea se pierde', () => {
    const { mine } = diff('u-judet-schimbat', [[JUDET, '40'], [LOC, 'Voluntari'], [JUDET, '5']], {
      'identifCntr.adresa.judet': '5',
      'identifCntr.adresa.loc': null,
    });
    expect(mine).toEqual([]);
  });

  it('acelasi judet => localitatea ramane', () => {
    diff('u-judet-acelasi', [[JUDET, '5'], [LOC, 'Cluj Napoca'], [JUDET, '5']], {
      'identifCntr.adresa.judet': '5',
      'identifCntr.adresa.loc': 'CLUJ NAPOCA',
    });
  });
});

describe('change: bifele (#52 #55 #41 #202)', () => {
  it('#52 d_rez 2 pune temeiul legal pe 2, apoi 0 il sterge', () => {
    diff('u-d-rez-2-apoi-0', [['form1.Antet.metaDate.d_rez', '2']], { 'Antet.temeiLegal': '2' });
    const ctx = replay([['form1.Antet.metaDate.d_rez', '2']]);
    expect(ctx.mandatory.has('Antet.temeiLegal')).toBe(true);
    diff('u-d-rez-0', [['form1.Antet.metaDate.d_rez', '2'], ['form1.Antet.metaDate.d_rez', '0']], {
      'Antet.temeiLegal': null,
    });
    const ctx2 = replay([['form1.Antet.metaDate.d_rez', '2'], ['form1.Antet.metaDate.d_rez', '0']]);
    expect(ctx2.mandatory.has('Antet.temeiLegal')).toBe(false);
  });

  it('#55 d_scc 1 face CIF-ul succesorului obligatoriu, 0 il goleste', () => {
    const inputs: Input[] = [
      ['form1.Antet.metaDate.d_scc', '1'],
      ['form1.Antet.cifS', CUI_VALID],
    ];
    diff('u-d-scc-1', inputs, { 'Antet.cifS': CUI_VALID });
    expect(replay(inputs).mandatory.has('Antet.cifS')).toBe(true);

    const inputs0: Input[] = [...inputs, ['form1.Antet.metaDate.d_scc', '0']];
    diff('u-d-scc-0', inputs0, { 'Antet.cifS': null });
    expect(replay(inputs0).mandatory.has('Antet.cifS')).toBe(false);
  });

  it('#41 metoda simplificata goleste si blocheaza comertul intracomunitar', () => {
    const inputs: Input[] = [
      ['form1.date.comert.r1.c2', '1000'],
      ['form1.Antet.opInterne.mtdSimplificata', '1'],
    ];
    diff('u-mtd-simplificata-1', inputs, { 'date.comert.r1.c2': null });
    const ctx = replay(inputs);
    expect(ctx.readOnly.has('date.comert.r1.c2')).toBe(true);
    expect(ctx.readOnly.has('date.achizitiiRO.r20_1.c2')).toBe(true);
    expect(ctx.readOnly.has('date.achizitiiIMP.r30_1.c2')).toBe(true);
  });

  it('#41 fara bifa valorile raman', () => {
    const inputs: Input[] = [
      ['form1.date.comert.r1.c2', '1000'],
      ['form1.Antet.opInterne.mtdSimplificata', '0'],
    ];
    diff('u-mtd-simplificata-0', inputs, { 'date.comert.r1.c2': 1000 });
    expect(replay(inputs).readOnly.has('date.comert.r1.c2')).toBe(false);
  });

  it('#202 rambursarea sub prag se intoarce la N', () => {
    const { mine } = diff('u-rambursare-sub-prag', [['form1.date.rambursare.bifa_rambursare', 'D']], {
      'date.rambursare.bifa_rambursare': 'N',
    });
    expect(mine).toEqual([alert(text('rambursare.prag'))]);
  });

  it('#202 bifa N nu declanseaza nimic', () => {
    const { mine } = diff('u-rambursare-n', [['form1.date.rambursare.bifa_rambursare', 'N']], {
      'date.rambursare.bifa_rambursare': 'N',
    });
    expect(mine).toEqual([]);
  });

  // pragul se citeste din starea deja recalculata, deci il verificam unitar
  it.each([
    [null, true],
    [4999, true],
    [5000, false],
    [10000, false],
  ])('#202 rd.46 = %s => mesaj: %s', (r46, expectAlert) => {
    const ctx = createCtx(createInitialFormState());
    ctx.set('date.regularizari.r46.c3', r46);
    ctx.set('date.rambursare.bifa_rambursare', 'D');
    afterChange(ctx, 'date.rambursare.bifa_rambursare');
    if (expectAlert) {
      expect(ctx.messages).toEqual([alert(text('rambursare.prag'))]);
      expect(ctx.values['date.rambursare.bifa_rambursare']).toBe('N');
    } else {
      expect(ctx.messages).toEqual([]);
      expect(ctx.values['date.rambursare.bifa_rambursare']).toBe('D');
    }
  });
});

// ==================================================================== enter

describe('enter: preconditiile (#82 #59 #64)', () => {
  it('#82 localitate fara judet', () => {
    const { mine } = diff('u-loc-fara-judet', [[LOC, 'Cluj Napoca']], {
      'identifCntr.adresa.loc': 'CLUJ NAPOCA',
    });
    expect(mine).toEqual([alert(text('loc.judet-intai'))]);
  });

  it('#82 cu judet completat nu apare nimic', () => {
    const { mine } = diff('u-loc-cu-judet', [[JUDET, '12'], [LOC, 'Cluj Napoca']]);
    expect(mine).toEqual([]);
  });

  it('#59 temei legal fara bifa d_rez', () => {
    const { mine } = diff('u-temei-fara-bifa', [['form1.Antet.temeiLegal', '1']], {
      'Antet.temeiLegal': '2',
    });
    expect(mine).toEqual([box(TITLES.conditiePrealabila, text('temei.conditie'))]);
  });

  it('#59 cu bifa d_rez nu apare nimic, iar #60 forteaza valoarea 2', () => {
    const { mine } = diff(
      'u-temei-cu-bifa',
      [['form1.Antet.metaDate.d_rez', '2'], ['form1.Antet.temeiLegal', '1']],
      { 'Antet.temeiLegal': '2' },
    );
    expect(mine).toEqual([]);
  });

  it('#60 valoarea 2 ramane neatinsa (singura valoare posibila, defect #8)', () => {
    const { mine } = diff(
      'u-temei-deja-2',
      [['form1.Antet.metaDate.d_rez', '2'], ['form1.Antet.temeiLegal', '2']],
      { 'Antet.temeiLegal': '2' },
    );
    expect(mine).toEqual([]);
  });

  it('#64 CIF succesor fara bifa d_scc', () => {
    const { mine } = diff('u-cifs-fara-bifa', [['form1.Antet.cifS', CUI_VALID]], {
      'Antet.cifS': CUI_VALID,
    });
    expect(mine).toEqual([box(TITLES.conditiePrealabila, text('cifS.conditie'))]);
  });

  it('#64 cu bifa d_scc nu apare nimic', () => {
    const { mine } = diff('u-cifs-cu-bifa', [
      ['form1.Antet.metaDate.d_scc', '1'],
      ['form1.Antet.cifS', CUI_VALID],
    ]);
    expect(mine).toEqual([]);
  });
});

// ==================================================================== exit

describe('exit: anul si corelatia tip decont / luna (#43 #45 #47)', () => {
  it('#43 an sub 2024', () => {
    const { mine } = diff('u-an-2023', [[AN, '2023']], { 'Antet.metaDate.an_r': '2023' });
    expect(mine).toEqual([alert(text('an.minim'))]);
  });

  it('#43 an 2024 e acceptat', () => {
    const { mine } = diff('u-an-2024', [[AN, '2024']], { 'Antet.metaDate.an_r': '2024' });
    expect(mine).toEqual([]);
  });

  it('#45 decont trimestrial cu luna 1', () => {
    const { mine } = diff('u-tip-t-luna-1', [[LUNA, '1'], [TIP, 'T']], {
      'Antet.metaDate.tipDecont': 'L',
      'Antet.metaDate.luna_r': null,
    });
    expect(mine).toEqual([alert(text('tipDecont.T'))]);
  });

  it('#45 decont trimestrial cu luna 3', () => {
    const { mine } = diff('u-tip-t-luna-3', [[LUNA, '3'], [TIP, 'T']], {
      'Antet.metaDate.tipDecont': 'T',
      'Antet.metaDate.luna_r': '3',
    });
    expect(mine).toEqual([]);
  });

  it('#45 decont semestrial cu luna 7', () => {
    const { mine } = diff('u-tip-s-luna-7', [[LUNA, '7'], [TIP, 'S']], {
      'Antet.metaDate.tipDecont': 'L',
      'Antet.metaDate.luna_r': null,
    });
    expect(mine).toEqual([alert(text('tipDecont.S'))]);
  });

  it('#45 decont anual cu luna 6', () => {
    const { mine } = diff('u-tip-a-luna-6', [[LUNA, '6'], [TIP, 'A']], {
      'Antet.metaDate.tipDecont': 'L',
      'Antet.metaDate.luna_r': null,
    });
    expect(mine).toEqual([alert(text('tipDecont.A'))]);
  });

  it('#45 decont anual cu luna 12', () => {
    const { mine } = diff('u-tip-a-luna-12', [[LUNA, '12'], [TIP, 'A']], {
      'Antet.metaDate.tipDecont': 'A',
      'Antet.metaDate.luna_r': '12',
    });
    expect(mine).toEqual([]);
  });

  it('#47 corelatia se verifica si la iesirea din luna (ramura else)', () => {
    const { mine } = diff('u-luna-dupa-tip', [[TIP, 'S'], [LUNA, '7']], {
      'Antet.metaDate.tipDecont': 'L',
      'Antet.metaDate.luna_r': null,
    });
    expect(mine).toEqual([alert(text('tipDecont.S'))]);
  });

  it('#47 an 2024 cu luna 4', () => {
    const { mine } = diff('u-2024-luna-4', [[AN, '2024'], [LUNA, '4']], {
      'Antet.metaDate.an_r': '2024',
      'Antet.metaDate.luna_r': '4',
    });
    expect(mine).toEqual([alert(text('luna.2024'))]);
  });

  it('#47 an 2024 cu luna 5 nu produce nimic', () => {
    const { mine } = diff('u-2024-luna-5', [[AN, '2024'], [LUNA, '5']], {
      'Antet.metaDate.luna_r': '5',
    });
    expect(mine).toEqual([]);
  });

  it('#47 in 2024 mesajul de luna INLOCUIESTE corelatia (else)', () => {
    // decont anual + luna 4 in 2024: apare doar "luna >= 5", nu si "luna trebuie 12"
    const { mine } = diff('u-2024-luna-4-anual', [[AN, '2024'], [TIP, 'A'], [LUNA, '4']], {
      'Antet.metaDate.tipDecont': 'A',
      'Antet.metaDate.luna_r': '4',
    });
    expect(mine).toEqual([alert(text('luna.2024'))]);
  });
});

describe('exit: perioada (#48 #49)', () => {
  const DI = 'form1.Antet.metaDate.perioada.dataInceput';
  const DS = 'form1.Antet.metaDate.perioada.dataSfarsit';

  it('#48 format invalid', () => {
    const { mine } = diff('u-data-format', [[DI, '19 octombrie']], {
      'Antet.metaDate.perioada.dataInceput': null,
    });
    expect(mine).toEqual([box(TITLES.validareFormatData, text('data.format'))]);
  });

  it('#48 data de inceput dupa cea de sfarsit', () => {
    const { mine } = diff('u-data-ordine-inceput', [[DS, '2026-01-31'], [DI, '2026-03-01']], {
      'Antet.metaDate.perioada.dataInceput': null,
      'Antet.metaDate.perioada.dataSfarsit': '2026-01-31',
    });
    expect(mine).toEqual([alert(text('data.ordine.inceput'))]);
  });

  it('#49 data de sfarsit inainte de cea de inceput', () => {
    const { mine } = diff('u-data-ordine-sfarsit', [[DI, '2026-03-01'], [DS, '2026-01-31']], {
      'Antet.metaDate.perioada.dataInceput': '2026-03-01',
      'Antet.metaDate.perioada.dataSfarsit': null,
    });
    expect(mine).toEqual([alert(text('data.ordine.sfarsit'))]);
  });

  it('#48/#49 pereche corecta', () => {
    const { mine } = diff('u-data-corecta', [[DI, '2026-01-01'], [DS, '2026-03-31']], {
      'Antet.metaDate.perioada.dataInceput': '2026-01-01',
      'Antet.metaDate.perioada.dataSfarsit': '2026-03-31',
    });
    expect(mine).toEqual([]);
  });
});

describe('exit: coduri de identificare (#61 #70)', () => {
  it('CUI valid', () => {
    const { mine } = diff('u-cui-valid', [[CIF, CUI_VALID]], { 'identifCntr.denumire.cif': CUI_VALID });
    expect(mine).toEqual([]);
  });

  it('CUI cu cifra de control gresita', () => {
    const { mine } = diff('u-cui-invalid', [[CIF, CUI_INVALID]], {
      'identifCntr.denumire.cif': CUI_INVALID,
    });
    expect(mine).toEqual([alert(text('cui.invalid'))]);
  });

  it('CUI care incepe cu 0: DOUA alerte', () => {
    const { mine } = diff('u-cui-zero', [[CIF, '018597239']], {
      'identifCntr.denumire.cif': '018597239',
    });
    expect(mine).toEqual([alert(text('cui.zero')), alert(text('cui.invalid'))]);
  });

  it('CUI cu spatii: trimSpaces salveaza valoarea curatata', () => {
    const { mine } = diff('u-cui-spatii', [[CIF, `  ${CUI_VALID}  `]], {
      'identifCntr.denumire.cif': CUI_VALID,
    });
    expect(mine).toEqual([]);
  });

  it('NIF de 13 cifre valid (isCnpNif intoarce undefined, deci tacere)', () => {
    const { mine } = diff('u-nif-valid', [[CIF, '9000000000007']], {
      'identifCntr.denumire.cif': '9000000000007',
    });
    expect(mine).toEqual([]);
  });

  it('NIF de 13 cifre cu cifra de control gresita', () => {
    const { mine } = diff('u-nif-invalid', [[CIF, '9000000000008']], {
      'identifCntr.denumire.cif': '9000000000008',
    });
    expect(mine).toEqual([alert(text('cnp.invalid'))]);
  });

  it('acelasi algoritm pe CIF-ul succesorului', () => {
    const { mine } = diff('u-cifs-invalid', [
      ['form1.Antet.metaDate.d_scc', '1'],
      ['form1.Antet.cifS', CUI_INVALID],
    ]);
    expect(mine).toEqual([alert(text('cui.invalid'))]);
  });
});

describe('exit: seturile de caractere (#67 #125 / #73 ... #110)', () => {
  it('setul A: caractere nepermise, in ordinea aparitiei, separate prin virgula', () => {
    const { mine } = diff('u-set-a-invalid', [[DEN, 'Acme @ Co # Srl']], {
      'identifCntr.denumire.den': 'ACME @ CO # SRL',
    });
    expect(mine).toEqual([alert(text('caractere.setA', '@,#'))]);
  });

  it('setul A: ampersandul si punctuatia permisa trec', () => {
    const { mine } = diff('u-set-a-valid', [[DEN, 'Acme & Co, S.R.L.-Filiala 2']], {
      'identifCntr.denumire.den': 'ACME & CO, S.R.L.-FILIALA 2',
    });
    expect(mine).toEqual([]);
  });

  it('setul A se aplica si bancii', () => {
    const { mine } = diff('u-set-a-banca', [['form1.identifCntr.banca.den', 'Banca % Exemplu']], {
      'identifCntr.banca.den': 'BANCA % EXEMPLU',
    });
    expect(mine).toEqual([alert(text('caractere.setA', '%'))]);
  });

  it('setul B: ampersandul NU e permis in adresa', () => {
    const { mine } = diff('u-set-b-invalid', [['form1.identifCntr.adresa.str', 'Str. Mihai # 1 & 2']], {
      'identifCntr.adresa.str': 'STR. MIHAI # 1 & 2',
    });
    expect(mine).toEqual([alert(text('caractere.setB', '#,&'))]);
  });

  it('setul B: plusul e permis', () => {
    const { mine } = diff('u-set-b-valid', [['form1.identifCntr.adresa.str', 'Str. Mihai Viteazu 1-3+5']], {
      'identifCntr.adresa.str': 'STR. MIHAI VITEAZU 1-3+5',
    });
    expect(mine).toEqual([]);
  });

  it('#110 cod postal de 5 cifre', () => {
    const { mine } = diff('u-codpst-5', [['form1.identifCntr.adresa.codPst', '03016']], {
      'identifCntr.adresa.codPst': '03016',
    });
    expect(mine).toEqual([box(TITLES.formatEronat, text('codPst.lungime'))]);
  });
});

describe('exit: judetul (#86)', () => {
  it('judetul 40 completeaza localitatea si deblocheaza sectorul', () => {
    const inputs: Input[] = [[JUDET, '40'], ['form1.identifCntr.adresa.sect', '3']];
    const { mine } = diff('u-judet-40', inputs, {
      'identifCntr.adresa.loc': 'BUCURESTI',
      'identifCntr.adresa.sect': '3',
    });
    expect(mine).toEqual([]);
    expect(replay(inputs).readOnly.has('identifCntr.adresa.sect')).toBe(false);
  });

  it('alt judet blocheaza si goleste sectorul', () => {
    const inputs: Input[] = [[JUDET, '40'], ['form1.identifCntr.adresa.sect', '3'], [JUDET, '5']];
    const { mine } = diff('u-judet-5', inputs, {
      'identifCntr.adresa.judet': '5',
      'identifCntr.adresa.sect': null,
      'identifCntr.adresa.loc': null,
    });
    expect(mine).toEqual([]);
    expect(replay(inputs).readOnly.has('identifCntr.adresa.sect')).toBe(true);
  });

  it('valoare in afara nomenclatorului', () => {
    const { mine } = diff('u-judet-nomenclator', [[JUDET, '99']], {
      'identifCntr.adresa.judet': null,
    });
    expect(mine).toEqual([alert(text('nomenclator'))]);
  });
});

describe('exit: telefon, fax, email (#115 #119 #123)', () => {
  it('telefon invalid', () => {
    const { mine } = diff('u-telefon-invalid', [['form1.identifCntr.contact.telefon', '0212345']], {
      'identifCntr.contact.telefon': '0212345',
    });
    expect(mine).toEqual([alert(text('telefon.invalid'))]);
  });

  it('telefon valid', () => {
    const { mine } = diff('u-telefon-valid', [['form1.identifCntr.contact.telefon', '0211234567']], {
      'identifCntr.contact.telefon': '0211234567',
    });
    expect(mine).toEqual([]);
  });

  it('fax invalid (acelasi regex)', () => {
    const { mine } = diff('u-fax-invalid', [['form1.identifCntr.contact.fax', '1234']], {
      'identifCntr.contact.fax': '1234',
    });
    expect(mine).toEqual([alert(text('telefon.invalid'))]);
  });

  it('email invalid: messageBox fara titlu, iar valoarea se pierde', () => {
    const { mine } = diff('u-email-invalid', [['form1.identifCntr.contact.email', 'nume.contribuabil@']], {
      'identifCntr.contact.email': null,
    });
    expect(mine).toEqual([box('', text('email.invalid'))]);
  });

  it('email valid', () => {
    const { mine } = diff('u-email-valid', [['form1.identifCntr.contact.email', 'nume@domeniu.ro']], {
      'identifCntr.contact.email': 'nume@domeniu.ro',
    });
    expect(mine).toEqual([]);
  });
});

describe('exit: IBAN (#128)', () => {
  it('restul 1 inseamna IBAN corect: niciun mesaj', () => {
    const { mine } = diff('u-iban-rest-1', [[IBAN, 'RO49AAAA1B31007593840000']], {
      'identifCntr.banca.iban': 'RO49AAAA1B31007593840000',
    });
    expect(mine).toEqual([]);
  });

  it('restul 0 cade pe ramura "err == false"', () => {
    const { mine } = diff('u-iban-rest-0', [[IBAN, 'RO48AAAA1B31007593840000']], {
      'identifCntr.banca.iban': 'RO48AAAA1B31007593840000',
    });
    expect(mine).toEqual([alert(text('iban.invalid'))]);
  });

  it('restul 7 cade pe ramura "err > 1"', () => {
    const { mine } = diff('u-iban-rest-7', [[IBAN, 'RO55AAAA1B31007593840000']], {
      'identifCntr.banca.iban': 'RO55AAAA1B31007593840000',
    });
    expect(mine).toEqual([alert(text('iban.control'))]);
  });

  it('lungime gresita: tot ramura "err == false"', () => {
    const { mine } = diff('u-iban-scurt', [[IBAN, 'RO49AAAA1B3100759384']], {
      'identifCntr.banca.iban': 'RO49AAAA1B3100759384',
    });
    expect(mine).toEqual([alert(text('iban.invalid'))]);
  });

  it('tara din afara listei nu se valideaza deloc', () => {
    const { mine } = diff('u-iban-tara-straina', [[IBAN, 'US64SVBKUS6S3300958879']], {
      'identifCntr.banca.iban': 'US64SVBKUS6S3300958879',
    });
    expect(mine).toEqual([]);
  });

  it('spatiile si minusculele dispar inainte de validare', () => {
    const { mine } = diff('u-iban-spatii', [[IBAN, 'ro49 aaaa 1b31 0075 9384 0000']], {
      'identifCntr.banca.iban': 'RO49AAAA1B31007593840000',
    });
    expect(mine).toEqual([]);
  });
});

describe('exit: CAEN exclusiv (#131 #132)', () => {
  it('completarea lui caen1 goleste caen', () => {
    const { mine } = diff('u-caen-apoi-caen1', [
      ['form1.identifCntr.caen', '6201'],
      ['form1.identifCntr.caen1', '6202'],
    ], { 'identifCntr.caen': null, 'identifCntr.caen1': '6202' });
    expect(mine).toEqual([]);
  });

  it('completarea lui caen goleste caen1', () => {
    diff('u-caen1-apoi-caen', [
      ['form1.identifCntr.caen1', '6202'],
      ['form1.identifCntr.caen', '6201'],
    ], { 'identifCntr.caen': '6201', 'identifCntr.caen1': null });
  });

  it('un singur cod ramane neatins', () => {
    diff('u-caen-singur', [['form1.identifCntr.caen', '6201']], {
      'identifCntr.caen': '6201',
      'identifCntr.caen1': null,
    });
  });
});

describe('exit: TVA automat si toleranta (#136 ... #190)', () => {
  it('la iesirea din c2, coloana TVA se recalculeaza', () => {
    diff('u-tva-r9-c2', [['form1.date.livrari.r9.c2', '1000']], { 'date.livrari.r9.c3': 210 });
  });

  it.each([
    ['date.livrari.r9', 0.21],
    ['date.livrari.r10', 0.11],
    ['date.livrari.r11', 0.09],
    ['date.livrari.r12_1', 0.21],
    ['date.livrari.r12_2', 0.11],
    ['date.achizitiiIMP.r24', 0.21],
    ['date.achizitiiIMP.r25', 0.11],
    ['date.achizitiiIMP.r27_1', 0.21],
    ['date.achizitiiIMP.r27_2', 0.11],
  ])('%s: TVA in afara tolerantei', (row) => {
    const { mine } = diff(`u-tva-${row}-afara`, [
      [`form1.${row}.c2`, '1000'],
      [`form1.${row}.c3`, '1'],
    ]);
    expect(mine).toEqual([box(TITLES.atentie, text('tva.toleranta'))]);
  });

  it('garda mereu adevarata (defect #5): c2 golit scrie 0 in coloana TVA', () => {
    // aici oracolul si modelul difera DUPA recalculare (`calc.c3.null-cand-c2-null`
    // pune c3 pe null), asa ca verificam mesajele diferential si valoarea doar la noi
    const inputs: Input[] = [['form1.date.livrari.r9.c2', '1000'], ['form1.date.livrari.r9.c2', '']];
    const { mine } = diff('u-tva-r9-c2-golit', inputs);
    expect(mine).toEqual([]);
    expect(replay(inputs).values['date.livrari.r9.c3']).toBe(0);
  });

  it('TVA in interiorul tolerantei nu produce nimic', () => {
    const { mine } = diff('u-tva-r9-in-toleranta', [
      ['form1.date.livrari.r9.c2', '1000'],
      ['form1.date.livrari.r9.c3', '205'],
    ], { 'date.livrari.r9.c3': 205 });
    expect(mine).toEqual([]);
  });

  it('marginea de sus e literalul 0.10, nu 0.09 + 0.01', () => {
    // cu (cota + 0.01) === 0.09999999999999999 marginea ar fi 0 si mesajul ar aparea
    const { mine } = diff('u-tva-r11-margine', [
      ['form1.date.livrari.r11.c2', '5'],
      ['form1.date.livrari.r11.c3', '1'],
    ], { 'date.livrari.r11.c3': 1 });
    expect(mine).toEqual([]);
  });

  it('TVA golit: Math.abs(null) e 0, deci mesajul apare', () => {
    const { mine } = diff('u-tva-r9-null', [
      ['form1.date.livrari.r9.c2', '1000'],
      ['form1.date.livrari.r9.c3', ''],
    ], { 'date.livrari.r9.c3': null });
    expect(mine).toEqual([box(TITLES.atentie, text('tva.toleranta'))]);
  });
});

describe('exit: rd.29 vs rd.29.1 (#191)', () => {
  it('valoarea mai mica in modul se pierde, apoi apare alerta', () => {
    const { mine } = diff('u-r30-sub-r30-1', [
      ['form1.date.achizitiiIMP.r30_1.c2', '500'],
      ['form1.date.achizitiiIMP.r30.c2', '100'],
    ], { 'date.achizitiiIMP.r30.c2': null, 'date.achizitiiIMP.r30_1.c2': 500 });
    expect(mine).toEqual([alert(text('r30.min'))]);
  });

  it('valoarea mai mare ramane', () => {
    const { mine } = diff('u-r30-peste-r30-1', [
      ['form1.date.achizitiiIMP.r30_1.c2', '100'],
      ['form1.date.achizitiiIMP.r30.c2', '500'],
    ], { 'date.achizitiiIMP.r30.c2': 500 });
    expect(mine).toEqual([]);
  });
});

describe('exit: rd.A / rd.A1 (#203 #205 #206 #207)', () => {
  const A2 = 'form1.date.nedeductibil.r50.c2';
  const A3 = 'form1.date.nedeductibil.r50.c3';
  const A12 = 'form1.date.nedeductibil.r50_1.c2';
  const A13 = 'form1.date.nedeductibil.r50_1.c3';

  it('#203 rd.A col.Valoare sub rd.A1 col.Valoare', () => {
    const { mine } = diff('u-a-valoare-vs-a1', [[A12, '1000'], [A2, '500']]);
    expect(mine).toEqual([alert(text('A.valoare-vs-A1', 500, 1000))]);
  });

  it('#203 rd.A col.Valoare sub rd.A col.TVA', () => {
    const { mine } = diff('u-a-valoare-vs-tva', [[A3, '1000'], [A2, '500']]);
    expect(mine).toEqual([alert(text('A.valoare-vs-tva', 500, 1000))]);
  });

  it('#205 rd.A col.TVA sub rd.A1 col.TVA', () => {
    const { mine } = diff('u-a-tva-vs-a1', [[A13, '1000'], [A3, '500']]);
    expect(mine).toEqual([alert(text('A.tva-vs-A1', 500, 1000))]);
  });

  it('#205 interpolarea inversata (valoarea apare la "col.TVA")', () => {
    const { mine } = diff('u-a-tva-vs-valoare', [[A2, '500'], [A3, '1000']]);
    expect(mine).toEqual([alert(text('A.tva-vs-valoare', 500, 1000))]);
    expect(mine[0]?.text).toContain('col.TVA(500)');
    expect(mine[0]?.text).toContain('col.Valoare(1000)');
  });

  it('#206 rd.A1 col.Valoare peste rd.A col.Valoare', () => {
    const { mine } = diff('u-a1-valoare', [[A2, '500'], [A12, '1000']]);
    expect(mine).toEqual([alert(text('A.valoare-vs-A1', 500, 1000))]);
  });

  it('#207 rd.A1 col.TVA peste rd.A col.TVA', () => {
    const { mine } = diff('u-a1-tva-vs-a', [[A3, '500'], [A13, '1000']]);
    expect(mine).toEqual([alert(text('A.tva-vs-A1', 500, 1000))]);
  });

  it('#207 rd.A1 col.TVA peste rd.A1 col.Valoare', () => {
    const { mine } = diff('u-a1-tva-vs-valoare', [[A12, '500'], [A13, '1000']]);
    expect(mine).toEqual([alert(text('A1.tva-vs-valoare', 1000, 500))]);
  });

  it('valori coerente: tacere', () => {
    const { mine } = diff('u-a-coerent', [[A2, '1000'], [A3, '210'], [A12, '400'], [A13, '84']]);
    expect(mine).toEqual([]);
  });
});

describe('exit: rd.B / rd.B1 (#209 #211 #212 #213)', () => {
  const B2 = 'form1.date.nedeductibil.r60.c2';
  const B3 = 'form1.date.nedeductibil.r60.c3';
  const B12 = 'form1.date.nedeductibil.r60_1.c2';
  const B13 = 'form1.date.nedeductibil.r60_1.c3';

  it('#209 rd.B col.Valoare sub rd.B1 col.Valoare', () => {
    const { mine } = diff('u-b-valoare-vs-b1', [[B12, '1000'], [B2, '500']]);
    expect(mine).toEqual([alert(text('B.valoare-vs-B1', 500, 1000))]);
  });

  it('#209 rd.B col.Valoare sub rd.B col.TVA', () => {
    const { mine } = diff('u-b-valoare-vs-tva', [[B3, '1000'], [B2, '500']]);
    expect(mine).toEqual([alert(text('B.valoare-vs-tva', 500, 1000))]);
  });

  it('#211 rd.B col.TVA sub rd.B1 col.TVA', () => {
    const { mine } = diff('u-b-tva-vs-b1', [[B13, '1000'], [B3, '500']]);
    expect(mine).toEqual([alert(text('B.tva-vs-B1', 500, 1000))]);
  });

  it('#211 interpolarea CORECTA (spre deosebire de rd.A)', () => {
    const { mine } = diff('u-b-tva-vs-valoare', [[B2, '500'], [B3, '1000']]);
    expect(mine).toEqual([alert(text('B.tva-vs-valoare', 1000, 500))]);
    expect(mine[0]?.text).toContain('col.TVA(1000)');
    expect(mine[0]?.text).toContain('col.Valoare(500)');
  });

  it('#212 rd.B1 col.Valoare peste rd.B col.Valoare', () => {
    const { mine } = diff('u-b1-valoare', [[B2, '500'], [B12, '1000']]);
    expect(mine).toEqual([alert(text('B.valoare-vs-B1', 500, 1000))]);
  });

  it('#213 rd.B1 col.TVA peste rd.B col.TVA', () => {
    const { mine } = diff('u-b1-tva-vs-b', [[B3, '500'], [B13, '1000']]);
    expect(mine).toEqual([alert(text('B.tva-vs-B1', 500, 1000))]);
  });

  it('#213 rd.B1 col.TVA peste rd.B1 col.Valoare', () => {
    const { mine } = diff('u-b1-tva-vs-valoare', [[B12, '500'], [B13, '1000']]);
    expect(mine).toEqual([alert(text('B1.tva-vs-valoare', 1000, 500))]);
  });

  it('valori coerente: tacere', () => {
    const { mine } = diff('u-b-coerent', [[B2, '1000'], [B3, '210'], [B12, '400'], [B13, '84']]);
    expect(mine).toEqual([]);
  });

  it('comparatiile sunt in modul, deci negativele trec (A11.0.2)', () => {
    const { mine } = diff('u-b-negativ', [[B12, '-1000'], [B2, '-500']]);
    expect(mine).toEqual([alert(text('B.valoare-vs-B1', -500, -1000))]);
  });
});

// ==================================================================== corpusul

/**
 * Singurele cazuri din corpus care nu pot fi rulate fara `calculate`: bifa de
 * rambursare citeste rd.46 col.TVA, care e o valoare CALCULATA. Fara recalculare
 * rd.46 ramane null, iar `null < 5000` e adevarat, deci am emite mesajul de prag
 * acolo unde oracolul nu il emite. Le rulam mai jos cu rd.46 semanat din oracol.
 */
const CER_RECALCUL = new Set(['ramb-02-peste-prag-acceptata', 'ramb-03-exact-la-prag']);
const R46 = 'date.regularizari.r46.c3';

describe('corpusul scris de mana (harness/oracle/cases)', () => {
  const cases = loadAll({ gen: false });

  it('exista cazuri de rulat', () => {
    expect(cases.length).toBeGreaterThan(20);
  });

  for (const { case: c } of cases.filter((x) => !CER_RECALCUL.has(x.case.name))) {
    it(`${c.name}: mesajele fazei de intrari coincid cu oracolul`, () => {
      diff(c.name, c.inputs as readonly Input[]);
    });
  }

  for (const { case: c } of cases.filter((x) => CER_RECALCUL.has(x.case.name))) {
    it(`${c.name}: coincide daca rd.46 e semanat din oracol`, () => {
      const oracle = form.runCase({ name: c.name, inputs: c.inputs });
      const r46 = oracle.values[`form1.${R46}`] ?? null;
      expect(r46).toBeGreaterThanOrEqual(5000);
      diff(c.name, c.inputs as readonly Input[], {}, { [R46]: r46 });
    });
  }
});
