// Ruleaza un caz prin codul original D300 si scrie rezultatele in out/.
//   node harness/oracle/run.mjs sample-01
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createForm } from './legacy-runtime.mjs';
import { loadCase } from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] || 'sample-01';
// substituentii ({{CUI}}, {{IBAN}}, ...) sunt expandati determinist de cases.mjs
const c = loadCase(name);

const r = createForm().runCase(c);

// numele poate fi si `gen/gen-1-0002`; pentru fisierele din out/ il aplatizam
const slug = name.replace(/[\/]/g, '-');
const outDir = path.join(here, 'out');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${slug}.values.json`), JSON.stringify(r.values, null, 1));
fs.writeFileSync(path.join(outDir, `${slug}.log.json`), JSON.stringify({ log: r.log, erori: r.erori, unshimmed: r.unshimmed }, null, 1));
if (r.xml) fs.writeFileSync(path.join(outDir, `${slug}.xml`), r.xml);

const v = (p) => r.values[`form1.${p}`];
console.log(`caz: ${r.name}   treceri de recalculare: ${r.passes}`);
console.log(`mesaje: ${r.log.length}`);
for (const m of r.log) console.log(`  [${m.kind}] ${(m.title ? m.title + ' | ' : '') + m.text.replace(/\s+/g, ' ').slice(0, 110)}`);
console.log(`\ncampuri evidentiate cu rosu (obligatorii lipsa): ${r.highlighted.length ? r.highlighted.map((p) => p.replace('form1.', '')).join(', ') : '-'}`);
console.log(`\nErori si avertizari.txt: ${r.erori ? '\n' + r.erori : '(nu a fost generat)'}`);
console.log(`D300.xml: ${r.xml ? `generat, ${r.xml.length} caractere -> out/${slug}.xml` : 'NU a fost generat'}`);
console.log('\nvalori cheie:');
for (const p of ['Antet.nr_evid', 'Antet.metaDate.totalPlata_A', 'identifCntr.adresa.loc',
  'date.livrari.r9.c3', 'date.livrari.r10.c3', 'date.livrari.r19.c2', 'date.livrari.r19.c3',
  'date.achizitiiIMP.r24.c3', 'date.achizitiiIMP.r31.c3', 'date.achizitiiIMP.r36.c3',
  'date.regularizari.r37.c3', 'date.regularizari.r38.c3', 'date.regularizari.r41.c3',
  'date.regularizari.r44.c3', 'date.regularizari.r45.c3', 'date.regularizari.r46.c3']) {
  console.log(`  ${p.padEnd(34)} ${v(p)}`);
}
console.log(`\nAPI Acrobat neacoperit de shim (${r.unshimmed.length}): ${r.unshimmed.join(', ') || '-'}`);
