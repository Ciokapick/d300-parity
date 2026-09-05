import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { EXCL_GROUPS, FIELDS, FIELD_BY_PATH } from '../src/domain/fields';
import { coerce, initialState } from '../src/domain/state';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

interface LegacyField {
  path: string;
  valueType: string;
  nullTest: string;
  default: string | null;
}

const legacy: { fields: LegacyField[] } = JSON.parse(
  readFileSync(path.join(ROOT, 'legacy', 'extracted', 'fields.json'), 'utf8'),
) as { fields: LegacyField[] };

describe('registrul de câmpuri', () => {
  it('are toate câmpurile din inventarul extras din PDF', () => {
    expect(FIELDS).toHaveLength(legacy.fields.length);
    expect(FIELDS).toHaveLength(296);
  });

  it('nu păstrează prefixul form1.', () => {
    for (const f of FIELDS) expect(f.path.startsWith('form1.')).toBe(false);
  });

  it('indexează fiecare câmp după cale', () => {
    expect(FIELD_BY_PATH.size).toBe(FIELDS.length);
    for (const f of FIELDS) expect(FIELD_BY_PATH.get(f.path)).toBe(f);
  });

  it('marchează obligatoriu exact câmpurile cu nullTest error', () => {
    const asteptate = legacy.fields
      .filter((f) => f.nullTest === 'error')
      .map((f) => f.path.replace(/^form1\./, ''))
      .sort();
    const obtinute = FIELDS.filter((f) => f.mandatory)
      .map((f) => f.path)
      .sort();
    expect(obtinute).toEqual(asteptate);
    expect(obtinute.length).toBeGreaterThan(0);
  });

  it('păstrează butoanele și semnătura, marcate prin ui', () => {
    expect(FIELDS.filter((f) => f.ui === 'button').length).toBe(9);
    expect(FIELDS.filter((f) => f.ui === 'signature').length).toBe(1);
  });

  it('are grupurile de butoane radio ca exclGroup, nu ca subformulare', () => {
    const cai = EXCL_GROUPS.map((g) => g.path);
    expect(cai).toEqual([
      'date.bife.caption.bifa_cereale',
      'date.bife.caption.bifa_mob',
      'date.bife.caption.bifa_disp',
      'date.bife.caption.bifa_cons',
      'date.rambursare.bifa_rambursare',
    ]);
    for (const g of EXCL_GROUPS) {
      expect(g.options).toEqual(['D', 'N']);
      expect(g.defaultValue).toBe('N');
      // grupul nu e el însuși un câmp
      expect(FIELD_BY_PATH.has(g.path)).toBe(false);
      // dar copiii DA/NU sunt
      expect(FIELD_BY_PATH.has(`${g.path}.DA`)).toBe(true);
      expect(FIELD_BY_PATH.has(`${g.path}.NU`)).toBe(true);
    }
  });
});

describe('coerce', () => {
  it('transformă golul în null', () => {
    expect(coerce('decimal', '')).toBeNull();
    expect(coerce('decimal', null)).toBeNull();
    expect(coerce('decimal', undefined)).toBeNull();
    expect(coerce('text', '')).toBeNull();
  });

  it('transformă numericele în Number', () => {
    expect(coerce('decimal', '100')).toBe(100);
    expect(coerce('decimal', '100.5')).toBe(100.5);
    expect(coerce('integer', '0')).toBe(0);
    expect(coerce('integer', 7)).toBe(7);
  });

  it('întoarce null pentru numere imposibile', () => {
    expect(coerce('decimal', 'abc')).toBeNull();
    expect(coerce('integer', 'x1')).toBeNull();
  });

  it('transformă restul în String', () => {
    expect(coerce('text', 0)).toBe('0');
    expect(coerce('text', 'D')).toBe('D');
    expect(coerce('date', '2026-01-31')).toBe('2026-01-31');
  });
});

describe('initialState', () => {
  const state = initialState();

  it('are o cheie pentru fiecare câmp și fiecare exclGroup', () => {
    expect(Object.keys(state)).toHaveLength(FIELDS.length + EXCL_GROUPS.length);
    for (const f of FIELDS) expect(state).toHaveProperty([f.path]);
    for (const g of EXCL_GROUPS) expect(state).toHaveProperty([g.path]);
  });

  it('pornește de la valorile implicite din fields.json', () => {
    for (const lf of legacy.fields) {
      const p = lf.path.replace(/^form1\./, '');
      let asteptat: string | number | null;
      if (lf.default === null || lf.default === '') {
        asteptat = null;
      } else if (lf.valueType === 'decimal' || lf.valueType === 'integer') {
        const n = Number(lf.default);
        asteptat = Number.isNaN(n) ? null : n;
      } else {
        asteptat = String(lf.default);
      }
      expect(state[p], p).toBe(asteptat);
    }
  });

  it('are valorile punctuale așteptate', () => {
    expect(state['Antet.metaDate.an_r']).toBe('2026');
    expect(state['identifCntr.proRata']).toBe(100);
    expect(state['Antet.metaDate.tipDecont']).toBe('L');
    expect(state['date.rambursare.bifa_rambursare']).toBe('N');
    expect(state['Antet.metaDate.luna_r']).toBeNull();
    expect(state['Antet.IdDoc.universalCode']).toBe('D300_A12.0.2');
  });

  it('întoarce un obiect nou la fiecare apel', () => {
    const alta = initialState();
    expect(alta).not.toBe(state);
    expect(alta).toEqual(state);
  });
});
