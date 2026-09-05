// Regulile `enter` din registry.ts: cele trei preconditii afisate la intrarea in camp.
// Nu schimba nicio valoare — doar avertizeaza (originalul muta si focusul, ceea ce nu
// are corespondent in model).

import type { Ctx } from './context';
import type { EnterModule } from './contracts';
import { text, TITLES } from './messages';

/** `x == 0` din JavaScript: `null` NU e egal cu 0 */
function isZero(v: string | number | null): boolean {
  return v !== null && Number(v) === 0;
}

function onEnter(ctx: Ctx, path: string): void {
  switch (path) {
    // -------------------------------------------------- #82
    case 'identifCntr.adresa.loc': {
      if (ctx.get('identifCntr.adresa.judet') === null) {
        ctx.say({ kind: 'alert', text: text('loc.judet-intai') });
        ctx.fire('enter.loc.judet-intai', path);
      }
      return;
    }

    // -------------------------------------------------- #59
    case 'Antet.temeiLegal': {
      if (isZero(ctx.get('Antet.metaDate.d_rez'))) {
        ctx.say({
          kind: 'messageBox',
          title: TITLES.conditiePrealabila,
          text: text('temei.conditie'),
        });
        ctx.fire('enter.temeiLegal.conditie', path);
      }
      return;
    }

    // -------------------------------------------------- #64
    case 'Antet.cifS': {
      if (isZero(ctx.get('Antet.metaDate.d_scc'))) {
        ctx.say({
          kind: 'messageBox',
          title: TITLES.conditiePrealabila,
          text: text('cifS.conditie'),
        });
        ctx.fire('enter.cifS.conditie', path);
      }
      return;
    }

    // #150 / #153 / #155 / #158 (`enter.r12.dead`) sunt comentate integral in original
    default:
      return;
  }
}

export { onEnter };

export default { onEnter } satisfies EnterModule;
