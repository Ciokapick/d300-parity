// Harnessul de paritate: acelasi caz prin AMBELE implementari, diferenta e livrabilul.
//
//   npx tsx harness/parity/run.mjs        (npm run parity)
//   npx tsx harness/parity/run.mjs --no-xsd     sare peste al doilea oracol
//   npx tsx harness/parity/run.mjs --no-gen     doar cazurile scrise de mana
//
// Se ruleaza cu tsx fiindca importa direct modelul nou din src/domain/*.ts, fara build.
//
// Pentru fiecare caz din harness/oracle/cases (scrise de mana) si cases/gen (generate):
//   1. oracolul: codul ANAF original din PDF, rulat neschimbat in Node, formular
//      PROASPAT per caz (createForm().runCase) - starea acumulata, access/mandatory/
//      fillColor, nu se reseteaza intre cazuri;
//   2. modelul: runCase din src/domain/engine.ts;
//   3. se compara mesajele (ordonat), valorile TUTUROR campurilor, campurile
//      evidentiate (ca multime), fisierul de erori si XML-ul (egalitate de sir).
// Cheile oracolului au prefixul `form1.`, cele ale modelului nu; prefixul se taie
// inainte de comparatie, nu se adauga.
//
// Diferentele declarate in expected.json sunt raportate separat, ca "asteptate".
// Ies cu 0 daca nu exista diferente NEASTEPTATE, cu 1 altfel.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { createForm } from '../oracle/legacy-runtime.mjs';
import { loadAll } from '../oracle/cases.mjs';
import { runCase as runModelCase } from '../../src/domain/engine.ts';
import { LIVE_RULE_IDS, RULES, SET_B_FIELDS, UPPERCASE_FIELDS } from '../../src/domain/rules/registry.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const XSD = path.join(ROOT, 'legacy', 'anaf', 'd300_v12_11022026.xml');
const PDF_VERSION = 'D300_v12.0.2_12022026.pdf';

const argv = process.argv.slice(2);
const withGen = !argv.includes('--no-gen');
const withXsd = !argv.includes('--no-xsd');

const started = Date.now();

// ------------------------------------------------------------------ utilitare
const strip = (p) => (typeof p === 'string' ? p.replace(/^form1\./, '') : p);
const show = (v) => (v === undefined ? '(absent)' : JSON.stringify(v));

/** Un mesaj adus la o forma comuna: aceleasi chei, in aceeasi ordine, fara prefix. */
const normMsg = (m) => ({
  kind: m.kind,
  title: m.title === undefined ? null : m.title,
  text: m.text,
  field: m.field === undefined ? null : strip(m.field),
});

/** Un sir lung taiat pentru raport, cu marcarea taieturii. */
const clip = (s, n = 160) => {
  if (typeof s !== 'string') return show(s);
  return s.length <= n ? JSON.stringify(s) : JSON.stringify(s.slice(0, n)) + ` ...(+${s.length - n} car.)`;
};

/** Primul index in care doua siruri difera, pentru a arata exact unde. */
function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return n;
}

// ------------------------------------------------------------ dovezi indirecte
// Noua reguli din registru sunt functii pure (checksums.ts, nrEvid.ts, xml.ts): nu
// primesc `ctx`, deci NU pot ajunge in `trace` oricat de bogat ar fi corpusul. Absenta
// lor din acoperire e o lipsa de instrumentare in model, nu o gaura in corpus. Pentru
// fiecare masuram, din rezultatul rularii, in cate cazuri s-a indeplinit conditia in
// care apelantul le cheama - un criteriu explicit, verificabil, nu o presupunere.
const TEXT_FIELDS = [...new Set([...UPPERCASE_FIELDS, ...SET_B_FIELDS])];
const CIF_FIELDS = ['Antet.cifS', 'identifCntr.denumire.cif'];
const len = (v) => (v === null || v === undefined ? 0 : String(v).length);

