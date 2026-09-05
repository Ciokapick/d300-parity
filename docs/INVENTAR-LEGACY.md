# Inventarul legacy-ului: ce conține de fapt D300 v12.0.2

Sursa: `D300_v12.0.2_12022026.pdf`, publicat de ANAF pe 12.02.2026, 175 KB, o pagină,
Adobe LiveCycle Designer ES 10.0. Tot ce e mai jos a fost extras cu
`harness/extract_legacy.py`, nu transcris.

## Cifrele

| ce | cât |
|---|---|
| câmpuri | 296: 141 text, 121 numerice (toate `decimal`), 15 bife, 7 liste, 2 date, 9 butoane, 1 semnătură |
| acces | 125 editabile, 137 protejate, 34 read-only (rândurile calculate și cele blocate) |
| subformulare | 112 |
| scripturi de eveniment | 218 (57 KB): 60 exit, 39 calculate, 27 change, 20 ready, 18 enter, 16 initialize, 8 click, 6 validate |
| limbaj | 194 JavaScript, 24 FormCalc (toate de forma `$ = a + b + …`) |
| obiecte de scripturi | 7 (81 KB), 51 de funcții: `genValid`, `valid`, `utile`, `conversii`, `oblig`, `formular`, `attach` |
| mesaje unice către utilizator | 43 în evenimente + ~35 în `validForm` |
| câmpuri obligatorii | 13 marcate `nullTest="error"` în template, ~35 verificate în `validForm` (două sisteme paralele) |
| XML | 130 de atribute în XSD v12, 23 obligatorii, un singur element `<declaratie300>` |
| indicatori de „încâlceală" | 2 `resolveNode`, 0 `eval`, 3 căi SOM cu `..` |

## Unde stau regulile

### Calcule (39 de scripturi + 8 auto-completări la ieșirea din câmp)

- **Totaluri pe rânduri**, FormCalc: rd.12 = 12.1 + 12.2; rd.19 (total taxă
  colectată) = suma rândurilor 1–18; rd.20–23 oglindesc rd.5–8; rd.26 = 26.1 + 26.2
  oglindind 12.1/12.2; rd.30 (total taxă deductibilă) = 20–28.
- **TVA automat**: la ieșirea din coloana Valoare, coloana TVA = rotunjit(Valoare × cotă),
  cu cotele **21%** (rd.9, 12.1, 24, 26.1), **11%** (rd.10, 12.2, 25, 26.2) și **9%**
  (rd.11). Dacă utilizatorul modifică TVA-ul manual, un avertisment dacă iese din
  ±1 punct procentual.
- **Regularizări** (JavaScript): rd.35 = 31+32+33+34; rd.36 = max(35−19, 0);
  rd.37 = max(19−35, 0); rd.40 = 37+38+39; rd.43 = 36+41+42; rd.44 = max(40−43, 0);
  rd.45 = max(43−40, 0).
- **Suma de control** (`totalPlata_A`): suma a ~100 de celule, calculată inline în
  scriptul butonului de validare.
- **Numărul de evidență a plății** (`nr_evid`, 23 de cifre): `10` + cod tip decont
  (301 lunar, 302 trimestrial, 303 semestrial, 304 anual) + `01` + LLAA perioadă +
  ZZLLAA termen de plată (25 a lunii următoare, cu reguli separate pe semestru/an)
  + `0000` + două cifre de control (suma cifrelor, ultimele două).

### Validări

- **CUI**: cheie `753217532` inversată, sumă ponderată × 10 mod 11; primul caracter ≠ 0.
- **CNP / NIF**: ponderi `279146358279` mod 11, cu regula 10 → 1; NIF începe cu 9.
- **IBAN**: ISO 7064 mod 97 după mutarea primelor 4 caractere; tabel de lungimi pe țară.
- **Telefon/fax**: regex de numerotare românească. **Email**: regex propriu.
- **Cod poștal**: exact 6 cifre. **Caractere permise**: două seturi (`,.-&` pentru
  denumiri, `,.-+` pentru adresă), majuscule forțate la tastare.
