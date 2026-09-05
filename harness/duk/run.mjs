// Al treilea oracol: validatorul oficial Java al ANAF (D300Validator.jar prin
// DUKIntegrator), rulat pe XML-ul pe care il produce MODELUL pentru fiecare caz din
// corpus.
//
//   npm run duk                                    tot corpusul
//   npx tsx harness/duk/run.mjs --no-gen           doar cazurile scrise de mana
//   npx tsx harness/duk/run.mjs --jobs 4           cate procese Java in paralel
//   npx tsx harness/duk/run.mjs --only sample-01   un singur caz
//   npx tsx harness/duk/run.mjs --keep             pastreaza tools/duk/work/
//
// Se ruleaza cu tsx fiindca importa direct modelul nou din src/domain/*.ts, ca in
// harness/parity/run.mjs, si foloseste exact aceeasi enumerare a cazurilor (loadAll).
//
// DUKIntegrator NU are un mod care sa primeasca mai multe fisiere intr-un singur
// proces: linia de comanda documentata in kit (dist/doc/Instructiuni.txt) e
//     java -jar DUKIntegrator.jar [-c caleConfig] -v tipDeclaratie fisierXML [fisierRezultat]
// cu un singur fisier per apel. De aceea rulam un proces per XML, cu paralelism
// limitat. Fiecare lucrator primeste o COPIE a folderului config, fiindca
// DUKIntegrator scrie emergency.log / emergency.trc in el si procesele paralele s-ar
// calca pe fisiere.
//
// Iesirea: harness/duk/duk.json. Java NU se ruleaza niciodata din harness/parity;
// paritatea doar citeste fisierul asta, daca exista.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { createForm } from '../oracle/legacy-runtime.mjs';
import { loadAll, loadCase } from '../oracle/cases.mjs';
import { runCase as runModelCase } from '../../src/domain/engine.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const TOOLS = path.join(ROOT, 'tools');
const WORK = path.join(TOOLS, 'duk', 'work');
const DECL = 'D300';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : dflt;
};
const withGen = !flag('--no-gen');
const only = opt('--only', null);
const jobs = Math.max(1, Number(opt('--jobs', String(Math.min(8, Math.max(2, os.cpus().length))))) || 1);
const keepWork = flag('--keep');

// -------------------------------------------------------------------- uneltele
const isWin = process.platform === 'win32';
const javaBin = process.env.DUK_JAVA
  || path.join(TOOLS, 'jre', 'bin', isWin ? 'java.exe' : 'java');
const dukHome = process.env.DUK_HOME || path.join(TOOLS, 'duk', 'dist');
const dukJar = path.join(dukHome, 'DUKIntegrator.jar');
const cfgSrc = path.join(dukHome, 'config');
/** Calea, relativa la radacina proiectului cand e inauntru, absoluta cand nu e. */
const rel = (p) => {
  const r = path.relative(ROOT, p).replace(/\\/g, '/');
  return r.startsWith('..') ? p.replace(/\\/g, '/') : r;
};

function missing(what, cum) {
  console.error(`lipseste ${what}`);
  console.error(cum);
  console.error('\nInstalarea completa e descrisa in docs/DUK.md.');
  process.exit(2);
}
if (!fs.existsSync(javaBin)) {
  missing(`JRE-ul portabil (${rel(javaBin)})`,
    'Descarca Eclipse Temurin 21 (zip, windows x64) de pe api.adoptium.net si dezarhiveaza-l in tools/jre/,\n'
    + 'astfel incat sa existe tools/jre/bin/java.exe. Sau seteaza DUK_JAVA spre un java existent.');
}
if (!fs.existsSync(dukJar)) {
  missing(`kitul DUKIntegrator (${rel(dukJar)})`,
    'Descarca https://static.anaf.ro/static/DUKIntegrator/dist_javaInclus20200203.zip in tools/duk/,\n'
    + 'dezarhiveaza-l (rezulta tools/duk/dist/), copiaza D300Validator.jar si D300Pdf.jar din\n'
    + 'legacy/anaf/validator/ in tools/duk/dist/lib/ si sterge config/versiuniCurente.txt daca exista.\n'
    + 'Sau seteaza DUK_HOME spre folderul dist al unui kit deja instalat.');
}
for (const jar of ['D300Validator.jar', 'D300Pdf.jar']) {
  if (!fs.existsSync(path.join(dukHome, 'lib', jar))) {
    missing(`pluginul ${jar} din kitul DUKIntegrator (lib/${jar})`,
      `Copiaza legacy/anaf/validator/${jar} in ${rel(path.join(dukHome, 'lib'))}/ `
      + '(vezi modInstalare.txt din legacy/anaf/D300_20250910.zip).');
  }
}

