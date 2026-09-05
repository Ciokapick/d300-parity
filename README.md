# D300 parity

ANAF's *Decont de TVA* (form 300) is an Adobe LiveCycle XFA PDF: every rule a Romanian
VAT return has to satisfy lives inside that file as JavaScript and FormCalc. This is that
form on the web, with the evidence on the table — the original code runs unchanged as an
oracle, and every case goes through both implementations.

> Unofficial reconstruction for engineering purposes. Not an ANAF product, it submits
> nothing anywhere, and every dataset in it is invented. Source: `D300_v12.0.2_12022026.pdf`,
> a public download from `static.anaf.ro`.

## Parity

| check | result |
|---|---|
| cases through both implementations | 418 (118 hand-written, 300 generated) |
| identical end to end | **418 / 418** |
| unexpected differences | **0** |
| declared intentional deviations | 0 |
| rules exercised by the corpus | 43 / 52 in `trace`, 52 / 52 with indirect evidence |
| XML valid against the official XSD v12 | 359 / 364 (the 5 invalid ones are defect #14, faithfully reproduced) |
| messages produced across the corpus | 918 |
| unit tests | 849 green |
| verdict | **full parity** |

What "identical" covers, per case: the messages (ordered, verbatim text), the values of
**every** field, the highlighted fields, the `Erori si avertizari.txt` file, and `D300.xml`
byte for byte. Reproduce it with `npm run parity` (about 7 seconds); the full table, the
rule coverage and the XSD verdicts are in [`docs/PARITATE.md`](docs/PARITATE.md), which
that command regenerates.

The runner was itself checked by injecting errors in all five comparison categories.

## Status

| step | state |
|---|---|
| extract the executable rules from the PDF | done: 296 fields, 218 event scripts + 7 script objects, ~138 KB of code |
| run the original code unchanged in Node (oracle 1) | done: `harness/oracle/legacy-runtime.mjs`, 0 unshimmed Acrobat APIs across the corpus |
| validate the produced XML against ANAF's XSD v12 (oracle 2) | done, on the whole corpus |
| run ANAF's official Java validator on the same XML (oracle 3) | done: `npm run duk`, 364 XML files, 206 accepted / 158 refused, every refusal explained in [`docs/DUK.md`](docs/DUK.md); 0 divergent verdicts between oracle and model |
| rule inventory, defects found in the original | done: 19 defects, see [`docs/INVENTAR-LEGACY.md`](docs/INVENTAR-LEGACY.md) |
| case corpus + golden files | done: 118 hand-written + 300 deterministic, `harness/oracle/golden/` |
| domain model (Vue 3, TypeScript strict, Pinia, Vitest) | done: `src/domain/`, 56 rule specs of which 52 live, 849 tests |
| parity harness | done: `harness/parity/run.mjs`, table above |
| web interface | done: `src/ui/`, `src/store/`, see [`docs/UI.md`](docs/UI.md) |
| confirm runtime assumptions A1 to A4 in Adobe Reader | pending, for the author |
| publish on GitHub Pages | workflow ready in `.github/workflows/pages.yml`; the repository stays local by decision |

`npm run typecheck`, `npm run lint` and `npm run build` are clean.

## Run it

```bash
npm install

# the web form
npm run dev                # development server
npm run build              # type-check + production build into dist/
npm run preview            # serve the build (base /d300-parity/)

# evidence
npm test                   # 849 unit tests (Vitest)
npm run parity             # both implementations on the whole corpus + XSD, rewrites docs/PARITATE.md
npm run parity:regen       # regenerate the 300 generated cases first, then the parity table
npm run golden             # re-run every case through the original code, rewrite the golden files
npm run golden:check       # recompute and compare against the golden files on disk, changing nothing

# generated sources (re-run after a new extraction)
npm run gen:fields         # legacy/extracted/fields.json  -> src/domain/fields.ts
npm run gen:rows           # the original genXML + fields.json -> src/domain/rows.ts
npm run gen:presets        # the hand-written cases -> src/ui/presets.json
```

Two Python steps sit outside npm, because they need `pypdf` and `lxml`:

```bash
# pull the rules out of the PDF (needs pypdf) — this is what fills legacy/extracted/
python harness/extract_legacy.py legacy/anaf/D300_v12.0.2_12022026.pdf legacy/extracted

# validate one produced XML against the official schema (needs lxml)
python harness/validate_xsd.py legacy/anaf/d300_v12_11022026.xml harness/oracle/out/sample-01.xml
```

One case at a time through the original code: `node harness/oracle/run.mjs sample-01`,
which writes the values, the message log and the XML into `harness/oracle/out/`.

The 300 generated cases and their golden files are not in git: they are reproducible with
`node harness/oracle/generate.mjs --seed 1 --count 300 --out cases/gen`.

## Layout

```
legacy/anaf/        the untouched ANAF downloads: PDF v12.0.2, XSD v12, structure doc, validator zips
legacy/extracted/   what extract_legacy.py pulls out: XFA packets, every script, field inventory

harness/            extraction, generators, XSD validation
harness/oracle/     legacy-runtime.mjs (the original code in Node), cases/, golden/, generate.mjs
harness/parity/     run.mjs (both implementations, one table), expected.json, parity.json, xsd.py

src/domain/         the new implementation: rules/registry.ts (the spec), fields.ts and rows.ts
                    (generated), engine.ts (the execution order), and one module per event kind
src/store/          form.ts, the single point where the interface touches the domain (Pinia)
src/ui/             the screens: sections, totals panel, message journal, FieldInput, display.ts
tests/              Vitest, over the golden files and the rule registry

docs/               PLAN.md, INVENTAR-LEGACY.md, PARITATE.md (generated), DIFERENTE.md,
                    UI.md, STUDIU-DE-CAZ.md
.github/workflows/  pages.yml, the GitHub Pages build, ready but not yet used
```

## Method

1. **Extract, don't transcribe.** The rules are read out of the PDF by a script. The field
   registry, the row-to-XML-attribute map and the UI presets are generated from that
   extraction, so nothing that matters is retyped by hand.
2. **Run the original as the oracle.** A minimal shim of the XFA object model lets the ANAF
   scripts execute unchanged. Any Acrobat API the shim does not cover is reported, never
   silently ignored. The four assumptions the shim makes (A1 to A4) are written at the top of
   `harness/oracle/legacy-runtime.mjs` and are still to be confirmed in Adobe Reader.
3. **Three oracles, different authorities.** The PDF's own code (what the taxpayer sees),
   the XSD (the contract), and ANAF's Java validator (the back end). Where they
   disagree, that disagreement is a finding, not a bug to hide — the 5 XML files the schema
   rejects are exactly that.
4. **Reproduce the defects, then decide.** The new implementation copies the original
   including its bugs; every accepted deviation would be declared in
   [`docs/DIFERENTE.md`](docs/DIFERENTE.md) and registered in the harness as expected.
   There are none so far.
5. **Parity is a table, not a sentence.** Every case goes through the legacy runtime and the
   new implementation; the diff is the deliverable.

## Documents

- [`docs/PLAN.md`](docs/PLAN.md) — the plan, the phases, the decisions and what is left
- [`docs/INVENTAR-LEGACY.md`](docs/INVENTAR-LEGACY.md) — what the legacy actually contains, and the 19 defects found in it
- [`docs/PARITATE.md`](docs/PARITATE.md) — the parity table, generated by `npm run parity`
- [`docs/DIFERENTE.md`](docs/DIFERENTE.md) — the deviation policy and the candidates
- [`docs/UI.md`](docs/UI.md) — the interface structure and what shipped
- [`docs/STUDIU-DE-CAZ.md`](docs/STUDIU-DE-CAZ.md) — raw material for the case study (Romanian)
