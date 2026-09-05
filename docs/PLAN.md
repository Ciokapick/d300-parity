# Planul: D300 de la PDF XFA la web, cu paritate dovedită

## De ce D300

Formularul 300 (Decont de TVA) e cel mai folosit formular fiscal din România și e
distribuit ca PDF Adobe LiveCycle. Toate regulile stau înăuntru, ca JavaScript și
FormCalc, într-un cod început în 2011 și cârpit de atunci încoace. E exact tipul de
sistem pe care îl promite noul hero de pe lumax.agency: reguli codificate într-un
lucru pe care nu-l mai întreține nimeni, aduse pe web cu paritate dovedită.

Avantajul unic față de orice alt candidat: vechiul sistem e **cod public, rulabil**.
Nu comparăm cu un PDF de instrucțiuni, comparăm cu codul care rulează azi în
Adobe Reader pe calculatoarele contabililor.

## Unde suntem (4 septembrie 2026)

Toate fazele, 0–6, sunt gata; oracolul 3 a rulat pe 6 septembrie (vezi `DUK.md`). Tabelul de
paritate e verde pe tot corpusul:

| | |
|---|---|
| cazuri prin ambele implementări | 418 (118 scrise de mână, 300 generate) |
| identice cap-coadă | **418 / 418** |
| diferențe neașteptate | **0** |
| abateri intenționate declarate | 0 |
| reguli atinse de corpus | 43 / 52 în `trace`, 52 / 52 cu dovezile indirecte |
| XML valide față de XSD v12 | 359 / 364 (cele 5 invalide sunt defectul #14, reprodus fidel) |
| mesaje produse în total | 918 |
| teste unitare | 849 verzi |

Cifrele complete și metoda de comparație: `PARITATE.md` (îl rescrie `npm run parity`).
Ce a rămas de făcut e la sfârșitul acestui fișier, în „Ce rămâne la autor".

## Verdictul verificării fazei 0 (4 septembrie 2026)

Codul e curat și rulabil. Cifrele complete sunt în `INVENTAR-LEGACY.md`; pe scurt:

- 296 de câmpuri, 218 scripturi de eveniment, 7 obiecte de scripturi cu 51 de
  funcții, în total ~138 KB de cod. Doar 2 apeluri `resolveNode`, zero `eval`.
- Logica de domeniu reală e mică: 39 de calcule (sume pe rânduri, TVA automat la
  21%/11%/9%, lanțul de regularizări rd.36–45), ~45 de mesaje de eroare, 3
  algoritmi de cifră de control (CUI, CNP/NIF, IBAN), numărul de evidență a plății,
  generatorul de XML și lista de câmpuri obligatorii.
- Runtime-ul din `harness/oracle` rulează codul ANAF **neschimbat** în Node.
  Pe cazul `sample-01`: „Formularul este valid", XML cu 72 de atribute, validat de
  schema oficială v12, zero API-uri Acrobat neacoperite.

## Cei trei oracoli, plus verificarea în Reader

| # | oracol | ce dovedește | stare |
|---|---|---|---|
| 1 | codul original rulat în Node (`harness/oracle`) | mesajele și XML-ul pe care le-ar produce PDF-ul | gata, rulat pe toate cele 418 de cazuri, zero API-uri Acrobat neacoperite |
| 2 | XSD-ul oficial v12 (`legacy/anaf/d300_v12_11022026.xml`) | XML-ul respectă contractul | gata, rulat pe tot corpusul: 359 / 364 valide, cele 5 invalide sunt defectul #14 |
| 3 | validatorul oficial Java, `D300Validator.jar` prin DUKIntegrator | back-end-ul ANAF îl acceptă; are reguli în plus față de PDF (corelațiile rd.18=rd.5 etc.) | gata: `npm run duk`, 364 XML-uri, 206 acceptate / 158 refuzate, fiecare refuz explicat în `DUK.md`; 0 verdicte divergente între oracol și model |
| R | Adobe Reader, manual | ipotezele shim-ului A1–A4 sunt adevărate | de făcut, 20 de minute |

**Ipoteze de confirmat în Reader** (sunt scrise și în capul lui `legacy-runtime.mjs`):

- A1: FormCalc tratează `null` ca 0 în adunări, iar totalul e mereu un număr.
- A2: `rawValue` pe câmpurile `<decimal>` e număr, nu șir.
- A3: scriptul de `change` primește valoarea întreagă, nu tastă cu tastă.
- A4: Acrobat recalculează după fiecare câmp, nu o singură dată la final. Adăugată în
  timpul fazei 1: bifa de rambursare citește rd.45 chiar în momentul bifării, deci cu
  recalculare doar la final nicio rambursare nu ar fi putut fi acceptată. Runtime-ul și
  modelul rulează amândouă calculele la punct fix după fiecare intrare.

**Cum le confirmi:** deschizi PDF-ul în Reader, completezi exact `cases/sample-01.json`,
apeși VALIDARE, salvezi fișierul atașat `D300.xml` și îl compari octet cu octet cu
`harness/oracle/out/sample-01.xml`. Dacă sunt identice, oracolul 1 e certificat de
Reader și avem a patra dovadă, cea definitivă.

## Fazele

### 0. Verificare și inventar — gata

Extracție reproductibilă din PDF, inventarul câmpurilor și regulilor, runtime-ul
oracol, două cazuri (valid + erori), validare XSD.

**Livrat:** `harness/extract_legacy.py`, `legacy/extracted/`, `harness/oracle/legacy-runtime.mjs`,
`harness/oracle/run.mjs`, `harness/validate_xsd.py`, `INVENTAR-LEGACY.md` cu cele 17 defecte
găsite în original (+6b).

### 1. Corpusul de cazuri — gata (estimat 2–3 zile)

- 30–50 de cazuri scrise de mână, câte unul pe regulă: fiecare mesaj din inventar
  trebuie declanșat de cel puțin un caz.
- Un generator aleator de declarații plauzibile (mii de cazuri) pentru sume, cote,
  regularizări, rambursare.
- Pentru fiecare caz, oracolul 1 produce „fișierul de aur": mesaje + XML +
  fișierul de erori. Astea devin așteptările testelor.

**Livrat:** 118 cazuri scrise de mână în `harness/oracle/cases/` (mai multe decât cele 30–50
planificate: fiecare mesaj din inventar are cel puțin un caz) plus 300 de cazuri generate
determinist cu `harness/oracle/generate.mjs --seed 1 --count 300`. Fișierele de aur în
`harness/oracle/golden/`, scrise și verificate cu `harness/oracle/golden.mjs`
(`npm run golden`, `npm run golden:check`). Corpusul generat și aurul lui sunt ignorate de
git, fiind reproductibile din seed. Total: 418 cazuri, 918 mesaje, 364 XML-uri.

Aici s-a adăugat ipoteza **A4** (recalculare după fiecare câmp, ca Acrobat): fără ea,
niciun caz de rambursare nu ar fi trecut.

### 2. Modelul de domeniu, fără interfață — gata (estimat 3–4 zile)

TypeScript pur, zero dependențe de UI:

- `Declaratie` ca tip, cu numerotarea **actuală** a rândurilor în cod și maparea
  spre codurile istorice din XML (`R17_1` = rândul 19) ținută într-un singur loc.
- Fiecare regulă ca funcție pură, cu adnotare spre sursa legacy (calea câmpului și
  evenimentul) și spre rândul din documentul de structură ANAF.
- Generatorul de XML cu aceeași ordine de atribute și aceeași escapare ca originalul.
- Numărul de evidență, CUI/CNP/IBAN, corelația tip decont–lună.
- Vitest pe fișierele de aur din faza 1.

**Livrat:** `src/domain/`. `rules/registry.ts` e specificația: 56 de reguli cu id stabil,
sursa exactă în legacy (numărul scriptului sau `obiect.funcție`), condiția și efectul cu
semantica originalului; 4 sunt marcate `dead` (cod comentat sau inert), deci 52 vii.
`fields.ts` și `rows.ts` sunt **generate** (`npm run gen:fields`, `npm run gen:rows`), ca
maparea istorică (`R17_1` = rândul 19) și ordinea atributelor din XML să nu fie transcrise
de mână. `engine.ts` nu conține nicio regulă, doar ordinea de execuție și punctul fix al
calculelor. 849 de teste Vitest peste fișierele de aur și registru; `npm run typecheck` și
`npm run lint` curate.

### 3. Harnessul de paritate — gata (estimat 1–2 zile)

Un singur runner: același caz intră în legacy (Node) și în modelul nou; se compară
mesajele (normalizate: fără diacritice, fără spații duble) și XML-ul (canonicalizat).
Ieșirea e **tabelul de paritate**: cazuri rulate, diferențe, link la fiecare diferență.
Diferențele așteptate (bug-urile din original pe care nu le reproducem) se declară
explicit, nu se ascund.

**Livrat:** `harness/parity/run.mjs` (`npm run parity`, ~7 s). Comparația a ieșit mai
strictă decât planul: nu doar mesajele normalizate și XML-ul canonicalizat, ci mesajele
**verbatim** și ordonate, valorile **tuturor** câmpurilor, câmpurile evidențiate,
`Erori si avertizari.txt` și XML-ul ca șir, octet cu octet. Al doilea oracol rulează în
același pas (`harness/parity/xsd.py`, un singur proces Python pentru tot corpusul).
Ieșirile: `harness/parity/parity.json` pentru mașină și `PARITATE.md` pentru om, ambele
rescrise la fiecare rulare; cod de ieșire 1 dacă apare o diferență nedeclarată.
Rezultat: 418 / 418 identice, 0 diferențe, `expected.json` gol.

Runner-ul a fost verificat cu erori injectate în toate cele 5 categorii de comparație
(mesaje, valori, evidențieri, fișier de erori, XML): fiecare a fost prinsă.

### 4. Interfața web — gata (estimat 5–7 zile)

Recomand Vue 3 + TypeScript + Vite + Pinia + Vitest, același stack ca GarageBoard,
ca portofoliul să arate un singur mod de lucru pentru software de operațiuni.
React merge la fel de bine; modelul din faza 2 nu depinde de framework.

Paritate ecran cu ecran, nu redesign:

- aceleași secțiuni și aceeași numerotare a rândurilor ca în PDF, cu etichetele
  luate din template (sunt în `fields.json`);
- totaluri calculate live, TVA automat la ieșirea din câmp, cu avertismentul de
  ±1% ca în original;
- panoul de erori reproduce „Erori si avertizari.txt";
- descărcare XML + validare XSD în browser;
- tastatură completă, stări recuperabile, undo pe ștergeri (regulile din GarageBoard).

**Livrat:** stack-ul recomandat, Vue 3 + TypeScript + Vite + Pinia + Vitest. `src/ui/*`,
`src/store/form.ts`, structura și abaterile în `UI.md`. Store-ul nu conține nicio regulă:
fiecare tastă trece prin `applyInput`, butonul VALIDARE prin `pressValidate`.

Verificat în browser pe build-ul de preview:

- presetarea `sample-01` + VALIDARE produce un XML cu SHA-256 identic cu fișierul de aur;
- presetarea `sample-02-erori` produce exact cele 9 mesaje din aur, în aceeași ordine;
- pe 375 px lățime nu apare scroll orizontal;
- `Enter` / `Shift+Enter` navighează pe coloană în tabel;
- după o validare reușită formularul se blochează, ca în PDF, iar „Deblocare" îl redeschide.

Două abateri față de plan, ambele scrise în `UI.md`: etichetele din afara tabelului sunt
scrise de mână (`src/ui/display.ts`), fiindcă `toolTip`-urile din template sunt pe alocuri
greșite, iar validarea XSD **nu** rulează în browser — rămâne în harness, unde e `lxml`.
Undo pe ștergeri nu s-a implementat: originalul nu are așa ceva, iar „Formular nou" și
„Deblocare" acoperă recuperarea.

`vite preview` cerea `isPreview` în `vite.config.ts` ca să folosească base-ul
`/d300-parity/` al build-ului; altfel pagina rămânea goală. Corectat.

### 5. Oracolul 3 — gata pe 6 septembrie (estimat 1 zi)

JRE + DUKIntegrator, rulat pe toate XML-urile din corpus, rezultatele intră în
tabelul de paritate. Aici apar regulile de back-end care **nu** sunt în PDF
(documentul de structură le listează: corelațiile rd.18=rd.5, rd.20=rd.7 etc.).
Ele se implementează în modelul nou ca reguli separate, marcate „server-side".

**Livrat:** JRE portabil în `tools/` (fără instalare de sistem), DUKIntegrator 1.4.17.3.3 cu
pluginul D300 J12.0.1, `harness/duk/run.mjs` (`npm run duk`, un proces Java per XML, ~2 minute),
rând nou în tabelul de paritate și analiza completă în `DUK.md`. Trei descoperiri: back-end-ul
cere namespace-ul v10 pentru perioadele dinainte de 2026, dar formularul v12 scrie mereu v12
(defectul #18); regula V_1 pentru metoda simplificată există doar în back-end; codurile de
identificare pe care PDF-ul doar le semnalează sunt refuzate de back-end (#19).

**Starea anterioară:** amânat la decizia autorului, după faza 6. Nu bloca nimic: paritatea față de
PDF e completă și dovedită fără el, iar contractul XML e deja verificat de oracolul 2.
Ce lipsește e confirmarea că back-end-ul ANAF acceptă XML-urile și, mai interesant, lista
regulilor de corelație pe care PDF-ul nu le verifică deloc. Până atunci, nici documentele,
nici studiul de caz nu au voie să spună că a fost rulat.

### 6. Studiul de caz pe lumax.agency — material gata (estimat 2 zile)

Ordinea paginii:

1. tabelul de paritate, cu cifrele reale și link spre harness;
2. fiecare ecran vechi lângă cel nou, cu lista regulilor păstrate;
3. „ce am găsit în original": defectele din inventar, cu locul exact;
4. „ce nu am reprodus", explicit;
5. link spre repo, ca oricine să ruleze dovada.

**Livrat:** documentația finală a proiectului — `README.md` rescris (paritatea în primele
25 de rânduri), acest fișier actualizat, `UI.md` completat cu ce s-a livrat efectiv și
`STUDIU-DE-CAZ.md`, materialul brut pentru pagină: cifrele, defectele explicate pe scurt,
propozițiile candidate pentru titlu, lista capturilor de făcut și lista lucrurilor care nu
trebuie spuse. Textul final al paginii și capturile rămân de făcut de autor.

## Ce NU reproducem (și spunem asta)

- atașarea arhivelor zip, semnătura digitală, blocarea/deblocarea PDF-ului;
- verificarea versiunii de Acrobat și meniurile de ajutor (textele se pot păstra);
- funcțiile PDF-only din obiectele `attach` și `formular`.

## Riscuri

- **Semantica XFA.** Shim-ul nostru poate diferi de Reader în cazuri de margine.
  De aceea verificarea în Reader e pasul 1 de făcut de tine, nu ultimul.
- **Formularul se schimbă.** Fixăm versiunea (v12.0.2, 12.02.2026) în README și în
  titlul studiului de caz. O versiune nouă e un rerun al extracției, nu o rescriere.
- **Percepția.** Trebuie scris clar „reconstrucție neoficială", fără sigla ANAF,
  fără sugestia că se depune ceva. Repo-ul poartă nota asta din prima linie.
- **Conflict cu jobul.** D300 e ANAF (fiscalitate centrală), nu modulul de impozite
  locale de la SDG. Nu există suprapunere de produs.

## Efort total

Estimarea inițială: aproximativ 15–20 de zile de lucru efectiv, deci 3–4 săptămâni în ritm
de seară. Faza 0 a durat o zi și a fost cea cu cel mai mare risc; a trecut.

## Ce rămâne la autor

Nimic din lista asta nu e blocat de cod; sunt decizii și pași manuali.

1. **Verificarea în Adobe Reader a ipotezelor A1–A4.** Cea mai importantă, ~20 de minute:
   `sample-01` completat în Reader, VALIDARE, `D300.xml` salvat și comparat octet cu octet
   cu `harness/oracle/out/sample-01.xml`. Dacă sunt identice, oracolul 1 e certificat de
   Reader și paritatea are a patra dovadă, cea definitivă. Până atunci, A1–A4 rămân
   ipoteze declarate, nu fapte, și așa trebuie scrise peste tot.
2. **Oracolul 3** (faza 5): JRE + DUKIntegrator pe toate XML-urile din corpus.
3. **Publicarea.** Repo-ul e local, fără push, prin decizie. `.github/workflows/pages.yml`
   e pregătit și rulează typecheck, lint, teste și build înainte de deploy; la primul push
   pe `main` intră singur în funcțiune.
4. **Textul studiului de caz pe lumax.agency** și capturile de ecran, din
   `STUDIU-DE-CAZ.md`.
5. **Decizia asupra abaterilor.** `DIFERENTE.md` are cinci candidate și zero abateri
   acceptate. Paritatea fiind verde, se poate discuta fiecare pe rând — dar orice abatere
   acceptată se scrie acolo și se declară în `harness/parity/expected.json`, altfel
   harness-ul o raportează ca diferență neașteptată și pică.
