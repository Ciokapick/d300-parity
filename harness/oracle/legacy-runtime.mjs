// Ruleaza codul original din formularul D300 (JavaScript + FormCalc, extras din
// PDF) in Node, peste un model minimal al obiectelor XFA.
//
// Principiu: NU reimplementam nicio regula. Scripturile ANAF ruleaza neschimbate;
// shim-ul ofera doar obiectele pe care le ating (campuri cu rawValue, app.alert,
// xfa.host.messageBox, event.target cu fisiere atasate etc.). Orice API neacoperit
// e raportat in `unshimmed`, ca sa nu treaca neobservat.
//
// Ipoteze documentate (de verificat in Adobe Reader, vezi docs/PLAN.md):
//   A1  FormCalc trateaza null ca 0 in adunari; rezultatul e mereu un numar.
//   A2  rawValue pe campurile <decimal> e Number, nu string.
//   A3  Scriptul de `change` primeste intreaga valoare, nu tasta cu tasta.
//   A4  Acrobat recalculeaza automat dupa fiecare camp; runtime-ul ruleaza calculele
//       la punct fix dupa fiecare intrare, nu o singura data la final. Conteaza:
//       bifa de rambursare citeste rd.45 in momentul bifarii.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const EXTRACTED = path.resolve(here, '..', '..', 'legacy', 'extracted');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(EXTRACTED, f), 'utf8'));

const inventory = readJson('fields.json');
const eventScripts = readJson('scripts.json');
const scriptObjects = readJson('scriptobjects.json');

const style = () => ({ fill: { color: { value: '' } }, weight: 'normal', underline: '0', posture: 'normal' });
const hidden = (obj, key, value) => Object.defineProperty(obj, key, { value, enumerable: false, writable: true });

// Numele declarate cu `var` sau `function` la nivelul unui script. In Acrobat o
// variabila locala umbreste numele din formular (ex. `var rambursare` intr-un script
// de sub subformularul `rambursare`). Intr-un bloc `with`, obiectul de scope ar
// castiga, deci excludem explicit aceste nume din rezolvarea SOM a scriptului.
function declaredNames(source) {
  const names = new Set();
  // fara comentarii: originalul e plin de cod comentat si de text liber cu "var"/"function"
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const m of code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  const re = /\bvar\s+/g;
  let m;
  while ((m = re.exec(code))) {
    let i = m.index + m[0].length;
    let depth = 0;
    let expectName = true;
    let quote = null;
    while (i < code.length) {
      const ch = code[i];
      if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; i++; continue; }
      if (ch === '"' || ch === "'" || ch === '/' && code[i + 1] !== '/' && code[i + 1] !== '*' && /[=(,;:!&|?{}]\s*$/.test(code.slice(Math.max(0, i - 3), i))) { quote = ch; i++; continue; }
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') { if (depth === 0) break; depth--; }
      else if (depth === 0 && (ch === ';' || ch === '\n' && /^\s*(var|if|for|while|return|\}|\/\/|[A-Za-z_$][\w$]*\s*[.(=])/.test(code.slice(i + 1, i + 40)) && !/,\s*$/.test(code.slice(m.index, i)))) break;
      else if (depth === 0 && ch === ',') expectName = true;
      else if (expectName && /[A-Za-z_$]/.test(ch)) {
        const w = code.slice(i).match(/^[A-Za-z_$][\w$]*/)[0];
        names.add(w);
        i += w.length;
        expectName = false;
        continue;
      }
      i++;
    }
  }
  return names;
}

// ---------------------------------------------------------------- noduri
function makeContainer(name, parent, className) {
  const node = {
    name,
    className,
    parent,
    access: 'open',
    presence: 'visible',
    relevant: '',
    somExpression: parent ? `${parent.somExpression}.${name}` : name,
    border: { fill: { color: { value: '' } } },
    validate: { nullTest: 'disabled' },
    rawValue: null,
  };
  hidden(node, '__kids', []);
  hidden(node, '__children', {});
  node.nodes = {
    get length() { return node.__kids.length; },
    item: (i) => node.__kids[i],
    remove: () => {},
  };
  return node;
}

function coerce(valueType, v) {
  if (v === undefined || v === null || v === '') return null;
  if (valueType === 'decimal' || valueType === 'integer') {
    const n = Number(v);
    return Number.isNaN(n) ? null : n; // A2
  }
  return String(v);
}

