# -*- coding: utf-8 -*-
"""Extrage tot codul executabil din PDF-ul D300 (formular XFA de la ANAF).

Un formular inteligent ANAF are trei locuri in care poate trai cod:
  1. pachetele XFA (template, config, datasets...) - scripturile de camp
     stau in <script> in interiorul <event> din template
  2. arborele de nume /JavaScript la nivel de document
  3. actiunile /AA de pe campurile AcroForm (rar la XFA, dar verificam)

Scrie fiecare pachet XFA ca fisier, apoi toate scripturile intr-un singur
fisier indexat, cu calea campului si evenimentul care le declanseaza.
"""
import io, os, re, sys
from collections import Counter
from pypdf import PdfReader
from pypdf.generic import IndirectObject, ArrayObject, NameObject

SRC = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

reader = PdfReader(SRC)
root = reader.trailer['/Root']
print('pagini:', len(reader.pages))
print('producer:', reader.metadata.get('/Producer') if reader.metadata else None)
print('creator :', reader.metadata.get('/Creator') if reader.metadata else None)

def deref(o):
    return o.get_object() if isinstance(o, IndirectObject) else o

# ---------- 1. pachetele XFA ----------
acro = deref(root.get('/AcroForm'))
xfa = deref(acro.get('/XFA')) if acro else None
packets = {}
if xfa is None:
    print('XFA: lipsa (formular AcroForm clasic)')
elif isinstance(xfa, ArrayObject):
    for i in range(0, len(xfa), 2):
        name = str(deref(xfa[i]))
        data = deref(xfa[i + 1]).get_data()
        packets[name] = data
else:
    packets['xfa'] = deref(xfa).get_data()

for name, data in packets.items():
    fn = os.path.join(OUT, 'xfa_%s.xml' % name.strip('/').replace('/', '_'))
    io.open(fn, 'wb').write(data)
    print('pachet XFA %-14s %9d bytes -> %s' % (name, len(data), os.path.basename(fn)))

# ---------- 2. scripturile din template ----------
tpl = packets.get('template', b'')
try:
    tpl_text = tpl.decode('utf-8')
except UnicodeDecodeError:
    tpl_text = tpl.decode('latin-1')

# parcurgem XML-ul cu un parser tolerant, tinand evidenta caii de camp
import xml.etree.ElementTree as ET
scripts = []
def local(tag):
    return tag.split('}')[-1]

def walk(el, path):
    tag = local(el.tag)
    name = el.get('name')
    here = path
    if tag in ('subform', 'field', 'exclGroup', 'draw') and name:
        here = path + [name]
    if tag == 'event':
        act = el.get('activity', '?')
        for s in el:
            if local(s.tag) == 'script':
                scripts.append({
                    'path': '.'.join(here) or '(root)',
                    'event': act,
                    'lang': s.get('contentType', 'formcalc?'),
                    'code': (s.text or '').strip(),
                })
    # scripturi in <calculate>, <validate> (fara <event>)
    if tag in ('calculate', 'validate'):
        for s in el:
            if local(s.tag) == 'script':
                scripts.append({
                    'path': '.'.join(here) or '(root)',
                    'event': tag,
                    'lang': s.get('contentType', 'formcalc?'),
                    'code': (s.text or '').strip(),
                })
    for c in el:
        walk(c, here)

if tpl_text:
    try:
        rootel = ET.fromstring(tpl_text)
        walk(rootel, [])
    except ET.ParseError as e:
        print('template XML nu se parseaza:', e)

# ---------- 3. JavaScript la nivel de document ----------
doc_js = []
names = deref(root.get('/Names'))
if names and '/JavaScript' in names:
    jsTree = deref(names['/JavaScript'])
    def walk_names(node):
        node = deref(node)
        if '/Names' in node:
            arr = node['/Names']
            for i in range(0, len(arr), 2):
                act = deref(arr[i + 1])
                js = deref(act.get('/JS'))
                code = js.get_data().decode('latin-1') if hasattr(js, 'get_data') else str(js)
                doc_js.append((str(deref(arr[i])), code))
        for kid in node.get('/Kids', []):
            walk_names(kid)
    walk_names(jsTree)