- **Perioadă**: an ≥ 2024; 2024 ⇒ lună ≥ 5; trimestrial ⇒ luna ∈ {3,6,9,12} sau
  {2,5,8,11}; semestrial ⇒ {6,12}; anual ⇒ 12. La nepotrivire, formularul revine la lunar.
- **Rambursare**: bifa D respinsă dacă rd.45 < 5000.
- **Rd.A/A1/B/B1**: A ≥ A1, TVA ≤ Valoare, comparate în valoare absolută.
- **Rd.29 ≥ rd.29.1**; **rd.37 > 0 ⇔ rd.40 = 0** (exclusivitate).
- **Județ 40 (București)** ⇒ localitate = BUCUREȘTI, sectorul devine editabil.
- **Metoda simplificată = 1** ⇒ secțiunile rd.1–8 și rd.20–23 se golesc și se blochează.
- **Obligatorii** la validare: perioadă, CUI, denumire, bancă, IBAN, CAEN, pro-rata,
  cele 5 bife, nr. evidență, declarant (nume, prenume, funcție), rândurile calculate
  19, 30, 35, 36–45, suma de control.

### XML

Un singur element cu atribute, în ordine fixă. **Numele atributelor păstrează
numerotarea istorică a rândurilor**, nu pe cea afișată: `R17_1` = rândul 19,
`R64_1` = rândul 17, `R65_1` = rândul 18, `R43_2` = rândul 27 col. 2, `R26_1` =
rândul 29, `R27_1` = rândul 30. Formularul a fost renumerotat de mai multe ori;
XML-ul, niciodată. Asta e regula cea mai ușor de pierdut la o rescriere.

Adresa se concatenează într-un singur atribut cu etichete (`strada: …, nr: …`).
Escaparea trece prin `conversii.schEnt`, apoi printr-un dans `encodeURI`/`decodeURI`
ca să iasă UTF-8.

## Defecte găsite în original

Toate verificate în cod, cu locul exact. Nu le reproducem tacit: le declarăm în
tabelul de paritate ca „diferențe intenționate".

1. **`schemaLocation` pe v11, `xmlns` pe v12** (`genValid.genXML`, finalul). Namespace-ul
   e cel care contează, deci nu strică validarea, dar e o urmă de copy-paste.
2. **Atributul `caen` emis de două ori** dacă ambele liste CAEN (rev.2 și rev.3) au
   valoare (`genXML`). XML-ul ar fi malformat. Latent: scripturile de ieșire #131/#132
   golesc lista cealaltă.
3. **`isCNP`: `/` în loc de `||`** în `day == 0 / day > getDaysInMonth(...)`. Expresia
   se grupează ca `day == ((0/day) > zile)`, adică e echivalentă cu `day === 0`: ziua 00
   e respinsă, dar ziua prea mare nu se verifică niciodată. Un CNP cu 31 februarie trece
   dacă are cifra de control bună. Verificat diferențial pe 1.000 de variante.
4. **`utile.sumaControl` e cod mort cu bug**: apelul e comentat, suma se calculează
   inline în butonul de validare; funcția moartă are `r23.c3` fără `.rawValue` și
   rânduri (9.1, 10.1, 11.1) care nu mai există în v12.
5. **Garda auto-completării e mereu adevărată**: `if (rawValue != "" || rawValue != null)`
   (ar fi trebuit `&&`). Ieșirea dintr-o celulă Valoare goală scrie 0 în coloana TVA;
   scriptul de calcul de pe coloana TVA (`if (c2.rawValue == null) this.rawValue = null`)
   îl readuce apoi la gol. Net, două scripturi care se anulează reciproc.
6. **Validarea IBAN confundă boolean cu număr**: `isValidIBANNumber` întoarce `false` sau
   restul mod 97 (un număr), iar apelantul testează `err == false` (adevărat și pentru
   restul 0) și `err > 1` (resturile 2–96). Un IBAN cu restul 0 primește mesajul de
   *lungime și sintaxă*, nu pe cel de cifră de control. Coexistă două implementări
   (`isIban`, nefolosită, și `isValidIBANNumber`).
