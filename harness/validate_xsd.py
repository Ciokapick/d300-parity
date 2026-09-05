# -*- coding: utf-8 -*-
"""Valideaza un XML D300 fata de schema oficiala ANAF (al doilea oracol).
   python harness/validate_xsd.py legacy/anaf/d300_v12_11022026.xml harness/oracle/out/sample-01.xml
"""
import sys
from lxml import etree

xsd_path, xml_path = sys.argv[1], sys.argv[2]
schema = etree.XMLSchema(etree.parse(xsd_path))
doc = etree.parse(xml_path)
root = doc.getroot()
print('radacina :', etree.QName(root).localname, '  namespace:', etree.QName(root).namespace)
print('atribute :', len(root.attrib))
ok = schema.validate(doc)
print('XSD      :', 'VALID' if ok else 'INVALID')
for e in schema.error_log:
    print('   linia %s: %s' % (e.line, e.message))
sys.exit(0 if ok else 1)