const INDIRECT = [
  {
    id: 'xml.genXML', criteriu: 'cazuri in care validForm a trecut si s-a generat D300.xml',
    hit: (m) => m.xml !== null,
  },
  {
    id: 'nrEvid.calcul', criteriu: 'cazuri in care Antet.nr_evid a iesit nenul (calc.nr_evid a apelat calculateRegistrationNumber)',
    hit: (m) => m.state.values['Antet.nr_evid'] != null,
  },
  {
    id: 'checksums.cui', criteriu: 'cazuri cu un cod de identificare nenul de cel mult 10 caractere (ramura isCUI din exit.cif.identificare)',
    hit: (m) => CIF_FIELDS.some((f) => { const n = len(m.state.values[f]); return n > 0 && n <= 10; }),
  },
  {
    id: 'checksums.cnpNif', criteriu: 'cazuri cu un cod de identificare de 11-13 caractere (ramura isCnpNif)',
    hit: (m) => CIF_FIELDS.some((f) => { const n = len(m.state.values[f]); return n >= 11 && n <= 13; }),
  },
  {
    id: 'checksums.cnp', criteriu: 'cazuri cu un cod de 13 caractere care nu incepe cu 9 (isCnpNif deleaga spre isCNP)',
    hit: (m) => CIF_FIELDS.some((f) => { const v = m.state.values[f]; return len(v) === 13 && String(v)[0] !== '9'; }),
  },
  {
    id: 'checksums.iban', criteriu: 'cazuri cu identifCntr.banca.iban nenul (exit.iban apeleaza isValidIBANNumber)',
    hit: (m) => m.state.values['identifCntr.banca.iban'] != null,
  },
  {
    id: 'checksums.telefon', criteriu: 'cazuri cu telefon sau fax nenul (regex-ul regTel e evaluat)',
    hit: (m) => m.state.values['identifCntr.contact.telefon'] != null || m.state.values['identifCntr.contact.fax'] != null,
  },
  {
    id: 'checksums.email', criteriu: 'cazuri cu identifCntr.contact.email nenul (regex-ul de email e evaluat)',
    hit: (m) => m.state.values['identifCntr.contact.email'] != null,
  },
  {
    id: 'checksums.text', criteriu: 'cazuri cu cel putin un camp text nenul supus trimSpaces / invalidChr',
    hit: (m) => TEXT_FIELDS.some((f) => m.state.values[f] != null),
  },
];
const indirect = new Map(INDIRECT.map((e) => [e.id, { ...e, manual: 0, gen: 0 }]));

// ------------------------------------------------------------------ comparatia
/**
 * Toate diferentele dintre rezultatul oracolului si cel al modelului, pentru un caz.
 * Fiecare diferenta: {case, category, path, oracle, model}.
 * category: mesaje | valori | highlighted | erori | xml
 */
function compare(name, o, m) {
  const diffs = [];
  const add = (category, p, oracle, model) => diffs.push({ case: name, category, path: p, oracle, model });

  // --- mesaje: ordonate, comparate pozitie cu pozitie
  const ol = o.log.map(normMsg);
  const ml = m.messages.map(normMsg);
  for (let i = 0; i < Math.max(ol.length, ml.length); i++) {
    const a = ol[i];
    const b = ml[i];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      add('mesaje', `[${i}]`, a === undefined ? undefined : a, b === undefined ? undefined : b);
    }
  }

  // --- valori: reuniunea cheilor, ca sa prindem si un camp lipsa dintr-o parte
  const ov = {};
  for (const [k, v] of Object.entries(o.values)) ov[strip(k)] = v;
  const mv = m.state.values;
  const keys = [...new Set([...Object.keys(ov), ...Object.keys(mv)])].sort();
  for (const k of keys) {
    const a = Object.prototype.hasOwnProperty.call(ov, k) ? ov[k] : undefined;
    const b = Object.prototype.hasOwnProperty.call(mv, k) ? mv[k] : undefined;
    // egalitate stricta: 0 !== null !== "0"; A2 cere ca decimalele sa fie numere
    if (!Object.is(a, b)) add('valori', k, a, b);
  }

  // --- highlighted: multime
  const oh = new Set(o.highlighted.map(strip));
  const mh = new Set([...m.state.highlighted].map(strip));
  for (const k of [...new Set([...oh, ...mh])].sort()) {
    if (oh.has(k) !== mh.has(k)) add('highlighted', k, oh.has(k), mh.has(k));
  }

  // --- erori: sir sau null
  if (o.erori !== m.erori) {
    const p = o.erori && m.erori ? `car. ${firstDiff(o.erori, m.erori)}` : null;
    add('erori', p, o.erori, m.erori);
  }

  // --- xml: egalitate de sir, octet cu octet
  if (o.xml !== m.xml) {
    const p = o.xml && m.xml ? `car. ${firstDiff(o.xml, m.xml)}` : null;
    add('xml', p, o.xml, m.xml);
  }

  return diffs;
}

// ------------------------------------------------------------------ asteptate
/**
 * O diferenta e "asteptata" daca exista o intrare in expected.json cu acelasi caz si
 * aceeasi categorie, iar `path` fie lipseste din intrare (acopera toata categoria),
 * fie e egal cu calea diferentei.
 */
function matchExpected(diff, expected) {
  return expected.find((e) => e.case === diff.case
    && e.category === diff.category
    && (e.path === undefined || e.path === null || e.path === diff.path));
}

