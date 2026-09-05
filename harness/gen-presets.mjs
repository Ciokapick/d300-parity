// Genereaza src/ui/presets.json din cazurile de mana ale corpusului, cu substituentii
// ({{CUI}}, {{IBAN}}...) deja expandati prin cases.mjs. UI-ul incarca un caz rulandu-i
// intrarile prin store, exact ca un utilizator; jurnalul trebuie sa coincida cu aurul.
//   node harness/gen-presets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCase } from './oracle/cases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const casesDir = path.join(here, 'oracle', 'cases');
const names = fs.readdirSync(casesDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();

const presets = names.map((name) => {
  const c = loadCase(name);
  return {
    name: c.name,
    descriere: c.descriere ?? '',
    inputs: c.inputs.map(([p, v]) => [String(p).replace(/^form1\./, ''), String(v)]),
  };
});

const out = path.join(here, '..', 'src', 'ui', 'presets.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(presets, null, 1) + '\n');
console.log(`presets.json: ${presets.length} cazuri, ${presets.reduce((n, p) => n + p.inputs.length, 0)} intrari`);
