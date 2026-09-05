# Tabelul de paritate D300

| verificare | rezultat |
|---|---|
| cazuri rulate prin ambele implementari | 418 (118 scrise de mana, 300 generate) |
| cazuri identice cap-coada | 418 / 418 |
| diferente neasteptate | **0** |
| diferente asteptate (declarate in expected.json) | 0 |
| reguli vii atinse de corpus | 52 / 52 in `trace`, 52 / 52 cu dovezile indirecte |
| XML-uri valide fata de XSD-ul oficial v12 | 359 / 364 |
| XML-uri acceptate de validatorul oficial ANAF (DUKIntegrator) | 206 / 364 |
| **verdict** | **PARITATE COMPLETA** |

Comparate pe fiecare caz: mesajele (ordonate, cu textul verbatim), valorile
**tuturor** campurilor, campurile evidentiate, fisierul `Erori si avertizari.txt`
si `D300.xml` ca sir, octet cu octet.

## Ce se compara cu ce

| | oracol | model |
|---|---|---|
| cod | ANAF, neschimbat din `D300_v12.0.2_12022026.pdf`, rulat in Node prin `harness/oracle/legacy-runtime.mjs` | `src/domain`, TypeScript, scris de la zero dupa `src/domain/rules/registry.ts` |
| stare | formular proaspat (`createForm()`) pentru fiecare caz | stare initiala pentru fiecare caz |
| chei | cu prefixul `form1.` | fara prefix (prefixul se taie la comparatie) |

## Corpusul

| categorie | cazuri |
|---|---|
| scrise de mana (`harness/oracle/cases`) | 118 |
| generate determinist (`--seed 1 --count 300`) | 300 |
| **total** | **418** |
| dintre care ajung la XML | 364 |
| dintre care produc fisier de erori | 27 |
| dintre care se opresc pe campuri obligatorii | 27 |
| mesaje produse in total | 918 |

## Diferente neasteptate

Niciuna. Pe toate cele 418 de cazuri, modelul produce exact ce produce
codul original: aceleasi mesaje in aceeasi ordine, aceleasi valori pe toate campurile,
aceleasi campuri evidentiate, acelasi fisier de erori, acelasi XML.

## Diferente asteptate

Niciuna declarata. `harness/parity/expected.json` e lista goala, iar politica din
`docs/DIFERENTE.md` e zero abateri: modelul reproduce originalul inclusiv defectele.

## Acoperirea regulilor

Reuniunea id-urilor din `trace` peste tot corpusul, fata de `LIVE_RULE_IDS` din
`src/domain/rules/registry.ts`.

| corpus | reguli atinse |
|---|---|
| scrise de mana | 52 / 52 |
| generate | 36 / 52 |
| **reuniune** | **52 / 52** |

Listele de mai jos numara doar regulile **instrumentate** (cele care apeleaza
`ctx.fire`). Cele 9 fara punct de instrumentare sunt tratate separat, mai jos.

**Neatinse de niciun caz, desi au punct de instrumentare (`ctx.fire`)** (0)

- niciuna

**Neatinse de corpusul scris de mana** (0)

- niciuna

**Neatinse de corpusul generat** (14)

- `change.uppercase`
- `change.numeric.silent`
- `change.numeric.alert`
- `change.numeric.codPst`
- `enter.loc.judet-intai`
- `enter.temeiLegal.conditie`
- `enter.cifS.conditie`
- `exit.an.minim`
- `exit.perioada.data`
- `exit.temeiLegal.fortat`
- `exit.caractere.setB`
- `exit.caen.exclusiv`
- `exit.r30.min`
- `exit.nedeductibil.A`

Regulile marcate `dead: true` in registru sunt cod mort in original (comentat sau
inert); nu intra in `LIVE_RULE_IDS` si nu pot fi atinse:

| regula | sursa in legacy | motivul |
|---|---|---|
| `change.ctrl-clears` | #44 #46 #87 | utilizatorul tine Ctrl apasat |
| `enter.r12.dead` | #150 #153 #155 #158 | comentat integral |
| `exit.dead` | #134 #135 #159 #160 #194 | comentat integral (corelatiile rd.7/7.1 si rd.17 eliminate in A11.0.5) |
| `validate.dead` | #145 #147 #204 #208 #210 | comentat integral (defect #7) |

