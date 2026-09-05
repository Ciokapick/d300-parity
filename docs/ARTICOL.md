# Ce am găsit în codul formularului D300 după ce l-am rulat în afara lui Acrobat

*Material de publicat: LinkedIn, un blog personal sau o comunitate de contabili și dezvoltatori. Tonul e factual; fiecare afirmație are locul exact în sursă și poate fi verificată în repo-ul public [Ciokapick/d300-parity](https://github.com/Ciokapick/d300-parity).*

Decontul de TVA, formularul 300, e cel mai folosit formular fiscal din România. ANAF îl distribuie ca PDF Adobe LiveCycle, iar toate regulile pe care trebuie să le respecte un decont stau înăuntrul fișierului, ca JavaScript și FormCalc: sumele pe rânduri, TVA-ul completat automat pe cotă, cifrele de control pentru CUI, CNP și IBAN, numărul de evidență a plății, XML-ul pe care îl consumă back-end-ul. Codul a fost început în 2011 și cârpit la fiecare schimbare de cotă sau de rând.

Am extras codul din PDF cu un script și l-am rulat neschimbat în Node, peste un strat minimal care imită obiectele XFA. Apoi am trecut prin el 418 declarații fictive, 118 scrise de mână și 300 generate dintr-un seed, și am comparat ce iese cu o implementare nouă, scrisă în TypeScript. Rezultatul: 418 din 418 identice, până la octet, în XML. Pe drum, codul original și-a arătat defectele. Iată-le pe cele care contează.

## 1. Un contabil cu sold negativ reportat nu poate depune dacă lasă rândul 38 gol

În `validForm`, regula de exclusivitate dintre rândurile 37 și 40 e scrisă așa:

```js
if (R38_2 > 0 && R35_2 != 0) mesaj += "EROARE - Daca R41 > 0 , atunci R38 = 0";
```

`R35_2` e rândul 38 afișat, soldul TVA de plată din perioada precedentă. Dacă e lăsat gol, valoarea e `null`, iar în JavaScript `null != 0` e adevărat. Deci orice declarant cu sold negativ reportat primește eroarea și nu poate valida formularul până nu scrie explicit `0`. Dintre toate defectele, ăsta lovește cel mai probabil utilizatori reali. În corpus: cazurile `cor-04` (blocat) și `cor-05` (trece, cu 0 scris de mână).

## 2. Formularul acceptă un cod de identificare pe care schema îl refuză

Câmpul de identificare fiscală admite un NIF de 13 cifre și lasă să treacă un CUI care începe cu 0, doar cu un avertisment. Atributul `cui` din XSD-ul oficial e însă `[1-9]\d{1,9}`: maximum 10 cifre, prima diferită de 0. Formularul spune „valid", schema spune „invalid". Același cod e legal ca `cuiSuccesor` (alt tip în schemă) și ilegal ca declarant. Din 364 de XML-uri produse de corpus, 5 pică la schemă exact din acest motiv.

## 3. Un CNP cu 31 februarie trece

Verificarea zilei din lună, în `isCNP`:

```js
if (month == 0 || month > 12 || day == 0 / day > getDaysInMonth(month, year) ...
```

Un `/` în loc de `||`. Expresia se grupează ca `day == ((0/day) > zile)`, adică e echivalentă cu `day === 0`: ziua 00 e respinsă, dar ziua prea mare nu se verifică niciodată. Un CNP cu 31 februarie și cifră de control corectă e acceptat. Verificat pe 1.000 de variante generate.

## 4. Cinci din șase validări sunt comentate integral

Formularul are șase scripturi de tip `validate`. Cinci sunt comentate în întregime, între `/*` și `*/`: verificările pentru rândul 12 pe ambele coloane și pentru rândurile A și B. Rămâne activă doar limitarea pro-ratei la intervalul 0–100. Codul mort a rămas în fișier și se livrează la fiecare versiune.

## 5. Două scripturi care se anulează reciproc

La ieșirea din coloana Valoare, TVA-ul se completează automat, cu o gardă care ar trebui să sară peste câmpurile goale:

```js
if (this.rawValue != "" || this.rawValue != null) c3.rawValue = round(this.rawValue * 0.21);
```

Cu `||` în loc de `&&`, garda e mereu adevărată, deci o celulă goală scrie 0 în coloana TVA. Apoi scriptul de calcul al coloanei TVA (`if (c2.rawValue == null) this.rawValue = null`) o golește la loc. Rezultatul net e corect. Drumul până la el nu.

## 6. Temeiul legal e decorativ

Lista „Temei legal" are două opțiuni, lit. a) și lit. b). Scriptul de la ieșirea din câmp forțează însă mereu valoarea 2, deci lit. a) nu poate fi selectată. Iar în XML, atributul `temei` nu vine din listă, ci din bifa de deasupra ei. Lista există, se poate deschide, dar nu ajunge nicăieri.

## 7. Erorile se numără prin concatenare de șiruri

Contorul de câmpuri obligatorii lipsă pornește de la șirul gol și adaugă `1` la fiecare câmp: `"" + 1 + 1` dă `"11"`, iar numărul de erori e apoi lungimea șirului. Funcționează din întâmplare și e fragil la prima modificare.

## 8. Lista câmpurilor lipsă e construită și apoi aruncată

Scriptul de validare parcurge toate câmpurile obligatorii și construiește un mesaj cu numele fiecăruia. Scriptul butonului îl înlocuiește imediat cu unul generic: „Trebuie să mai completați 5 câmpuri". Singura urmă care ajunge la utilizator e fundalul roșu. Iar cele două sisteme de „obligatoriu", cel din template și cel din `validForm`, aproape că nu se suprapun: majoritatea mesajelor „X este element obligatoriu" sunt inaccesibile, pentru că butonul se oprește mai devreme pe fundalul roșu.

## Restul, pe scurt

`schemaLocation` a rămas pe versiunea 11 lângă `xmlns` pe versiunea 12; atributul `caen` ar fi emis de două ori dacă ambele liste CAEN ar fi completate, ceea ce scripturile de ieșire împiedică; validarea IBAN confundă un boolean cu un număr, așa că un IBAN cu restul 0 la mod 97 primește mesajul de sintaxă, nu pe cel de cifră de control; cifra de control a numărului de evidență e „ultimele două cifre" doar în comentariu, codul adaugă toată suma; textul de ajutor pentru rectificare e copiat din Declarația unică și vorbește despre anii 2018 și 2019; validatorul Java al D300 are ca punct de intrare `d394validator.D394Validator`. Lista completă, cu 17 intrări, e în [`docs/INVENTAR-LEGACY.md`](INVENTAR-LEGACY.md).

## Ce nu spune articolul ăsta

Că formularul nu funcționează. Funcționează, în fiecare zi, pentru sute de mii de deconturi. Defectele de mai sus sunt fie inofensive în practică, fie cu ocoliș cunoscut (se scrie 0). Ce arată ele e altceva: că regulile unei proceduri fiscale naționale trăiesc într-un fișier pe care nu-l mai citește nimeni, și că singurul mod de a le muta în altă parte fără să le pierzi e să rulezi codul vechi ca martor. Asta am făcut. Codul, corpusul și tabelul de paritate sunt publice, ca oricine să poată repeta verificarea.

*Reconstrucție neoficială, în scop de inginerie. Nu e un produs ANAF, nu depune nimic, toate datele sunt fictive.*
