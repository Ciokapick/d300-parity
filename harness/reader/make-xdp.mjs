// Construieste un pachet XDP care deschide PDF-ul original D300 in Adobe Reader cu
// datele unui caz deja incarcate (valorile finale din fisierul de aur). In Reader
// raman de facut doar: VALIDARE, OK, Ctrl+S. XML-ul atasat de Reader se compara apoi
// cu cel din fisierul de aur (harness/reader/compare.mjs). Asta certifica ipotezele
// A1 si A2 ale runtime-ului si generatorul de XML, direct din motorul Adobe.
//   node harness/reader/make-xdp.mjs sample-01
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const name = process.argv[2] || 'sample-01';
const golden = JSON.parse(fs.readFileSync(path.join(root, 'harness/oracle/golden', `${name}.json`), 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'legacy/extracted/fields.json'), 'utf8'));
const pdf = fs.readFileSync(path.join(root, 'legacy/anaf/D300_v12.0.2_12022026.pdf'));

// campurile fara legatura de date (butoanele) nu intra in datasets
const unbound = new Set(inventory.fields.filter((f) => f.ui === 'button' || f.ui === 'signature').map((f) => f.path));
// stampila si codul universal sunt puse de formular, nu de utilizator
const skip = new Set(['form1.Antet.IdDoc.formValid', 'form1.Antet.IdDoc.universalCode']);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tree = {};
let n = 0;
for (const [p, v] of Object.entries(golden.values)) {
  if (v === null || unbound.has(p) || skip.has(p)) continue;
  // grupurile radio se leaga ca un singur element cu valoarea aleasa; butoanele DA/NU nu
  if (/\.(DA|NU)$/.test(p)) continue;
  const segs = p.split('.');
  let cur = tree;
  for (let i = 0; i < segs.length - 1; i++) cur = cur[segs[i]] ??= {};
  cur[segs[segs.length - 1]] = v;
  n++;
}
const render = (node, depth) => {
  const pad = ' '.repeat(depth);
  return Object.entries(node)
    .map(([k, v]) => (typeof v === 'object' ? `${pad}<${k}>\n${render(v, depth + 1)}${pad}</${k}>\n` : `${pad}<${k}>${esc(v)}</${k}>\n`))
    .join('');
};

const xdp = `<?xml version="1.0" encoding="UTF-8"?>
<?xfa generator="d300-parity" APIVersion="3.0.0"?>
<xdp:xdp xmlns:xdp="http://ns.adobe.com/xdp/">
<xfa:datasets xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/">
<xfa:data>
${render(tree, 0)}</xfa:data>
</xfa:datasets>
<pdf xmlns="http://ns.adobe.com/xdp/pdf/"><document><chunk>${pdf.toString('base64')}</chunk></document></pdf>
</xdp:xdp>
`;
const outDir = path.join(here, 'out');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.xdp`);
fs.writeFileSync(out, xdp);
console.log(`${out}: ${n} valori, ${(xdp.length / 1024).toFixed(0)} KB`);