// ------------------------------------------------------------------ rularea
// corpusul generat e regenerabil (si e in .gitignore): daca lipseste, il refacem cu
// exact comanda din raport, ca tabelul sa acopere mereu si cele 300 de cazuri
const GEN_DIR = path.join(ROOT, 'harness', 'oracle', 'cases', 'gen');
if (withGen && (!fs.existsSync(GEN_DIR) || fs.readdirSync(GEN_DIR).filter((f) => f.endsWith('.json')).length === 0)) {
  console.log('corpusul generat lipseste; il regenerez (--seed 1 --count 300)');
  const g = spawnSync(process.execPath, [path.join(ROOT, 'harness', 'oracle', 'generate.mjs'),
    '--seed', '1', '--count', '300', '--out', 'cases/gen'], { encoding: 'utf8' });
  if (g.status !== 0) throw new Error(`generate.mjs a esuat: ${(g.stderr || '').trim()}`);
}

const entries = loadAll({ gen: withGen });
if (entries.length === 0) throw new Error('niciun caz de rulat (ruleaza node harness/oracle/generate.mjs --seed 1 --count 300 --out cases/gen)');

const expectedFile = path.join(here, 'expected.json');
const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
if (!Array.isArray(expected)) throw new Error('expected.json trebuie sa fie o lista');

const stats = {
  total: 0,
  manual: 0,
  gen: 0,
  xml: 0,
  erori: 0,
  incomplete: 0,
  mesaje: 0,
  identice: 0,
};
const unexpected = [];
const acknowledged = [];
const errors = [];
const coverage = { manual: new Set(), gen: new Set() };
const xmlBatch = [];
/** name -> {xml, sameString} pentru raportul XSD */
const xmlByCase = new Map();

for (const { case: c, gen } of entries) {
  let o;
  let m;
  try {
    o = createForm().runCase(c); // formular proaspat: starea acumulata nu se scurge intre cazuri
  } catch (e) {
    errors.push(`${c.name}: oracolul a aruncat -> ${e.message}`);
    continue;
  }
  if (o.unshimmed.length) errors.push(`${c.name}: API Acrobat neacoperit -> ${o.unshimmed.join(', ')}`);
  try {
    m = runModelCase(c.inputs);
  } catch (e) {
    errors.push(`${c.name}: modelul a aruncat -> ${e.message}`);
    continue;
  }

  stats.total++;
  if (gen) stats.gen++; else stats.manual++;
  if (o.xml) stats.xml++;
  if (o.erori) stats.erori++;
  if (!o.xml && !o.erori) stats.incomplete++;
  stats.mesaje += o.log.length;

  const set = gen ? coverage.gen : coverage.manual;
  for (const t of m.trace) set.add(t.rule);
  for (const e of indirect.values()) if (e.hit(m)) e[gen ? 'gen' : 'manual']++;

  const diffs = compare(c.name, o, m);
  if (diffs.length === 0) stats.identice++;
  for (const d of diffs) {
    const e = matchExpected(d, expected);
    if (e) acknowledged.push({ ...d, reason: e.reason ?? '' });
    else unexpected.push(d);
  }

  xmlByCase.set(c.name, { model: m.xml, oracle: o.xml, same: o.xml === m.xml });
  if (withXsd) {
    if (m.xml) xmlBatch.push({ name: `model:${c.name}`, xml: m.xml });
    // XML-ul oracolului se trimite doar cand difera ca sir: daca sirurile sunt egale
    // verdictul e identic prin constructie si a doua validare n-ar dovedi nimic
    if (o.xml && o.xml !== m.xml) xmlBatch.push({ name: `oracle:${c.name}`, xml: o.xml });
  }
}

