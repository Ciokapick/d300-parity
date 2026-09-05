// Contextul de executie al regulilor: starea de lucru pe care modulele o modifica in
// timpul unei operatii (applyInput, recalculate, pressValidate). Motorul (engine.ts)
// cloneaza starea imutabila intr-un Ctx, ruleaza modulele, apoi ingheata rezultatul.
//
// Modulele NU emit mesaje decat prin ctx.say(...) si NU marcheaza reguli decat prin
// ctx.fire(...), ca ordinea mesajelor si trace-ul sa fie deterministe si comparabile
// cu fisierele de aur produse de harness/oracle/legacy-runtime.mjs.
import { FIELD_BY_PATH, EXCL_GROUPS, type FieldValue } from './fields';
import { coerce, initialState, type Message, type State, type Trace } from './state';

/** Starea imutabila expusa interfetei si harnessului. */
export interface FormState {
  /** harta plata cale legacy (fara form1.) -> valoare */
  readonly values: Readonly<State>;
  /** campurile obligatorii in acest moment: cele 13 din template + cele facute obligatorii dinamic */
  readonly mandatory: ReadonlySet<string>;
  /** campurile blocate dinamic (metoda simplificata, sectorul) */
  readonly readOnly: ReadonlySet<string>;
  /** campurile evidentiate cu rosu de ultima apasare a butonului Validare */
  readonly highlighted: ReadonlySet<string>;
}

export interface Ctx {
  values: State;
  mandatory: Set<string>;
  readOnly: Set<string>;
  highlighted: Set<string>;
  messages: Message[];
  trace: Trace[];
  /** citeste o valoare (null daca lipseste) */
  get(path: string): FieldValue;
  /** scrie o valoare cu coercitia campului (decimal -> numar, '' -> null) */
  set(path: string, v: unknown): void;
  /** emite un mesaj in ordinea in care originalul l-ar afisa */
  say(m: Message): void;
  /** marcheaza o regula declansata */
  fire(rule: string, field?: string): void;
  /** textul afisat al unei valori de lista (editValue in XFA), altfel valoarea */
  editValue(path: string): FieldValue;
}

const exclGroupPaths = new Set(EXCL_GROUPS.map((g) => g.path));

export function valueTypeOf(path: string): 'text' | 'decimal' | 'integer' | 'date' | 'dateTime' {
  if (exclGroupPaths.has(path)) return 'text';
  const f = FIELD_BY_PATH.get(path);
  if (!f) throw new Error(`camp necunoscut: ${path}`);
  return f.valueType;
}

export function createCtx(state: FormState): Ctx {
  const ctx: Ctx = {
    values: { ...state.values },
    mandatory: new Set(state.mandatory),
    readOnly: new Set(state.readOnly),
    highlighted: new Set(state.highlighted),
    messages: [],
    trace: [],
    get: (path) => ctx.values[path] ?? null,
    set: (path, v) => { ctx.values[path] = coerce(valueTypeOf(path), v); },
    say: (m) => { ctx.messages.push(m); },
    fire: (rule, field) => { ctx.trace.push(field ? { rule, field } : { rule }); },
    editValue: (path) => {
      const f = FIELD_BY_PATH.get(path);
      const raw = ctx.get(path);
      if (!f || !f.items || raw == null) return raw;
      const values = f.itemValues ?? f.items;
      const i = values.indexOf(String(raw));
      return i >= 0 ? (f.items[i] ?? raw) : raw;
    },
  };
  return ctx;
}

export function freeze(ctx: Ctx): FormState {
  return {
    values: Object.freeze({ ...ctx.values }),
    mandatory: new Set(ctx.mandatory),
    readOnly: new Set(ctx.readOnly),
    highlighted: new Set(ctx.highlighted),
  };
}

/** Starea initiala: valorile implicite din formular, cele 13 obligatorii din template. */
export function createInitialFormState(): FormState {
  const mandatory = new Set<string>();
  for (const f of FIELD_BY_PATH.values()) if (f.mandatory) mandatory.add(f.path);
  return {
    values: Object.freeze(initialState()),
    mandatory,
    readOnly: new Set(),
    highlighted: new Set(),
  };
}