## XSD (al doilea oracol)

Schema: `legacy/anaf/d300_v12_11022026.xml` (extensia e `.xml` pe site-ul ANAF, continutul e un XSD).
Validarea ruleaza intr-un singur proces Python (`harness/parity/xsd.py`), nu unul per caz.

| | |
|---|---|
| XML-uri produse de model | 364 |
| valide fata de XSD | 359 |
| invalide | 5 |
| cazuri fara XML (formular respins de original) | 54 |
| verdicte diferite intre XML-ul oracolului si al modelului | 0 |

XML-urile invalide sunt cele prevazute de **defectul #14** din `docs/INVENTAR-LEGACY.md`:
formularul accepta un cod de identificare pe care XSD-ul il refuza (`cif` admite NIF de
13 cifre prin `isCnpNif` si lasa sa treaca un CUI cu 0 in fata, doar avertizand, dar
atributul `cui` din schema e `[1-9]\d{1,9}`). Nu e o diferenta de paritate: oracolul
produce exact acelasi XML invalid, deci dezacordul e intre PDF si schema, nu intre
implementari.

| caz | mesajul schemei |
|---|---|
| `id-03-nif-valid-13-cifre` | Element '{mfp:anaf:dgti:d300:declaratie:v12}declaratie300', attribute 'cui': [facet 'pattern'] The value '9000000000015' is not accepted by the pattern '[1-9]\d{1,9}'. |
| `id-04-nif-invalid-13-cifre` | Element '{mfp:anaf:dgti:d300:declaratie:v12}declaratie300', attribute 'cui': [facet 'pattern'] The value '9000000000016' is not accepted by the pattern '[1-9]\d{1,9}'. |
| `id-09-cui-cu-zero-la-inceput` | Element '{mfp:anaf:dgti:d300:declaratie:v12}declaratie300', attribute 'cui': [facet 'pattern'] The value '01234567' is not accepted by the pattern '[1-9]\d{1,9}'. |
| `id-12-cnp-valid-13-cifre` | Element '{mfp:anaf:dgti:d300:declaratie:v12}declaratie300', attribute 'cui': [facet 'pattern'] The value '1800101221144' is not accepted by the pattern '[1-9]\d{1,9}'. |
| `id-13-cnp-31-februarie-trece` | Element '{mfp:anaf:dgti:d300:declaratie:v12}declaratie300', attribute 'cui': [facet 'pattern'] The value '1800231221144' is not accepted by the pattern '[1-9]\d{1,9}'. |

## Validatorul oficial ANAF (al treilea oracol)

Rulat separat, nu din acest harness: un proces Java per XML dureaza minute, iar
paritatea trebuie sa ramana de ordinul secundelor. Tabelul de mai jos e citit din
`harness/duk/duk.json`, produs de `npm run duk`. Analiza pe categorii: [`DUK.md`](DUK.md).

```
java -jar tools/duk/dist/DUKIntegrator.jar -c <config> -v D300 <fisier.xml> <fisier_erori>
```

| | |
|---|---|
| XML-uri trimise validatorului | 364 |
| acceptate | 206 |
| dintre care doar cu atentionari | 14 |
| refuzate | 158 |
| cazuri fara XML (formular respins de original) | 54 |
| verdicte diferite intre XML-ul oracolului si al modelului | 0 |

Mesajele validatorului, grupate (valorile concrete inlocuite cu substituenti):

