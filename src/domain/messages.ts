// Textele mesajelor din D300, VERBATIM din original: aceleasi diacritice inconsecvente
// (uneori ţ cu sedila, uneori fara), aceleasi spatii duble si aceleasi `\n`-uri.
// Fiecare cheie poarta in comentariu sursa: #N din legacy/extracted/scripts_index.txt
// sau `obiect.functie` din scriptobj_*.js.
//
// Cheile sunt exact cele referite in `rules/registry.ts` (campul `message`), plus
// cateva pe care registry-ul nu le numeste dar originalul le emite (vezi comentarii).
// Mesajele interpolate sunt functii; argumentele au ordinea din original, inclusiv
// acolo unde originalul le incurca (`A.tva-vs-valoare`).

import type { FieldValue } from './fields';

/** Titlurile ferestrelor `xfa.host.messageBox`, verbatim. */
export const TITLES = {
  /** #110, #111 */
  formatEronat: 'Format eronat',
  /** #138 si celelalte verificari de toleranta TVA */
  atentie: 'Atenţie:',
  /** #59, #64 */
  conditiePrealabila: 'Conditie prealabila',
  /** #13 */
  dateIncomplete: 'Date incomplete',
  /** genValid.validForm */
  d300: 'D300',
  /** #48, #49 */
  validareFormatData: 'VALIDARE FORMAT DATA',
} as const;

