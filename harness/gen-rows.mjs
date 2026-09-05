// Genereaza src/domain/rows.ts: tabelul rand afisat <-> cale legacy <-> atribut XML
// <-> eticheta, plus ordinea exacta a atributelor din genXML. Sursa e codul original
// (legacy/extracted/scriptobj_genValid.js) si inventarul campurilor (fields.json),
// ca nimic din maparea istorica (R17_1 = randul 19) sa nu fie transcris de mana.
//   node harness/gen-rows.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = fs.readFileSync(path.join(root, 'legacy/extracted/scriptobj_genValid.js'), 'utf8');
const gen = src.slice(src.indexOf('function genXML'), src.indexOf('// eof genXML'));
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'legacy/extracted/fields.json'), 'utf8'));
const fields = new Map(inventory.fields.map((f) => [f.path.replace(/^form1\./, ''), f]));

// perechile "obj = cale; if (obj.rawValue != null) xml/adr += ' atribut=' / ' eticheta: '"
const re = /(?:var\s+)?(obj2?)\s*=\s*([\w.]+);[^\n]*\n\s*if \(\1\.(rawValue|editValue)?[^)]*\)\s*(xml|adr)\s*\+=\s*"\s*([^"=:]+?)\s*[=:]/g;
const entries = [];
let m;
while ((m = re.exec(gen))) {
  const [, , p, , kind, name] = m;
  const viaEdit = /\1\.editValue|obj\.editValue/.test(gen.slice(m.index, m.index + 200).split('\n')[1] || '');
  entries.push({ kind, path: p, name: name.trim(), via: viaEdit ? 'editValue' : 'rawValue', at: m.index });
}
// caen si caen1 sunt scrise incrucisat in original (obj = caen; var obj2 = caen1; if (obj...) if (obj2...))
// si emit AMANDOUA atributul "caen" (defect #2 din inventar); le luam cu o trecere separata
const caenRe = /if \((obj2?)\.rawValue != null\) xml \+= " caen=/g;
const caenDecl = { obj: 'identifCntr.caen', obj2: 'identifCntr.caen1' };
let cm;
while ((cm = caenRe.exec(gen))) {
  entries.push({ kind: 'xml', path: caenDecl[cm[1]], name: 'caen', via: 'rawValue', at: cm.index });
}
entries.sort((a, b) => a.at - b.at);
const adrAt = gen.indexOf('if (adr != "") xml += " adresa=');
// linia ACTIVA cu namespace-urile; cele comentate (v5, v9...) sunt istoric
const nsLine = gen.split('\n').map((l) => l.trim()).find((l) => l.startsWith('xml += " xmlns:xsi='));
if (!nsLine) throw new Error('nu gasesc linia activa cu xmlns in genXML');
const schemaLocation = nsLine.match(/xsi:schemaLocation=\\"([^\\]+)\\"/)[1];
const xmlns = nsLine.match(/xmlns=\\"([^\\]+)\\"/)[1];

const xmlAttrs = [];
let adresaInserted = false;
for (const e of entries) {
  if (e.kind === 'xml' && !adresaInserted && e.at > adrAt) {
    xmlAttrs.push({ attr: 'adresa', composite: true });
    adresaInserted = true;
  }
  if (e.kind === 'xml') xmlAttrs.push({ attr: e.name, path: e.path, via: e.via });
}
const adresaParts = entries.filter((e) => e.kind === 'adr').map((e) => ({ path: e.path, label: e.name, via: e.via }));

const sectionOf = (p) => {
  const seg = p.split('.')[1];
  if (/^r4[789]$/.test(seg)) return 'facturi';
  return seg;
};
const FACTURI_LABELS = { r47: 'Facturi emise', r48: 'Facturi primite', r49: 'Facturi emise conform art. 11 alin. (6) și (7) din Codul fiscal' };
const ALTE_LABELS = { c1: 'Valoarea totală a livrărilor/prestărilor din decontul precedent', c2: 'Valoarea totală a livrărilor/prestărilor din decontul curent' };
const tableRows = [];
for (const a of xmlAttrs) {
  if (a.composite || !a.path.startsWith('date.')) continue;
  const parent = a.path.slice(0, a.path.lastIndexOf('.'));
  const col = a.path.slice(a.path.lastIndexOf('.') + 1);
  const seg = parent.split('.')[1];
  if (seg === 'bife' || seg === 'rambursare') continue;
  const f = fields.get(a.path);
  const nrCrt = fields.get(`${parent}.nrCrt`)?.default ?? null;
  let label = fields.get(`${parent}.c1`)?.default ?? '';
  if (!label && FACTURI_LABELS[seg]) label = FACTURI_LABELS[seg];
  if (!label && seg === 'alteInfo') label = ALTE_LABELS[col];
  tableRows.push({
    path: a.path, attr: a.attr, section: sectionOf(a.path), row: nrCrt, col,
    label: label.replace(/\s+/g, ' ').trim(),
    computed: f ? f.access !== 'open' : false,
  });
}

