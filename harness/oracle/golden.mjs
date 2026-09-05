// Ruleaza TOATE cazurile prin codul original si scrie fisierele de aur.
//
//   node harness/oracle/golden.mjs            scrie golden/ (si golden/gen/)
//   node harness/oracle/golden.mjs --check    recalculeaza si compara cu ce e pe disc
//   node harness/oracle/golden.mjs --no-gen   doar cazurile scrise de mana
//
// Fiecare caz primeste un formular proaspat (createForm), fiindca runCase reseteaza
// valorile dar nu si starea acumulata: access, mandatory, fillColor.
// Ne oprim cu eroare daca un caz arunca sau daca `unshimmed` nu e gol.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createForm } from './legacy-runtime.mjs';
import { loadAll } from './cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN = path.join(here, 'golden');
const GOLDEN_GEN = path.join(GOLDEN, 'gen');

const args = process.argv.slice(2);
const check = args.includes('--check');
const withGen = !args.includes('--no-gen');

const entries = loadAll({ gen: withGen });
if (entries.length === 0) throw new Error('niciun caz de rulat');

fs.mkdirSync(GOLDEN, { recursive: true });
if (entries.some((e) => e.gen)) fs.mkdirSync(GOLDEN_GEN, { recursive: true });

const stats = { total: 0, manual: 0, gen: 0, xml: 0, erori: 0, incomplete: 0, mesaje: 0 };
const problems = [];
const diffs = [];

for (const { case: c, gen } of entries) {
  let r;
  try {
    r = createForm().runCase(c);
  } catch (e) {
    problems.push(`${c.name}: a aruncat -> ${e.message}`);
    continue;
  }
  if (r.unshimmed.length) problems.push(`${c.name}: API Acrobat neacoperit -> ${r.unshimmed.join(', ')}`);

  stats.total++;
  if (gen) stats.gen++; else stats.manual++;
  if (r.xml) stats.xml++;
  if (r.erori) stats.erori++;
  if (!r.xml && !r.erori) stats.incomplete++;
  stats.mesaje += r.log.length;

  const golden = {
    name: c.name,
    descriere: c.descriere ?? '',
    inputs: c.inputs,
    passes: r.passes,
    log: r.log,
    values: r.values,
    highlighted: r.highlighted,
    xml: r.xml,
    erori: r.erori,
  };
  const text = JSON.stringify(golden, null, 1) + '\n';
  const file = path.join(gen ? GOLDEN_GEN : GOLDEN, `${c.name}.json`);
  if (check) {
    const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (old !== text) diffs.push(c.name);
  } else {
    fs.writeFileSync(file, text);
  }
}

if (problems.length) {
  console.error(`\nPROBLEME (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`cazuri: ${stats.total} (${stats.manual} scrise de mana, ${stats.gen} generate)`);
console.log(`  cu XML generat        : ${stats.xml}`);
console.log(`  cu fisier de erori    : ${stats.erori}`);
console.log(`  oprite pe obligatorii : ${stats.incomplete}`);
console.log(`  mesaje in total       : ${stats.mesaje}`);
console.log(`  API Acrobat neacoperit: 0`);

if (check) {
  if (diffs.length) {
    console.error(`\nNEDETERMINIST: ${diffs.length} fisiere de aur difera: ${diffs.slice(0, 10).join(', ')}`);
    process.exit(1);
  }
  console.log('\n--check: toate fisierele de aur sunt identice cu cele de pe disc.');
} else {
  console.log(`\nscrise in ${path.relative(process.cwd(), GOLDEN)}`);
}
