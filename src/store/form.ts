// Singurul punct prin care interfața atinge domeniul. Store-ul nu conține nicio regulă:
// fiecare intrare trece prin `applyInput`, butonul VALIDARE prin `pressValidate`, iar
// „Deblocare” prin `unlock`. Ce nu poate răspunde motorul, nu răspunde nici store-ul.
import { defineStore } from 'pinia';
import { computed, shallowRef } from 'vue';

import type { FormState } from '../domain/context';
import { applyInput, createInitialFormState, pressValidate, unlock as engineUnlock } from '../domain/engine';
import { FIELD_BY_PATH, type FieldValue } from '../domain/fields';
import type { Message, Trace } from '../domain/state';
import { TOTAL_CELLS, formatNumber } from '../ui/display';

/** Un mesaj din jurnal, cu numărul pasului care l-a produs. */
export type JournalEntry = Message & { step: number };

/** Rezultatul ultimei apăsări pe VALIDARE. */
export interface LastResult {
  erori: string | null;
  xml: string | null;
  highlighted: string[];
}

export interface TotalCell {
  path: string;
  label: string;
  text: string;
  value: FieldValue;
}

/** O intrare de presetare: cale (cu sau fără prefixul `form1.`) și valoare. */
export type PresetInput = readonly [string, string];

export const useFormStore = defineStore('form', () => {
  const form = shallowRef<FormState>(createInitialFormState());
  const journal = shallowRef<JournalEntry[]>([]);
  const trace = shallowRef<Trace[]>([]);
  const last = shallowRef<LastResult | null>(null);
  const locked = shallowRef(false);

  // numărul pasului curent; nu e stare reactivă, doar eticheta mesajelor din jurnal
  let step = 0;

  function record(messages: readonly Message[], t: readonly Trace[]): void {
    if (messages.length > 0) {
      journal.value = [...journal.value, ...messages.map((m) => ({ ...m, step }))];
    }
    if (t.length > 0) trace.value = [...trace.value, ...t];
  }

  /** O intrare a utilizatorului într-un câmp, exact ca un pas din harness. */
  function input(path: string, value: string): void {
    step += 1;
    const o = applyInput(form.value, path.replace(/^form1\./, ''), value);
    form.value = o.state;
    record(o.messages, o.trace);
  }

  /** Butonul VALIDARE. Cu XML, formularul rămâne blocat până la „Deblocare”. */
  function validate(): void {
    step += 1;
    const o = pressValidate(form.value);
    form.value = o.state;
    record(o.messages, o.trace);
    last.value = { erori: o.erori, xml: o.xml, highlighted: [...o.state.highlighted] };
    if (o.xml !== null) locked.value = true;
  }

  /** Starea inițială a formularului, jurnal gol. */
  function reset(): void {
    form.value = createInitialFormState();
    journal.value = [];
    trace.value = [];
    last.value = null;
    locked.value = false;
    step = 0;
  }

  /** Un caz din corpus: reset, apoi fiecare intrare pe același drum ca un utilizator. */
  function loadPreset(inputs: readonly PresetInput[]): void {
    reset();
    for (const [path, value] of inputs) input(path, value);
  }

  /** Butonul „Deblocare”: ștampila revine la NEVALIDAT, XML-ul atașat dispare. */
  function unlock(): void {
    form.value = engineUnlock(form.value);
    locked.value = false;
    last.value = null;
  }

  const value = (path: string): FieldValue => form.value.values[path] ?? null;

  const readOnly = (path: string): boolean => {
    if (locked.value) return true;
    if (form.value.readOnly.has(path)) return true;
    const f = FIELD_BY_PATH.get(path);
    // grupurile exclGroup nu sunt în registrul de câmpuri; sunt editabile
    return f ? f.access !== 'open' : false;
  };

  const highlighted = (path: string): boolean => form.value.highlighted.has(path);
  const mandatory = (path: string): boolean => form.value.mandatory.has(path);

  const totaluri = computed<TotalCell[]>(() =>
    TOTAL_CELLS.map((c) => {
      const v = form.value.values[c.path] ?? null;
      return { path: c.path, label: c.label, value: v, text: c.numeric ? formatNumber(v) : v === null ? '' : String(v) };
    }),
  );

  /** Câmpurile evidențiate de ultima validare, în ordinea în care le-a marcat motorul. */
  const highlightedFields = computed<string[]>(() => last.value?.highlighted ?? []);

  /** XML-ul ultimei validări reușite, sau null. */
  const xml = computed<string | null>(() => last.value?.xml ?? null);

  return {
    form,
    journal,
    trace,
    last,
    locked,
    input,
    validate,
    loadPreset,
    reset,
    unlock,
    value,
    readOnly,
    highlighted,
    mandatory,
    totaluri,
    highlightedFields,
    xml,
  };
});
