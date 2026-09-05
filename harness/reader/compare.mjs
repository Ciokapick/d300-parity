// Extrage atasamentul D300.xml dintr-un PDF salvat din Adobe Reader dupa VALIDARE si
// il compara, octet cu octet, cu XML-ul din fisierul de aur al aceluiasi caz.
//   node harness/reader/compare.mjs sample-01 harness/reader/out/sample-01.reader.pdf
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const name = process.argv[2] || 'sample-01';
const pdfPath = process.argv[3] || path.join(here, 'out', `${name}.reader.pdf`);
const golden = JSON.parse(fs.readFileSync(path.join(root, 'harness/oracle/golden', `${name}.json`), 'utf8'));

// pypdf citeste atasamentele; Python e deja cerut de proiect pentru XSD
const py = `
import sys, json
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
out = {}
for name, data in r.attachments.items():
    out[name] = [d.decode('utf-8', 'replace') for d in data]
print(json.dumps(out))
`;
const attachments = JSON.parse(execFileSync('python', ['-c', py, pdfPath], { encoding: 'utf8' }));
const names = Object.keys(attachments);
console.log('atasamente in PDF:', names.join(', ') || '(niciunul)');
const reader = (attachments['D300.xml'] || [])[0];
if (!reader) {
  console.log('Nu exista D300.xml atasat: formularul nu a fost validat cu succes in Reader.');
  const erori = (attachments['Erori si avertizari.txt'] || [])[0];
  if (erori) console.log('Erori si avertizari.txt:\n' + erori);
  process.exit(1);
}
const ours = golden.xml;
const same = reader === ours;
console.log(`Reader : ${reader.length} caractere`);
console.log(`aur    : ${ours.length} caractere`);
console.log(same ? 'IDENTIC octet cu octet' : 'DIFERIT');
if (!same) {
  let i = 0;
  while (i < Math.min(reader.length, ours.length) && reader[i] === ours[i]) i++;
  console.log(`prima diferenta la pozitia ${i}:`);
  console.log('  Reader:', JSON.stringify(reader.slice(Math.max(0, i - 40), i + 80)));
  console.log('  aur   :', JSON.stringify(ours.slice(Math.max(0, i - 40), i + 80)));
  fs.writeFileSync(path.join(here, 'out', `${name}.reader.xml`), reader);
}
process.exit(same ? 0 : 2);
