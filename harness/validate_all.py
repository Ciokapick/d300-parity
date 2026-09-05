# -*- coding: utf-8 -*-
"""Valideaza toate XML-urile din fisierele de aur fata de XSD-ul oficial v12.

   python harness/validate_all.py
   python harness/validate_all.py --xsd legacy/anaf/d300_v12_11022026.xml --golden harness/oracle/golden

Al doilea oracol, aplicat pe tot corpusul deodata. XML-ul e citit din campul `xml`
al fiecarui fisier de aur (exact sirul pe care originalul il ataseaza ca D300.xml),
nu dintr-un fisier separat.

Fisierul XSD are extensia .xml pe site-ul ANAF; continutul e o schema.
"""
import argparse
import json
import os
import sys
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def golden_files(golden_dir):
    """Fisierele de aur: intai cele scrise de mana, apoi cele generate din gen/."""
    out = []
    if os.path.isdir(golden_dir):
        for name in sorted(os.listdir(golden_dir)):
            if name.endswith('.json'):
                out.append((os.path.join(golden_dir, name), False))
        gen = os.path.join(golden_dir, 'gen')
        if os.path.isdir(gen):
            for name in sorted(os.listdir(gen)):
                if name.endswith('.json'):
                    out.append((os.path.join(gen, name), True))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--xsd', default=os.path.join(ROOT, 'legacy', 'anaf', 'd300_v12_11022026.xml'))
    ap.add_argument('--golden', default=os.path.join(ROOT, 'harness', 'oracle', 'golden'))
    ap.add_argument('--quiet', action='store_true', help='doar rezumatul si lista invalidelor')
    args = ap.parse_args()

    schema = etree.XMLSchema(etree.parse(args.xsd))
    files = golden_files(args.golden)
    if not files:
        print('nu am gasit fisiere de aur in %s (ruleaza intai node harness/oracle/golden.mjs)' % args.golden)
        return 2

    total = valid = invalid = fara_xml = 0
    manual_total = gen_total = 0
    problems = []

    for path, is_gen in files:
        with open(path, encoding='utf-8') as fh:
            g = json.load(fh)
        total += 1
        if is_gen:
            gen_total += 1
        else:
            manual_total += 1
        raw = g.get('xml')
        if not raw:
            fara_xml += 1
            continue
        # genXML face encodeURI si apoi decodeURI inainte de a rescrie atasamentul,
        # deci ce ajunge in fisierul de aur e deja text curat; il parsam ca atare
        text = raw
        try:
            doc = etree.fromstring(text.encode('utf-8'))
        except etree.XMLSyntaxError as exc:
            invalid += 1
            problems.append((g['name'], 'XML malformat: %s' % exc))
            continue
        tree = etree.ElementTree(doc)
        if schema.validate(tree):
            valid += 1
        else:
            invalid += 1
            msgs = '; '.join(e.message for e in schema.error_log)
            problems.append((g['name'], msgs))

    print('fisiere de aur      : %d (%d scrise de mana, %d generate)' % (total, manual_total, gen_total))
    print('fara XML (erori)    : %d' % fara_xml)
    print('XML valide fata XSD : %d' % valid)
    print('XML invalide        : %d' % invalid)
    if problems and not args.quiet:
        print('')
        for name, msg in problems:
            print('  %-30s %s' % (name, msg))
    return 0 if invalid == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
