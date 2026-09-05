// Registrul regulilor din D300: specificatia dupa care se traduce codul original in
// modelul de domeniu. Fiecare regula are un id stabil (apare in `trace`), sursa exacta in
// legacy (numarul din legacy/extracted/scripts_index.txt sau obiect.functie), conditia
// si efectul cu semantica EXACTA a originalului, inclusiv ciudateniile. Nu se "repara"
// nimic aici; abaterile intentionate se decid dupa ce paritatea e verde (docs/DIFERENTE.md).
//
// ORDINEA DE EXECUTIE (identica cu harness/oracle/legacy-runtime.mjs, runCase):
//   pentru fiecare intrare (cale, valoare), in ordinea din caz:
//     - checkButton / exclGroup: set -> reguli `change` -> recalculate()
//     - altfel: reguli `enter` -> reguli `change` (transforma sau resping valoarea)
//               -> set -> reguli `exit` ale campului -> recalculate()
//   recalculate(): regulile `calculate` la punct fix (max 12 treceri), in ordinea din registru
//   butonul VALIDARE: `button.obligatorii` -> `button.obligatorii.mesaj` -> `button.execValidate`
//                     -> daca nu lipsesc obligatorii: `button.sumaControl` -> `button.validForm`
//                     -> daca validForm nu are erori: `xml.genXML`
// Mesajele se emit in ordinea de mai sus si se compara ordonat cu fisierele de aur.
// Textul fiecarui mesaj e VERBATIM din original (messages.ts), inclusiv diacriticele
// inconsecvente si spatiile duble.

export type RuleModule =
  | 'change' | 'enter' | 'exit' | 'calculate' | 'validate' | 'button' | 'xml' | 'checksums' | 'nrEvid';

export interface RuleSpec {
  /** id stabil; apare in trace cand regula se declanseaza */
  id: string;
  module: RuleModule;
  /** unde sta in original: #N din scripts_index.txt, sau obiect.functie din scriptobj_*.js */
  source: string;
  /** caile (fara form1.) pe care se aplica; lipseste pentru regulile globale */
  fields?: readonly string[];
  /** conditia, cu semantica exacta */
  when: string;
  /** efectul, cu semantica exacta */
  effect: string;
  /** cheia din messages.ts; textul se copiaza verbatim din sursa */
  message?: string | readonly string[];
  /** exista in original, dar e comentat sau inert: se inregistreaza, nu se implementeaza */
  dead?: true;
}

const TVA_AUTO: readonly { c2: string; c3: string; rate: number; source: string }[] = [
  { c2: 'date.livrari.r9.c2', c3: 'date.livrari.r9.c3', rate: 0.21, source: '#136/#138' },
  { c2: 'date.livrari.r10.c2', c3: 'date.livrari.r10.c3', rate: 0.11, source: '#139/#140' },
  { c2: 'date.livrari.r11.c2', c3: 'date.livrari.r11.c3', rate: 0.09, source: '#142/#143' },
  { c2: 'date.livrari.r12_1.c2', c3: 'date.livrari.r12_1.c3', rate: 0.21, source: '#149/#152' },
  { c2: 'date.livrari.r12_2.c2', c3: 'date.livrari.r12_2.c3', rate: 0.11, source: '#154/#157' },
  { c2: 'date.achizitiiIMP.r24.c2', c3: 'date.achizitiiIMP.r24.c3', rate: 0.21, source: '#175/#177' },
  { c2: 'date.achizitiiIMP.r25.c2', c3: 'date.achizitiiIMP.r25.c3', rate: 0.11, source: '#178/#180' },
  { c2: 'date.achizitiiIMP.r27_1.c2', c3: 'date.achizitiiIMP.r27_1.c3', rate: 0.21, source: '#184/#186' },
  { c2: 'date.achizitiiIMP.r27_2.c2', c3: 'date.achizitiiIMP.r27_2.c3', rate: 0.11, source: '#188/#190' },
];
export { TVA_AUTO };

export const UPPERCASE_FIELDS = [
  'identifCntr.denumire.den', 'identifCntr.adresa.str', 'identifCntr.adresa.nr', 'identifCntr.adresa.loc',
  'identifCntr.adresa.bloc', 'identifCntr.adresa.scara', 'identifCntr.adresa.etaj', 'identifCntr.adresa.apt',
  'identifCntr.banca.den', 'identifCntr.banca.iban', 'semnatura.prenume', 'semnatura.nume', 'semnatura.smnFnc',
] as const;

