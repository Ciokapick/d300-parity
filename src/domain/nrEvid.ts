// Numarul de evidenta a platii (regula `nrEvid.calcul` din registry.ts), copiat din
// `utile.calculateRegistrationNumber` si `utile.getReferencePeriod`.
//
// Logica cu `Date` e pastrata ca in original, cu tot cu ciudateniile ei:
//   - la decontul anual `endMonth` ramane sirul gol, deci `new Date(endYear, "", 25)`
//     inseamna luna 0 (25 ianuarie);
//   - la decontul semestrial `endYear` creste doar cand `refMonth >= 9`, deci lunile
//     7, 8 si 9 dau termen 25 ianuarie in ACELASI an (nu apar in practica, pentru ca
//     `utile.check_tipDecont` accepta doar lunile 6 si 12, dar le reproducem);
//   - ultimele caractere sunt suma cifrelor INTREAGA, nu ultimele doua (vezi mai jos);
//   - un tipDecont necunoscut ramane in sir asa cum e, iar `deadline` ramane data
//     curenta, deci rezultatul e nedeterminist — exact ca in original.

import type { FieldValue } from './fields';

/**
 * `utile.getReferencePeriod`: `new Date(an, luna - 1)`, cu conversia numerica
 * implicita a constructorului Date (rawValue-urile pot fi siruri).
 */
export function getReferencePeriod(an: FieldValue, luna: FieldValue): Date | null {
  if (an !== null && luna !== null) {
    return new Date(Number(an), Number(luna) - 1);
  }
  return null;
}

/** `utile.calculateRegistrationNumber`, cu tipDecont citit din formular ca parametru. */
export function calculateRegistrationNumber(tipDecont: FieldValue, referencePeriod: Date): string {
  let scheduledControl = 0;

  let ddRule = String(tipDecont);
  if (ddRule === 'L') ddRule = '301';
  if (ddRule === 'T') ddRule = '302';
  if (ddRule === 'S') ddRule = '303';
  if (ddRule === 'A') ddRule = '304';
  let deadline = new Date();
  let deadlineFmt = '';

  const refMonth = referencePeriod.getMonth();
  const refMonth2 = (refMonth < 9) ? '0' + (refMonth + 1) : String(refMonth + 1);
  const refYear = referencePeriod.getFullYear();
  const refYear2 = ('' + refYear).substr(2);
  // `endMonth`/`endYear` pornesc ca siruri goale: la decontul anual `endMonth` chiar
  // ramane asa, iar `Number("")` e 0, adica ianuarie.
  let endMonth: number | string = '';
  // originalul il initializeaza tot cu "", dar valoarea aia nu ajunge niciodata
  // sa fie citita: fiecare ramura o suprascrie inainte de `new Date(...)`
  let endYear: number | string;

  // - Lunar si trim.
  if (ddRule === '301' || ddRule === '302') {
    endYear = (refMonth < 11) ? refYear : refYear + 1;
    endMonth = (refMonth < 11) ? refMonth + 1 : 0;
    deadline = new Date(Number(endYear), Number(endMonth), 25, 12, 0, 0);
  }
  // - Semestrial
  if (ddRule === '303') {
    endYear = (refMonth < 9) ? refYear : refYear + 1;
    if (refMonth === 0 || refMonth === 1 || refMonth === 2 || refMonth === 3 || refMonth === 4 || refMonth === 5) endMonth = 6;
    if (refMonth === 6 || refMonth === 7 || refMonth === 8 || refMonth === 9 || refMonth === 10 || refMonth === 11) endMonth = 0;
    deadline = new Date(Number(endYear), Number(endMonth), 25, 12, 0, 0);
  }

  // - Anual
  if (ddRule === '304') {
    endYear = (refMonth < 11) ? refYear : refYear + 1;
    deadline = new Date(Number(endYear), Number(endMonth), 25, 12, 0, 0);
  }

  deadlineFmt += (deadline.getDate() < 10) ? '0' + deadline.getDate() : String(deadline.getDate());
  deadlineFmt += ((deadline.getMonth() + 1) < 10) ? '0' + (deadline.getMonth() + 1) : String(deadline.getMonth() + 1);
  deadlineFmt += ('' + deadline.getFullYear()).substr((('' + deadline.getFullYear()).length) - 2);

  let paymentRegNumber = '10' + ddRule + '01' + refMonth2 + refYear2 + deadlineFmt + '0' + '000';

  for (let i = 0; i < paymentRegNumber.length; i++) {
    scheduledControl = (scheduledControl + Number(paymentRegNumber.charAt(i)));
  }

  // Originalul scrie `("" + scheduledControl).substr((scheduledControl.length) - 2)`,
  // dar `scheduledControl` e un numar, deci `.length` e `undefined`, `undefined - 2`
  // e NaN, iar `substr(NaN)` porneste de la 0: se pastreaza sirul INTREG al sumei,
  // nu "ultimele 2 cifre" cum spune registry.ts. Pentru sume de doua cifre (cazul
  // obisnuit) diferenta nu se vede.
  const control = '' + scheduledControl;
  paymentRegNumber += ('' + control);

  return paymentRegNumber;
}
