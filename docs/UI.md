# Structura interfeței (decizie, faza 4)

Regula de bază: **paritate ecran cu ecran, nu redesign.** Aceleași secțiuni, aceeași
ordine, aceeași numerotare a rândurilor ca în PDF. Nicio regulă în componente: tot ce
înseamnă comportament trece prin `src/domain/engine.ts` (`applyInput`, `pressValidate`).

## Compunere

```
App.vue                       shell: antet, secțiuni, panou lateral
 ├─ ui/FormHeader.vue          titlu, nota „reconstrucție neoficială", versiunea PDF-ului sursă,
 │                             PresetPicker, butonul VALIDARE, descărcare XML, reset
 ├─ ui/SectionPerioada.vue     an, lună, tip decont, bifele din antet (d_rez + temei, d_scc + cifS,
 │                             d_rec, d_reprezentant, metoda simplificată)
 ├─ ui/SectionIdentificare.vue denumire, CIF, adresă (județ → sector), contact, bancă, CAEN, pro-rata
 ├─ ui/SectionTabel.vue        rd.1–45 în grupele originalului (comerț, livrări, achiziții RO,
 │                             achiziții și import, regularizări), din TABLE_ROWS (rows.ts)
 ├─ ui/SectionFacturi.vue      rd.47–49 și „alte informații"
 ├─ ui/SectionNedeductibil.vue rândurile A / A1 / B / B1
 ├─ ui/SectionBife.vue         cele 4 bife de taxare inversă + solicitarea de rambursare
 ├─ ui/SectionSemnatura.vue    nume, prenume, funcție
 ├─ ui/PanelTotaluri.vue       rd.19, 30, 35, 36/37, 40, 43, 44/45, suma de control, nr. evidență (live)
 ├─ ui/PanelMesaje.vue         jurnalul mesajelor (alert / messageBox / respins) în ordinea emiterii,
 │                             câmpurile evidențiate, conținutul „Erori si avertizari.txt"
 ├─ ui/PresetPicker.vue        încarcă un caz din corpus (presets.json, generat)
 └─ ui/FieldInput.vue          un singur control legat la o cale: text / număr / listă / bifă / radio
```

## Store (`src/store/form.ts`, Pinia)

- stare: `form: FormState` (din engine), `journal: Message[]` (append-only, cu indexul pasului),
  `trace: Trace[]`, `last: { erori, xml, highlighted } | null`, `busy: boolean`.
- acțiuni: `input(path, value)` → `applyInput`; `validate()` → `pressValidate`;
  `loadPreset(inputs)` → `reset()` apoi `input` pentru fiecare intrare în ordine (același
  drum ca un utilizator); `reset()`.
- getters: `value(path)`, `readOnly(path)` (din `form.readOnly` + `FIELD_BY_PATH.access`),
  `highlighted(path)`, `mandatory(path)`, totalurile pentru panou.
- Store-ul nu cunoaște reguli. Dacă o componentă are nevoie de o decizie, lipsește o funcție în domeniu.

## Semantica intrării (A3)

`FieldInput` trimite valoarea la `store.input` la **părăsirea câmpului** (`blur`) pentru text
și numere, la `change` pentru liste, bife și radio. Nu la fiecare tastă: originalul rulează
`exit` la ieșire, iar modelul primește valoarea întreagă. O valoare respinsă (filtrul numeric)
lasă câmpul cum era și scrie în jurnal.

## Tastatură

- `Enter` într-o celulă de tabel → celula de sub ea, aceeași coloană; `Shift+Enter` → sus.
- `Tab` implicit; tot fluxul, inclusiv butonul VALIDARE și descărcarea, fără mouse.
- Câmpurile evidențiate primesc `aria-invalid`; panoul de mesaje e `aria-live="polite"`.

## Afișare

- Etichetele rândurilor din `rows.ts` (`label`, `row`); tooltip-urile și captions din `fields.ts`.
- Celulele calculate sunt afișate ca text formatat `ro-RO` (separator de mii), nu ca input.
  Câmpurile editabile arată cifrele brute.
- Coloanele tabelului: „Valoare" (c2) și „TVA" (c3), ca în PDF; rândurile fără c3 lasă celula goală.
- Light, o coloană de max 1100 px, panou lateral lipicios de la 1100 px în sus; sub, se stivuiește.
  Font de sistem; numerele cu `font-variant-numeric: tabular-nums`. Fără framework CSS.
- Butonul VALIDARE face exact ce face cel din PDF, inclusiv mesajul generic „Date incomplete".
  Descărcarea XML e activă doar după o validare reușită; numele fișierului `D300.xml`.

## Presetări

`harness/gen-presets.mjs` expandează cazurile de mână din `harness/oracle/cases/*.json` prin
`cases.mjs` (substituenții `{{CUI}}` etc.) și scrie `src/ui/presets.json`: `{ name, descriere,
inputs }`. UI-ul nu conține logică de substituenți. Un click pe o presetare rulează intrările
prin store, deci jurnalul arată exact mesajele din fișierul de aur.

## Verificare (checkpoint 2)

- `vite preview` în browser pane: `sample-01` introdus prin tastatură, XML descărcat identic cu
  `golden/sample-01.json`; presetarea `sample-02-erori` produce aceleași 9 mesaje ca aurul.