// ------------------------------------------------------------------ XSD
const xsd = { rulat: false, valide: 0, invalide: 0, faraXml: 0, invalidList: [], verdictDiff: [], eroare: null };
if (withXsd) {
  if (!fs.existsSync(XSD)) {
    xsd.eroare = `XSD-ul lipseste: ${path.relative(ROOT, XSD)}`;
  } else {
    const py = process.env.PYTHON || 'python';
    const r = spawnSync(py, [path.join(here, 'xsd.py'), '--xsd', XSD], {
      input: JSON.stringify(xmlBatch),
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
    if (r.error || r.status !== 0) {
      xsd.eroare = `xsd.py a esuat (${py}): ${(r.stderr || r.error?.message || '').trim().split('\n').slice(-3).join(' | ')}`;
    } else {
      const verdicts = new Map(JSON.parse(r.stdout).verdicts.map((v) => [v.name, v]));
      xsd.rulat = true;
      for (const [name, e] of xmlByCase) {
        if (!e.model) { xsd.faraXml++; continue; }
        const v = verdicts.get(`model:${name}`);
        if (v.ok) xsd.valide++;
        else { xsd.invalide++; xsd.invalidList.push({ case: name, message: v.message }); }
        // verdictul trebuie sa fie acelasi pe XML-ul oracolului
        if (e.same) continue; // siruri egale -> verdict identic prin constructie
        const vo = verdicts.get(`oracle:${name}`);
        const okO = e.oracle ? vo.ok : null;
        if (okO !== v.ok) xsd.verdictDiff.push({ case: name, oracle: okO, model: v.ok });
      }
    }
  }
}

// ------------------------------------------------- DUK (al treilea oracol)
// Validatorul oficial Java NU se ruleaza de aici: paritatea trebuie sa ramana de
// ordinul secundelor, iar un proces Java per XML dureaza minute. Citim doar
// rezultatul lasat de `npm run duk` (harness/duk/duk.json), daca exista.
const DUK_JSON = path.join(ROOT, 'harness', 'duk', 'duk.json');
let duk = null;
if (fs.existsSync(DUK_JSON)) {
  try {
    const d = JSON.parse(fs.readFileSync(DUK_JSON, 'utf8'));
    // cazurile din duk.json trebuie sa fie cele din rularea curenta; daca nu sunt,
    // raportul spune asta in loc sa amestece doua corpusuri
    const rulate = new Set((d.verdicte ?? []).map((v) => v.case));
    const lipsa = [...xmlByCase.keys()].filter((n) => xmlByCase.get(n).model && !rulate.has(n));
    duk = { ...d, lipsa, invechit: lipsa.length > 0 || rulate.size !== stats.xml };
  } catch (e) {
    duk = { eroare: `duk.json nu poate fi citit: ${e.message}` };
  }
}

// ------------------------------------------------------------------ acoperire
const live = [...LIVE_RULE_IDS];
const all = new Set([...coverage.manual, ...coverage.gen]);
const necunoscute = [...all].filter((id) => !live.includes(id)).sort();
const neatinse = live.filter((id) => !all.has(id));
const neatinseManual = live.filter((id) => !coverage.manual.has(id));
const neatinseGen = live.filter((id) => !coverage.gen.has(id));
const dead = RULES.filter((r) => r.dead).map((r) => ({ id: r.id, source: r.source, when: r.when }));

// neatinsele se despart in doua: cele fara punct de instrumentare (functii pure, nu pot
// ajunge in trace) si cele care au ctx.fire dar nu s-au declansat pe niciun caz
const neinstrumentate = neatinse.filter((id) => indirect.has(id));
const chiarNeatinse = neatinse.filter((id) => !indirect.has(id));
const dovezi = [...indirect.values()].map((e) => ({
  id: e.id,
  criteriu: e.criteriu,
  manual: e.manual,
  gen: e.gen,
  total: e.manual + e.gen,
  inTrace: all.has(e.id),
}));
const doveziZero = dovezi.filter((d) => d.total === 0);
const realAtinse = live.length - chiarNeatinse.length - doveziZero.length;

const durationMs = Date.now() - started;
const bucket = durationMs < 5000 ? 'sub 5 s' : durationMs < 15000 ? 'sub 15 s' : durationMs < 60000 ? 'sub 60 s' : 'peste 60 s';

// ------------------------------------------------------------------ parity.json
const iso = new Date();
const dataZi = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(iso.getDate()).padStart(2, '0')}`;

const report = {
  data: dataZi,
  sursa: { pdf: PDF_VERSION, xsd: path.relative(ROOT, XSD).replace(/\\/g, '/') },
  comenzi: {
    genereaza: 'node harness/oracle/generate.mjs --seed 1 --count 300 --out cases/gen',
    paritate: 'npm run parity',
    paritateRegen: 'npm run parity:regen',
  },
  cazuri: {
    total: stats.total,
    manual: stats.manual,
    generate: stats.gen,
    cuXml: stats.xml,
    cuErori: stats.erori,
    opriteObligatorii: stats.incomplete,
    mesajeTotal: stats.mesaje,
    identice: stats.identice,
  },
  diferente: {
    neasteptate: unexpected.length,
    asteptate: acknowledged.length,
    listaNeasteptate: unexpected,
    listaAsteptate: acknowledged,
  },
  acoperire: {
    live: live.length,
    atinse: live.length - neatinse.length,
    neatinse,
    neatinseDoarManual: neatinseManual,
    neatinseDoarGenerat: neatinseGen,
    atinseManual: live.length - neatinseManual.length,
    atinseGenerat: live.length - neatinseGen.length,
    neatinseFaraInstrumentare: neinstrumentate,
    neatinseCuInstrumentare: chiarNeatinse,
    doveziIndirecte: dovezi,
    idNecunoscuteInTrace: necunoscute,
    moarte: dead,
  },
  xsd: {
    rulat: xsd.rulat,
    eroare: xsd.eroare,
    valide: xsd.valide,
    invalide: xsd.invalide,
    faraXml: xsd.faraXml,
    invalidList: xsd.invalidList,
    verdictDiferitOracolModel: xsd.verdictDiff,
  },
  duk: duk === null ? { rulat: false, motiv: 'harness/duk/duk.json lipseste (ruleaza npm run duk)' } : {
    rulat: !duk.eroare,
    eroare: duk.eroare ?? null,
    data: duk.data ?? null,
    invechit: duk.invechit ?? null,
    cazuriLipsa: duk.lipsa ?? [],
    unelte: duk.unelte ?? null,
    comanda: duk.comanda ?? null,
    rezultat: duk.rezultat ?? null,
    grupe: (duk.grupe ?? []).map((g) => ({ fel: g.fel, exemplu: g.exemplu, cazuri: g.cazuri.length })),
    verdictDiferitOracolModel: duk.verdictDiferitOracolModel ?? [],
  },
  probleme: errors,
  durataMs: durationMs,
};

fs.writeFileSync(path.join(here, 'parity.json'), JSON.stringify(report, null, 1) + '\n');

// ------------------------------------------------------------------ PARITATE.md
const verdict = errors.length ? 'PROBLEME DE RULARE'
  : unexpected.length ? `${unexpected.length} DIFERENTE NEASTEPTATE`
    : 'PARITATE COMPLETA';

const L = [];
L.push('# Tabelul de paritate D300');
L.push('');
L.push('| verificare | rezultat |');
L.push('|---|---|');
L.push(`| cazuri rulate prin ambele implementari | ${stats.total} (${stats.manual} scrise de mana, ${stats.gen} generate) |`);
L.push(`| cazuri identice cap-coada | ${stats.identice} / ${stats.total} |`);
L.push(`| diferente neasteptate | **${unexpected.length}** |`);
L.push(`| diferente asteptate (declarate in expected.json) | ${acknowledged.length} |`);
L.push(`| reguli vii atinse de corpus | ${live.length - neatinse.length} / ${live.length} in \`trace\`, ${realAtinse} / ${live.length} cu dovezile indirecte |`);
L.push(`| XML-uri valide fata de XSD-ul oficial v12 | ${xsd.valide} / ${xsd.valide + xsd.invalide} |`);
if (duk && !duk.eroare && duk.rezultat) {
  L.push(`| XML-uri acceptate de validatorul oficial ANAF (DUKIntegrator) | ${duk.rezultat.acceptate} / ${duk.corpus.cuXml} |`);
}
L.push(`| **verdict** | **${verdict}** |`);
L.push('');
L.push('Comparate pe fiecare caz: mesajele (ordonate, cu textul verbatim), valorile');
L.push('**tuturor** campurilor, campurile evidentiate, fisierul `Erori si avertizari.txt`');
L.push('si `D300.xml` ca sir, octet cu octet.');
L.push('');
L.push('## Ce se compara cu ce');
L.push('');
L.push('| | oracol | model |');
L.push('|---|---|---|');
L.push(`| cod | ANAF, neschimbat din \`${PDF_VERSION}\`, rulat in Node prin \`harness/oracle/legacy-runtime.mjs\` | \`src/domain\`, TypeScript, scris de la zero dupa \`src/domain/rules/registry.ts\` |`);
L.push('| stare | formular proaspat (`createForm()`) pentru fiecare caz | stare initiala pentru fiecare caz |');
L.push('| chei | cu prefixul `form1.` | fara prefix (prefixul se taie la comparatie) |');
L.push('');
L.push('## Corpusul');
L.push('');
L.push('| categorie | cazuri |');
L.push('|---|---|');
L.push(`| scrise de mana (\`harness/oracle/cases\`) | ${stats.manual} |`);
L.push(`| generate determinist (\`--seed 1 --count 300\`) | ${stats.gen} |`);
L.push(`| **total** | **${stats.total}** |`);
L.push(`| dintre care ajung la XML | ${stats.xml} |`);
L.push(`| dintre care produc fisier de erori | ${stats.erori} |`);
L.push(`| dintre care se opresc pe campuri obligatorii | ${stats.incomplete} |`);
L.push(`| mesaje produse in total | ${stats.mesaje} |`);
L.push('');

