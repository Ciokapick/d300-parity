// Motorul, cap-coada, fata de fisierele de aur: fiecare caz de mana trece prin
// runCase (intrari in ordine + butonul VALIDARE) si trebuie sa dea EXACT ce a dat codul
// ANAF original in harness/oracle/legacy-runtime.mjs: aceleasi mesaje, in aceeasi
// ordine, aceleasi valori pe toate campurile, aceleasi campuri evidentiate, acelasi
// fisier de erori si acelasi XML, octet cu octet.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCase } from '../../src/domain/engine';

interface Golden {
  name: string;
  inputs: [string, string][];
  log: { kind: string; title?: string; text: string; field?: string }[];
  values: Record<string, string | number | null>;
  highlighted: string[];
  xml: string | null;
  erori: string | null;
}

const goldenDir = path.resolve(__dirname, '../../harness/oracle/golden');
const files = fs.readdirSync(goldenDir).filter((f) => f.endsWith('.json')).sort();
const strip = (p: string) => p.replace(/^form1\./, '');

describe('engine.runCase = codul original, pe toate fisierele de aur', () => {
  it('exista un corpus de mana', () => {
    expect(files.length).toBeGreaterThanOrEqual(40);
  });

  for (const file of files) {
    it(file.replace(/\.json$/, ''), () => {
      const g = JSON.parse(fs.readFileSync(path.join(goldenDir, file), 'utf8')) as Golden;
      const r = runCase(g.inputs);

      const expectedLog = g.log.map((m) => (m.field ? { ...m, field: strip(m.field) } : m));
      expect(r.messages).toEqual(expectedLog);

      const expectedValues: Record<string, string | number | null> = {};
      for (const [k, v] of Object.entries(g.values)) expectedValues[strip(k)] = v;
      expect(r.state.values).toEqual(expectedValues);

      expect([...r.state.highlighted].sort()).toEqual(g.highlighted.map(strip).sort());
      expect(r.erori).toBe(g.erori);
      expect(r.xml).toBe(g.xml);
    });
  }
});

describe('determinism', () => {
  it('acelasi caz de doua ori da acelasi rezultat', () => {
    const g = JSON.parse(fs.readFileSync(path.join(goldenDir, 'sample-01.json'), 'utf8')) as Golden;
    const a = runCase(g.inputs);
    const b = runCase(g.inputs);
    expect(a.xml).toBe(b.xml);
    expect(a.messages).toEqual(b.messages);
    expect(a.state.values).toEqual(b.state.values);
  });
});
