<script setup lang="ts">
// Cele 116 cazuri din corpus, generate de `harness/gen-presets.mjs`. Un caz încărcat
// trece prin store intrare cu intrare, deci jurnalul arată exact mesajele din aur.
import { computed, ref } from 'vue';

import { useFormStore } from '../store/form';
import presets from './presets.json';

interface Preset {
  name: string;
  descriere: string;
  inputs: [string, string][];
}

const cases = presets as Preset[];
const store = useFormStore();
const selected = ref(cases[0]?.name ?? '');
const current = computed(() => cases.find((c) => c.name === selected.value) ?? null);

function load(): void {
  const c = current.value;
  if (c) store.loadPreset(c.inputs);
}
</script>

<template>
  <div class="presets">
    <label class="field">
      <span>Caz din corpus ({{ cases.length }})</span>
      <select v-model="selected">
        <option
          v-for="c in cases"
          :key="c.name"
          :value="c.name"
        >{{ c.name }}</option>
      </select>
    </label>
    <button
      type="button"
      @click="load"
    >
      Încarcă
    </button>
    <p
      v-if="current"
      class="descriere"
    >
      {{ current.descriere }}
    </p>
  </div>
</template>