6b. **Cifra de control a numărului de evidență nu e „ultimele 2 cifre"**, cum spune
   comentariul: `("" + suma).substr(suma.length - 2)` pe un număr dă `substr(NaN)`, adică
   întregul șir. Coincide cu intenția doar când suma cifrelor are exact două cifre, ceea ce
   se întâmplă mereu în practică. Iar pentru decontul semestrial, lunile 7–9 primesc termen
   în același an, nu în următorul; inaccesibil prin formular, dar reprodus.
7. **5 din 6 scripturi `validate` sunt comentate integral** (rd.12 col. 1 și 2, rd.A,
   rd.B col. 1 și 2). Rămâne activ doar pro-rata 0–100.
8. **Temeiul legal e decorativ**: `temeiLegal` are opțiunile lit. a)/lit. b), dar
   scriptul #60 forțează mereu valoarea 2, iar în XML `temei` se ia din bifa `d_rez`,
   nu din listă. Opțiunea „lit. a)" nu poate fi selectată și nu ajunge nicăieri.
9. **Două sisteme de obligatoriu** care nu coincid: 13 câmpuri evidențiate cu roșu
   (template) vs ~35 verificate în `validForm`. Localitatea și județul sunt obligatorii
   doar în primul; rândurile calculate doar în al doilea.
10. **Numărătoarea erorilor prin concatenare**: `errCount.value += 1` pe un șir gol dă
    `"11"` pentru două erori; se folosește apoi `.length`. Funcționează din întâmplare.
11. **Text de ajutor copiat din D212**: secțiunea „Rectificarea" vorbește despre
    capitolul I/II și anii 2018/2019 ai declarației unice. Intrarea de meniu e
    comentată, textul a rămas.
12. **Istoricul din formular e în urmă**: butonul „Versiuni" se oprește la A11.0.5
    (19.11.2025), deși `universalCode` e `D300_A12.0.2`.
13. **Validatorul Java are `Main-Class: d394validator.D394Validator`**: jar-ul D300 a
    fost construit din șablonul D394. Inofensiv ca plugin, grăitor ca proveniență.
14. **Formularul acceptă un cod de identificare pe care XSD-ul îl refuză.** `cif` admite
    NIF de 13 cifre (prin `isCnpNif`) și lasă să treacă un CUI cu 0 în față (doar avertizează),
    dar atributul `cui` din XSD e `[1-9]\d{1,9}`. Același cod e legal ca `cuiSuccesor`
    (`CifSType`) și ilegal ca declarant. Găsit de corpus: 5 din 364 de XML-uri „valide"
    după PDF pică la schemă (`id-03`, `id-04`, `id-09`, `id-12`, `id-13`).
15. **`null` nu e 0 în regula de exclusivitate rd.37/rd.40.** `validForm` verifică
    `R38_2 > 0 && R35_2 != 0`; dacă rândul 38 (soldul TVA de plată din perioada precedentă)
    e lăsat gol, `null != 0` e adevărat, deci **orice declarant cu sold negativ reportat
    (rd.41 > 0) primește „Daca R41 > 0, atunci R38 = 0" și nu poate depune** până nu scrie
    explicit 0. Cel mai probabil defect care lovește utilizatori reali (`cor-04` vs `cor-05`).
16. **Ramura NIF din `isCnpNif` nu întoarce `true`**, ci `undefined`; merge doar pentru că
    apelantul testează `test == false`. Iar un IBAN cu rest 0 la mod 97 primește mesajul de
    *lungime și sintaxă*, nu pe cel de cifră de control, fiindcă `0 == false` (`id-11`).
17. **Aproape toate mesajele „X este element obligatoriu" din `validForm` sunt inaccesibile**:
    câmpurile respective sunt oprite mai devreme de fundalul roșu (template), bifele au
    valori implicite non-nule, iar rândurile calculate sunt mereu numere. Singura ramură
    vie e CAEN. Confirmarea cifrică a defectului 9.
18. **Formularul v12 scrie mereu namespace-ul v12, dar back-end-ul cere v10 pentru perioadele
    dinainte de ianuarie 2026.** PDF-ul acceptă perioade începând cu mai 2024 (`an >= 2024`,
    `2024 => luna >= 5`) și emite `xmlns="...v12"` indiferent de perioadă; validatorul oficial
    refuză 110 din cele 364 de XML-uri ale corpusului exact din acest motiv. Un decont rectificativ
    pentru 2025 făcut cu formularul curent ar fi respins la depunere. Găsit de oracolul 3 (`DUK.md`).