function makeField(spec, name, parent) {
  const f = makeContainer(name, parent, 'field');
  delete f.rawValue;
  hidden(f, '__ui', spec.ui);
  hidden(f, '__valueType', spec.valueType);
  hidden(f, '__default', spec.default);
  hidden(f, '__items', spec.items || []);
  hidden(f, '__itemValues', spec.itemValues || spec.items || []);
  let raw = coerce(spec.valueType, spec.default);
  const idx = () => f.__itemValues.indexOf(raw == null ? raw : String(raw));
  Object.defineProperties(f, {
    rawValue: { enumerable: true, get: () => raw, set: (v) => { raw = coerce(spec.valueType, v); } },
    editValue: { get: () => (idx() >= 0 ? f.__items[idx()] : raw) },
    formattedValue: {
      get: () => {
        if (spec.ui === 'dateTimeEdit' && typeof raw === 'string') {
          const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (m) return `${m[3]}.${m[2]}.${m[1]}`;
        }
        return raw;
      },
    },
    selectedIndex: { get: idx, set: (i) => { raw = i >= 0 ? coerce(spec.valueType, f.__itemValues[i]) : null; } },
    length: { get: () => f.__items.length },
    // `mandatory` e alias XFA pentru validate.nullTest; scripturile le folosesc pe ambele
    mandatory: { get: () => f.validate.nullTest, set: (v) => { f.validate.nullTest = v; } },
  });
  f.getDisplayItem = (i) => f.__items[i];
  f.access = spec.access || 'open';
  f.validate = { nullTest: spec.nullTest || 'disabled' };
  f.caption = { font: style(), reserve: '' };
  f.font = style();
  f.fillColor = '';
  f.assist = { toolTip: { value: spec.toolTip || '' }, speak: { value: spec.access === 'protected' ? 'protected' : '' } };
  f.ui = { oneOfChild: { className: spec.ui, border: { fill: { color: { value: '' } } } } };
  hidden(f, '__reset', () => { raw = coerce(spec.valueType, spec.default); });
  return f;
}

function buildTree() {
  const root = makeContainer('form1', null, 'subform');
  const byPath = new Map([['form1', root]]);
  // parintii campurilor DA/NU sunt grupuri de butoane radio (exclGroup), nu subformulare
  const exclGroups = new Set(
    inventory.fields.filter((f) => /\.(DA|NU)$/.test(f.path)).map((f) => f.path.replace(/\.(DA|NU)$/, '')),
  );
  for (const spec of inventory.fields) {
    const segs = spec.path.split('.');
    let cur = root;
    for (let i = 1; i < segs.length; i++) {
      const p = segs.slice(0, i + 1).join('.');
      let node = byPath.get(p);
      if (!node) {
        node = i === segs.length - 1
          ? makeField(spec, segs[i], cur)
          : makeContainer(segs[i], cur, exclGroups.has(p) ? 'exclGroup' : 'subform');
        byPath.set(p, node);
        cur.__children[segs[i]] = node;
        cur.__kids.push(node);
        cur[segs[i]] = node;
      }
      cur = node;
    }
  }
  // valoarea implicita a unui exclGroup = valoarea butonului bifat implicit
  for (const p of exclGroups) {
    const g = byPath.get(p);
    const on = g.__kids.find((k) => k.__default != null);
    hidden(g, '__default', on ? on.__default : null);
    g.rawValue = g.__default;
  }
  return { root, byPath };
}