# ---------- 4. actiuni /AA pe campuri AcroForm ----------
aa_js = []
fields = deref(acro.get('/Fields')) if acro else []
def walk_fields(arr):
    for f in arr or []:
        f = deref(f)
        aa = deref(f.get('/AA'))
        if aa:
            for k, v in aa.items():
                v = deref(v)
                js = deref(v.get('/JS')) if hasattr(v, 'get') else None
                if js is not None:
                    code = js.get_data().decode('latin-1') if hasattr(js, 'get_data') else str(js)
                    aa_js.append((str(f.get('/T')), k, code))
        walk_fields(f.get('/Kids'))
walk_fields(fields)

# ---------- raport ----------
with io.open(os.path.join(OUT, 'scripts_index.txt'), 'w', encoding='utf-8') as idx, \
     io.open(os.path.join(OUT, 'scripts_all.js'), 'w', encoding='utf-8') as allf:
    for i, s in enumerate(scripts, 1):
        idx.write('%4d  %-14s %-24s %6d chars  %s\n' % (i, s['event'], s['lang'][:24], len(s['code']), s['path']))
        allf.write('// ===== #%d  %s  [%s]  (%s)\n%s\n\n' % (i, s['path'], s['event'], s['lang'], s['code']))
    for n, code in doc_js:
        allf.write('// ===== DOC-LEVEL %s\n%s\n\n' % (n, code))
    for t, k, code in aa_js:
        allf.write('// ===== ACROFORM %s %s\n%s\n\n' % (t, k, code))

total = sum(len(s['code']) for s in scripts)
print()
print('scripturi XFA         :', len(scripts), '(%d chars)' % total)
print('  pe eveniment        :', dict(Counter(s['event'] for s in scripts)))
print('  pe limbaj           :', dict(Counter(s['lang'] for s in scripts)))
print('JS la nivel document  :', len(doc_js), '(%d chars)' % sum(len(c) for _, c in doc_js))
print('actiuni AcroForm /AA  :', len(aa_js))

# indicatori de cat de incalcit e codul
code_all = '\n'.join(s['code'] for s in scripts) + '\n'.join(c for _, c in doc_js)
probes = {
    'xfa.resolveNode(': code_all.count('xfa.resolveNode('),
    'xfa.host.': code_all.count('xfa.host.'),
    'rawValue': code_all.count('rawValue'),
    'formattedValue': code_all.count('formattedValue'),
    'presence': code_all.count('presence'),
    'messageBox': code_all.count('messageBox'),
    'eval(': code_all.count('eval('),
    'app.': code_all.count('app.'),
    'event.': code_all.count('event.'),
    'xfa.datasets': code_all.count('xfa.datasets'),
    'SOM path cu ..': code_all.count('..'),
    'functii declarate': len(re.findall(r'\bfunction\s+\w+\s*\(', code_all)),
}
print()
print('indicatori:')
for k, v in probes.items():
    print('  %-22s %d' % (k, v))

# campurile: cate, cate sunt calculate, cate au validare
n_fields = tpl_text.count('<field ')
print()
print('campuri in template   :', n_fields)
print('scripturi calculate   :', sum(1 for s in scripts if s['event'] == 'calculate'))
print('scripturi validate    :', sum(1 for s in scripts if s['event'] == 'validate'))

# ---------- 5. obiectele de scripturi (<variables><script name=...>) ----------
# Aici stau functiile partajate: genValid (validare + XML), valid (CUI/CNP/IBAN),
# utile (numar de evidenta, corelatii), conversii (escapare XML), oblig, formular, attach.
import json
objs = {}
if tpl_text:
    try:
        for var in ET.fromstring(tpl_text).iter():
            if local(var.tag) == 'variables':
                for s in var:
                    if local(s.tag) == 'script' and s.get('name'):
                        objs[s.get('name')] = s.text or ''
    except ET.ParseError:
        pass
for name, code in objs.items():
    io.open(os.path.join(OUT, 'scriptobj_%s.js' % name), 'w', encoding='utf-8').write(code)

# JSON pentru runtime-ul din harness/oracle: scripturile de eveniment si obiectele
json.dump(scripts, io.open(os.path.join(OUT, 'scripts.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(objs, io.open(os.path.join(OUT, 'scriptobjects.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('obiecte de scripturi  :', len(objs), '(%d chars)' % sum(len(c) for c in objs.values()),
      '->', ', '.join(objs))