const q = (s) => JSON.stringify(s);
let out = `// Generat de harness/gen-rows.mjs din codul original (genXML) si fields.json. Nu edita.
//
// Doua numerotari coexista in D300: cea AFISATA (rd.19 = total taxa colectata) si cea
// ISTORICA din XML (R17_1), pastrata de ANAF de la versiunile vechi ale formularului.
// Acest fisier e singurul loc unde se face traducerea. Modelul de domeniu lucreaza pe
// caile legacy; interfata afiseaza \`row\`; xml.ts urmeaza XML_ATTRIBUTES in ordine.

export const XML_NAMESPACE = ${q(xmlns)};
/** Exact ca in original: schemaLocation ramas pe v11 langa xmlns v12 (defect #1 din inventar). */
export const XML_SCHEMA_LOCATION = ${q(schemaLocation)};

export interface XmlAttrSpec { attr: string; path: string; via: 'rawValue' | 'editValue' }
export interface XmlCompositeSpec { attr: 'adresa'; composite: true }
export type XmlEntry = XmlAttrSpec | XmlCompositeSpec;

/** Ordinea exacta a atributelor emise de genXML. Atributele cu valoare null se omit. */
export const XML_ATTRIBUTES: readonly XmlEntry[] = [
${xmlAttrs.map((a) => (a.composite ? `  { attr: 'adresa', composite: true },` : `  { attr: ${q(a.attr)}, path: ${q(a.path)}, via: ${q(a.via)} },`)).join('\n')}
];

/** Partile adresei, concatenate in genXML ca "eticheta: valoare, ..." (judetul prin editValue). */
export const ADRESA_PARTS: readonly { path: string; label: string; via: 'rawValue' | 'editValue' }[] = [
${adresaParts.map((p) => `  { path: ${q(p.path)}, label: ${q(p.label)}, via: ${q(p.via)} },`).join('\n')}
];

export type Section = 'comert' | 'livrari' | 'achizitiiRO' | 'achizitiiIMP' | 'regularizari' | 'facturi' | 'nedeductibil' | 'alteInfo';
export interface RowSpec {
  path: string;
  attr: string;
  section: Section;
  /** numarul de rand AFISAT (nrCrt din formular); null pentru randurile fara numar */
  row: string | null;
  col: 'c1' | 'c2' | 'c3';
  label: string;
  /** true daca celula e calculata (protected/readOnly in formular) */
  computed: boolean;
}

export const TABLE_ROWS: readonly RowSpec[] = [
${tableRows.map((r) => `  { path: ${q(r.path)}, attr: ${q(r.attr)}, section: ${q(r.section)}, row: ${q(r.row)}, col: ${q(r.col)}, label: ${q(r.label)}, computed: ${r.computed} },`).join('\n')}
];

export const ROW_BY_PATH: ReadonlyMap<string, RowSpec> = new Map(TABLE_ROWS.map((r) => [r.path, r]));
export const ROW_BY_ATTR: ReadonlyMap<string, RowSpec> = new Map(TABLE_ROWS.map((r) => [r.attr, r]));
`;
fs.mkdirSync(path.join(root, 'src/domain'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/domain/rows.ts'), out);
console.log(`rows.ts: ${xmlAttrs.length} intrari XML (${xmlAttrs.filter((a) => a.composite).length} compusa), ${adresaParts.length} parti de adresa, ${tableRows.length} celule de tabel`);
console.log('xmlns:', xmlns, '| schemaLocation:', schemaLocation);
console.log('primele atribute:', xmlAttrs.slice(0, 6).map((a) => a.attr).join(', '));
