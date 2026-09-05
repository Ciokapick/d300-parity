// `conversii.schEnt` din legacy/extracted/scriptobj_conversii.js, copiat verbatim.
//
// Inlocuieste cele 5 entitati predefinite XML. Ordinea conteaza: `&` PRIMUL, altfel
// ampersandurile introduse de celelalte inlocuiri ar fi escapate a doua oara.
// Folosit de xml.ts, care il aplica de DOUA ori pe adresa (o data pe fiecare parte,
// o data pe sirul concatenat) — exact ca originalul.

export function schEnt(Ref: string): string {
  // originalul declara `var sir = "";` si abia apoi il suprascrie; initializarea
  // moarta e comasata aici, restul e identic
  let sir = Ref.replace(/[&]/g, '&amp;');
  sir = sir.replace(/[<]/g, '&lt;');
  sir = sir.replace(/[>]/g, '&gt;');
  sir = sir.replace(/["]/g, '&quot;');
  sir = sir.replace(/[']/g, '&apos;');
  return sir;
}