- Capturi 1400×900 și 375×812; consolă curată; rulare dublă a aceluiași caz → același XML.

## Ce s-a livrat

Structura de mai sus a rămas în picioare: aceleași componente, același drum
`FieldInput → store → engine`, zero reguli în componente. Ce urmează sunt abaterile pe
care le-a luat implementarea față de specificație, cu motivul fiecăreia.

### `src/ui/display.ts`, un fișier care nu era în plan

Compunerea de mai sus nu prevedea niciun modul de afișare. A apărut unul, ca să nu se
strecoare decizii în componente: grupează `TABLE_ROWS` pe rânduri afișate (`groupRows`,
astfel încât `r5.c2` și `r5.c3` ajung pe același rând, ca în PDF), ține titlurile celor
cinci secțiuni, formatează numerele `ro-RO`, traduce o cale într-o etichetă de citit
(`labelFor`, folosită și de jurnalul de mesaje) și listează celulele panoului de totaluri
(`TOTAL_CELLS`). Nu ia nicio decizie de domeniu și nu citește starea.

### Etichetele din afara tabelului sunt scrise de mână

Planul spunea „etichetele luate din template". Nu se poate: `toolTip`-urile din PDF sunt pe
alocuri greșite — codul poștal poartă „B.7.Scara", numărul de evidență poartă „protected".
Așa că pentru **antet, identificare, bife și semnătură** eticheta e scrisă în
`FIELD_LABELS` din `display.ts`, în română, după textul tipărit în formular. Etichetele
**rândurilor** rămân cele generate în `rows.ts`, nemodificate, fiindcă acolo textul din
template e corect și e chiar denumirea operațiunii din decont.

### `FieldInput` nu are `<label>` propriu

Componenta redă doar controlul, cu `aria-label` (din `label`, apoi `FIELD_LABELS`, apoi
`toolTip`, apoi calea). Eticheta vizibilă stă în secțiunea care o folosește: `<label
class="field"><span>…</span><FieldInput/></label>` în formulare, `<span class="bifa-text">`
lângă bife, iar în tabel antetul de rând și de coloană. Motivul e tabelul: un `<label>`
propriu în fiecare celulă ar dubla textul deja prezent pe rând și ar strica alinierea.
Consecința de accesibilitate e asumată: numele accesibil vine din `aria-label`, nu dintr-o
asociere `for`/`id`.

### Celulele blocate dinamic rămân `input` readonly

`FieldInput` afișează o celulă ca **text** (`<span class="calc">`) doar când câmpul e
protejat sau read-only **în template** (`access !== 'open'`), adică pentru rândurile
calculate. Blocarea care apare în timpul rulării — rd.1–8 și rd.20–23 golite de metoda
simplificată, sau tot formularul după o validare reușită — trece prin `store.readOnly` și
pune doar `readonly` pe input. Deci o celulă blocată la rulare arată în continuare ca un
câmp de completat, doar că nu primește text. Diferența e vizuală, nu de comportament:
valoarea nu poate fi schimbată în niciunul dintre cazuri.

### Commit la `blur` doar dacă valoarea s-a schimbat

`commit()` iese devreme când tamponul local e egal cu valoarea din store. Intrarea și
ieșirea dintr-un câmp fără să tastezi nimic nu produce niciun pas: nici mesaj, nici
recalculare. Originalul rulează `exit` la fiecare ieșire, indiferent. Nu afectează
paritatea — harness-ul trimite oricum fiecare intrare a cazului prin `applyInput` — dar
înseamnă că prin interfață nu poți declanșa un mesaj de ieșire doar plimbându-te prin
câmpuri. E o alegere deliberată: altfel, un `Tab` peste un CIF valid ar rescrie jurnalul la
fiecare trecere.

### Bifele de taxare inversă și rambursarea sunt radio DA/NU

În PDF cele patru bife de taxare inversă și solicitarea de rambursare nu sunt casete, ci
`exclGroup`-uri cu valorile `D` și `N`. `FieldInput` le redă ca `role="radiogroup"` cu două
butoane radio, etichetate „Da" și „Nu" în componentă. Bifele din antet (`d_rez`, `d_scc`,
`d_rec`, `d_reprezentant`, metoda simplificată) sunt `checkButton` adevărate și rămân
casete de bifat, cu perechea de valori luată din `items`.

### Blocarea după validare, în locul lui `busy`

Starea `busy` din specificație nu a fost necesară: totul rulează sincron. În locul ei,
store-ul ține `locked`. După o validare care produce XML, formularul se blochează — ca
ștampila din PDF — iar butonul „Deblocare" apelează `engine.unlock`, readuce ștampila la
NEVALIDAT și golește XML-ul atașat. `readOnly(path)` întoarce `true` pentru orice cale cât
timp `locked` e adevărat.

### Rămas de completat

Linkul „Codul sursă" din `FormHeader.vue` e `href="#"`, fiindcă repo-ul e local; se
completează la publicare. Linkul „Tabelul de paritate" arată spre `docs/PARITATE.md`, deci
funcționează abia după ce documentele ajung lângă build.
