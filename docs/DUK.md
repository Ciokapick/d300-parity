# Oracolul 3: validatorul oficial ANAF (DUKIntegrator + D300Validator.jar)

Faza 5 din [`PLAN.md`](PLAN.md). Validatorul pe care îl rulează ANAF pe declarațiile
depuse, aplicat pe XML-ul pe care îl produce modelul nou pentru fiecare caz din corpus.
Cifrele intră în tabelul de paritate; analiza de mai jos spune, pentru fiecare fel de
verdict, dacă e o **regulă de back-end absentă din PDF**, un **defect al originalului
reprodus fidel** sau o **problemă a corpusului**.

Rezumatul, în trei rânduri: **206 din 364 de XML-uri sunt acceptate**, 158 sunt refuzate,
iar refuzurile se explică integral prin trei cauze — 110 pentru că declarația e dintr-o
perioadă anterioară lui ianuarie 2026 (formularul v12 scrie mereu namespace-ul v12, dar
back-end-ul cere v10 pentru perioadele vechi), 51 pentru un cod de identificare pe care
**PDF-ul însuși îl semnalase și l-a lăsat să treacă**, 20 pentru regula V_1 (metoda
simplificată), plus un caz cu caractere interzise în numele băncii. Nu există niciun refuz
pe care să nu-l putem numi.

> Toate datele din corpus sunt inventate. Validatorul nu consultă niciun nomenclator: nu
> verifică dacă un CUI, un județ sau o localitate există, doar cifra de control și
> corelațiile. De aceea nimic nu e refuzat „pentru că firma nu există".

## Ce dovedește și ce nu

| dovedește | nu dovedește |
|---|---|
| că XML-ul modelului trece prin validatorul pe care ANAF îl folosește la depunere | că declarația ar fi acceptată în SPV (semnătura, atașamentele și transmiterea rămân în afara proiectului) |
| care sunt regulile de back-end pe care PDF-ul nu le verifică deloc | că lista lor e completă: corpusul le atinge doar pe cele pe care le declanșează |
| că verdictul e același pentru XML-ul oracolului și al modelului | nimic în plus față de paritate: șirurile XML sunt identice octet cu octet pe toate cele 418 cazuri, deci verdictul e identic prin construcție |

## Ce s-a instalat

Nimic la nivel de sistem: nici instalator, nici PATH, nici registry. Totul stă în `tools/`,
care e în `.gitignore`.

### JRE portabil

| | |
|---|---|
| distribuție | Eclipse Temurin 21 (JRE), Windows x64, zip |
| versiune | `jdk-21.0.12.1+1` → `openjdk version "21.0.12.1" 2026-08-18 LTS` |
| URL | `https://api.adoptium.net/v3/binary/version/jdk-21.0.12.1%2B1/windows/x64/jre/hotspot/normal/eclipse` |
| fișier | `OpenJDK21U-jre_x64_windows_hotspot_21.0.12.1_1.zip`, 48 999 141 octeți |
| SHA-256 | `d35f31e712f0fcf6ac5a093edc90204fbff22f720ba3950bd09d331d5e621636` — **egal** cu suma publicată de Adoptium în `api.adoptium.net/v3/assets/latest/21/hotspot` |
| dezarhivat în | `tools/jre/` (conținutul folderului `jdk-21.0.12.1+1-jre` mutat la rădăcină, ca să existe `tools/jre/bin/java.exe`) |

Jar-urile ANAF sunt compilate cu Java 1.6 (`Created-By: 1.6.0_35-b10` în manifestul lui
`D300Validator.jar`), dar rulează neschimbate pe Temurin 21: nu a fost nevoie de nicio
opțiune de compatibilitate.

### Kitul DUKIntegrator

Pagina oficială de descărcare a declarațiilor,
`https://www.anaf.ro/anaf/internet/ANAF/servicii_online/declaratii_electronice/descarcare_declaratii`,
e o pagină de portal; conținutul ei stă la
`https://static.anaf.ro/static/10/Anaf/Declaratii_R/descarcare_declaratii.htm` și are un
singur link către DUKIntegrator, spre
`https://static.anaf.ro/static/DUKIntegrator/DUKIntegrator.htm`. Acolo e o singură
variantă publicată:

| | |
|---|---|
| versiune | DUKIntegrator 1.4.17.3.3, „cu kit jre versiune 1.6 - 32 biți încorporat" |
| URL | `https://static.anaf.ro/static/DUKIntegrator/dist_javaInclus20200203.zip` |
| fișier | 36 103 651 octeți, `Last-Modified: Mon, 03 Feb 2020` |
| dezarhivat în | `tools/duk/` → `tools/duk/dist/` |
| sursele (pentru documentarea liniei de comandă) | `https://static.anaf.ro/static/10/Anaf/Declaratii_R/AplicatiiDec/src_DUKIntegrator_20180911.zip`, 55 510 octeți, dezarhivat în `tools/duk/src/` |

JRE-ul 1.6 pe 32 de biți din `dist/jre6/` **nu** e folosit: rulăm explicit cu
`tools/jre/bin/java.exe`.

Instalarea pluginului D300, exact după `modInstalare.txt` din
`legacy/anaf/D300_20250910.zip`:

```bash
cp legacy/anaf/validator/D300Validator.jar legacy/anaf/validator/D300Pdf.jar tools/duk/dist/lib/
cp legacy/anaf/validator/D300IstoriaVersiunilor.txt tools/duk/dist/doc/     # pasul 4, opțional
rm -f tools/duk/dist/config/versiuniCurente.txt                            # pasul 3
```

Jar-urile vin din `legacy/anaf/D300Validator_11022026_2.zip` (dezarhivat deja în
`legacy/anaf/validator/`): `D300Validator.jar` 624 775 octeți, `D300Pdf.jar` 280 262
octeți, publicate 11-Feb-2026 ca versiunile **J12.0.1 / P9.0.0** (ultima intrare din
`D300IstoriaVersiunilor.txt`). `config/versiuniCurente.txt` nu exista în kit și nu e
creat de rulările în linie de comandă.

Nu s-a descărcat nimic de pe alte domenii decât `anaf.ro`, `static.anaf.ro` și
`api.adoptium.net` (care redirectează spre arhiva de release Adoptium; suma SHA-256
verificată mai sus e a fișierului publicat de Adoptium).

## Modul linie de comandă

