// Regulile `change` din registry.ts: ce se intampla la tastare (A3 — scriptul primeste
// valoarea intreaga) si ce se intampla dupa bifarea unei casute sau a unui grup radio.
//
// `applyChange` ruleaza INAINTE de setare, pentru campurile text/numerice/liste:
// filtrele numerice pot respinge valoarea (originalul goleste `xfa.event.change`),
// majusculele o transforma, iar `change.judet.clears-loc` are efect lateral pe alt camp.
//
// `afterChange` ruleaza DUPA setare, pentru `checkButton` si `exclGroup`: acolo
// originalul citeste `this.rawValue`, deci valoarea trebuie sa fie deja in stare.
//
// Ordinea si conditiile sunt cele din `RULES` (id-urile apar in `ctx.fire`).

import type { ChangeModule } from './contracts';
import type { Ctx } from './context';
import { FIELDS, FIELD_BY_PATH } from './fields';
import { text, TITLES } from './messages';
import { UPPERCASE_FIELDS } from './rules/registry';

/** `xfa.event.newText.match(/[^0-9 ]/)` din #42 / #62 / #71 / #111 / #116 / #120 */
const NON_NUMERIC = /[^0-9 ]/;

/** #42: respingere tacuta */
const NUMERIC_SILENT: readonly string[] = ['Antet.metaDate.an_r'];

/** #62, #71, #116, #120: `app.alert` apoi respingere */
const NUMERIC_ALERT: readonly string[] = [
  'Antet.cifS',
  'identifCntr.denumire.cif',
  'identifCntr.contact.telefon',
  'identifCntr.contact.fax',
];

/** #111: `xfa.host.messageBox(..., "Format eronat", 0)` apoi respingere */
const NUMERIC_CODPST = 'identifCntr.adresa.codPst';

const UPPERCASE = new Set<string>(UPPERCASE_FIELDS);

const JUDET = 'identifCntr.adresa.judet';
const LOC = 'identifCntr.adresa.loc';

/**
 * `x == 0` din JavaScript, cu `null` care NU e egal cu 0 (#52, #55, #41 folosesc
 * comparatia slaba pe `rawValue`, care poate fi sir sau numar).
 */
function looseEq(v: string | number | null, n: number): boolean {
  if (v === null) return false;
  return Number(v) === n;
}

/** subarborii golitii de `xfa.host.resetData` in #41 */
const SIMPLIFICATA_SUBTREES = ['date.comert.', 'date.achizitiiRO.'] as const;
const SIMPLIFICATA_FIELDS: readonly string[] = FIELDS
  .filter((f) => SIMPLIFICATA_SUBTREES.some((p) => f.path.startsWith(p)))
  .map((f) => f.path);
const R30_1_C2 = 'date.achizitiiIMP.r30_1.c2';

function applyChange(ctx: Ctx, path: string, value: string): { value: string; rejected: boolean } {
  // ---------------------------------------------------- filtrele numerice (#42 etc.)
  if (NON_NUMERIC.test(value)) {
    if (NUMERIC_SILENT.includes(path)) {
      ctx.fire('change.numeric.silent', path);
      return { value, rejected: true };
    }
    if (NUMERIC_ALERT.includes(path)) {
      ctx.say({ kind: 'alert', text: text('doar.cifre') });
      ctx.fire('change.numeric.alert', path);
      return { value, rejected: true };
    }
    if (path === NUMERIC_CODPST) {
      ctx.say({ kind: 'messageBox', title: TITLES.formatEronat, text: text('doar.cifre') });
      ctx.fire('change.numeric.codPst', path);
      return { value, rejected: true };
    }
  }

  let out = value;

  // ---------------------------------------------------- majuscule (#68 etc., A3)
  if (UPPERCASE.has(path)) {
    const upper = value.toUpperCase();
    if (upper !== out) ctx.fire('change.uppercase', path);
    out = upper;
  }

  // ---------------------------------------------------- #87: judetul goleste localitatea
  if (path === JUDET) {
    const prev = ctx.get(path);
    const prevText = prev === null ? '' : String(prev);
    if (prevText !== out) {
      ctx.set(LOC, null);
      ctx.fire('change.judet.clears-loc', path);
    }
  }

  return { value: out, rejected: false };
}

function afterChange(ctx: Ctx, path: string): void {
  switch (path) {
    // -------------------------------------------------- #52
    case 'Antet.metaDate.d_rez': {
      if (looseEq(ctx.get(path), 0)) {
        ctx.set('Antet.temeiLegal', null);
        ctx.mandatory.delete('Antet.temeiLegal');
      } else {
        ctx.mandatory.add('Antet.temeiLegal');
        ctx.set('Antet.temeiLegal', 2);
      }
      ctx.fire('change.d_rez', path);
      return;
    }

    // -------------------------------------------------- #55
    case 'Antet.metaDate.d_scc': {
      if (looseEq(ctx.get(path), 0)) {
        ctx.set('Antet.cifS', null);
        ctx.mandatory.delete('Antet.cifS');
      } else {
        ctx.mandatory.add('Antet.cifS');
      }
      ctx.fire('change.d_scc', path);
      return;
    }

    // -------------------------------------------------- #41
    case 'Antet.opInterne.mtdSimplificata': {
      if (looseEq(ctx.get(path), 1)) {
        for (const p of SIMPLIFICATA_FIELDS) {
          ctx.set(p, FIELD_BY_PATH.get(p)?.defaultValue ?? null);
          ctx.readOnly.add(p);
        }
        ctx.set(R30_1_C2, null);
        ctx.readOnly.add(R30_1_C2);
      } else {
        for (const p of SIMPLIFICATA_FIELDS) ctx.readOnly.delete(p);
        ctx.readOnly.delete(R30_1_C2);
      }
      ctx.fire('change.mtdSimplificata', path);
      return;
    }

    // -------------------------------------------------- #202
    case 'date.rambursare.bifa_rambursare': {
      const r46 = ctx.get('date.regularizari.r46.c3');
      // `null < 5000` e adevarat in JavaScript (null -> 0)
      const sold = r46 === null ? 0 : Number(r46);
      if (sold < 5000 && ctx.get(path) === 'D') {
        ctx.say({ kind: 'alert', text: text('rambursare.prag') });
        ctx.set(path, 'N');
        ctx.fire('change.rambursare.prag', path);
      }
      return;
    }

    default:
      return;
  }
}

export { applyChange, afterChange };

export default { applyChange, afterChange } satisfies ChangeModule;