// ---------------------------------------------------------------- runtime
export function createForm() {
  const { root, byPath } = buildTree();
  const log = [];
  const unshimmed = new Set();
  const store = {};
  const globals = Object.create(null);

  // orice proprietate necunoscuta pe obiectele Acrobat e inregistrata si intoarce
  // o functie inofensiva, ca scripturile sa mearga mai departe fara sa ascunda lipsa
  const lenient = (name, base) => new Proxy(base, {
    get(t, k) {
      if (k in t) return t[k];
      if (typeof k !== 'string') return undefined;
      unshimmed.add(`${name}.${k}`);
      return lenient(`${name}.${k}`, function () { return lenient(`${name}.${k}()`, function () {}); });
    },
    set(t, k, v) { t[k] = v; return true; },
  });

  const resolveSom = (som) => {
    if (som == null) return undefined;
    const s = String(som).replace(/\[\d+\]/g, '');
    return byPath.get(s.startsWith('form1') ? s : `form1.${s}`);
  };
  const resetSubtree = (node) => {
    if (!node) return;
    if (node.className === 'field') node.__reset();
    else if (node.className === 'exclGroup') node.rawValue = node.__default;
    for (const k of node.__kids || []) resetSubtree(k);
  };

  const pdfDoc = lenient('event.target', {
    dataObjects: null,
    viewState: {},
    removeDataObject: (n) => { delete store[n]; },
    createDataObject: (n, c) => { store[n] = c; },
    getDataObjectContents: (n) => store[n],
    setDataObjectContents: (n, c) => { store[n] = c; },
  });
  const app = lenient('app', {
    alert: (msg) => { log.push({ kind: 'alert', text: String(msg) }); return 1; },
    popUpMenu: () => '',
    platform: 'WIN', viewerVersion: 11, viewerType: 'Reader', language: 'ENU',
  });
  const xfa = lenient('xfa', {
    host: lenient('xfa.host', {
      messageBox: (msg, title) => { log.push({ kind: 'messageBox', title: title || '', text: String(msg) }); return 1; },
      setFocus: () => {}, beep: () => {}, openList: () => {}, gotoURL: () => {},
      resetData: (som) => resetSubtree(resolveSom(som)),
      validationsEnabled: true,
      numPages: 1,
    }),
    layout: lenient('xfa.layout', { pageContent: () => ({ length: 0, item: () => undefined }) }),
    resolveNode: (p) => resolveSom(p),
    event: { newText: '', prevText: '', change: '', modifier: false, target: null },
  });

  Object.assign(globals, {
    form1: root,
    app, xfa, util: { stringFromStream: (s) => s, streamFromString: (s) => s },
    event: { target: pdfDoc },
    errMsg: { value: '' }, errCount: { value: '' },
    execValidate: () => runAll('validate'),
  });

  // rezolvarea numelor ca in XFA SOM: urc din nodul curent pana la form1, apoi globale
  const lookup = (node, k) => {
    for (let n = node; n; n = n.parent) if (n.__children && k in n.__children) return n.__children[k];
    return k in globals ? globals[k] : undefined;
  };
  const scopeFor = (node, exclude) => new Proxy(Object.create(null), {
    has: (_, k) => typeof k === 'string' && !exclude.has(k) && lookup(node, k) !== undefined,
    get: (_, k) => (typeof k === 'string' ? lookup(node, k) : undefined),
    set: (_, k, v) => { globals[k] = v; return true; },
  });

  // obiectele de scripturi: compilate o data, functiile expuse sub numele obiectului
  for (const [name, code] of Object.entries(scriptObjects)) {
    const names = [...new Set([...code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]))];
    const body = `with(__s){\n${code}\n;return {${names.map((n) => `${n}: (typeof ${n} === 'function' ? ${n} : undefined)`).join(',')}};}`;
    globals[name] = new Function('__s', body)(scopeFor(root, declaredNames(code)));
  }

  // scripturile de eveniment, grupate pe nod si activitate
  const compiled = new Map();
  for (const s of eventScripts) {
    const node = byPath.get(s.path);
    if (!node) continue;
    const key = `${s.path}|${s.event}`;
    if (!compiled.has(key)) compiled.set(key, []);
    const isJs = s.lang === 'application/x-javascript';
    compiled.get(key).push({
      node, lang: isJs ? 'js' : 'formcalc', code: s.code,
      fn: isJs ? new Function('__s', `with(__s){\n${s.code}\n}`) : null,
      exclude: isJs ? declaredNames(s.code) : new Set(),
    });
  }

  const resolvePath = (node, dotted) => {
    const segs = dotted.split('.');
    let cur = lookup(node, segs[0]);
    for (let i = 1; cur && i < segs.length; i++) cur = cur.__children ? cur.__children[segs[i]] : undefined;
    return cur;
  };
  // FormCalc din D300 e exclusiv `$ = a.b + c.d + ...`; il evaluam direct (A1)
  const evalFormCalc = (node, code) => {
    const stmt = code.split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, '').trim()).filter(Boolean).join(' ');
    const m = stmt.match(/^\$\s*=\s*(.+?)\s*;?\s*$/);
    if (!m) throw new Error(`FormCalc neacoperit in ${node.somExpression}: ${code}`);
    let sum = 0;
    for (const term of m[1].split('+').map((t) => t.trim())) {
      const target = resolvePath(node, term);
      if (!target || !('rawValue' in target)) throw new Error(`FormCalc: nu rezolv "${term}" din ${node.somExpression}`);
      sum += target.rawValue == null ? 0 : Number(target.rawValue);
    }
    node.rawValue = sum;
  };

  const runEvent = (node, activity) => {
    const list = compiled.get(`${node.somExpression}|${activity}`) || [];
    for (const s of list) {
      if (s.lang === 'js') s.fn.call(node, scopeFor(node, s.exclude));
      else evalFormCalc(node, s.code);
    }
    return list.length;
  };
  const hasEvent = (node, activity) => compiled.has(`${node.somExpression}|${activity}`);
  const runAll = (activity) => {
    for (const [key, list] of compiled) {
      if (!key.endsWith(`|${activity}`)) continue;
      for (const s of list) {
        if (s.lang === 'js') s.fn.call(s.node, scopeFor(s.node, s.exclude));
        else evalFormCalc(s.node, s.code);
      }
    }
  };

  const snapshot = () => {
    const out = {};
    for (const [p, n] of byPath) if (n.className === 'field' || n.className === 'exclGroup') out[p] = n.rawValue;
    return out;
  };
  // XFA recalculeaza in ordinea dependentelor; noi iteram pana la punct fix
  const recalculate = () => {
    for (let pass = 1; pass <= 12; pass++) {
      const before = JSON.stringify(snapshot());
      runAll('calculate');
      if (JSON.stringify(snapshot()) === before) return pass;
    }
    throw new Error('calculele nu converg in 12 treceri');
  };

  const runCase = (c) => {
    resetSubtree(root);
    for (const k of Object.keys(store)) delete store[k];
    log.length = 0;
    unshimmed.clear();
    globals.errMsg.value = ''; globals.errCount.value = '';

    let passes = 0;
    for (const [p, v] of c.inputs) {
      const node = resolveSom(p);
      if (!node) throw new Error(`camp necunoscut: ${p}`);
      if (node.className === 'exclGroup' || node.__ui === 'checkButton') {
        node.rawValue = v;
        runEvent(node, 'change');
        passes = Math.max(passes, recalculate()); // A4
        continue;
      }
      xfa.event.target = node;
      runEvent(node, 'enter');
      let value = v;
      if (hasEvent(node, 'change')) { // A3
        xfa.event = { change: String(v), newText: String(v), prevText: node.rawValue == null ? '' : String(node.rawValue), modifier: false, target: node };
        runEvent(node, 'change');
        if (String(v) !== '' && xfa.event.change === '') { log.push({ kind: 'respins', field: p, text: String(v) }); continue; }
        value = xfa.event.change;
      }
      node.rawValue = value;
      xfa.event.target = node;
      runEvent(node, 'exit');
      runEvent(root, 'exit');
      passes = Math.max(passes, recalculate()); // A4
    }

    passes = Math.max(passes, recalculate());

    // butonul VALIDARE: mouseUp (campuri obligatorii) apoi click (suma de control,
    // validForm, genXML)
    const btn = byPath.get('form1.btnDoc.btnValid');
    xfa.event.target = btn;
    runEvent(btn, 'mouseUp');
    runEvent(btn, 'click');

    // originalul pierde lista campurilor lipsa in mesajul generic; ce ramane vizibil
    // pentru utilizator e fundalul rosu (fillColor) pus de oblig.CheckForErrors
    const highlighted = [...byPath.values()]
      .filter((n) => n.className === 'field' && n.fillColor === '255,200,200')
      .map((n) => n.somExpression);

    return {
      name: c.name,
      passes,
      log: [...log],
      values: snapshot(),
      highlighted,
      xml: store['D300.xml'] ?? null,
      erori: store['Erori si avertizari.txt'] ?? null,
      unshimmed: [...unshimmed].sort(),
    };
  };

  return { root, byPath, objects: globals, runCase, runEvent, recalculate, snapshot };
}