| cazuri | gravitate | mesaj |
|---|---|---|
| 110 | eroare fatala | eroare structura: namespace ('mfp:anaf:dgti:d300:declaratie:v12') lipsa sau incorect la sectiunea declaratie300. Valoarea corecta este xmlns='mfp:anaf:dgti:d300:declaratie:v10' |
| 110 | eroare fatala | va rugam sa verificati daca folositi versiunea corecta de PDF inteligent sau daca XML-ul creat contine namespace-ul conform schemei XSD (pentru perioada de raportare) |
| 38 | eroare | eroare atribut: cui: CUI invalid ('68116490') |
| 20 | eroare | S-a bifat ca se aplica metoda simplificata pentru operatiuni interne dar s-au gasit valori in randurile: 1, 2, 3, 3.1, 4, 5, 5.1, 6, 7, 7.1, 8, 20, 20.1, 21, 22, 22.1, 23, 28.1 |
| 20 | eroare | eroare regula: V1: daca bifa_interne = 1 atunci si urmatoarele atribute: R3_1 (44640), R5_1_1 (276603), R18_1_1 (276603) trebuie sa fie nule |
| 15 | atentionare | TVA(12.2) nu se incadreaza in 11% +- marja 1% |
| 9 | eroare | eroare atribut: cuiSuccesor: CUI invalid ('18597230') |
| 4 | atentionare | atentionare regula: R51: 8% din abs(R11_1 (27164)) (2173) <= abs(R11_2 (815)) <= 10% din abs(R11_1) (2716) |
| 4 | atentionare | atentionare regula: R55: 20% din abs(R12_1_1 (7802450)) (1560490) <= abs(R12_1_2 (546172)) <= 22% din abs(R12_1_1) (1716539) |
| 4 | atentionare | atentionare regula: R92: 20% din abs(R25_1_1 (7802450)) (1560490) <= abs(R25_1_2 (546172)) <= 22% din abs(R25_1_1) (1716539) |
| 4 | eroare | eroare atribut: cui: sir mai lung de 10 caractere ('9000000000015') |
| 2 | atentionare | atentionare regula: R49: 10% din abs(R10_1 (869254)) (86925) <= abs(R10_2 (541666)) <= 12% din abs(R10_1) (104310) |
| 2 | atentionare | atentionare regula: R57: 10% din abs(R12_2_1 (56502900)) (5650290) <= abs(R12_2_2 (2071773)) <= 12% din abs(R12_2_1) (6780348) |
| 2 | atentionare | atentionare regula: R84: 20% din abs(R22_1 (61425400)) (12285080) <= abs(R22_2 (-117815)) <= 22% din abs(R22_1) (13513588) |
| 2 | atentionare | atentionare regula: R94: 10% din abs(R25_2_1 (56502900)) (5650290) <= abs(R26_2_2 (2071773)) <= 12% din abs(R25_2_1) (6780348) |
| 1 | atentionare | atentionare regula: R47: 20% din abs(R9_1 (100000)) (20000) <= abs(R9_2 (5000)) <= 22% din abs(R9_1) (22000) |
| 1 | atentionare | atentionare regula: R86: 10% din abs(R23_1 (1530670)) (153067) <= abs(R23_2 (6437900)) <= 12% din abs(R23_1) (183680) |
| 1 | eroare | eroare regula: R15: banca (BANCA #1 EXEMPLU) nu poate contine caracterele ',' si '#' |
| 1 | eroare | eroare regula: R16: cont (RO49AAAA1B31007593840000) nu poate contine caracterele ',' si '#' |


## Reproducere

```bash
npm ci
# corpusul generat (300 de cazuri, determinist din seed)
node harness/oracle/generate.mjs --seed 1 --count 300 --out cases/gen
# tabelul de paritate: ambele implementari pe tot corpusul + XSD
npm run parity
# sau, intr-un pas, cu regenerarea corpusului:
npm run parity:regen
```

Iesirile: `harness/parity/parity.json` (pentru masina) si acest fisier (pentru om).
Cod de iesire 0 daca nu exista diferente neasteptate, 1 altfel.

## Rulare

Tot ce e mai sus e determinist: doua rulari dau acelasi fisier. Datele care variaza
de la o rulare la alta stau doar aici.

- data: 2026-09-06
- PDF-ul sursa: `D300_v12.0.2_12022026.pdf`
- validatorul oficial: rulat pe 2026-09-06 cu openjdk version "21.0.12.1" 2026-08-18 LTS
- timpul de rulare: sub 15 s (valoarea exacta in milisecunde, in `parity.json`)