const started = Date.now();

/** Prima linie din `java -version`, ca raportul sa spuna cu ce s-a rulat. */
function javaVersion() {
  return new Promise((res) => {
    execFile(javaBin, ['-version'], (err, stdout, stderr) => {
      const line = String(stderr || stdout || '').split('\n')[0].trim();
      res(line || 'necunoscuta');
    });
  });
}

// -------------------------------------------------------------------- cazurile
const entries = only
  ? [{ case: loadCase(only), gen: false }]
  : loadAll({ gen: withGen });
if (entries.length === 0) throw new Error('niciun caz de rulat');

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(path.join(WORK, 'xml'), { recursive: true });

// cate un folder config per lucrator: DUKIntegrator scrie emergency.log in el
const cfgs = [];
for (let i = 0; i < jobs; i++) {
  const d = path.join(WORK, `cfg-${i}`);
  fs.mkdirSync(d, { recursive: true });
  for (const f of fs.readdirSync(cfgSrc)) {
    if (f === 'versiuniCurente.txt') continue; // se sterge la instalarea unui plugin nou
    fs.copyFileSync(path.join(cfgSrc, f), path.join(d, f));
  }
  cfgs.push(d);
}

/**
 * Perioada de raportare din XML (`an` si `luna`): validatorul isi alege singur
 * versiunea de schema dupa ea, deci e coloana care explica erorile de namespace.
 */
function perioada(xml) {
  if (!xml) return null;
  const an = /\ban="(\d+)"/.exec(xml);
  const luna = /\bluna="(\d+)"/.exec(xml);
  return an ? `${an[1]}-${luna ? String(luna[1]).padStart(2, '0') : '??'}` : null;
}

/** lucrarile de trimis la Java: cate un XML de validat */
const tasks = [];
/** nume caz -> {gen, model, oracle, same} */
const byCase = new Map();
const runErrors = [];
let faraXml = 0;

for (const { case: c, gen } of entries) {
  let o;
  let m;
  try {
    o = createForm().runCase(c);
  } catch (e) {
    runErrors.push(`${c.name}: oracolul a aruncat -> ${e.message}`);
    continue;
  }
  try {
    m = runModelCase(c.inputs);
  } catch (e) {
    runErrors.push(`${c.name}: modelul a aruncat -> ${e.message}`);
    continue;
  }
  const same = o.xml === m.xml;
  byCase.set(c.name, { gen, model: m.xml, oracle: o.xml, same, perioada: perioada(m.xml) });
  if (!m.xml) { faraXml++; continue; }
  tasks.push({ id: `model:${c.name}`, case: c.name, side: 'model', xml: m.xml });
  // XML-ul oracolului se trimite doar cand difera ca sir: daca sirurile sunt egale
  // verdictul e identic prin constructie, exact ca la XSD in harness/parity/run.mjs
  if (o.xml && !same) tasks.push({ id: `oracle:${c.name}`, case: c.name, side: 'oracle', xml: o.xml });
}
tasks.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

for (const t of tasks) {
  t.xmlFile = path.join(WORK, 'xml', `${t.side}--${t.case}.xml`);
  t.errFile = `${t.xmlFile}.err.txt`;
  fs.writeFileSync(t.xmlFile, t.xml, 'utf8');
}

// -------------------------------------------------------------------- verdicte
/**
 * Verdictul unei rulari, din iesirea DUKIntegrator plus fisierul de rezultat.
 * `-v` lasa in fisierul de rezultat marca "ok" (validare fara nimic de semnalat),
 * atentionarile (cod 1) sau erorile (cod negativ); mesajul final de pe stdout spune
 * care din cele trei e - vezi Integrator.parseDocumentXML din sursele kitului.
 */
