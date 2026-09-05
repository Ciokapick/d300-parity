// Store-ul e singura punte între interfață și domeniu, deci e singurul lucru din UI care
// trebuie dovedit: aceleași presetări trebuie să producă exact jurnalul, XML-ul și
// câmpurile evidențiate din fișierele de aur ale oracolului.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import presets from '../../src/ui/presets.json';
import { type JournalEntry, useFormStore } from '../../src/store/form';

interface Preset {
  name: string;
  descriere: string;
  inputs: [string, string][];
}

interface Golden {
  log: { kind: string; title?: string; text: string; field?: string }[];
  highlighted: string[];
  xml: string | null;
  erori: string | null;
}

const cases = presets as Preset[];

const preset = (name: string): Preset => {
  const c = cases.find((x) => x.name === name);
  if (!c) throw new Error(`presetare lipsă: ${name}`);
  return c;
};

const fara = (p: string): string => p.replace(/^form1\./, '');

/** Jurnalul fără indexul pasului, în forma în care îl scrie fișierul de aur. */
const faraPas = (entries: readonly JournalEntry[]): Golden['log'] =>
  entries.map((m) => ({
    kind: m.kind,
    text: m.text,
    ...(m.title === undefined ? {} : { title: m.title }),
    ...(m.field === undefined ? {} : { field: m.field }),
  }));

const golden = (name: string): Golden => {
  const url = new URL(`../../harness/oracle/golden/${name}.json`, import.meta.url);
  const g = JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as Golden;
  return {
    ...g,
    log: g.log.map((m) => (m.field === undefined ? m : { ...m, field: fara(m.field) })),
    highlighted: g.highlighted.map(fara),
  };
};

describe('store-ul formularului', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sample-01: XML-ul și jurnalul sunt cele din aur, iar formularul rămâne blocat', () => {
    const store = useFormStore();
    const aur = golden('sample-01');

    store.loadPreset(preset('sample-01').inputs);
    store.validate();

    expect(store.last?.xml).toBe(aur.xml);
    expect(faraPas(store.journal)).toEqual(aur.log);
    expect(store.locked).toBe(true);
  });

  it('sample-02-erori: nouă mesaje, niciun XML, aceleași câmpuri evidențiate', () => {
    const store = useFormStore();
    const aur = golden('sample-02-erori');

    store.loadPreset(preset('sample-02-erori').inputs);
    store.validate();

    expect(faraPas(store.journal)).toEqual(aur.log);
    expect(aur.log).toHaveLength(9);
    expect(store.last?.xml).toBeNull();
    expect(store.last?.highlighted).toEqual(aur.highlighted);
    expect(store.locked).toBe(false);
  });

  it('validarea e idempotentă, unlock ridică ștampila, reset readuce starea inițială', () => {
    const store = useFormStore();

    store.loadPreset(preset('sample-01').inputs);
    store.validate();
    const primul = store.last?.xml ?? null;
    expect(primul).not.toBeNull();

    store.validate();
    expect(store.last?.xml).toBe(primul);

    store.unlock();
    expect(store.value('Antet.IdDoc.formValid')).toBe('FORMULAR NEVALIDAT');
    expect(store.locked).toBe(false);
    expect(store.last).toBeNull();

    store.reset();
    expect(store.journal).toEqual([]);
    expect(store.trace).toEqual([]);
    expect(store.value('identifCntr.denumire.cif')).toBeNull();
    expect(store.value('Antet.metaDate.an_r')).toBe('2026');
    expect(store.value('Antet.IdDoc.formValid')).toBe('FORMULAR NEVALIDAT');
  });

  it('readOnly: celulele calculate sunt blocate, cele editabile nu, metoda simplificată blochează comerţul', () => {
    const store = useFormStore();

    expect(store.readOnly('date.livrari.r19.c2')).toBe(true);
    expect(store.readOnly('date.livrari.r9.c2')).toBe(false);

    expect(store.readOnly('date.comert.r1.c2')).toBe(false);
    store.input('Antet.opInterne.mtdSimplificata', '1');
    expect(store.readOnly('date.comert.r1.c2')).toBe(true);
  });
});
