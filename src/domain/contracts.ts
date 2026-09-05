// Contractele modulelor de reguli. Fiecare modul exporta functiile de mai jos cu
// `satisfies`, iar engine.ts le compune in ordinea din registry.ts (vezi comentariul
// "ORDINEA DE EXECUTIE" de acolo). Modulele nu se apeleaza intre ele decat prin
// importuri explicite de functii pure (checksums, nrEvid, messages, xml).
import type { Ctx } from './context';

/** change.ts: transformarile si respingerile de la tastare (A3) + efectele bifelor. */
export interface ChangeModule {
  /**
   * Pentru campurile text/numerice/liste: ruleaza inainte de setare.
   * Intoarce valoarea transformata (ex. majuscule) sau `rejected: true` daca
   * originalul ar fi golit `xfa.event.change` (valoarea nu se seteaza; log "respins").
   */
  applyChange(ctx: Ctx, path: string, value: string): { value: string; rejected: boolean };
  /** Pentru checkButton si exclGroup: ruleaza DUPA setare (d_rez, d_scc, mtdSimplificata, rambursare). */
  afterChange(ctx: Ctx, path: string): void;
}

/** enter.ts: preconditiile la intrarea in camp (loc <- judet, temeiLegal <- d_rez, cifS <- d_scc). */
export interface EnterModule {
  onEnter(ctx: Ctx, path: string): void;
}

/** exit.ts: regulile de la iesirea din camp, dupa setare (trim, seturi de caractere, CUI/IBAN, TVA automat...). */
export interface ExitModule {
  onExit(ctx: Ctx, path: string): void;
}

/** calculate.ts: o trecere prin toate regulile `calculate`, in ordinea din registry. */
export interface CalculateModule {
  /** intoarce true daca vreo valoare s-a schimbat (motorul itereaza pana la punct fix, max 12) */
  recalculateOnce(ctx: Ctx): boolean;
}

/** validate.ts: butonul VALIDARE, in pasii din registry (button.*) si regulile `validate`. */
export interface ValidateModule {
  /** button.obligatorii: marcheaza highlighted, intoarce numarul de campuri lipsa ca in errCount (lungimea sirului) */
  checkMandatory(ctx: Ctx): number;
  /** button.obligatorii.mesaj: emite mesajul generic daca lipsesc campuri; intoarce true daca lipsesc */
  mandatoryMessage(ctx: Ctx, missing: number): boolean;
  /** button.execValidate: regulile validate.* */
  execValidate(ctx: Ctx): void;
  /** button.sumaControl: scrie Antet.metaDate.totalPlata_A */
  sumaControl(ctx: Ctx): void;
  /** button.validForm: intoarce continutul "Erori si avertizari.txt" sau null daca nu sunt erori; emite messageBox-ul corespunzator */
  validForm(ctx: Ctx): string | null;
}