export const SET_A_FIELDS = ['identifCntr.denumire.den', 'identifCntr.banca.den'] as const;
export const SET_B_FIELDS = [
  'identifCntr.adresa.str', 'identifCntr.adresa.nr', 'identifCntr.adresa.loc', 'identifCntr.adresa.bloc',
  'identifCntr.adresa.scara', 'identifCntr.adresa.etaj', 'identifCntr.adresa.apt', 'identifCntr.adresa.codPst',
] as const;

export const RULES: readonly RuleSpec[] = [
  // ------------------------------------------------------------------ change
  {
    id: 'change.uppercase', module: 'change', source: '#68 #74 #77 #81 #95 #99 #103 #107 #126 #129 #214 #215 #216',
    fields: UPPERCASE_FIELDS,
    when: 'orice valoare',
    effect: 'valoarea devine toUpperCase() (A3: pe valoarea intreaga)',
  },
  {
    id: 'change.numeric.silent', module: 'change', source: '#42', fields: ['Antet.metaDate.an_r'],
    when: 'valoarea contine un caracter in afara [0-9 ]',
    effect: 'valoarea e respinsa fara mesaj (campul ramane cum era); in log apare kind "respins"',
  },
  {
    id: 'change.numeric.alert', module: 'change', source: '#62 #71 #116 #120',
    fields: ['Antet.cifS', 'identifCntr.denumire.cif', 'identifCntr.contact.telefon', 'identifCntr.contact.fax'],
    when: 'valoarea contine un caracter in afara [0-9 ]',
    effect: 'alert, apoi valoarea e respinsa (kind "respins")', message: 'doar.cifre',
  },
  {
    id: 'change.numeric.codPst', module: 'change', source: '#111', fields: ['identifCntr.adresa.codPst'],
    when: 'valoarea contine un caracter in afara [0-9 ]',
    effect: 'messageBox cu titlul "Format eronat", apoi valoarea e respinsa', message: 'doar.cifre',
  },
  {
    id: 'change.judet.clears-loc', module: 'change', source: '#87', fields: ['identifCntr.adresa.judet'],
    when: 'valoarea noua difera de cea veche (prevText = valoarea veche ca string sau "", newText = valoarea noua)',
    effect: 'identifCntr.adresa.loc = null',
  },
  {
    id: 'change.d_rez', module: 'change', source: '#52', fields: ['Antet.metaDate.d_rez'],
    when: 'dupa setare',
    effect: 'daca valoarea == 0: Antet.temeiLegal = null si temeiLegal iese din obligatorii; altfel temeiLegal devine obligatoriu (nullTest error) si = 2',
  },
  {
    id: 'change.d_scc', module: 'change', source: '#55', fields: ['Antet.metaDate.d_scc'],
    when: 'dupa setare',
    effect: 'daca valoarea == 0: Antet.cifS = null si cifS iese din obligatorii; altfel cifS devine obligatoriu',
  },
  {
    id: 'change.mtdSimplificata', module: 'change', source: '#41', fields: ['Antet.opInterne.mtdSimplificata'],
    when: 'dupa setare',
    effect: 'daca == 1: toate campurile din date.comert si date.achizitiiRO revin la valorile implicite si devin readOnly; date.achizitiiIMP.r30_1.c2 = null si readOnly. Altfel: toate devin editabile (valorile raman)',
  },
  {
    id: 'change.rambursare.prag', module: 'change', source: '#202', fields: ['date.rambursare.bifa_rambursare'],
    when: 'valoarea == "D" si date.regularizari.r46.c3 < 5000 (null < 5000 este TRUE in JS); starea e deja recalculata (A4)',
    effect: 'alert, apoi valoarea = "N"', message: 'rambursare.prag',
  },
  {
    id: 'change.ctrl-clears', module: 'change', source: '#44 #46 #87', dead: true,
    fields: ['Antet.metaDate.tipDecont', 'Antet.metaDate.luna_r', 'identifCntr.adresa.judet'],
    when: 'utilizatorul tine Ctrl apasat', effect: 'gest de UI, fara corespondent in model',
  },

  // ------------------------------------------------------------------ enter
  {
    id: 'enter.loc.judet-intai', module: 'enter', source: '#82', fields: ['identifCntr.adresa.loc'],
    when: 'identifCntr.adresa.judet == null', effect: 'alert (intrarea continua normal)', message: 'loc.judet-intai',
  },
  {
    id: 'enter.temeiLegal.conditie', module: 'enter', source: '#59', fields: ['Antet.temeiLegal'],
    when: 'Antet.metaDate.d_rez == 0', effect: 'messageBox titlu "Conditie prealabila"', message: 'temei.conditie',
  },
  {
    id: 'enter.cifS.conditie', module: 'enter', source: '#64', fields: ['Antet.cifS'],
    when: 'Antet.metaDate.d_scc == 0', effect: 'messageBox titlu "Conditie prealabila"', message: 'cifS.conditie',
  },
  {
    id: 'enter.r12.dead', module: 'enter', source: '#150 #153 #155 #158', dead: true,
    fields: ['date.livrari.r12_1.c2', 'date.livrari.r12_1.c3', 'date.livrari.r12_2.c2', 'date.livrari.r12_2.c3'],
    when: 'comentat integral', effect: 'nimic',
  },

  // ------------------------------------------------------------------ exit
  {
    id: 'exit.an.minim', module: 'exit', source: '#43', fields: ['Antet.metaDate.an_r'],
    when: 'valoarea != null si valoarea < 2024 (comparatie JS pe string)', effect: 'alert', message: 'an.minim',
  },
  {
    id: 'exit.tipDecont.corelatie', module: 'exit', source: '#45 -> utile.check_tipDecont', fields: ['Antet.metaDate.tipDecont'],
    when: 'luna_r != null; tipDecont "T" si luna nu e in {3,6,9,12,2,5,8,11}; sau "S" si luna nu e in {6,12}; sau "A" si luna != 12 (check_tipDecont copiaza luna si tipDecont in variabile locale INAINTE de cele trei if-uri, deci atribuirea tipDecont = "L" nu influenteaza conditiile urmatoare; cel mult un if se declanseaza oricum)',
    effect: 'alert, apoi tipDecont = "L" si luna_r = null', message: ['tipDecont.T', 'tipDecont.S', 'tipDecont.A'],
  },
  {
    id: 'exit.luna.2024', module: 'exit', source: '#47', fields: ['Antet.metaDate.luna_r'],
    when: 'an_r == 2024 si luna < 5', effect: 'alert; ALTFEL (else) ruleaza utile.check_tipDecont ca la exit.tipDecont.corelatie', message: 'luna.2024',
  },
  {
    id: 'exit.perioada.data', module: 'exit', source: '#48 #49',
    fields: ['Antet.metaDate.perioada.dataInceput', 'Antet.metaDate.perioada.dataSfarsit'],
    when: 'format: rawValue == formattedValue (adica valoarea nu e o data ISO yyyy-mm-dd) -> messageBox si null; altfel dataInceput > dataSfarsit (comparatie de string ISO) -> alert si campul curent = null',
    effect: 'vezi when; campurile nu ajung in XML', message: ['data.format', 'data.ordine.inceput', 'data.ordine.sfarsit'],
  },
  {
    id: 'exit.temeiLegal.fortat', module: 'exit', source: '#60', fields: ['Antet.temeiLegal'],
    when: 'd_rez == 1 (imposibil, d_rez e 0 sau 2) sau valoarea == 1', effect: 'valoarea = 2. Net: temeiLegal poate fi doar 2 sau null (defect #8)',
  },
  {
    id: 'exit.cif.identificare', module: 'exit', source: '#61 #70 -> valid.isCUI / valid.isCnpNif',
    fields: ['Antet.cifS', 'identifCntr.denumire.cif'],
    when: 'valoarea != null: se aplica utile.trimSpaces si se salveaza; lungime <= 10 -> isCUI; altfel lungime <= 13 -> isCnpNif; peste 13 nimic',
    effect: 'daca testul e false: alert cui.invalid respectiv cnp.invalid. isCUI insusi emite alert cui.zero inainte de a intoarce false cand primul caracter e "0"',
    message: ['cui.invalid', 'cnp.invalid', 'cui.zero'],
  },
  {
    id: 'exit.caractere.setA', module: 'exit', source: '#67 #125 -> utile.trimSpaces, utile.invalidChr', fields: SET_A_FIELDS,
    when: 'valoarea !== null: trim si salvare; string.match(/[^0-9a-zA-Z,.\\-& ]/g) != null',
    effect: 'alert cu caracterele gasite interpolate: String(array) = elementele unite cu virgula', message: 'caractere.setA',
  },
  {
    id: 'exit.caractere.setB', module: 'exit', source: '#73 #76 #80 #94 #98 #102 #106 #110', fields: SET_B_FIELDS,
    when: 'valoarea !== null: trim si salvare; string.match(/[^0-9a-zA-Z,.\\-+ ]/g) != null',
    effect: 'alert cu caracterele gasite interpolate', message: 'caractere.setB',
  },
  {
    id: 'exit.codPst.lungime', module: 'exit', source: '#110', fields: ['identifCntr.adresa.codPst'],
    when: 'dupa exit.caractere.setB, valoarea !== null si lungimea != 6', effect: 'messageBox titlu "Format eronat"', message: 'codPst.lungime',
  },
  {
    id: 'exit.judet', module: 'exit', source: '#86', fields: ['identifCntr.adresa.judet'],
    when: 'valoarea nu e in lista (imposibil prin model, se pastreaza pentru completitudine) -> null + alert nomenclator; apoi: valoarea == 40',
    effect: '== 40: identifCntr.adresa.loc = "BUCURESTI", sect devine editabil; altfel sect devine readOnly si sect = null',
    message: 'nomenclator',
  },
  {
    id: 'exit.telefon', module: 'exit', source: '#115 #119 -> checksums.telefon', fields: ['identifCntr.contact.telefon', 'identifCntr.contact.fax'],
    when: 'valoarea != null si regex-ul de telefon nu se potriveste', effect: 'alert (valoarea ramane)', message: 'telefon.invalid',
  },
  {
    id: 'exit.email', module: 'exit', source: '#123 -> checksums.email', fields: ['identifCntr.contact.email'],
    when: 'valoarea != null si regex-ul de email nu se potriveste', effect: 'messageBox, apoi valoarea = null', message: 'email.invalid',
  },
  {
    id: 'exit.iban', module: 'exit', source: '#128 -> valid.isValidIBANNumber, valid.mod97', fields: ['identifCntr.banca.iban'],
    when: 'valoarea != null: se scot toate spatiile (replace(/ /g) apoi utile.remSpaces) si se salveaza; codul de tara (primele 2) e in lista CODE din #128',
    effect: 'err = isValidIBANNumber(valoare), care intoarce false (sintaxa/lungime) sau NUMARUL mod97 (0..96). "err == false" e adevarat pentru false SI pentru 0 -> alert iban.invalid; "err > 1" e adevarat pentru resturile 2..96 -> alert iban.control. Restul 1 (IBAN valid) nu emite nimic. Tara in afara listei: nicio validare',
    message: ['iban.invalid', 'iban.control'],
  },
  {
    id: 'exit.caen.exclusiv', module: 'exit', source: '#131 #132', fields: ['identifCntr.caen', 'identifCntr.caen1'],
    when: 'la iesirea din caen: caen1 nenul si != "" ; la iesirea din caen1: caen nenul', effect: 'celalalt camp = null',
  },
  {
    id: 'exit.tva.auto', module: 'exit', source: TVA_AUTO.map((t) => t.source).join(' '), fields: TVA_AUTO.map((t) => t.c2),
    when: 'garda "rawValue != \\"\\" || rawValue != null" e mereu adevarata (defect #5)',
    effect: 'c3 = Math.round(c2 * cota) unde null * cota = 0; cotele: vezi TVA_AUTO',
  },
  {
    id: 'exit.tva.toleranta', module: 'exit', source: TVA_AUTO.map((t) => t.source).join(' '), fields: TVA_AUTO.map((t) => t.c3),
    when: 'vv = Math.abs(c2) (null -> 0); lo = Math.round(vv * LITERAL_JOS), hi = Math.round(vv * LITERAL_SUS), unde literalii sunt EXACT cei din sursa (0.20/0.22 pentru 21%, 0.10/0.12 pentru 11%, 0.08/0.10 pentru 9%), NU cota +- 0.01: in virgula mobila 0.09 + 0.01 = 0.09999999999999999 si rotunjirea diverge de la vv = 5 in sus; garda mereu adevarata; lo > Math.abs(c3) || Math.abs(c3) > hi (c3 null -> 0)',
    effect: 'messageBox titlu "Atenţie:" (valoarea ramane)', message: 'tva.toleranta',
  },
  {
    id: 'exit.r30.min', module: 'exit', source: '#191', fields: ['date.achizitiiIMP.r30.c2'],
    when: 'valoarea si date.achizitiiIMP.r30_1.c2 nenule si Math.abs(valoare) < Math.abs(r30_1.c2)',
    effect: 'valoarea = null, APOI alert', message: 'r30.min',
  },
  {
    id: 'exit.nedeductibil.A', module: 'exit', source: '#203 #205 #206 #207',
    fields: ['date.nedeductibil.r50.c2', 'date.nedeductibil.r50.c3', 'date.nedeductibil.r50_1.c2', 'date.nedeductibil.r50_1.c3'],
    when: 'toate comparatiile in Math.abs, doar cand ambii operanzi sunt nenuli; r50.c2: (|A|<|A1|) -> A.valoare-vs-A1, apoi (|A|<|tvaA|) -> A.valoare-vs-tva; r50.c3: (|tvaA1|>|tvaA|) -> A.tva-vs-A1, apoi (|A|<|tvaA|) -> A.tva-vs-valoare (textul interpoleaza A ca TVA si tvaA ca Valoare: se copiaza asa); r50_1.c2: (|A|<|A1|) -> A.valoare-vs-A1; r50_1.c3: (|tvaA1|>|tvaA|) -> A.tva-vs-A1, apoi (|A1|<|tvaA1|) -> A1.tva-vs-valoare',
    effect: 'doar alert-uri, cu valorile interpolate ca in original; nicio valoare nu se schimba',
    message: ['A.valoare-vs-A1', 'A.valoare-vs-tva', 'A.tva-vs-A1', 'A.tva-vs-valoare', 'A1.tva-vs-valoare'],
  },
  {
    id: 'exit.nedeductibil.B', module: 'exit', source: '#209 #211 #212 #213',
    fields: ['date.nedeductibil.r60.c2', 'date.nedeductibil.r60.c3', 'date.nedeductibil.r60_1.c2', 'date.nedeductibil.r60_1.c3'],
    when: 'identic cu exit.nedeductibil.A, cu B/B1 si mesajele B', effect: 'doar alert-uri',
    message: ['B.valoare-vs-B1', 'B.valoare-vs-tva', 'B.tva-vs-B1', 'B.tva-vs-valoare', 'B1.tva-vs-valoare'],
  },
  {
    id: 'exit.dead', module: 'exit', source: '#134 #135 #159 #160 #194', dead: true,
    fields: ['date.comert.r7_1.c2', 'date.comert.r7_1.c3', 'date.livrari.r17.c2', 'date.livrari.r17.c3', 'date.achizitiiIMP.r32.c3'],
    when: 'comentat integral (corelatiile rd.7/7.1 si rd.17 eliminate in A11.0.5)', effect: 'nimic',
  },

  // ------------------------------------------------------------------ calculate
  {
    id: 'calc.nr_evid', module: 'calculate', source: '#38 -> utile.manageRegistrationNumber, calculateRegistrationNumber', fields: ['Antet.nr_evid'],
    when: 'la fiecare recalculare',
    effect: 'nr_evid devine obligatoriu (nullTest error); nr_evid = null; daca an_r si luna_r sunt nenule: nr_evid = calculateRegistrationNumber(new Date(an, luna-1)) (vezi nrEvid.ts)',
  },
  {
    id: 'calc.c3.null-cand-c2-null', module: 'calculate', source: '#137 #141 #144 #151 #156 #176 #179',
    fields: ['date.livrari.r9.c3', 'date.livrari.r10.c3', 'date.livrari.r11.c3', 'date.livrari.r12_1.c3', 'date.livrari.r12_2.c3', 'date.achizitiiIMP.r24.c3', 'date.achizitiiIMP.r25.c3'],
    when: 'c2 == null', effect: 'c3 = null',
  },
  {
    id: 'calc.formcalc.sum', module: 'calculate',
    source: '#146 #148 #161 #162 #163-#174 #181-#183 #185 #187 #189 #192 #193 (FormCalc, "$ = a + b + ...")',
    fields: [
      'date.livrari.r12.c2', 'date.livrari.r12.c3', 'date.livrari.r19.c2', 'date.livrari.r19.c3',
      'date.achizitiiRO.r20.c2', 'date.achizitiiRO.r20.c3', 'date.achizitiiRO.r20_1.c2', 'date.achizitiiRO.r20_1.c3',
      'date.achizitiiRO.r21.c2', 'date.achizitiiRO.r21.c3', 'date.achizitiiRO.r22.c2', 'date.achizitiiRO.r22.c3',
      'date.achizitiiRO.r22_1.c2', 'date.achizitiiRO.r22_1.c3', 'date.achizitiiRO.r23.c2', 'date.achizitiiRO.r23.c3',
      'date.achizitiiIMP.r27.c2', 'date.achizitiiIMP.r27.c3', 'date.achizitiiIMP.r27_1.c2', 'date.achizitiiIMP.r27_1.c3',
      'date.achizitiiIMP.r27_2.c2', 'date.achizitiiIMP.r27_2.c3', 'date.achizitiiIMP.r31.c2', 'date.achizitiiIMP.r31.c3',
    ],
    when: 'la fiecare recalculare',
    effect: 'campul = suma termenilor, cu null tratat ca 0 si rezultat MEREU numar (A1). Lista exacta a termenilor se copiaza din legacy/extracted/scripts_all.js (liniile active, nu cele comentate); r19.c2 NU include r3_1, r5_1, r7_1; r19.c3 include doar r5-r8, r9-r12, r16-r18',
  },
  {
    id: 'calc.r36', module: 'calculate', source: '#195', fields: ['date.achizitiiIMP.r36.c3'],
    when: 'la fiecare recalculare',
    effect: 'suma = r32.c3 + r33.c3 + r34.c3 + r35.c3 cu aritmetica JS (null -> 0); "if (suma != null)" e mereu adevarat; r36.c3 = suma',
  },
  {
    id: 'calc.regularizari', module: 'calculate', source: '#196-#201',
    fields: ['date.regularizari.r37.c3', 'date.regularizari.r38.c3', 'date.regularizari.r41.c3', 'date.regularizari.r44.c3', 'date.regularizari.r45.c3', 'date.regularizari.r46.c3'],
    when: 'la fiecare recalculare, aritmetica JS (null -> 0)',
    effect: 'r37 = (r36.c3 - r19.c3) > 0 ? diferenta : 0; r38 = (r19.c3 - r36.c3) > 0 ? diferenta : 0; r41 = r38 + r39 + r40; r44 = r37 + r42 + r43; r45 = (r41 - r44) > 0 ? diferenta : 0; r46 = (r44 - r41) > 0 ? diferenta : 0 (toate pe coloana c3)',
  },

  // ------------------------------------------------------------------ validate (execValidate)
  {
    id: 'validate.proRata', module: 'validate', source: '#133', fields: ['identifCntr.proRata'],
    when: 'NU (valoare != null si 0 <= valoare <= 100); deci si null declanseaza', effect: 'alert, apoi valoarea = 100', message: 'proRata.interval',
  },
  {
    id: 'validate.dead', module: 'validate', source: '#145 #147 #204 #208 #210', dead: true,
    fields: ['date.livrari.r12.c2', 'date.livrari.r12.c3', 'date.nedeductibil.r50.c3', 'date.nedeductibil.r60.c2', 'date.nedeductibil.r60.c3'],
    when: 'comentat integral (defect #7)', effect: 'nimic',
  },

  // ------------------------------------------------------------------ butonul VALIDARE
  {
    id: 'button.obligatorii', module: 'button', source: '#18 -> oblig.CheckForErrors(form1)',
    when: 'la apasare (mouseUp), inaintea click-ului',
    effect: 'errMsg = santinela, errCount = ""; parcurge campurile in ordinea documentului (fields.json): un camp cu nullTest != "disabled" (cele 13 din template plus cele facute obligatorii dinamic: temeiLegal prin change.d_rez, cifS prin change.d_scc, nr_evid prin calc.nr_evid) si rawValue === null (sau === "000") devine evidentiat (highlighted), errMsg += "\\n\\t- " + toolTip, errCount += 1 CA STRING ("" + 1 + 1 = "11"). Grupurile radio cu rawValue === "" si bifele obligatorii cu 0 la fel (nu exista in template)',
  },
  {
    id: 'button.obligatorii.mesaj', module: 'button', source: '#13 (primele linii)',
    when: 'errMsg != santinela (deci a lipsit cel putin un camp)',
    effect: 'n = errCount.length; txt1/txt2 = "camp."/"campul evidentiat" daca n == 1, "campuri."/"campurile evidentiate" daca n > 1; messageBox(mesaj compus, titlu "Date incomplete"); marcheaza valid = 1 (blocheaza restul)',
    message: 'obligatorii.generic',
  },
  {
    id: 'button.execValidate', module: 'button', source: '#13 execValidate()',
    when: 'intotdeauna, dupa mesajul de obligatorii si INAINTE de if (valid == 0)', effect: 'ruleaza toate regulile validate.*',
  },
  {
    id: 'button.sumaControl', module: 'button', source: '#13 (suma inline; utile.sumaControl e cod mort, defect #4)', fields: ['Antet.metaDate.totalPlata_A'],
    when: 'doar daca nu au lipsit obligatorii',
    effect: 'totalPlata_A = suma cu "+" JS a celulelor din lista inline din #13 (null -> 0; toate null -> 0). Lista se copiaza din scripts_all.js #13, nu din utile.sumaControl',
  },
  {
    id: 'button.validForm', module: 'button', source: 'genValid.validForm',
    when: 'doar daca nu au lipsit obligatorii, dupa sumaControl',
    effect: 'construieste mesaj = concatenarea "EROARE - ...\\r\\n" pentru fiecare verificare picata, IN ORDINEA din functie (an null; luna null; an < 2024; an == 2024 && luna < 5; d_rez null; d_rez == 2 && temeiLegal null; mtdSimplificata null; nume; prenume; smnFnc; cif; den; banca.den; iban; caen si caen1 ambele goale; tipDecont; proRata; bifa_cereale; bifa_mob; bifa_disp; bifa_cons; bifa_rambursare; nr_evid; r19.c2; r19.c3; r31.c2; r31.c3; r36.c3; r37.c3; r38.c3; (r42.c3 > 0 && r39.c3 != 0); (r39.c3 > 0 && r42.c3 != 0); r41.c3; r44.c3; r45.c3; r46.c3; totalPlata_A). Textele verbatim din scriptobj_genValid.js. Daca mesaj nevid: messageBox validForm.invalid titlu "D300", erori = mesaj, xml = null. Altfel: erori = null, xml.genXML, messageBox validForm.valid titlu "D300"',
    message: ['validForm.invalid', 'validForm.valid'],
  },

  {
    id: 'button.blochez', module: 'button', source: 'genValid.validForm -> formular.blochez', fields: ['Antet.IdDoc.formValid'],
    when: 'validForm fara erori, dupa genXML',
    effect: 'Antet.IdDoc.formValid = "FORMULAR VALIDAT" (stampila din antet). Restul lui blochez (toate campurile readOnly, butoanele de listare/deblocare) e comportament de UI: interfata blocheaza formularul pana la "Deblocare", care il readuce la "FORMULAR NEVALIDAT"',
  },

  // ------------------------------------------------------------------ xml
  {
    id: 'xml.genXML', module: 'xml', source: 'genValid.genXML + conversii.schEnt; ordinea in rows.ts XML_ATTRIBUTES',
    when: 'validForm fara erori',
    effect: '"<?xml version=\\"1.0\\"?>\\n<declaratie300" + pentru fiecare intrare din XML_ATTRIBUTES cu valoare nenula: " attr=\\"" + schEnt(String(valoare)) + "\\""; judet in adresa prin editValue (textul afisat, ex. "B--Bucuresti"); adresa = schEnt(concatenarea "eticheta: schEnt(valoare), " a partilor nenule, ultima (cod postal) fara ", " final) doar daca nevida (escapare dubla, ca in original); caen si caen1 emit AMBELE atributul "caen" daca sunt nenule (defect #2); apoi " xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" xsi:schemaLocation=\\"" + XML_SCHEMA_LOCATION + "\\" xmlns=\\"" + XML_NAMESPACE + "\\">" + "</declaratie300>". encodeURI/decodeURI din original se anuleaza reciproc: iesirea e sirul brut',
  },

  // ------------------------------------------------------------------ algoritmi
  {
    id: 'checksums.cui', module: 'checksums', source: 'valid.isCUI, valid.isNumeric, valid.strReverse',
    when: 'apelat din exit.cif.identificare',
    effect: 'false daca nu e numeric; daca primul caracter e "0": alert cui.zero si false; cheia "753217532" inversata, suma ponderata a cifrelor inversate (fara cifra de control) * 10, mod 11; 10 corespunde controlului "0"',
    message: 'cui.zero',
  },
  {
    id: 'checksums.cnp', module: 'checksums', source: 'valid.isCNP, valid.getDaysInMonth',
    when: 'apelat din valid.isCnpNif pentru prima cifra != 9',
    effect: 'exact ca originalul, INCLUSIV expresia "day == 0 / day > getDaysInMonth(...)", care se grupeaza ca day == ((0/day) > zile), adica e echivalenta cu day === 0: ziua 00 e respinsa, dar ziua prea mare (32, 31 februarie) nu se verifica niciodata (defect #3); secolul dupa prima cifra; anul intre 1800 si 2099; hash cu ponderile 279146358279 mod 11, 10 -> 1',
  },
  {
    id: 'checksums.cnpNif', module: 'checksums', source: 'valid.isCnpNif',
    when: 'apelat din exit.cif.identificare pentru lungime 11-13', effect: 'lungime != 13 -> false; prima cifra 9 -> doar hash-ul; altfel isCNP',
  },
  {
    id: 'checksums.iban', module: 'checksums', source: 'valid.isValidIBANNumber, valid.mod97 (nu valid.isIban, care nu e apelata)',
    when: 'apelat din exit.iban', effect: 'exact ca originalul: tabelul CODE_LENGTHS, regex-ul, rearanjarea, mod97 pe fragmente de 7',
  },
  {
    id: 'checksums.telefon', module: 'checksums', source: '#115 regTel', when: '-', effect: 'regex-ul copiat verbatim',
  },
  {
    id: 'checksums.email', module: 'checksums', source: '#123 reg', when: '-', effect: 'regex-ul copiat verbatim',
  },
  {
    id: 'checksums.text', module: 'checksums', source: 'utile.trimSpaces, utile.remSpaces, utile.invalidChr, utile.roundNumber',
    when: '-', effect: 'semantica exacta din scriptobj_utile.js (roundNumber(null) intoarce undefined; null * cota = 0 deci nu apare)',
  },
  {
    id: 'nrEvid.calcul', module: 'nrEvid', source: 'utile.calculateRegistrationNumber, utile.getReferencePeriod',
    when: 'apelat din calc.nr_evid',
    effect: '"10" + cod (L 301, T 302, S 303, A 304; alt tipDecont ramane string-ul brut) + "01" + LL + AA + ZZLLAA termen + "0" + "000" + suma cifrelor. ATENTIE: originalul vrea "ultimele 2 cifre", dar scrie ("" + suma).substr(suma.length - 2) pe un NUMAR, deci substr(NaN) = substr(0): se adauga INTREGUL sir al sumei (coincide cu 2 cifre doar cand suma are exact 2 cifre). Termen: L/T -> 25 a lunii urmatoare (decembrie -> 25.01 anul urmator); S -> endYear = (refMonth < 9 ? an : an+1), endMonth = 6 pentru lunile 1-6 si 0 pentru 7-12, deci lunile 7, 8, 9 dau 25.01 ACELASI an (inaccesibil prin UI, dar se reproduce); A -> endMonth ramane "" (Date(endYear, "", 25) => luna 0, adica 25 ianuarie; decembrie -> anul urmator). Copiaza logica cu Date, nu o rescrie',
  },
];

export const RULE_BY_ID: ReadonlyMap<string, RuleSpec> = new Map(RULES.map((r) => [r.id, r]));
export const LIVE_RULE_IDS: readonly string[] = RULES.filter((r) => !r.dead).map((r) => r.id);