19. **PDF-ul lasă să treacă coduri de identificare pe care back-end-ul le refuză.** Pentru un
    CUI cu cifră de control greșită formularul doar alertează și validează oricum; validatorul
    oficial respinge XML-ul (48 de cazuri din corpus). Iar regula V_1, corelația pentru metoda
    simplificată, există doar în back-end, nu și în PDF: 20 de cazuri trec de formular și pică
    la validator. Corelațiile rd.18=rd.5 etc. nu se pot declanșa niciodată, pentru că PDF-ul
    calculează rândurile 20–23 ca oglindă a rândurilor 5–8.

## Note de semantică XFA învățate construind runtime-ul

- **Variabilele locale umbresc numele din formular.** Scriptul de pe bifa de rambursare
  declară `var rambursare` sub subformularul numit tot `rambursare`. În Acrobat merge,
  pentru că rezolvarea SOM e doar un fallback pentru identificatorii nedeclarați.
  Prima versiune a shim-ului rezolva întâi numele din formular și regula nu se declanșa;
  la fel, `var valid = 0` din butonul de validare suprascria obiectul de scripturi
  `valid`. Runtime-ul exclude acum din rezolvarea SOM numele declarate în fiecare script.
- **Butonul de validare nu produce lista câmpurilor lipsă.** `oblig.CheckForErrors`
  o construiește, dar scriptul de click o înlocuiește cu un mesaj generic („Trebuie
  să mai completați 5 câmpuri"). Singura urmă vizibilă e fundalul roșu; runtime-ul o
  raportează ca `highlighted`.
- **`nr_evid` intră singur pe lista de obligatorii lipsă** când perioada e incompletă,
  pentru că scriptul lui de calcul îl marchează `mandatory = "error"` și îl golește
  înainte să-l recalculeze.
- **Acrobat recalculează după fiecare câmp** (ipoteza A4 a runtime-ului). Contează pentru
  bifa de rambursare, care citește rd.45 în momentul bifării: cu recalculare doar la final,
  nicio rambursare nu ar fi putut fi acceptată.
- **Ordinea mesajelor nu e ordinea formularului.** Alerta de pro-rata apare după „Date
  incomplete", pentru că `execValidate()` rulează în `click`, după verificarea obligatoriilor.
- **Numerotarea din mesaje e cea veche**: „Rd.30 nu poate fi mai mic decat rd.30.1" pentru
  ce se afișează ca rd.29/29.1; fișierul de erori vorbește de R38/R41 pentru câmpurile
  `r39`/`r42`. Textul „'Data sfarsit contract' < 'Data inceput contract'" vine dintr-un alt
  formular; D300 nu are contract.
- **Termenul decontului anual iese corect din întâmplare**: în ramura `304`, `endMonth`
  rămâne `""`, iar `new Date(an, "", 25)` cade pe ianuarie, exact termenul dorit.

## Ce e PDF-only și rămâne afară

`attach` (zip atașat), `formular` (blocare/deblocare, ștergere semnătură), verificarea
versiunii Acrobat din JavaScript-ul de document, `xfa.layout`, meniurile popup.

## Materiale ANAF folosite

| fișier | ce e |
|---|---|
| `D300_v12.0.2_12022026.pdf` | formularul, sursa tuturor regulilor de mai sus |
| `d300_v12_11022026.xml` | XSD v12 (extensia e greșită pe site, conținutul e schemă) |
| `d300_v10_05062024.xsd` | XSD v10, pentru istoricul schimbărilor |
| `structura_D300_v12.0.0_10022026.pdf` | documentul de structură, 28 de pagini, cu regulile de back-end în proză (`legacy/extracted/structura_v12.txt`) |
| `D300Validator_11022026_2.zip`, `D300_20250910.zip` | validatorul Java + generatorul de PDF din XML, plugin-uri pentru DUKIntegrator |
