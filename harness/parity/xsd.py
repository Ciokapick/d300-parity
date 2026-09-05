# -*- coding: utf-8 -*-
"""Al doilea oracol, intr-un singur proces: valideaza un lot de XML-uri fata de XSD-ul
oficial ANAF v12.

Citeste de pe stdin un JSON `[{"name": "...", "xml": "..."}, ...]` si scrie pe stdout
`{"verdicts": [{"name": "...", "ok": true|false, "message": "..."}]}`.

Un singur proces pentru tot corpusul: schema se compileaza o data, nu de 800 de ori.

Fisierul XSD are extensia .xml pe site-ul ANAF; continutul e o schema.

  echo '[{"name":"x","xml":"<a/>"}]' | python harness/parity/xsd.py --xsd legacy/anaf/d300_v12_11022026.xml
"""
import argparse
import json
import os
import sys

from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--xsd', default=os.path.join(ROOT, 'legacy', 'anaf', 'd300_v12_11022026.xml'))
    args = ap.parse_args()

    payload = json.load(sys.stdin)
    schema = etree.XMLSchema(etree.parse(args.xsd))

    verdicts = []
    for item in payload:
        name = item.get('name')
        raw = item.get('xml')
        if not raw:
            verdicts.append({'name': name, 'ok': None, 'message': 'fara XML'})
            continue
        try:
            doc = etree.fromstring(raw.encode('utf-8'))
        except etree.XMLSyntaxError as exc:
            verdicts.append({'name': name, 'ok': False, 'message': 'XML malformat: %s' % exc})
            continue
        tree = etree.ElementTree(doc)
        if schema.validate(tree):
            verdicts.append({'name': name, 'ok': True, 'message': ''})
        else:
            msgs = '; '.join(e.message for e in schema.error_log)
            verdicts.append({'name': name, 'ok': False, 'message': msgs})

    json.dump({'verdicts': verdicts}, sys.stdout, ensure_ascii=False)
    return 0


if __name__ == '__main__':
    sys.exit(main())