L.push('## Diferente neasteptate');
L.push('');
if (unexpected.length === 0) {
  L.push('Niciuna. Pe toate cele ' + stats.total + ' de cazuri, modelul produce exact ce produce');
  L.push('codul original: aceleasi mesaje in aceeasi ordine, aceleasi valori pe toate campurile,');
  L.push('aceleasi campuri evidentiate, acelasi fisier de erori, acelasi XML.');
} else {
  L.push(`**${unexpected.length}.** Fiecare e un bug de raportat, nu de ascuns in \`expected.json\`.`);
  L.push('');
  L.push('| caz | categorie | cale | oracol | model |');
  L.push('|---|---|---|---|---|');
  for (const d of unexpected.slice(0, 200)) {
    const p = d.path === null || d.path === undefined ? '-' : `\`${d.path}\``;
    L.push(`| \`${d.case}\` | ${d.category} | ${p} | ${clip(d.oracle, 90).replace(/\|/g, '\\|')} | ${clip(d.model, 90).replace(/\|/g, '\\|')} |`);
  }
  if (unexpected.length > 200) L.push(`| ... | ... | ... | inca ${unexpected.length - 200} in \`parity.json\` | |`);
}
L.push('');

L.push('## Diferente asteptate');
L.push('');
if (acknowledged.length === 0) {
  L.push('Niciuna declarata. `harness/parity/expected.json` e lista goala, iar politica din');
  L.push('`docs/DIFERENTE.md` e zero abateri: modelul reproduce originalul inclusiv defectele.');
} else {
  L.push('| caz | categorie | cale | motiv |');
  L.push('|---|---|---|---|');
  for (const d of acknowledged) {
    const p = d.path === null || d.path === undefined ? '-' : `\`${d.path}\``;
    L.push(`| \`${d.case}\` | ${d.category} | ${p} | ${d.reason} |`);
  }
}
L.push('');