function verdict(stdout, errText) {
  const out = String(stdout || '');
  const txt = String(errText || '').replace(/\r\n/g, '\n').trim();
  let status;
  if (/^Validare fara erori fisier:/m.test(out)) status = 'ok';
  else if (/^Atentionari la validare fisier:/m.test(out)) status = 'atentionari';
  else if (/^(Erori la validare fisier|Perioada raportare eronata|Tip declaratie necunoscut)/m.test(out)) status = 'erori';
  else status = 'necunoscut';
  return { status, mesaje: txt === 'ok' ? [] : parseMessages(txt), raw: txt };
}

/**
 * Fisierul de rezultat e o succesiune de blocuri: un antet `E: <sectiune>` /
 * `A: <sectiune>` / `F: <sectiune>` urmat de una sau mai multe linii de mesaj.
 * Litera da gravitatea: E = eroare, A = atentionare, F = eroare fatala (structura).
 * Un caz poate avea mai multe blocuri, deci si mesaje de gravitati diferite.
 */
function parseMessages(txt) {
  const out = [];
  let sev = '?';
  let sectiune = '';
  for (const raw of txt.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const h = /^([EAF]):\s*(.*)$/.exec(line);
    if (h) { sev = h[1]; sectiune = h[2]; continue; }
    out.push({ sev, sectiune, text: line });
  }
  return out;
}

function runOne(task, cfg) {
  return new Promise((res) => {
    execFile(javaBin, ['-jar', dukJar, '-c', cfg, '-v', DECL, task.xmlFile, task.errFile],
      { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, windowsHide: true },
      (err, stdout, stderr) => {
        let errText = '';
        try { errText = fs.readFileSync(task.errFile, 'utf8'); } catch { /* fara fisier de rezultat */ }
        const v = verdict(stdout, errText);
        if (v.status === 'necunoscut') {
          v.stdout = String(stdout || '').trim();
          v.stderr = String(stderr || '').trim();
          if (err) v.spawnError = err.message;
        }
        res({ ...task, ...v });
      });
  });
}

async function pool() {
  const results = [];
  let next = 0;
  let done = 0;
  const total = tasks.length;
  await Promise.all(cfgs.map(async (cfg) => {
    for (;;) {
      const i = next++;
      if (i >= total) return;
      results.push(await runOne(tasks[i], cfg));
      done++;
      if (total >= 20 && (done % 25 === 0 || done === total)) {
        process.stderr.write(`\r  ${done} / ${total} XML-uri validate`);
      }
    }
  }));
  if (total >= 20) process.stderr.write('\n');
  return results;
}

/**
 * Cheia de grupare a unui mesaj: valorile concrete (intre apostrofuri, si numerele)
 * se inlocuiesc cu substituenti, ca doua aparitii ale aceleiasi reguli sa cada in
 * aceeasi grupa indiferent de datele cazului.
 */
function groupKey(line) {
  return line
    // regula V1 enumera atributele nenule gasite; lista difera de la caz la caz,
    // dar regula incalcata e aceeasi, deci lista se strange intr-un substituent
    .replace(/(urmatoarele atribute: ).*?( trebuie sa fie nule)/, '$1<lista>$2')
    .replace(/'[^']*'/g, "'X'")
    .replace(/(?<![A-Za-z0-9])-?\d+(?:[.,]\d+)?(?![A-Za-z0-9])/g, 'N')
    .replace(/\s+/g, ' ')
    .trim();
}

// -------------------------------------------------------------------- rularea
console.log(`java   : ${rel(javaBin)}`);
console.log(`duk    : ${rel(dukJar)}`);
console.log(`cazuri : ${byCase.size} (${tasks.length} XML-uri de validat, ${faraXml} fara XML), ${jobs} procese in paralel`);

const jv = await javaVersion();
const results = await pool();
const byId = new Map(results.map((r) => [r.id, r]));

const verdicte = [];
const verdictDiff = [];
for (const name of [...byCase.keys()].sort()) {
  const e = byCase.get(name);
  if (!e.model) continue;
  const r = byId.get(`model:${name}`);
  verdicte.push({
    case: name,
    gen: e.gen,
    perioada: e.perioada,
    status: r.status,
    mesaje: r.mesaje,
    ...(r.status === 'necunoscut' ? { stdout: r.stdout, stderr: r.stderr, spawnError: r.spawnError } : {}),
  });
  if (e.same) continue; // siruri egale -> verdict identic prin constructie
  const ro = e.oracle ? byId.get(`oracle:${name}`) : null;
  const so = ro ? ro.status : null;
  if (so !== r.status) verdictDiff.push({ case: name, oracle: so, model: r.status });
}

