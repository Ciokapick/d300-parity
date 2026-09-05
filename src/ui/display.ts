// Ajutoare de AFIȘARE, nu de comportament. Aici nu se ia nicio decizie de domeniu:
// se grupează rândurile din `rows.ts` pe secțiuni, se traduc căile în etichete de
// citit și se formatează numerele pentru `ro-RO`. Orice regulă trece prin
// `src/domain/engine.ts`, niciodată prin fișierul acesta.
import { EXCL_GROUPS, FIELD_BY_PATH, type ExclGroupSpec, type FieldValue } from '../domain/fields';
import { ROW_BY_PATH, TABLE_ROWS, type RowSpec, type Section } from '../domain/rows';

export const EXCL_BY_PATH: ReadonlyMap<string, ExclGroupSpec> = new Map(
  EXCL_GROUPS.map((g) => [g.path, g]),
);

export const isExclGroup = (path: string): boolean => EXCL_BY_PATH.has(path);

/** Un rând afișat: numărul din formular, eticheta și celulele lui pe coloane. */
export interface DisplayRow {
  key: string;
  row: string | null;
  label: string;
  cells: Partial<Record<'c1' | 'c2' | 'c3', RowSpec>>;
}

/**
 * Grupează `TABLE_ROWS` pe rânduri afișate. Cheia e calea fără sufixul de coloană,
 * deci `date.comert.r5.c2` și `date.comert.r5.c3` ajung pe același rând, ca în PDF.
 * `perCell` desface grupul înapoi în câte un rând pe celulă (secțiunea „alte informații”,
 * unde cele două coloane au etichete diferite).
 */
export function groupRows(section: Section, perCell = false): DisplayRow[] {
  const out: DisplayRow[] = [];
  const byKey = new Map<string, DisplayRow>();
  for (const r of TABLE_ROWS) {
    if (r.section !== section) continue;
    const key = perCell ? r.path : r.path.replace(/\.c[123]$/, '');
    let row = byKey.get(key);
    if (!row) {
      row = { key, row: r.row, label: r.label, cells: {} };
      byKey.set(key, row);
      out.push(row);
    }
    if (!row.label) row.label = r.label;
    row.cells[r.col] = r;
  }
  return out;
}

/** Singura celulă a unui rând desfăcut cu `perCell` (secţiunea „alte informaţii”). */
export function onlyCell(r: DisplayRow): RowSpec | null {
  return r.cells.c1 ?? r.cells.c2 ?? r.cells.c3 ?? null;
}

export const SECTIONS: readonly { id: Section; title: string }[] = [
  { id: 'comert', title: 'Comerţ intracomunitar şi în afara UE' },
  { id: 'livrari', title: 'Taxa pe valoarea adăugată colectată' },
  { id: 'achizitiiRO', title: 'Achiziţii intracomunitare şi achiziţii cu taxare inversă (oglinda rd.5–8)' },
  { id: 'achizitiiIMP', title: 'Taxa pe valoarea adăugată deductibilă' },
  { id: 'regularizari', title: 'Regularizări' },
];

const nf = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });

/** Numerele calculate se afișează `ro-RO`; ce nu e număr se afișează ca text. */
export function formatNumber(v: FieldValue): string {
  if (v === null || v === '') return '';
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? nf.format(n) : String(v);
}

/**
 * Etichetele câmpurilor din afara tabelului. `toolTip`-urile din PDF sunt pe alocuri
 * greșite (codul poștal poartă „B.7.Scara”, numărul de evidență poartă „protected”),
 * așa că pentru câmpurile de antet, identificare, bife și semnătură eticheta e scrisă
 * aici, în română, după textul din formular. Etichetele rândurilor rămân cele din
 * `rows.ts`, nemodificate.
 */
