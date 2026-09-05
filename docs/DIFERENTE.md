# Abateri intenționate față de original

Regula proiectului: modelul nou reproduce originalul **exact**, inclusiv defectele din
`INVENTAR-LEGACY.md`, până când tabelul de paritate e verde pe tot corpusul. Abia apoi se
decide, una câte una, ce merită schimbat. Fiecare abatere acceptată se scrie aici și se
înregistrează în harness ca diferență **așteptată**, cu cazurile pe care le afectează.
O diferență care nu e în acest fișier e un bug.

Format: id, ce face originalul, ce face modelul nou, de ce, cazurile afectate.

## Abateri acceptate

Niciuna încă. Faza 2 și 3 rulează cu zero abateri.

## Candidate, de decis după paritate

| candidat | originalul | argument pentru schimbare | argument contra |
|---|---|---|---|
| `schemaLocation` v11 lângă `xmlns` v12 | emite v11 | e un copy-paste, XSD-ul e v12 | validatorul ANAF nu se uită la schemaLocation; identitatea octet cu octet a XML-ului e dovada principală |
| `caen` emis de două ori | XML malformat dacă ambele CAEN sunt setate | XML-ul devine invalid | scripturile de exit golesc oricum celălalt câmp; situația e practic imposibilă prin interfață |
| verificarea zilei din CNP moartă | acceptă 31 februarie | un CNP invalid trece | schimbă comportamentul față de PDF-ul pe care contabilul îl folosește azi |
| interpolarea inversată în mesajul `A.tva-vs-valoare` | textul arată TVA drept Valoare | mesaj corect | mesajul verbatim e ce vede utilizatorul în PDF |
| temeiul legal forțat la 2 | opțiunea lit. a) nu se poate selecta | listă funcțională | `temei` din XML vine din bifă, nu din listă; lista e decorativă în original |

## Ce nu se reproduce deloc (nu sunt abateri, sunt în afara modelului)

Atașarea arhivelor zip, semnătura digitală, blocarea/deblocarea PDF-ului, verificarea
versiunii Acrobat, meniurile de ajutor, gestul Ctrl+click pe liste, evidențierea prin
`border` la ieșirea din câmp (`oblig.OnExit`).
