// Motorul: compune modulele de reguli in ORDINEA din registry.ts (comentariul
// "ORDINEA DE EXECUTIE"), identic cu runCase din harness/oracle/legacy-runtime.mjs.
// Nu contine nicio regula; doar secventa si punctul fix al calculelor.
import { EXCL_GROUPS, FIELD_BY_PATH } from './fields';
import { createCtx, createInitialFormState, freeze, type Ctx, type FormState } from './context';
import type { Message, Trace } from './state';
import { applyChange, afterChange } from './change';
import { onEnter } from './enter';
import { onExit } from './exit';
import { recalculateOnce } from './calculate';
import { checkMandatory, execValidate, mandatoryMessage, sumaControl, validForm } from './validate';
import { genXML } from './xml';

export interface Outcome {
  state: FormState;
  messages: Message[];
  trace: Trace[];
}
export interface ValidateOutcome extends Outcome {
  /** continutul "Erori si avertizari.txt" sau null */
  erori: string | null;
  /** D300.xml sau null daca formularul nu e valid */
  xml: string | null;
}

const exclGroups = new Set(EXCL_GROUPS.map((g) => g.path));
const isToggle = (path: string) => exclGroups.has(path) || FIELD_BY_PATH.get(path)?.ui === 'checkButton';

/** calculele la punct fix, ca xfa (max 12 treceri); intoarce numarul de treceri */
function recalc(ctx: Ctx): number {
  for (let pass = 1; pass <= 12; pass++) if (!recalculateOnce(ctx)) return pass;
  throw new Error('calculele nu converg in 12 treceri');
}

const done = (ctx: Ctx): Outcome => ({ state: freeze(ctx), messages: ctx.messages, trace: ctx.trace });

export { createInitialFormState };

/**
 * O intrare a utilizatorului intr-un camp, cu tot ce declanseaza ea:
 *   toggle (bifa, grup radio): set -> change -> recalculare
 *   altfel: enter -> change (transforma sau respinge) -> set -> exit -> recalculare
 * O valoare respinsa NU recalculeaza (ca `continue` din runCase).
 */
export function applyInput(state: FormState, path: string, value: string): Outcome {
  const ctx = createCtx(state);
  if (!(path in ctx.values)) throw new Error(`camp necunoscut: ${path}`);
  if (isToggle(path)) {
    ctx.set(path, value);
    afterChange(ctx, path);
    recalc(ctx);
    return done(ctx);
  }
  onEnter(ctx, path);
  const r = applyChange(ctx, path, value);
  if (r.rejected) {
    ctx.say({ kind: 'respins', field: path, text: value });
    return done(ctx);
  }
  ctx.set(path, r.value);
  onExit(ctx, path);
  recalc(ctx);
  return done(ctx);
}

export function recalculate(state: FormState): Outcome {
  const ctx = createCtx(state);
  recalc(ctx);
  return done(ctx);
}

/** Butonul VALIDARE, exact ca in PDF: obligatorii -> mesaj -> execValidate -> suma de control -> validForm -> XML. */
export function pressValidate(state: FormState): ValidateOutcome {
  const ctx = createCtx(state);
  ctx.highlighted.clear();
  const missing = checkMandatory(ctx);
  const incomplete = mandatoryMessage(ctx, missing);
  execValidate(ctx);
  let erori: string | null = null;
  let xml: string | null = null;
  if (!incomplete) {
    sumaControl(ctx);
    erori = validForm(ctx);
    if (erori === null) {
      xml = genXML(ctx.values, ctx.editValue);
      ctx.fire('xml.genXML');
      // button.blochez: stampila din antet; blocarea campurilor e treaba interfetei
      ctx.set('Antet.IdDoc.formValid', 'FORMULAR VALIDAT');
      ctx.fire('button.blochez', 'Antet.IdDoc.formValid');
    }
  }
  return { ...done(ctx), erori, xml };
}

/** Butonul DEBLOCARE din PDF (formular.deblochez): stampila revine la NEVALIDAT; XML-ul atasat se sterge (treaba interfetei). */
export function unlock(state: FormState): FormState {
  const ctx = createCtx(state);
  ctx.set('Antet.IdDoc.formValid', 'FORMULAR NEVALIDAT');
  ctx.highlighted.clear();
  return freeze(ctx);
}

export interface CaseResult extends ValidateOutcome {
  /** mesajele tuturor pasilor, in ordine, inclusiv cele de la buton */
  messages: Message[];
  trace: Trace[];
}

/** Un caz intreg, in formatul harnessului: intrarile in ordine (cu sau fara prefixul form1.), apoi butonul. */
export function runCase(inputs: readonly (readonly [string, string])[]): CaseResult {
  let state = createInitialFormState();
  const messages: Message[] = [];
  const trace: Trace[] = [];
  for (const [p, v] of inputs) {
    const o = applyInput(state, p.replace(/^form1\./, ''), v);
    state = o.state;
    messages.push(...o.messages);
    trace.push(...o.trace);
  }
  const v = pressValidate(state);
  messages.push(...v.messages);
  trace.push(...v.trace);
  return { ...v, messages, trace };
}