export const FIELD_LABELS: Readonly<Record<string, string>> = {
  'Antet.metaDate.an_r': 'Anul',
  'Antet.metaDate.tipDecont': 'Perioada de raportare',
  'Antet.metaDate.luna_r': 'Luna / trimestrul / semestrul',
  'Antet.metaDate.perioada.dataInceput': 'Perioada de la',
  'Antet.metaDate.perioada.dataSfarsit': 'Perioada până la',
  'Antet.metaDate.d_rez': 'Decont depus după anularea rezervei verificării ulterioare',
  'Antet.temeiLegal': 'Temei legal',
  'Antet.metaDate.d_scc': 'Decont depus de succesor',
  'Antet.cifS': 'Cod de identificare fiscală al succesorului',
  'Antet.metaDate.d_rec': 'Declaraţie rectificativă',
  'Antet.d_reprezentant': 'Decont depus prin reprezentant fiscal',
  'Antet.opInterne.mtdSimplificata': 'Aplic metoda simplificată (numai operaţiuni interne)',
  'Antet.nr_evid': 'Număr de evidenţă a plăţii',
  'Antet.metaDate.totalPlata_A': 'Sumă de control',
  'identifCntr.denumire.den': 'Denumire / Nume şi prenume',
  'identifCntr.denumire.cif': 'Cod de identificare fiscală',
  'identifCntr.adresa.judet': 'Judeţ',
  'identifCntr.adresa.sect': 'Sector',
  'identifCntr.adresa.loc': 'Localitate',
  'identifCntr.adresa.str': 'Strada',
  'identifCntr.adresa.nr': 'Număr',
  'identifCntr.adresa.bloc': 'Bloc',
  'identifCntr.adresa.scara': 'Scara',
  'identifCntr.adresa.etaj': 'Etaj',
  'identifCntr.adresa.apt': 'Apartament',
  'identifCntr.adresa.codPst': 'Cod poştal',
  'identifCntr.contact.telefon': 'Telefon',
  'identifCntr.contact.fax': 'Fax',
  'identifCntr.contact.email': 'E-mail',
  'identifCntr.banca.den': 'Banca',
  'identifCntr.banca.iban': 'Cont bancar (IBAN)',
  'identifCntr.caen': 'Cod CAEN (rev. 3)',
  'identifCntr.caen1': 'Cod CAEN (rev. 2)',
  'identifCntr.proRata': 'Pro-rata de deducere (%)',
  'date.bife.caption.bifa_cereale': 'Aţi efectuat livrări de cereale şi plante tehnice?',
  'date.bife.caption.bifa_mob': 'Aţi efectuat livrări de telefoane mobile?',
  'date.bife.caption.bifa_disp':
    'Aţi efectuat livrări de dispozitive cu circuite integrate înainte de integrarea lor în produse destinate utilizatorului final?',
  'date.bife.caption.bifa_cons': 'Aţi efectuat livrări de console de jocuri, tablete PC şi laptopuri?',
  'date.rambursare.bifa_rambursare': 'Solicitaţi rambursarea soldului sumei negative de TVA?',
  'semnatura.nume': 'Nume',
  'semnatura.prenume': 'Prenume',
  'semnatura.smnFnc': 'Funcţia',
};

/** Eticheta de citit a unei căi: rândul din tabel, eticheta scrisă, tooltip-ul, apoi calea. */
export function labelFor(path: string): string {
  const r = ROW_BY_PATH.get(path);
  if (r) {
    const col = r.col === 'c3' ? 'col. TVA' : r.col === 'c2' ? 'col. Valoare' : 'col. Nr.';
    const nr = r.row ? `rd.${r.row} ` : '';
    return `${nr}${col}${r.label ? ` — ${r.label}` : ''}`;
  }
  const written = FIELD_LABELS[path];
  if (written) return written;
  const f = FIELD_BY_PATH.get(path);
  if (f && f.toolTip) return f.toolTip;
  return path;
}

/** Celulele din panoul de totaluri, în ordinea din formular. */
export const TOTAL_CELLS: readonly { path: string; label: string; numeric: boolean }[] = [
  { path: 'date.livrari.r19.c2', label: 'rd.19 col. Valoare', numeric: true },
  { path: 'date.livrari.r19.c3', label: 'rd.19 col. TVA — total taxă colectată', numeric: true },
  { path: 'date.achizitiiIMP.r31.c3', label: 'rd.30 total taxă deductibilă', numeric: true },
  { path: 'date.achizitiiIMP.r36.c3', label: 'rd.35 total taxă dedusă', numeric: true },
  { path: 'date.regularizari.r37.c3', label: 'rd.36 sumă negativă a TVA în perioadă', numeric: true },
  { path: 'date.regularizari.r38.c3', label: 'rd.37 taxă de plată în perioadă', numeric: true },
  { path: 'date.regularizari.r41.c3', label: 'rd.40 TVA de plată cumulat', numeric: true },
  { path: 'date.regularizari.r44.c3', label: 'rd.43 sumă negativă a TVA cumulată', numeric: true },
  { path: 'date.regularizari.r45.c3', label: 'rd.44 sold TVA de plată la sfârşitul perioadei', numeric: true },
  { path: 'date.regularizari.r46.c3', label: 'rd.45 sold sumă negativă la sfârşitul perioadei', numeric: true },
  { path: 'Antet.metaDate.totalPlata_A', label: 'Sumă de control', numeric: true },
  { path: 'Antet.nr_evid', label: 'Număr de evidenţă a plăţii', numeric: false },
];
