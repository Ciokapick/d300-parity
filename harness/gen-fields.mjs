// Generează src/domain/fields.ts din legacy/extracted/fields.json.
//
// Principiu: registrul de câmpuri nu se scrie de mână. Singura sursă de adevăr e
// inventarul extras din PDF de harness/extract_legacy.py. Dacă formularul ANAF se
// schimbă, se re-rulează extracția și apoi `npm run gen:fields`.
//
// Convenții:
//   - căile pierd prefixul `form1.` (ex. `date.livrari.r9.c2`)
//   - `mandatory` = `nullTest === 'error'` din template
//   - părinții câmpurilor `DA`/`NU` sunt exclGroup-uri (butoane radio), nu subformulare;
//     valoarea implicită a grupului e `default`-ul copilului bifat implicit, iar
//     `options` sunt valorile copiilor, în ordinea din template
//   - butoanele (`ui: 'button'`) și semnătura (`ui: 'signature'`) rămân în FIELDS,
//     marcate prin `ui`; nu sunt câmpuri de date

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const SOURCE = path.join(ROOT, 'legacy', 'extracted', 'fields.json');
const TARGET = path.join(ROOT, 'src', 'domain', 'fields.ts');

const VALUE_TYPES = new Set(['text', 'decimal', 'integer', 'date', 'dateTime']);
const ACCESS = new Set(['open', 'protected', 'readOnly']);

const RADIO_CHILD = /\.(DA|NU)$/;

const stripRoot = (p) => (p.startsWith('form1.') ? p.slice('form1.'.length) : p);

const inventory = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
if (!Array.isArray(inventory.fields) || inventory.fields.length === 0) {
  throw new Error(`${SOURCE}: lipsește lista de câmpuri`);
}

// ---------------------------------------------------------------- câmpuri
const seen = new Set();
const fields = inventory.fields.map((f) => {
  if (!VALUE_TYPES.has(f.valueType)) {
    throw new Error(`${f.path}: valueType necunoscut "${f.valueType}"`);
  }
  if (!ACCESS.has(f.access)) {
    throw new Error(`${f.path}: access necunoscut "${f.access}"`);
  }
  const p = stripRoot(f.path);
  if (seen.has(p)) throw new Error(`cale duplicată: ${p}`);
  seen.add(p);
  return {
    path: p,
    ui: f.ui,
    valueType: f.valueType,
    access: f.access,
    mandatory: f.nullTest === 'error',
    toolTip: f.toolTip ?? '',
    defaultValue: f.default ?? null,
    items: f.items ?? null,
    itemValues: f.itemValues ?? null,
  };
});

// ---------------------------------------------------------------- exclGroup-uri
// Aceeași regulă ca în harness/oracle/legacy-runtime.mjs (buildTree).
const groups = new Map();
for (const f of inventory.fields) {
  if (!RADIO_CHILD.test(f.path)) continue;
  const p = stripRoot(f.path.replace(RADIO_CHILD, ''));
  if (!groups.has(p)) groups.set(p, { path: p, defaultValue: null, options: [] });
  const g = groups.get(p);
  // valoarea unui buton radio e singurul element din `items` (ex. ["D"] / ["N"])
  const value = f.items?.[0] ?? f.default;
  if (value == null) throw new Error(`${f.path}: buton radio fără valoare`);
  if (!g.options.includes(value)) g.options.push(value);
  if (f.default != null) {
    if (g.defaultValue != null && g.defaultValue !== f.default) {
      throw new Error(`${p}: două butoane bifate implicit (${g.defaultValue}, ${f.default})`);
    }
    g.defaultValue = f.default;
  }
}
const exclGroups = [...groups.values()];
for (const g of exclGroups) {
  if (seen.has(g.path)) throw new Error(`exclGroup ${g.path} se ciocnește cu un câmp`);
}

// ---------------------------------------------------------------- scriere
const lit = (v) => JSON.stringify(v);
const arr = (v) => (v === null ? 'null' : `[${v.map(lit).join(', ')}]`);

const fieldLines = fields
  .map(
    (f) =>
      `  { path: ${lit(f.path)}, ui: ${lit(f.ui)}, valueType: ${lit(f.valueType)}, ` +
      `access: ${lit(f.access)}, mandatory: ${f.mandatory}, toolTip: ${lit(f.toolTip)}, ` +
      `defaultValue: ${lit(f.defaultValue)}, items: ${arr(f.items)}, itemValues: ${arr(f.itemValues)} },`,
  )
  .join('\n');

const groupLines = exclGroups
  .map(
    (g) =>
      `  { path: ${lit(g.path)}, defaultValue: ${lit(g.defaultValue)}, options: ${arr(g.options)} },`,
  )
  .join('\n');

const out = `// generat de harness/gen-fields.mjs, nu edita
//
// Sursa: legacy/extracted/fields.json (inventarul extras din PDF-ul ANAF D300
// v12.0.2). Regenerează cu \`npm run gen:fields\`.
//
// Căile sunt cele din template, fără prefixul \`form1.\`.

export type FieldValue = string | number | null;

export type ValueType = 'text' | 'decimal' | 'integer' | 'date' | 'dateTime';

export interface FieldSpec {
  path: string;
  ui: string;
  valueType: ValueType;
  access: 'open' | 'protected' | 'readOnly';
  mandatory: boolean;
  toolTip: string;
  defaultValue: string | null;
  items: readonly string[] | null;
  itemValues: readonly string[] | null;
}

export interface ExclGroupSpec {
  path: string;
  defaultValue: string | null;
  options: readonly string[];
}

export const FIELDS: readonly FieldSpec[] = [
${fieldLines}
];

export const FIELD_BY_PATH: ReadonlyMap<string, FieldSpec> = new Map(
  FIELDS.map((f) => [f.path, f]),
);

export const EXCL_GROUPS: readonly ExclGroupSpec[] = [
${groupLines}
];
`;

fs.mkdirSync(path.dirname(TARGET), { recursive: true });
fs.writeFileSync(TARGET, out, 'utf8');
console.log(
  `src/domain/fields.ts: ${fields.length} câmpuri, ${exclGroups.length} exclGroup-uri, ` +
    `${fields.filter((f) => f.mandatory).length} obligatorii`,
);