L.push('## Acoperirea regulilor');
L.push('');
L.push('Reuniunea id-urilor din `trace` peste tot corpusul, fata de `LIVE_RULE_IDS` din');
L.push('`src/domain/rules/registry.ts`.');
L.push('');
L.push('| corpus | reguli atinse |');
L.push('|---|---|');
L.push(`| scrise de mana | ${live.length - neatinseManual.length} / ${live.length} |`);
L.push(`| generate | ${live.length - neatinseGen.length} / ${live.length} |`);
L.push(`| **reuniune** | **${live.length - neatinse.length} / ${live.length}** |`);
L.push('');
const listRules = (title, ids) => {
  L.push(`**${title}** (${ids.length})`);
  L.push('');
  if (ids.length === 0) L.push('- niciuna');
  else for (const id of ids) L.push(`- \`${id}\``);
  L.push('');
};
L.push('Listele de mai jos numara doar regulile **instrumentate** (cele care apeleaza');
L.push('`ctx.fire`). Cele 9 fara punct de instrumentare sunt tratate separat, mai jos.');
L.push('');
listRules('Neatinse de niciun caz, desi au punct de instrumentare (`ctx.fire`)', chiarNeatinse);
listRules('Neatinse de corpusul scris de mana', neatinseManual.filter((id) => !indirect.has(id)));
listRules('Neatinse de corpusul generat', neatinseGen.filter((id) => !indirect.has(id)));
if (necunoscute.length) listRules('Id-uri aparute in trace dar absente din registru (bug de registru)', necunoscute);

if (neinstrumentate.length) {
  L.push(`### Reguli fara punct de instrumentare (${neinstrumentate.length})`);
  L.push('');
  L.push('Aceste reguli sunt implementate ca **functii pure** in `src/domain/checksums.ts`,');
  L.push('`src/domain/nrEvid.ts` si `src/domain/xml.ts`: nu primesc `ctx`, deci nu apeleaza');
  L.push('`ctx.fire` si **nu pot** aparea in `trace`, oricat de bogat ar fi corpusul. Absenta lor');
  L.push('din tabelul de mai sus e o lipsa de instrumentare in model, nu o gaura in corpus.');
  L.push('Nu le-am "reparat": harnessul nu modifica `src/**`.');
  L.push('');
  L.push('Cat sunt totusi exercitate se masoara indirect, pe un criteriu explicit per regula:');
  L.push('numarul de cazuri in care s-a indeplinit conditia in care apelantul le cheama.');
  L.push('');
  L.push('| regula | criteriul de apel | de mana | generate | total |');
  L.push('|---|---|---|---|---|');
  for (const d of dovezi) {
    L.push(`| \`${d.id}\` | ${d.criteriu} | ${d.manual} | ${d.gen} | **${d.total}** |`);
  }
  L.push('');
  if (doveziZero.length) {
    const l = doveziZero.map((d) => `\`${d.id}\``).join(', ');
    L.push(doveziZero.length === 1
      ? `Una singura nu e atinsa nici indirect: ${l}. Aici e o gaura **reala** de corpus,`
      : `${doveziZero.length} nu sunt atinse nici indirect: ${l}. Aici sunt gauri **reale** de corpus,`);
    L.push('nu de instrumentare: niciun caz nu satisface criteriul de apel.');
    if (doveziZero.some((d) => d.id === 'checksums.cnp')) {
      L.push('');
      L.push('Pentru `checksums.cnp` motivul e explicit si documentat: generatorul refuza');
      L.push('deliberat CNP-urile care incep cu 7, 8 sau 9 (pentru ele `valid.isCNP` citeste data');
      L.push('curenta, deci rezultatul n-ar mai fi reproductibil - vezi capul lui');
      L.push('`harness/oracle/generate.mjs`) si emite doar CUI-uri de 8 cifre, iar cele doua cazuri');
      L.push('de mana cu 13 cifre (`id-03`, `id-04`) sunt NIF-uri care incep cu 9, deci `isCnpNif`');
      L.push('se opreste la hash si nu deleaga spre `isCNP`. Ramane de acoperit cu un caz scris de');
      L.push('mana, cu un CNP care incepe cu 1..6 (secol fix, fara dependenta de data curenta).');
    }
  } else {
    L.push('Toate cele ' + dovezi.length + ' sunt exercitate de corpus; le lipseste doar urma in `trace`.');
  }
  L.push('');
  L.push(`Cu dovezile indirecte luate in calcul, acoperirea reala e **${realAtinse} / ${live.length}**.`);
  L.push('');
}
L.push('Regulile marcate `dead: true` in registru sunt cod mort in original (comentat sau');
L.push('inert); nu intra in `LIVE_RULE_IDS` si nu pot fi atinse:');
L.push('');
L.push('| regula | sursa in legacy | motivul |');
L.push('|---|---|---|');
for (const d of dead) L.push(`| \`${d.id}\` | ${d.source} | ${d.when} |`);
L.push('');