export const MESSAGES = {
  // ------------------------------------------------------------------ change
  /** #62, #71, #116, #120 (alert) si #111 (messageBox, titlu "Format eronat") */
  'doar.cifre': 'Trebuie sa introduceti numai caractere numerice!',
  /** #202 */
  'rambursare.prag':
    'Nu puteti solicita rambursare daca Soldul sumei negative de TVA la sfârşitul perioadei de raportare (Rd.46) < 5000 !',

  // ------------------------------------------------------------------ enter
  /** #82 (spatiul de la inceput e in original) */
  'loc.judet-intai': ' Mai intai, trebuie sa completati campul Judet!',
  /** #59 */
  'temei.conditie':
    "Mai intai trebuie sa activati casuta 'Declaratie depusa dupa anularea rezervei verificarii ulterioare'!",
  /** #64 */
  'cifS.conditie':
    "Mai intai trebuie sa activati casuta 'Declarație depusă potrivit art.90 alin.(4) din Legea nr.207/2015 privind Codul de procedură fiscală'!",

  // ------------------------------------------------------------------ exit
  /** #43 */
  'an.minim': 'Anul trebuie sa fie mai mare sau egal cu 2024!',
  /** utile.check_tipDecont (`mesajT`) */
  'tipDecont.T':
    'Pentru decont trimestrial luna de raportare trebuie sa fie 3,6,9,12 sau 2,5,8,11 (achizitii intracomunitare).',
  /** utile.check_tipDecont (`mesajS`) */
  'tipDecont.S': 'Pentru decont semestrial luna de raportare trebuie sa fie 6 sau 12.',
  /** utile.check_tipDecont (`mesajA`) */
  'tipDecont.A': 'Pentru decont anual luna de raportare trebuie sa fie 12.',
  /** #47 */
  'luna.2024': 'Daca an = 2024, atunci luna >= 5!',
  /** #48, #49 (titlu "VALIDARE FORMAT DATA") */
  'data.format':
    'Ati introdus un format invalid pentru data. Utilizati calendarul sau introduceti data in formatul ZZ.LL.AAAA (ex. 19.10.2013).',
  /** #48 */
  'data.ordine.inceput': "'Data sfarsit' < 'Data inceput'",
  /** #49 (textul zice "contract", desi campurile sunt perioada de raportare) */
  'data.ordine.sfarsit': "'Data sfarsit contract' < 'Data inceput contract'",
  /** #61, #70 */
  'cui.invalid':
    'Cod de identificare fiscală(CUI) invalid!\n\nTrebuie sa introduceti un cod de identificare valid.',
  /** #61, #70 */
  'cnp.invalid':
    'Cod de identificare fiscală(CNP sau NIF) invalid!\n\nTrebuie sa introduceti un cod de identificare valid.',
  /** valid.isCUI (emis din interiorul algoritmului, inainte de a intoarce false) */
  'cui.zero':
    'Primul caracter al unui Cod Unic de Identificare nu poate fi 0(zero)!\n\nCorectati valoarea introdusa...',
  /** #67, #125 — `res` e `String(vectorul de potriviri)`, adica unite cu virgula */
  'caractere.setA': (res: string): string =>
    'Ati introdus caracterele nepermise: ' + res + '\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul ampersand (&) si spatii ( ).',
  /** #73, #76, #80, #94, #98, #102, #106, #110 */
  'caractere.setB': (res: string): string =>
    'Ati introdus caracterele nepermise: ' + res + '\nEliminati caracterele indicate si continuati completarea formularului.\n\nIntroduceti text fara caractere speciale. Puteti sa folositi literele alfabetului latin (A-Z, a-z), cifrele arabe (0-9), semnul virgula (,), semnul punct (.), semnul minus (-), semnul plus (+) si spatii ( ).',
  /** #110 (titlu "Format eronat") */
  'codPst.lungime': 'Trebuie sa introduceti 6(sase) caractere numerice!',
  /** #86 */
  'nomenclator': 'Valoarea introdusa nu exista in nomenclator!\n\nReluati introducerea datelor...',
  /** #115, #119 (spatiul dinaintea lui \n e in original) */
  'telefon.invalid': 'Trebuie sa introduceti o valoare corecta pentru telefon! \nDe exemplu 0211234567',
  /** #123 (messageBox fara titlu) */
  'email.invalid':
    'Nu aţi introdus un format valid pentru email!\n \nAcest câmp opţional trebuie să includă o adresă de e-mail validă la care să puteţi fi contactat.\n \nO adresa de e-mail are forma: [utilizator]@[domeniu].[TLD].De exemplu: nume.contribuabil@nume.domeniu.ro\n \nLimita maximă pentru acest câmp este de 200 de caractere. Nu introduceti spatii.',
  /** #128, ramura `err == false` (sintaxa sau lungime gresita) */
  'iban.invalid': 'Validare lungime si sintaxa:\n\nEROARE - Cont bancar(IBAN) invalid!',
  /**
   * #128, ramura `err > 1`. registry.ts o declara moarta ("functia intoarce boolean"),
   * dar `valid.isValidIBANNumber` intoarce restul mod 97, deci ramura CHIAR se
   * declanseaza pentru un IBAN cu cifra de control gresita (cazul id-06 din corpus).
   */
  'iban.control': 'Validare cifra de control:\n\nEROARE - Cont bancar(IBAN) invalid!',
  /** #138 si celelalte perechi c3 (titlu "Atenţie:"); varianta cu sume interpolate e comentata in original */
  'tva.toleranta':
    'ATENTIE!\n\nSuma introdusă diferă substanţial fată de cea calculată automat!\n\nDiferenta recomandata este de +/- 1%.',
  /** #191 (numerele din text sunt cele vechi: rd.30 = rd.29 afisat azi) */
  'r30.min': 'Rd.30 nu poate fi mai mic decat rd.30.1!',

  // ------------------------------------------------------------------ rd. A / A1
  /** #203, #206 */
  'A.valoare-vs-A1': (a: FieldValue, a1: FieldValue): string =>
    'EROARE!\n\n Rd.A col.Valoare(' + String(a) + ') nu poate fi mai mic decat Rd.A1 col.Valoare(' + String(a1) + ')!',
  /** #203 */
  'A.valoare-vs-tva': (a: FieldValue, tva: FieldValue): string =>
    'EROARE!\n\n Rd.A col.Valoare(' + String(a) + ') nu poate fi mai mic decat Rd.A col.TVA(' + String(tva) + ')!',
  /** #205, #207 */
  'A.tva-vs-A1': (tvaA: FieldValue, tvaA1: FieldValue): string =>
    'EROARE!\n\n Rd.A col.TVA(' + String(tvaA) + ') nu poate fi mai mic decat Rd.A1 col.TVA(' + String(tvaA1) + ')!',
  /**
   * #205. Originalul interpoleaza INVERS: pe pozitia "col.TVA" pune valoarea din c2
   * si pe pozitia "col.Valoare" pune TVA-ul. Pastram argumentele in ordinea sursei.
   */
  'A.tva-vs-valoare': (a: FieldValue, tvaA: FieldValue): string =>
    'EROARE!\n\n Rd.A col.TVA(' + String(a) + ') nu poate fi mai mare decat Rd.A col.Valoare(' + String(tvaA) + ')!',
  /** #207 */
  'A1.tva-vs-valoare': (tvaA1: FieldValue, a1: FieldValue): string =>
    'EROARE!\n\n Rd.A1 col.TVA(' + String(tvaA1) + ') nu poate fi mai mare decat Rd.A1 col.Valoare(' + String(a1) + ')!',

  // ------------------------------------------------------------------ rd. B / B1
  /** #209, #212 */
  'B.valoare-vs-B1': (b: FieldValue, b1: FieldValue): string =>
    'EROARE!\n\n Rd.B col.Valoare(' + String(b) + ') nu poate fi mai mic decat Rd.B1 col.Valoare(' + String(b1) + ')!',
  /** #209 */
  'B.valoare-vs-tva': (b: FieldValue, tva: FieldValue): string =>
    'EROARE!\n\n Rd.B col.Valoare(' + String(b) + ') nu poate fi mai mic decat Rd.B col.TVA(' + String(tva) + ')!',
  /** #211, #213 */
  'B.tva-vs-B1': (tvaB: FieldValue, tvaB1: FieldValue): string =>
    'EROARE!\n\n Rd.B col.TVA(' + String(tvaB) + ') nu poate fi mai mic decat Rd.B1 col.TVA(' + String(tvaB1) + ')!',
  /** #211. Spre deosebire de `A.tva-vs-valoare`, aici originalul interpoleaza corect. */
  'B.tva-vs-valoare': (tvaB: FieldValue, b: FieldValue): string =>
    'EROARE!\n\n Rd.B col.TVA(' + String(tvaB) + ') nu poate fi mai mare decat Rd.B col.Valoare(' + String(b) + ')!',
  /** #213 */
  'B1.tva-vs-valoare': (tvaB1: FieldValue, b1: FieldValue): string =>
    'EROARE!\n\n Rd.B1 col.TVA(' + String(tvaB1) + ') nu poate fi mai mare decat Rd.B1 col.Valoare(' + String(b1) + ')!',

  // ------------------------------------------------------------------ validate / buton
  /** #133 */
  'proRata.interval': 'Pro-rata de deducere trebuie sa fie >= 0 si <= 100',
  /**
   * #18: valoarea santinela pusa in `errMsg` inaintea lui `oblig.CheckForErrors`.
   * #13 o compara ca sa afle daca a lipsit vreun camp. Nu e afisata niciodata.
   */
  'obligatorii.sentinela':
    'Nu ati completat toate campurile obligatorii. Verificati formularul si completati toate campurile evidentiate:',
  /**
   * #13 (titlu "Date incomplete"). `n` e `errCount.value.length`, adica LUNGIMEA
   * sirului de "1"-uri concatenate de oblig.CheckForErrors, deci numarul de campuri
   * lipsa. Pentru n care nu e nici 1 nici > 1, `txt1`/`txt2` raman nedefinite si
   * originalul scrie literal "undefined" — reproducem si asta.
   */
  'obligatorii.generic': (n: number): string => {
    let txt1: string | undefined;
    let txt2: string | undefined;
    if (n === 1) { txt1 = 'camp.'; txt2 = 'campul evidentiat'; }
    if (n > 1) { txt1 = 'campuri.'; txt2 = 'campurile evidentiate'; }
    return 'Nu ati completat toate campurile obligatorii!\n\nTrebuie sa mai completati '
      + n + ' ' + String(txt1) + '\nCompletati ' + String(txt2) + ' cu culoarea rosu! \n\nMultumesc!';
  },
  /** genValid.validForm, ramura cu erori (titlu "D300") */
  'validForm.invalid': 'Verificati fisierul atasat pentru erori si avertizari!\n\nFormularul nu este valid!',
  /** genValid.validForm, ramura fara erori (titlu "D300") */
  'validForm.valid': 'Formularul este valid.\n\nA fost atasat fisierul D300.xml.',
};

export type MessageKey = keyof typeof MESSAGES;

type ArgsOf<V> = V extends (...args: infer A) => string ? A : [];

/** Textul unui mesaj; pentru cheile interpolate primeste argumentele din original. */
export function text<K extends MessageKey>(key: K, ...args: ArgsOf<(typeof MESSAGES)[K]>): string {
  const m: string | ((...a: never[]) => string) = MESSAGES[key];
  if (typeof m === 'string') return m;
  // singura conversie necesara: TypeScript nu poate lega `ArgsOf<K>` de semnatura
  // concreta a functiei cand `K` e inca generic
  const fn = m as (...a: readonly unknown[]) => string;
  return fn(...(args as readonly unknown[]));
}
