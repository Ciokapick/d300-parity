// Test diferential pentru numarul de evidenta a platii: toate combinatiile
// tipDecont x luna x an, comparate cu `utile.calculateRegistrationNumber` din PDF.
//
// Originalul citeste tipDecont direct din formular, deci inaintea fiecarui apel se
// scrie `form1.Antet.metaDate.tipDecont`; functia noastra il primeste ca parametru.

import { describe, expect, it } from 'vitest';

import { createForm } from '../../harness/oracle/legacy-runtime.mjs';
import { calculateRegistrationNumber, getReferencePeriod } from '../../src/domain/nrEvid';

const form = createForm();
const tipDecontNode = form.byPath.get('form1.Antet.metaDate.tipDecont');
const anNode = form.byPath.get('form1.Antet.metaDate.an_r');
const lunaNode = form.byPath.get('form1.Antet.metaDate.luna_r');

const TIPURI = ['L', 'T', 'S', 'A'];
const LUNI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ANI = [2024, 2025, 2026];

describe('calculateRegistrationNumber', () => {
  it(`da acelasi numar ca originalul pe ${TIPURI.length * LUNI.length * ANI.length} combinatii`, () => {
    if (!tipDecontNode) throw new Error('nu gasesc form1.Antet.metaDate.tipDecont in oracol');
    let n = 0;
    for (const tip of TIPURI) {
      for (const an of ANI) {
        for (const luna of LUNI) {
          tipDecontNode.rawValue = tip;
          const perioada = new Date(an, luna - 1);
          const original = form.objects.utile.calculateRegistrationNumber(perioada);
          const noastra = calculateRegistrationNumber(tip, new Date(an, luna - 1));
          expect(`${tip} ${an}-${luna}: ${noastra}`).toBe(`${tip} ${an}-${luna}: ${original}`);
          n++;
        }
      }
    }
    expect(n).toBe(144);
  });

  it('reproduce numarul din cazul sample-01 (lunar, ianuarie 2026)', () => {
    expect(calculateRegistrationNumber('L', new Date(2026, 0))).toBe('10301010126250226000032');
  });

  it('la decontul anual endMonth ramane "" , deci termenul e 25 ianuarie', () => {
    if (!tipDecontNode) throw new Error('nu gasesc tipDecont');
    tipDecontNode.rawValue = 'A';
    const perioada = new Date(2026, 11);
    expect(calculateRegistrationNumber('A', perioada))
      .toBe(form.objects.utile.calculateRegistrationNumber(perioada));
    // luna 12 -> anul urmator, ziua 25, luna 01
    expect(calculateRegistrationNumber('A', perioada)).toContain('250127');
  });

  it('un tipDecont necunoscut ramane in sir asa cum e', () => {
    // ddRule nu e inlocuit, deci apare literal in numar (deadline ramane data curenta,
    // deci comparam doar prefixul care nu depinde de ceas)
    expect(calculateRegistrationNumber('X', new Date(2026, 0)).startsWith('10X010126')).toBe(true);
    expect(calculateRegistrationNumber(null, new Date(2026, 0)).startsWith('10null010126')).toBe(true);
  });
});

describe('getReferencePeriod', () => {
  it('intoarce null daca an sau luna lipsesc, ca originalul', () => {
    if (!anNode || !lunaNode) throw new Error('nu gasesc an_r / luna_r in oracol');
    for (const [an, luna] of [[null, null], [2026, null], [null, 1]] as const) {
      anNode.rawValue = an;
      lunaNode.rawValue = luna;
      expect(getReferencePeriod(an, luna)).toBe(form.objects.utile.getReferencePeriod());
    }
  });

  it('construieste aceeasi data ca originalul pentru fiecare an si luna', () => {
    if (!anNode || !lunaNode) throw new Error('nu gasesc an_r / luna_r in oracol');
    for (const an of ANI) {
      for (const luna of LUNI) {
        anNode.rawValue = String(an);
        lunaNode.rawValue = String(luna);
        const original = form.objects.utile.getReferencePeriod();
        const noastra = getReferencePeriod(String(an), String(luna));
        expect(noastra).not.toBeNull();
        expect(noastra?.getTime()).toBe(original === null ? undefined : original.getTime());
      }
    }
  });
});