L.push('## XSD (al doilea oracol)');
L.push('');
if (!xsd.rulat) {
  L.push(`Nerulat: ${xsd.eroare ?? 'dezactivat cu --no-xsd'}.`);
} else {
  L.push(`Schema: \`${path.relative(ROOT, XSD).replace(/\\/g, '/')}\` (extensia e \`.xml\` pe site-ul ANAF, continutul e un XSD).`);
  L.push('Validarea ruleaza intr-un singur proces Python (`harness/parity/xsd.py`), nu unul per caz.');
  L.push('');
  L.push('| | |');
  L.push('|---|---|');
  L.push(`| XML-uri produse de model | ${xsd.valide + xsd.invalide} |`);
  L.push(`| valide fata de XSD | ${xsd.valide} |`);
  L.push(`| invalide | ${xsd.invalide} |`);
  L.push(`| cazuri fara XML (formular respins de original) | ${xsd.faraXml} |`);
  L.push(`| verdicte diferite intre XML-ul oracolului si al modelului | ${xsd.verdictDiff.length} |`);
  L.push('');
  if (xsd.invalide) {
    L.push('XML-urile invalide sunt cele prevazute de **defectul #14** din `docs/INVENTAR-LEGACY.md`:');
    L.push('formularul accepta un cod de identificare pe care XSD-ul il refuza (`cif` admite NIF de');
    L.push('13 cifre prin `isCnpNif` si lasa sa treaca un CUI cu 0 in fata, doar avertizand, dar');
    L.push('atributul `cui` din schema e `[1-9]\\d{1,9}`). Nu e o diferenta de paritate: oracolul');
    L.push('produce exact acelasi XML invalid, deci dezacordul e intre PDF si schema, nu intre');
    L.push('implementari.');
    L.push('');
    L.push('| caz | mesajul schemei |');
    L.push('|---|---|');
    for (const p of xsd.invalidList) L.push(`| \`${p.case}\` | ${p.message.replace(/\|/g, '\\|')} |`);
    L.push('');
  }
  if (xsd.verdictDiff.length) {
    L.push('**Verdicte diferite** (nu ar trebui sa existe: sirurile XML sunt comparate octet cu octet):');
    L.push('');
    L.push('| caz | oracol | model |');
    L.push('|---|---|---|');
    for (const p of xsd.verdictDiff) L.push(`| \`${p.case}\` | ${p.oracle} | ${p.model} |`);
    L.push('');
  }
}

L.push('## Validatorul oficial ANAF (al treilea oracol)');
L.push('');
if (duk === null) {
  L.push('Nerulat: `harness/duk/duk.json` lipseste. Se produce cu `npm run duk`, care cere');
  L.push('un JRE portabil in `tools/jre/` si kitul DUKIntegrator in `tools/duk/`; instalarea si');
  L.push('analiza rezultatelor sunt in [`DUK.md`](DUK.md).');
} else if (duk.eroare) {
  L.push(`Nerulat: ${duk.eroare}`);
} else {
  L.push('Rulat separat, nu din acest harness: un proces Java per XML dureaza minute, iar');
  L.push('paritatea trebuie sa ramana de ordinul secundelor. Tabelul de mai jos e citit din');
  L.push('`harness/duk/duk.json`, produs de `npm run duk`. Analiza pe categorii: [`DUK.md`](DUK.md).');
  L.push('');
  L.push('```');
  L.push(duk.comanda);
  L.push('```');
  L.push('');
  if (duk.invechit) {
    L.push(`**Atentie:** \`duk.json\` e dintr-o alta rulare decat corpusul curent (${duk.lipsa.length} cazuri`);
    L.push('cu XML nu apar in el). Ruleaza din nou `npm run duk`.');
    L.push('');
  }
  L.push('| | |');
  L.push('|---|---|');
  L.push(`| XML-uri trimise validatorului | ${duk.corpus.cuXml} |`);
  L.push(`| acceptate | ${duk.rezultat.acceptate} |`);
  L.push(`| dintre care doar cu atentionari | ${duk.rezultat.dintreCareCuAtentionari} |`);
  L.push(`| refuzate | ${duk.rezultat.refuzate} |`);
  L.push(`| cazuri fara XML (formular respins de original) | ${duk.corpus.faraXml} |`);
  L.push(`| verdicte diferite intre XML-ul oracolului si al modelului | ${duk.verdictDiferitOracolModel.length} |`);
  L.push('');
  if (duk.grupe.length) {
    L.push('Mesajele validatorului, grupate (valorile concrete inlocuite cu substituenti):');
    L.push('');
    L.push('| cazuri | gravitate | mesaj |');
    L.push('|---|---|---|');
    for (const g of duk.grupe) {
      L.push(`| ${g.cazuri.length} | ${g.fel} | ${g.exemplu.replace(/\|/g, '\\|')} |`);
    }
    L.push('');
  }
  if (duk.verdictDiferitOracolModel.length) {
    L.push('**Verdicte diferite** (nu ar trebui sa existe: sirurile XML sunt comparate octet cu octet):');
    L.push('');
    L.push('| caz | oracol | model |');
    L.push('|---|---|---|');
    for (const p of duk.verdictDiferitOracolModel) L.push(`| \`${p.case}\` | ${p.oracle} | ${p.model} |`);
    L.push('');
  }
}
L.push('');

