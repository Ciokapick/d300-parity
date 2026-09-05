// Tipurile minime pentru oracolul din `harness/oracle/legacy-runtime.mjs`, ca testele
// diferentiale sa ramana in TypeScript strict fara `any`. Fisierul din harness NU se
// modifica (e sursa de adevar); aici doar descriem ce foloseste testul.
//
// Declaratia e un tipar (`*/legacy-runtime.mjs`), pentru ca modulul e JavaScript
// simplu si nu are tipuri proprii.

declare module '*/legacy-runtime.mjs' {
  export interface LegacyNode {
    rawValue: string | number | null;
    editValue: string | number | null;
    somExpression: string;
  }

  export interface LegacyValid {
    isCUI(value: string): boolean;
    isCNP(value: string): boolean;
    isCnpNif(value: string): boolean | undefined;
    isValidIBANNumber(value: string): number | string | false;
    mod97(value: string): number | string;
    getDaysInMonth(m: number, y: number): number;
  }

  export interface LegacyUtile {
    trimSpaces(x: string): string;
    remSpaces(x: string): string;
    invalidChr(value: string, re: RegExp): RegExpMatchArray | null;
    roundNumber(n: number | null, digits: number): number | undefined;
    calculateRegistrationNumber(referencePeriod: Date): string;
    getReferencePeriod(): Date | null;
  }

  export interface LegacyConversii {
    schEnt(ref: string): string;
  }

  export interface LegacyGenValid {
    genXML(): boolean;
  }

  /** `event.target` din shim: fisierele atasate ale PDF-ului */
  export interface LegacyEvent {
    target: {
      getDataObjectContents(name: string): string | undefined;
      removeDataObject(name: string): void;
    };
  }

  export interface LegacyObjects {
    valid: LegacyValid;
    utile: LegacyUtile;
    conversii: LegacyConversii;
    genValid: LegacyGenValid;
    event: LegacyEvent;
  }

  export interface LegacyCase {
    name: string;
    inputs: [string, string][];
  }

  export interface LegacyResult {
    name: string;
    passes: number;
    log: { kind: string; title?: string; text: string; field?: string }[];
    values: Record<string, string | number | null>;
    highlighted: string[];
    xml: string | null;
    erori: string | null;
    unshimmed: string[];
  }

  export interface LegacyForm {
    byPath: Map<string, LegacyNode>;
    objects: LegacyObjects;
    runCase(c: LegacyCase): LegacyResult;
  }

  export function createForm(): LegacyForm;
}

declare module '*/cases.mjs' {
  import type { LegacyCase } from '*/legacy-runtime.mjs';
  export function loadCase(name: string): LegacyCase;
  export function loadAll(options?: { gen?: boolean }): { case: LegacyCase; gen: boolean }[];
  export function placeholders(): {
    CUI: string;
    CUI_INVALID: string;
    IBAN: string;
    IBAN_INVALID: string;
  };
}
