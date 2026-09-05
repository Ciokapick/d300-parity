# Studiu de caz D300 — material brut

**Ce e fișierul ăsta:** materia primă pentru pagina de pe lumax.agency, nu textul final.
Cifrele sunt verificate și se pot cita ca atare; frazele sunt schițe de tăiat și rescris.
Ordinea secțiunilor de mai jos e cea decisă în `PLAN.md`, faza 6.

Sursa cifrelor: `PARITATE.md` (regenerat de `npm run parity`), `INVENTAR-LEGACY.md`,
`npm test`. Data: 4 septembrie 2026. Formularul sursă: `D300_v12.0.2_12022026.pdf`.

---

## 1. Tabelul de paritate (prima secțiune a paginii)

| verificare | rezultat |
|---|---|
| cazuri rulate prin ambele implementări | 418 (118 scrise de mână, 300 generate determinist) |
| cazuri identice cap-coadă | **418 / 418** |
| diferențe neașteptate | **0** |
| abateri intenționate declarate | 0 |
| reguli atinse de corpus | 43 / 52 în `trace`, 52 / 52 cu dovezile indirecte |
| XML-uri valide față de XSD-ul oficial v12 | 359 / 364 |
| mesaje produse în total | 918 |
| teste unitare | 849, toate verzi |
| timp de rulare a întregii dovezi | ~7 secunde |

„Identic" înseamnă, pe fiecare caz: aceleași mesaje, în aceeași ordine, cu textul verbatim;
aceleași valori pe **toate** câmpurile; aceleași câmpuri evidențiate; același fișier
`Erori si avertizari.txt`; același `D300.xml`, octet cu octet.

Cele 5 XML-uri respinse de schemă nu sunt o diferență între implementări: oracolul produce
exact același XML invalid. E un dezacord între PDF și schemă, adică defectul #14 de mai jos.

### Cifrele care merită repetate în pagină

| | |
|---|---|
| formularul legacy | 296 de câmpuri, 218 scripturi de eveniment, 7 obiecte de scripturi, ~138 KB de cod |
| regulile extrase | 56 de reguli specificate, dintre care 52 vii și 4 cod mort |
| corpusul | 418 cazuri, 918 mesaje, 364 XML-uri generate |
| defecte găsite în original | 17 |
| abateri de la original | 0 |

**De spus explicit:** nimic din codul legacy nu a fost transcris de mână. Regulile ies din
PDF cu un script (`harness/extract_legacy.py`), iar registrul de câmpuri și maparea
rând → atribut XML sunt **generate** din extracție.

---

## 2. Ecrane vechi lângă ecrane noi

Pentru fiecare pereche, o listă scurtă cu regulile care trăiesc în ecranul respectiv:

| ecran | regulile de arătat lângă el |
|---|---|
| antet / perioada de raportare | an ≥ 2024; 2024 ⇒ luna ≥ 5; trimestrial ⇒ luna ∈ {3,6,9,12} sau {2,5,8,11}; semestrial ⇒ {6,12}; anual ⇒ 12; la nepotrivire formularul revine la lunar |
| identificare | cifra de control CUI (cheia 753217532), CNP/NIF (ponderile 279146358279 mod 11), IBAN (ISO 7064 mod 97), telefon, e-mail, cod poștal de 6 cifre, două seturi de caractere permise, majuscule forțate |
| tabelul rd.1–45 | 39 de calcule: rd.12 = 12.1 + 12.2, rd.19 = suma rd.1–18, rd.20–23 oglindesc rd.5–8, rd.30 = 20–28, lanțul de regularizări rd.35 → rd.45; TVA automat la 21% / 11% / 9% la ieșirea din coloana Valoare, cu avertisment la abatere de ±1 punct |
| panoul de totaluri | suma de control (~100 de celule) și numărul de evidență a plății: 23 de cifre, cod de tip decont, LLAA perioadă, ZZLLAA termen de plată, cifre de control |
| panoul de mesaje | jurnalul în ordinea emiterii, câmpurile evidențiate, fișierul „Erori si avertizari.txt" reprodus |

De spus lângă imagini: numerotarea rândurilor afișate **nu** e cea din XML. Formularul a
fost renumerotat de mai multe ori, XML-ul niciodată: `R17_1` e rândul 19, `R64_1` e rândul
17, `R26_1` e rândul 29. E regula cea mai ușor de pierdut la o rescriere și e ținută
într-un singur loc, generat din codul original.

---

## 3. Ce am găsit în original

Toate cele 17 sunt în `INVENTAR-LEGACY.md`, cu locul exact în cod. Astea opt sunt cele
care merită povestite. Niciunul nu e reparat în versiunea web: modelul reproduce
originalul inclusiv defectele, ca paritatea să însemne ceva.

