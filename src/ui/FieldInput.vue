<script setup lang="ts">
// Un singur control legat la o cale. Nu decide nimic: citește din store și trimite
// înapoi valoarea întreagă, la `blur` pentru text și numere (A3 din docs/UI.md),
// la `change` pentru liste, bife și radio.
import { computed, ref, watch } from 'vue';

import { FIELD_BY_PATH } from '../domain/fields';
import { useFormStore } from '../store/form';
import { EXCL_BY_PATH, FIELD_LABELS, formatNumber } from './display';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** calea legacy, fără prefixul `form1.` */
  path: string;
  /** eticheta accesibilă; implicit `FIELD_LABELS`, apoi `toolTip` */
  label?: string;
}>();

const store = useFormStore();

const spec = computed(() => FIELD_BY_PATH.get(props.path) ?? null);
const excl = computed(() => EXCL_BY_PATH.get(props.path) ?? null);

const kind = computed<'radio' | 'check' | 'select' | 'date' | 'number' | 'text'>(() => {
  if (excl.value) return 'radio';
  switch (spec.value?.ui) {
    case 'checkButton':
      return 'check';
    case 'choiceList':
      return 'select';
    case 'dateTimeEdit':
      return 'date';
    case 'numericEdit':
      return 'number';
    default:
      return 'text';
  }
});

const numeric = computed(() => {
  const t = spec.value?.valueType;
  return t === 'decimal' || t === 'integer';
});

/** Celulă calculată: câmp protejat sau readOnly în template. Se afișează ca text. */
const calculated = computed(() => spec.value !== null && spec.value.access !== 'open');

const raw = computed(() => store.value(props.path));
const text = computed(() => (raw.value === null ? '' : String(raw.value)));
const shown = computed(() => (numeric.value ? formatNumber(raw.value) : text.value));

const caption = computed(() => props.label ?? FIELD_LABELS[props.path] ?? spec.value?.toolTip ?? props.path);
const blocked = computed(() => store.readOnly(props.path));
const invalid = computed(() => store.highlighted(props.path));

/** Valorile bifei: prima din `items` bifează, a doua debifează. */
const checkOn = computed(() => spec.value?.items?.[0] ?? '1');
const checkOff = computed(() => spec.value?.items?.[1] ?? '0');
const checked = computed(() => text.value === checkOn.value);

const options = computed(() => {
  const s = spec.value;
  if (!s) return [];
  const values = s.itemValues ?? s.items ?? [];
  const labels = s.items ?? s.itemValues ?? [];
  return values.map((v, i) => ({ value: v, label: labels[i] ?? v }));
});

// tamponul local: se trimite la părăsirea câmpului, nu la fiecare tastă
const draft = ref(text.value);
watch(text, (t) => {
  draft.value = t;
});

function commit(): void {
  if (draft.value === text.value) return;
  store.input(props.path, draft.value);
  // o valoare respinsă lasă câmpul cum era
  draft.value = text.value;
}

function pick(v: string): void {
  store.input(props.path, v);
}

function onCheck(e: Event): void {
  pick((e.target as HTMLInputElement).checked ? checkOn.value : checkOff.value);
}

function onSelect(e: Event): void {
  pick((e.target as HTMLSelectElement).value);
}
</script>

<template>
  <span
    v-if="calculated"
    class="calc"
    :class="{ invalid }"
    :aria-label="caption"
    v-bind="$attrs"
  >{{ shown }}</span>

  <span
    v-else-if="kind === 'radio'"
    class="radio-group"
    role="radiogroup"
    :aria-label="caption"
    :aria-invalid="invalid || undefined"
    v-bind="$attrs"
  >
    <label
      v-for="o in excl?.options ?? []"
      :key="o"
      class="radio"
    >
      <input
        type="radio"
        :name="path"
        :value="o"
        :checked="text === o"
        :disabled="blocked"
        @change="pick(o)"
      >
      <span>{{ o === 'D' ? 'Da' : 'Nu' }}</span>
    </label>
  </span>

  <input
    v-else-if="kind === 'check'"
    type="checkbox"
    :checked="checked"
    :disabled="blocked"
    :aria-label="caption"
    :aria-invalid="invalid || undefined"
    v-bind="$attrs"
    @change="onCheck"
  >

  <select
    v-else-if="kind === 'select'"
    :value="text"
    :disabled="blocked"
    :aria-label="caption"
    :aria-invalid="invalid || undefined"
    :required="store.mandatory(path) || undefined"
    v-bind="$attrs"
    @change="onSelect"
  >
    <option value="">
      —
    </option>
    <option
      v-for="o in options"
      :key="o.value"
      :value="o.value"
    >
      {{ o.label }}
    </option>
  </select>

  <input
    v-else-if="kind === 'date'"
    v-model="draft"
    type="date"
    :readonly="blocked"
    :aria-label="caption"
    :aria-invalid="invalid || undefined"
    v-bind="$attrs"
    @blur="commit"
  >

  <input
    v-else
    v-model="draft"
    type="text"
    :class="{ num: numeric }"
    :inputmode="numeric ? 'numeric' : undefined"
    :readonly="blocked"
    :aria-label="caption"
    :aria-invalid="invalid || undefined"
    :required="store.mandatory(path) || undefined"
    v-bind="$attrs"
    @blur="commit"
  >
</template>
