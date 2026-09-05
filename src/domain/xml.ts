// Generatorul de XML (regula `xml.genXML` din registry.ts), dupa `genValid.genXML`.
//
// Iesirea trebuie sa fie identica OCTET CU OCTET cu ce scrie originalul in fisierul
// atasat D300.xml. Nicio normalizare: aceeasi ordine de atribute (XML_ATTRIBUTES din
// rows.ts, generata din original), aceeasi escapare, aceleasi ciudatenii:
//
//   - atributele cu valoare null se sar, dar `0` se emite;
//   - `caen` si `caen1` emit AMBELE atributul "caen" (defect #2 din inventar);
//   - judetul intra prin `editValue` (textul afisat, ex. "B--Bucuresti");
//   - adresa e concatenata din parti deja escapate si apoi escapata INCA o data;
//   - `xsi:schemaLocation` a ramas pe v11 langa `xmlns` v12 (defect #1);
//   - `encodeURI` / `decodeURI` din original se anuleaza reciproc, deci sirul brut.

import { XML_ATTRIBUTES, ADRESA_PARTS, XML_NAMESPACE, XML_SCHEMA_LOCATION } from './rows';
import { schEnt } from './schEnt';
import type { FieldValue } from './fields';
import type { State } from './state';

/**
 * @param values starea plata (cai legacy fara `form1.`)
 * @param editValue textul afisat al unei valori de lista; pentru celelalte campuri
 *                  trebuie sa intoarca aceeasi valoare ca `values` (vezi `Ctx.editValue`)
 */
export function genXML(values: State, editValue: (path: string) => FieldValue): string {
  const raw = (path: string): FieldValue => values[path] ?? null;

  let xml = '<?xml version="1.0"?>\n<declaratie300';

  for (const entry of XML_ATTRIBUTES) {
    if ('composite' in entry) {
      // adresa: partile nenule, in ordinea din original, fiecare "eticheta: valoare"
      // urmata de ", " — cu exceptia ultimei (codul postal), care nu primeste virgula.
      // Cand codul postal lipseste, sirul ramane cu ", " la coada: asa face originalul.
      let adr = '';
      for (const [i, part] of ADRESA_PARTS.entries()) {
        const value = part.via === 'editValue' ? editValue(part.path) : raw(part.path);
        if (raw(part.path) === null) continue;
        adr += part.label + ': ' + schEnt(String(value));
        if (i < ADRESA_PARTS.length - 1) adr += ', ';
      }
      if (adr !== '') xml += ' adresa="' + schEnt(adr) + '"';
      continue;
    }
    const value = entry.via === 'editValue' ? editValue(entry.path) : raw(entry.path);
    if (raw(entry.path) === null) continue;
    xml += ' ' + entry.attr + '="' + schEnt(String(value)) + '"';
  }

  xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="'
    + XML_SCHEMA_LOCATION + '" xmlns="' + XML_NAMESPACE + '">';
  xml += '</declaratie300>';
  return xml;
}