const acceptate = verdicte.filter((v) => v.status === 'ok' || v.status === 'atentionari');
const cuAtentionari = acceptate.filter((v) => v.status === 'atentionari');
const refuzate = verdicte.filter((v) => v.status === 'erori');
const necunoscute = verdicte.filter((v) => v.status === 'necunoscut');

const SEV = { E: 'eroare', A: 'atentionare', F: 'eroare fatala', '?': 'necunoscuta' };
const groups = new Map();
for (const v of [...refuzate, ...cuAtentionari]) {
  for (const msg of v.mesaje) {
    const k = `${msg.sev} ${groupKey(msg.text)}`;
    if (!groups.has(k)) {
      groups.set(k, {
        cheie: groupKey(msg.text), sev: msg.sev, fel: SEV[msg.sev] ?? msg.sev,
        sectiune: msg.sectiune, exemplu: msg.text, aparitii: 0, cazuri: new Set(),
      });
    }
    const g = groups.get(k);
    g.aparitii++;
    g.cazuri.add(v.case);
  }
}
const grupe = [...groups.values()]
  .map((g) => ({ ...g, cazuri: [...g.cazuri].sort() }))
  .sort((a, b) => b.cazuri.length - a.cazuri.length || (a.cheie < b.cheie ? -1 : 1));

const durationMs = Date.now() - started;
const iso = new Date();
const dataZi = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(iso.getDate()).padStart(2, '0')}`;

const report = {
  data: dataZi,
  unelte: {
    java: jv,
    javaCale: rel(javaBin),
    duk: rel(dukJar),
    validator: 'legacy/anaf/validator/D300Validator.jar (din legacy/anaf/D300Validator_11022026_2.zip)',
    declaratie: DECL,
  },
  comanda: `java -jar ${rel(dukJar)} -c <config> -v ${DECL} <fisier.xml> <fisier_erori>`,
  corpus: {
    cazuri: byCase.size,
    cuXml: verdicte.length,
    faraXml,
    generateIncluse: withGen && !only,
  },
  rezultat: {
    acceptate: acceptate.length,
    dintreCareCuAtentionari: cuAtentionari.length,
    refuzate: refuzate.length,
    necunoscute: necunoscute.length,
  },
  grupe,
  verdictDiferitOracolModel: verdictDiff,
  verdicte,
  probleme: runErrors,
  durataMs: durationMs,
};

// o rulare partiala (--only / --no-gen) nu are voie sa suprascrie rezultatul pe care il
// citeste paritatea: ar arata un corpus mai mic decat cel comparat
const partial = Boolean(only) || !withGen;
const outFile = path.join(here, partial ? 'duk.partial.json' : 'duk.json');
fs.writeFileSync(outFile, JSON.stringify(report, null, 1) + '\n');
if (!keepWork) fs.rmSync(WORK, { recursive: true, force: true });

console.log(`java ver : ${jv}`);
console.log(`acceptate: ${acceptate.length} / ${verdicte.length} (${cuAtentionari.length} doar cu atentionari)`);
console.log(`refuzate : ${refuzate.length}`);
if (necunoscute.length) console.log(`necunoscute: ${necunoscute.length} (vezi duk.json)`);
console.log(`grupe de mesaje: ${grupe.length}`);
for (const g of grupe.slice(0, 25)) console.log(`  ${String(g.cazuri.length).padStart(4)} cazuri  [${g.fel}] ${g.exemplu}`);
if (verdictDiff.length) console.log(`verdicte divergente oracol/model: ${verdictDiff.length}`);
console.log(`durata: ${(durationMs / 1000).toFixed(1)} s`);
console.log(`scris : ${rel(outFile)}${partial ? ' (rulare partiala: nu suprascrie duk.json)' : ''}`);

if (runErrors.length) {
  console.error(`\nPROBLEME DE RULARE (${runErrors.length}):`);
  for (const p of runErrors) console.error(`  ${p}`);
}
process.exit(runErrors.length || necunoscute.length ? 1 : 0);