Documentat în `tools/duk/dist/doc/Instructiuni.txt` („B. modul linie de comandă") și
confirmat în sursă, `tools/duk/src/src/general/Main.java`, funcția `analyzeParams` plus
ramura `_mode == 1` din `main`:

```
java -jar DUKIntegrator.jar [-c caleConfig] -v tipDeclaratie fisierXML [fisierRezultat] [optiuneValidare]
```

- `-v` validează, `-p` validează și creează PDF, `-s` validează, creează și semnează.
  Noi folosim doar `-v`.
- `-c` indică folderul `config`. În mod normal e opțional (programul îl deduce din locul
  jar-ului), dar noi îl dăm mereu: `Main` inițializează `LogTrace` cu
  `<config>/emergency.log` și `<config>/emergency.trc`, iar mai multe procese paralele ar
  scrie în aceleași fișiere. Runnerul dă fiecărui lucrător o copie a folderului.
- `fisierRezultat` primește fie marca `ok`, fie atenționările, fie erorile. Implicit
  `<fisierXML>.err.txt`.
- **Nu există un mod cu mai multe fișiere într-un singur proces.** Am citit
  `analyzeParams`: după tipul declarației se extrag exact un `xmlFile` și un `errFile`.
  De asta rulăm un proces per XML.
- Rularea e complet neinteractivă: nicio fereastră, cod de ieșire 0. (În mod grafic,
  `_mode == 0`, ar porni `DUKFrame` și `Download.jar`; în mod batch nu se face nicio
  conexiune la internet.)
- Ca efect secundar, validatorul lasă lângă XML fișierele `<xml>.log` și `<xml>.trc`.
  Runnerul le ține într-un folder de lucru temporar.

Verificat întâi pe cazul de referință, exact cum cere faza 5:

```bash
node harness/oracle/run.mjs sample-01        # scrie harness/oracle/out/sample-01.xml
./tools/jre/bin/java.exe -jar tools/duk/dist/DUKIntegrator.jar \
    -v D300 "$(pwd -W)/harness/oracle/out/sample-01.xml" "$(pwd -W)/sample-01.err.txt"
# 1.
# Validare fara erori fisier: .../sample-01.xml
# iar sample-01.err.txt conține exact: ok
```

Cum se citește verdictul (din `Integrator.parseDocumentXML`, sursele kitului):

| mesajul final pe stdout | cod | fișierul de rezultat | interpretare |
|---|---|---|---|
| `Validare fara erori fisier:` | 0 | `ok` | acceptat |
| `Atentionari la validare fisier:` | 1 | atenționările | acceptat, cu observații |
| `Erori la validare fisier:` | < 0 | erorile | refuzat |

Fișierul de rezultat e o succesiune de blocuri: un antet `E:` / `A:` / `F:` (eroare,
atenționare, eroare fatală de structură) urmat de mesajele lui. Un caz poate avea blocuri
de gravități diferite.

## Runnerul

`harness/duk/run.mjs`, rulat cu `npm run duk`. Folosește **aceeași enumerare a cazurilor**
ca `harness/parity/run.mjs` (`loadAll` din `harness/oracle/cases.mjs`) și importă modelul
direct prin `tsx`, fără build.

1. pentru fiecare caz rulează oracolul (`createForm().runCase`) și modelul
   (`runCase` din `src/domain/engine.ts`);
2. scrie XML-ul modelului într-un folder de lucru (`tools/duk/work/`, șters la final);
   XML-ul oracolului se trimite **doar dacă șirul diferă** de al modelului — când sunt
   egale, verdictul e identic prin construcție, exact cum procedează paritatea la XSD;
3. rulează un proces Java per fișier, cu paralelism limitat (implicit `min(8, nrCPU)`),
   fiecare lucrător cu propria copie a folderului `config`;
4. grupează mesajele înlocuind valorile concrete cu substituenți (textul dintre
   apostrofuri, numerele, lista de atribute enumerată de regula V_1), ca două apariții ale
   aceleiași reguli să cadă în aceeași grupă;
5. scrie `harness/duk/duk.json`.

Ieșirea e deterministă: două rulări dau același fișier, cu excepția câmpurilor `data` și
`durataMs` (verificat rulând de două ori și comparând JSON-ul fără cele două câmpuri).

Opțiuni: `--no-gen` (doar cazurile scrise de mână), `--jobs N`, `--only <caz>`, `--keep`
(păstrează folderul de lucru). `DUK_JAVA` și `DUK_HOME` permit un java sau un kit
instalate în altă parte.

`npm run parity` **nu** rulează Java: citește doar `harness/duk/duk.json`, dacă există, și
adaugă secțiunea „Validatorul oficial ANAF" în [`PARITATE.md`](PARITATE.md). Dacă fișierul
lipsește, paritatea spune asta și trece mai departe; dacă e dintr-o altă rulare decât
corpusul curent, o semnalează.

## Rezultatele

Corpusul: 418 cazuri, dintre care 364 ajung la XML (54 sunt respinse de original înainte
de generare, deci nu au ce trimite validatorului).

| | de mână | generate | total |
|---|---|---|---|
| XML-uri trimise | 107 | 257 | **364** |
| acceptate fără nimic de semnalat | 94 | 98 | **192** |
| acceptate, doar cu atenționări | 4 | 10 | **14** |
| refuzate | 9 | 149 | **158** |

Cauzele, numărate pe cazuri (un caz poate avea mai multe):

| cauză | cazuri | din care de mână | duce la refuz |
|---|---|---|---|
| namespace / perioadă anterioară lui 2026 | 110 | 1 | da |
| cod de identificare respins (`cui`, `cuiSuccesor`) | 51 | 7 | da |
| regula V_1, metoda simplificată | 20 | 0 | da |
| bandă TVA depășită (R47, R49, R51, R55, R57, R84, R86, R92, R94) | 15 | 4 | nu (atenționare) |
| R15 / R16, caractere interzise în bancă și cont | 1 | 1 | da |

Dacă scoatem cele 110 cazuri cu perioadă veche, rămân **254 de XML-uri, dintre care 206
acceptate și 48 refuzate**: 27 doar pentru cod de identificare, 17 doar pentru V_1, 3
pentru amândouă, 1 pentru R15/R16.

Verdictele diferite între XML-ul oracolului și cel al modelului: **0** — de altfel niciun
caz nu produce șiruri diferite, deci nu s-a trimis niciun XML al oracolului.

Tabelul complet, cu mesajele grupate, e regenerat în [`PARITATE.md`](PARITATE.md);
verdictul pe fiecare caz e în `harness/duk/duk.json`.

## Analiza pe categorii

### (a) Reguli de back-end care nu există în PDF

**V_1 — metoda simplificată (20 de cazuri, toate generate).** Documentul de structură o
listează explicit, la „Alte validări", `structura_v12.txt` linia 1024: dacă
`bifa_interne = 1`, atunci R1_1 … R8_2 și R18_1 … R26_1_1 trebuie să fie nule. Validatorul
dă două mesaje: unul general („S-a bifat că se aplică metoda simplificată … dar s-au găsit
valori în rândurile: 1, 2, 3, 3.1, …") și unul cu atributele nenule găsite efectiv.
Formularul **nu verifică nimic din asta**: bifează metoda simplificată, completează
rândurile, apasă VALIDARE și PDF-ul spune „Formularul este valid". Asta e exact categoria
pe care o anunța PLAN.md, iar în modelul nou se implementează ca regulă marcată
„server-side" — nu ca regulă de paritate, fiindcă originalul nu o are.

**Corelațiile V_7 … V_26 (rd.18 = rd.5, rd.20 = rd.7, rd.25 = rd.12 etc.) nu s-au
declanșat niciodată.** Nu pentru că lipsesc din validator, ci pentru că PDF-ul calculează
rândurile 20–23 ca oglindă a rândurilor 5–8 (regula `calc-03-rd20-23-oglinda-rd5-8` din
corpus), deci egalitățile sunt adevărate prin construcție în orice XML pe care îl produce
formularul. E o dovadă în plus că oglindirea din PDF e chiar ce așteaptă back-end-ul, nu o
gaură de acoperire.

**R15 / R16 — caractere interzise în bancă și cont (1 caz).** Validatorul refuză virgula
și diezul în `banca` și `cont`. Formularul are un set de caractere permise și alertează
(„Ați introdus caracterele nepermise: #") — dar **doar alertează**: cazul
`den-04-caractere-nepermise-banca` trece de VALIDARE și scrie `banca="BANCA #1 EXEMPLU"` în
XML. Diferența nu e în regulă, ci în consecință: PDF-ul avertizează, back-end-ul refuză.
De notat că validatorul raportează și `R16: cont (RO49AAAA1B31007593840000)` deși IBAN-ul
nu conține nici virgulă, nici diez — cel mai probabil un mesaj comun celor două reguli sau
un text greșit; nu am despachetat mai departe jar-ul ca să confirm.

**Legarea versiunii de schemă de perioada de raportare.** Pentru orice declarație cu
perioada anterioară lui ianuarie 2026 validatorul răspunde: *„namespace
('mfp:anaf:dgti:d300:declaratie:v12') lipsă sau incorect … valoarea corectă este
xmlns='mfp:anaf:dgti:d300:declaratie:v10'"*. Formularul v12.0.2 acceptă perioade începând
cu mai 2024 (regula `exit.an.minim`: an ≥ 2024; `exit.luna.2024`: în 2024, luna ≥ 5) și
scrie mereu namespace-ul v12. Cu alte cuvinte, **PDF-ul te lasă să completezi o declarație
pe care back-end-ul o va refuza sigur**, fără niciun avertisment. Corelația e perfectă:
toate cele 110 cazuri au perioada în intervalul 2024-05 … 2025-12, și niciunul dintre cele
254 cu perioadă în 2026 nu primește eroarea.

**Benzile de TVA nu sunt o regulă în plus.** Cele 15 cazuri semnalate de validator
(R47, R49, R51, R55, R57, R84, R86, R92, R94 — banda „cota ± 1 punct procentual") sunt
**exact aceleași 15** în care PDF-ul dă „ATENȚIE! Suma introdusă diferă substanțial față
de cea calculată automat! Diferența recomandată este de +/- 1%". Aceleași cazuri, aceeași
intenție, aceeași consecință: avertisment, nu refuz. Singura observație e un text greșit al
validatorului: pentru rândul 11 mesajul spune „nu se încadrează în 5% +- marja 1%", dar
regula R51 verifică banda 8–10%, adică 9% ± 1 — probabil o rămășiță de pe vremea când
rândul 11 era cota de 5%.

### (b) Defecte ale originalului, reproduse fidel

**48 din cele 51 de refuzuri pe cod de identificare sunt exact defectul „doar
avertizează".** În toate, PDF-ul a afișat „Cod de identificare fiscală(CUI) invalid!
Trebuie să introduceți un cod de identificare valid", după care **a validat formularul și
a scris codul greșit în XML**. Sunt cazuri negative pe care corpusul le pune intenționat
(cazul scris de mână `id-01-cui-invalid`, `antet-07-d-scc-cu-cif-succesor-invalid`, și
generatorul, care produce deliberat o cifră de control greșită în ~15% din cazuri pentru
`cif` și ~20% pentru `cifS`). Validatorul ANAF le refuză, cum era de așteptat. Modelul
produce același XML ca oracolul, octet cu octet, deci al treilea oracol dă același verdict
pentru amândouă: **nu e o diferență de paritate, e o confirmare că defectul e real și că îl
reproducem.**

**3 cazuri unde PDF-ul nu spune absolut nimic: `id-03-nif-valid-13-cifre`,
`id-12-cnp-valid-13-cifre`, `id-13-cnp-31-februarie-trece`.** Aici `isCnpNif` acceptă un
cod de 13 cifre, formularul tace, iar validatorul răspunde „eroare atribut: cui: șir mai
lung de 10 caractere". E **defectul #14** din [`INVENTAR-LEGACY.md`](INVENTAR-LEGACY.md),
până acum susținut doar de XSD; acum îl confirmă și a treia autoritate, back-end-ul. Cele
cinci XML-uri pe care XSD-ul le refuză sunt refuzate și de validatorul Java, cu mesaje
diferite dar cu aceeași cauză (`id-04` și `id-09` primesc și de la PDF un avertisment, deci
apar în grupa de mai sus).

**Cazul `den-04`** e tot un defect reprodus: PDF-ul alertează despre `#` și scrie totuși
caracterul în XML. Regula care îl refuză e a back-end-ului (R15), dar faptul că formularul
generează XML-ul e defectul.

### (c) Probleme ale corpusului

**Cele 110 cazuri cu perioadă în 2024–2025.** Generatorul alege perioada din tot intervalul
pe care îl acceptă formularul (mai 2024 încoace), fără să știe că schema v12 e valabilă
doar din ianuarie 2026. Nu e un bug al modelului și nici o regulă lipsă din PDF în sensul
obișnuit — e un corpus care amestecă epoci. Dacă generatorul ar fi restrâns la 2026,
raportul ar arăta 206 acceptate din 254 în loc de 206 din 364. Am lăsat cazurile așa:
corpusul e reproductibil din seed și e folosit de paritate și de fișierele de aur, iar
harnessul nu are voie să modifice `harness/oracle/**`. Concluzia utilă rămâne aceeași
indiferent de perioadă, iar constatarea că PDF-ul nu leagă perioada de versiunea schemei e
un câștig, nu un accident.

**Date fictive respinse de nomenclatoare: zero.** Ne așteptam la refuzuri pe CUI
inexistent, județ sau localitate — nu există niciunul. Validatorul rulat local nu consultă
niciun nomenclator: CUI-ul inventat `18597239` (cifră de control corectă), IBAN-ul fictiv
`RO49AAAA1B31007593840000`, județul 40 (București), CAEN 6201 trec toate. Singurele
verificări pe cod sunt cifra de control și lungimea.

## Limitări

- **Un singur proces per fișier.** DUKIntegrator nu primește mai multe XML-uri într-un
  apel, deci rularea completă durează ~110 s (364 de procese Java, 8 în paralel), față de
  ~8 s cât ia paritatea. De asta oracolul 3 stă într-o comandă separată, iar paritatea
  doar citește rezultatul. Alternativa — un mic driver Java care refolosește clasa
  `Integrator` într-un singur JVM, cum sugerează chiar `Instructiuni.txt` — ar cere un JDK
  (compilator), nu un JRE, și nu am făcut-o.
- **O singură versiune de validator.** `D300Validator.jar` J12.0.1 din 11-Feb-2026, cel din
  `legacy/anaf/`. Nu am testat versiuni mai vechi și nici nu am lăsat DUKIntegrator să se
  actualizeze singur (modul batch nu se conectează nicăieri).
- **Numai validare.** `-p` (creare PDF) și `-s` (semnare) nu au fost rulate: semnătura cere
  smartCard, iar PDF-ul generat de `D300Pdf.jar` nu e obiectul acestui proiect.
- **Kitul DUKIntegrator e din 2020** (1.4.17.3.3); pagina ANAF spune „actualizat în
  20.08.2021", dar linkul publicat trimite la arhiva din februarie 2020. Pluginul D300 e
  însă cel curent, iar el conține regulile.
- **Mesajele nu au coduri de eroare proprii** în afară de numele regulii (`V1`, `R15`,
  `R47`, …) și de litera de gravitate. Gruparea din raport se face pe textul normalizat.
- **Nu am despachetat jar-ul.** Toate concluziile de mai sus vin din rulare, din documentul
  de structură și din sursele publice ale DUKIntegrator, nu din decompilarea
  `D300Validator.jar`.

## Reproducere

```bash
# 1. JRE portabil (nimic instalat în sistem)
curl -L -o tools/OpenJDK21U-jre.zip \
  "https://api.adoptium.net/v3/binary/version/jdk-21.0.12.1%2B1/windows/x64/jre/hotspot/normal/eclipse"
# dezarhivat în tools/jre/ astfel încât să existe tools/jre/bin/java.exe

# 2. kitul DUKIntegrator
curl -L -o tools/duk/dist_javaInclus20200203.zip \
  "https://static.anaf.ro/static/DUKIntegrator/dist_javaInclus20200203.zip"
# dezarhivat în tools/duk/ (rezultă tools/duk/dist/)

# 3. pluginul D300, după modInstalare.txt
cp legacy/anaf/validator/D300Validator.jar legacy/anaf/validator/D300Pdf.jar tools/duk/dist/lib/
cp legacy/anaf/validator/D300IstoriaVersiunilor.txt tools/duk/dist/doc/
rm -f tools/duk/dist/config/versiuniCurente.txt

# 4. un singur caz, ca verificare
npx tsx harness/duk/run.mjs --only sample-01

# 5. tot corpusul (~110 s) și apoi tabelul de paritate cu secțiunea DUK
npm run duk
npm run parity
```

Ieșirile: `harness/duk/duk.json` (pentru mașină) și secțiunea „Validatorul oficial ANAF"
din [`PARITATE.md`](PARITATE.md) (pentru om).
