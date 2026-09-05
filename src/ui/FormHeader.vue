<script setup lang="ts">
// Antetul paginii: ce este proiectul, ce nu este, şi comenzile formularului.
// Butonul VALIDARE face exact ce face cel din PDF: `store.validate()`, nimic pe lângă.
import { onBeforeUnmount, ref, watch } from 'vue';

import { useFormStore } from '../store/form';
import PresetPicker from './PresetPicker.vue';

const store = useFormStore();

const href = ref('');
let url = '';

function revoke(): void {
  if (url) {
    URL.revokeObjectURL(url);
    url = '';
  }
}

watch(
  () => store.xml,
  (xml) => {
    revoke();
    url = xml === null ? '' : URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
    href.value = url;
  },
  { immediate: true },
);

onBeforeUnmount(revoke);
</script>

<template>
  <header class="head">
    <h1>Decont de TVA (D300) pe web</h1>

    <p class="nota">
      Reconstrucție neoficială, în scop de inginerie. Nu este un produs ANAF și nu depune nimic.
      Sursa regulilor: formularul D300 v12.0.2 din 12.02.2026.
    </p>

    <p class="linkuri">
      <a href="https://github.com/Ciokapick/d300-parity/blob/main/docs/PARITATE.md">Tabelul de paritate</a>
      <a href="https://github.com/Ciokapick/d300-parity">Codul sursă</a>
    </p>

    <PresetPicker />

    <div class="actions">
      <button
        type="button"
        class="primary"
        @click="store.validate()"
      >
        VALIDARE
      </button>

      <a
        v-if="href"
        class="btn"
        :href="href"
        download="D300.xml"
      >Descarcă D300.xml</a>
      <span
        v-else
        class="btn disabled"
        aria-disabled="true"
      >Descarcă D300.xml</span>

      <button
        v-if="store.locked"
        type="button"
        @click="store.unlock()"
      >
        Deblocare
      </button>
      <button
        type="button"
        @click="store.reset()"
      >
        Formular nou
      </button>

      <span class="stampila">{{ store.value('Antet.IdDoc.formValid') }}</span>
    </div>
  </header>
</template>