**1. `null` nu e 0, și cineva nu poate depune** (defect #15, în `validForm`).
Regula de exclusivitate verifică `R38_2 > 0 && R35_2 != 0`. Dacă rândul 38 — soldul TVA
de plată din perioada precedentă — e lăsat gol, `null != 0` e adevărat în JavaScript.
Rezultatul: orice declarant cu sold negativ reportat (rd.41 > 0) primește „Daca R41 > 0,
atunci R38 = 0" și nu poate trimite decontul până nu scrie explicit 0 într-o casetă pe
care ar fi lăsat-o goală. E cel mai probabil defect care lovește utilizatori reali.
Cazurile care îl arată: `cor-04` (blocat) lângă `cor-05` (trece, cu 0 scris de mână).

**2. Formularul acceptă un cod pe care propria schemă îl refuză** (defect #14).
Câmpul CIF admite NIF de 13 cifre și lasă să treacă un CUI cu 0 în față, doar avertizând.
Atributul `cui` din XSD e `[1-9]\d{1,9}`. Deci PDF-ul spune „valid", generează XML-ul, iar
schema oficială îl respinge. Găsit de corpus, nu de citit codul: 5 din 364 de XML-uri
„valide" după PDF pică la schemă. Același cod e legal ca `cuiSuccesor` și ilegal ca
declarant, în același fișier.

**3. Un CNP cu 31 februarie trece** (defect #3, în `valid.isCNP`).
Verificarea zilei e scrisă `day == 0 / day > getDaysInMonth(...)` — bară în loc de `||`.
Expresia se grupează ca `day == ((0/day) > zile)`, adică e echivalentă cu `day === 0`:
ziua 00 e respinsă, ziua prea mare nu se verifică niciodată. Verificat diferențial pe 1.000
de variante de CNP.

**4. Cinci din șase validări sunt comentate** (defect #7).
Scripturile `validate` de pe rd.12 coloanele 1 și 2, rd.A și rd.B coloanele 1 și 2 sunt
comentate integral. Rămâne activă doar verificarea pro-rata 0–100. Codul e acolo, arată ca
și cum ar rula, dar nu rulează de ani.

**5. Două scripturi care se anulează reciproc** (defect #5).
Garda auto-completării e `if (rawValue != "" || rawValue != null)` — ar fi trebuit `&&`,
deci e mereu adevărată. Ieșirea dintr-o celulă Valoare goală scrie 0 în coloana TVA, iar
scriptul de calcul de pe coloana TVA îl readuce imediat la gol. Net: zero efect, două
scripturi care se ceartă la fiecare `Tab`.

**6. Temeiul legal e decorativ** (defect #8).
Lista are opțiunile lit. a) și lit. b), dar scriptul de la intrarea în câmp forțează
valoarea 2 de fiecare dată, iar în XML atributul `temei` se ia din bifă, nu din listă.
„Lit. a)" nu poate fi selectată și nu ajunge nicăieri.

**7. Erorile se numără prin concatenare de șiruri** (defect #10).
`errCount.value += 1` pe un șir gol dă `"11"` pentru două erori; codul folosește apoi
`.length` ca să afle numărul. Funcționează din întâmplare, pentru că fiecare eroare adaugă
exact un caracter.

**8. Butonul de validare nu-ți spune ce lipsește.**
Funcția `oblig.CheckForErrors` construiește lista câmpurilor lipsă, dar scriptul butonului
o aruncă și afișează în loc „Trebuie să mai completați 5 câmpuri". Singura urmă rămâne
fundalul roșu. Versiunea web păstrează exact același mesaj — și listează separat câmpurile
evidențiate, fiindcă informația exista deja, doar că era aruncată.

Restul, pe scurt și fără explicație în pagină: `schemaLocation` rămas pe v11 lângă un
`xmlns` de v12; atributul `caen` emis de două ori dacă ambele liste CAEN au valoare;
validarea IBAN care confundă `false` cu restul 0 la mod 97; două sisteme paralele de
câmpuri obligatorii (13 în template, ~35 în cod) care nu coincid; text de ajutor copiat
dintr-un alt formular, care vorbește despre declarația unică 2018/2019; istoricul de
versiuni din formular oprit cu o versiune în urmă.

---

## 4. Ce nu am reprodus, explicit

- **Ce ține de PDF, nu de formular:** atașarea arhivelor zip, semnătura digitală,
  blocarea/deblocarea fișierului PDF, verificarea versiunii de Acrobat, meniurile de ajutor.
- **Oracolul 3.** Validatorul oficial Java al ANAF (`D300Validator.jar` prin DUKIntegrator)
  **nu a fost rulat încă.** Paritatea dovedită e față de codul din PDF și față de schema
  XSD. Regulile de corelație pe care le are doar back-end-ul ANAF (rd.18 = rd.5,
  rd.20 = rd.7 și celelalte din documentul de structură) nu sunt implementate.
- **Confirmarea în Adobe Reader.** Runtime-ul oracol face patru ipoteze despre semantica
  XFA (A1–A4, scrise în capul fișierului). Sunt bine argumentate și consistente cu tot
  corpusul, dar **nu au fost încă verificate deschizând PDF-ul în Reader.**
- **Depunerea.** Nu există trimitere nicăieri, nici SPV, nici e-mail, nici server.

Regula pe care merită s-o spunem răspicat: nici măcar defectele nu le-am reparat. Un
proiect de modernizare care „mai și îndreaptă pe drum" nu mai poate dovedi nimic, fiindcă
orice diferență devine discutabilă. Întâi paritate, apoi discuția despre ce merită
schimbat — lista candidatelor e deja scrisă, în `docs/DIFERENTE.md`.

---

## 5. Link spre repo

Textul de pus lângă link: oricine poate rula dovada în două comenzi, `npm install` și
`npm run parity`, în aproximativ șapte secunde. Harness-ul rescrie tabelul de paritate la
fiecare rulare, deci cifrele din pagină sunt verificabile, nu declarate.

De verificat înainte de publicare: repo-ul e local, deci linkul nu există încă. La primul
push trebuie completate și linkul „Codul sursă" din antetul aplicației
(`src/ui/FormHeader.vue`, acum `href="#"`) și adresa din pagina de caz.

---

## Propoziții candidate pentru titlu și subtitlu

De ales una și de rescris, nu de folosit ca atare. Fără superlative, fără „revoluționar",
fără „cel mai".

1. „Decontul de TVA, mutat pe web fără să se piardă o regulă — și cu dovada alături."
2. „418 cazuri prin ambele implementări: aceleași mesaje, același XML, octet cu octet."
3. „Am rulat codul original ca oracol, în loc să-l citesc și să-l rescriu după ureche."
4. „Ce găsești în 138 KB de JavaScript pornit în 2011 și cârpit de atunci: 17 defecte, toate reproduse fidel."
5. „Paritatea nu e o promisiune, e un tabel pe care îl poate rula oricine în șapte secunde."
6. „Modernizare cu martor: vechiul sistem e cod public, rulabil, deci se poate compara cu el."

Ideea de subtitlu, în orice variantă: **avantajul e că vechiul sistem e cod public și
rulabil.** Nu comparăm cu un document de instrucțiuni, ci cu programul care rulează azi în
Adobe Reader pe calculatoarele contabililor.

---

## Capturi de făcut

Desktop, 1400 × 900:

1. **Formularul gol** — starea inițială, ca să se vadă structura și secțiunile.
2. **`sample-01` validat**, cu panoul de totaluri completat: rd.19, rd.30, rd.35, rd.36/37,
   rd.40, rd.43, rd.44/45, suma de control și numărul de evidență, plus ștampila de
   formular valid și butonul de descărcare activ.
3. **`sample-02-erori`**, cu jurnalul de mesaje vizibil: cele 9 mesaje în ordinea emiterii,
   câmpurile evidențiate și conținutul fișierului „Erori si avertizari.txt".

Mobil, 375 × 812:

4. Aceeași pagină pe lățime de telefon, ca să se vadă că tabelul se derulează pe orizontală
   în containerul lui, iar pagina nu.

Opțional, dacă se găsește o pereche bună: **PDF-ul original deschis în Reader lângă ecranul
nou**, aceeași secțiune. Merită doar dacă e făcută la aceeași scară.

---

## Ce NU trebuie spus în pagină

Lista asta e de recitit înainte de publicare.

1. **Nu e un produs ANAF** și nu e afiliat cu ANAF. Fără siglă, fără culori instituționale,
   fără nimic care să sugereze aprobare oficială. Nota „reconstrucție neoficială, în scop de
   inginerie" apare deja în antetul aplicației și în prima linie din README; trebuie să apară
   și în pagină, sus, nu în subsol.
2. **Nu depune nimic** și nu e o alternativă la depunerea reală. Nici „încă", nici „în curând".
3. **Toate datele sunt inventate.** Niciun CUI, CNP, IBAN sau nume din capturi și din corpus
   nu aparține cuiva. Dacă apare vreun cod într-o captură, e generat.
4. **Oracolul 3 nu a fost rulat.** Nu se scrie „validat de ANAF", „acceptat de validatorul
   oficial" sau ceva echivalent. Formularea corectă: XML-ul e validat față de **schema**
   oficială v12; validatorul Java urmează.
5. **Ipotezele A1–A4 nu sunt încă verificate în Adobe Reader.** Nu se scrie „identic cu ce
   face Acrobat". Se scrie „identic cu codul din PDF, rulat în Node peste un model al
   obiectelor XFA, cu patru ipoteze declarate".
6. Fără cifre rotunjite în sus și fără „sute de reguli": sunt 52 de reguli vii, 418 cazuri,
   17 defecte. Cifrele exacte sunt mai convingătoare decât cele mari.
7. Fără afirmații despre alte formulare ANAF sau despre „toate PDF-urile de acest fel".
   Proiectul acoperă un formular, într-o versiune, fixată în titlu: v12.0.2 din 12.02.2026.