if (errors.length) {
  L.push('## Probleme de rulare');
  L.push('');
  for (const p of errors) L.push(`- ${p}`);
  L.push('');
}

L.push('## Reproducere');
L.push('');
L.push('```bash');
L.push('npm ci');
L.push('# corpusul generat (300 de cazuri, determinist din seed)');
L.push('node harness/oracle/generate.mjs --seed 1 --count 300 --out cases/gen');
L.push('# tabelul de paritate: ambele implementari pe tot corpusul + XSD');
L.push('npm run parity');
L.push('# sau, intr-un pas, cu regenerarea corpusului:');
L.push('npm run parity:regen');
L.push('```');
L.push('');
L.push('Iesirile: `harness/parity/parity.json` (pentru masina) si acest fisier (pentru om).');
L.push('Cod de iesire 0 daca nu exista diferente neasteptate, 1 altfel.');
L.push('');
L.push('## Rulare');
L.push('');
L.push('Tot ce e mai sus e determinist: doua rulari dau acelasi fisier. Datele care variaza');
L.push('de la o rulare la alta stau doar aici.');
L.push('');
L.push(`- data: ${dataZi}`);
L.push(`- PDF-ul sursa: \`${PDF_VERSION}\``);
if (duk && !duk.eroare) L.push(`- validatorul oficial: rulat pe ${duk.data} cu ${duk.unelte.java}`);
L.push(`- timpul de rulare: ${bucket} (valoarea exacta in milisecunde, in \`parity.json\`)`);
L.push('');

fs.writeFileSync(path.join(ROOT, 'docs', 'PARITATE.md'), L.join('\n'));

// ------------------------------------------------------------------ consola
console.log(`cazuri            : ${stats.total} (${stats.manual} de mana, ${stats.gen} generate)`);
console.log(`identice cap-coada: ${stats.identice} / ${stats.total}`);
console.log(`diferente         : ${unexpected.length} neasteptate, ${acknowledged.length} asteptate`);
console.log(`reguli atinse     : ${live.length - neatinse.length} / ${live.length}${neatinse.length ? ` (neatinse: ${neatinse.join(', ')})` : ''}`);
if (xsd.rulat) console.log(`XSD               : ${xsd.valide} valide, ${xsd.invalide} invalide, ${xsd.verdictDiff.length} verdicte divergente`);
else console.log(`XSD               : nerulat${xsd.eroare ? ` (${xsd.eroare})` : ''}`);
if (duk === null) console.log('DUK               : nerulat (harness/duk/duk.json lipseste; npm run duk)');
else if (duk.eroare) console.log(`DUK               : ${duk.eroare}`);
else console.log(`DUK               : ${duk.rezultat.acceptate} acceptate, ${duk.rezultat.refuzate} refuzate (din ${duk.corpus.cuXml}), rulat ${duk.data}${duk.invechit ? ' -- INVECHIT fata de corpusul curent' : ''}`);
console.log(`durata            : ${(durationMs / 1000).toFixed(1)} s`);
console.log(`scris             : docs/PARITATE.md, harness/parity/parity.json`);

if (errors.length) {
  console.error(`\nPROBLEME DE RULARE (${errors.length}):`);
  for (const p of errors) console.error(`  ${p}`);
}
if (unexpected.length) {
  console.error(`\nDIFERENTE NEASTEPTATE (${unexpected.length}):`);
  for (const d of unexpected.slice(0, 40)) {
    console.error(`  ${d.case} [${d.category}] ${d.path ?? ''}\n     oracol: ${clip(d.oracle, 120)}\n     model : ${clip(d.model, 120)}`);
  }
  if (unexpected.length > 40) console.error(`  ... inca ${unexpected.length - 40}, in parity.json`);
}

process.exit(unexpected.length || errors.length ? 1 : 0);
