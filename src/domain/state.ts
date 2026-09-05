// Starea formularului: un dicționar plat, cheia fiind calea legacy fără `form1.`.
//
// Plat, nu arborescent, pentru că regulile extrase din PDF se referă la câmpuri
// prin exact aceste căi; orice altă formă ar cere o traducere în plus între noi și
// oracol.

import { EXCL_GROUPS, FIELDS, type FieldValue, type ValueType } from './fields';

export type State = Record<string, FieldValue>;

/**
 * Aduce o valoare la forma pe care o are `rawValue` în runtime-ul XFA.
 *
 * Trebuie să rămână identică semantic cu `coerce` din
 * `harness/oracle/legacy-runtime.mjs` — altfel paritatea se rupe tăcut.
 */
export function coerce(valueType: ValueType, v: unknown): FieldValue {
  if (v === undefined || v === null || v === '') return null;
  if (valueType === 'decimal' || valueType === 'integer') {
    const n = Number(v);
    return Number.isNaN(n) ? null : n; // A2: rawValue pe <decimal> e număr
  }
  return String(v);
}

/**
 * Starea de pornire: fiecare câmp din registru și fiecare exclGroup, la valoarea
 * implicită din template. Valoarea unui exclGroup e a butonului bifat implicit.
 */
export function initialState(): State {
  const state: State = {};
  for (const f of FIELDS) {
    state[f.path] = coerce(f.valueType, f.defaultValue);
  }
  for (const g of EXCL_GROUPS) {
    state[g.path] = coerce('text', g.defaultValue);
  }
  return state;
}

/** Un mesaj produs de reguli, în forma în care îl scoate originalul. */
export interface Message {
  kind: 'alert' | 'messageBox' | 'respins';
  title?: string;
  text: string;
  field?: string;
}

/** Urma unei reguli care s-a executat, pentru harnessul de paritate. */
export interface Trace {
  rule: string;
  field?: string;
}
