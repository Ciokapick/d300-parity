<script setup lang="ts">
// Shell-ul: antetul, secţiunile în ordinea din PDF, panoul lateral cu totaluri şi mesaje.
import FormHeader from './ui/FormHeader.vue';
import PanelMesaje from './ui/PanelMesaje.vue';
import PanelTotaluri from './ui/PanelTotaluri.vue';
import SectionBife from './ui/SectionBife.vue';
import SectionFacturi from './ui/SectionFacturi.vue';
import SectionIdentificare from './ui/SectionIdentificare.vue';
import SectionNedeductibil from './ui/SectionNedeductibil.vue';
import SectionPerioada from './ui/SectionPerioada.vue';
import SectionSemnatura from './ui/SectionSemnatura.vue';
import SectionTabel from './ui/SectionTabel.vue';
import { onMounted } from 'vue';
import { useFormStore } from './store/form';
import presets from './ui/presets.json';

// Legaturi directe spre o stare a formularului, pentru demonstratii si capturi:
//   ?caz=sample-01            incarca un caz din corpus, ca butonul „Incarca"
//   ?caz=sample-01&valideaza  ... si apasa VALIDARE
const store = useFormStore();
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('caz');
  if (!name) return;
  const preset = (presets as { name: string; inputs: string[][] }[]).find((p) => p.name === name);
  if (!preset) return;
  store.loadPreset(preset.inputs.map(([p, v]) => [p ?? '', v ?? ''] as const));
  if (params.has('valideaza')) store.validate();
});
</script>

<template>
  <div class="layout">
    <div class="main">
      <FormHeader />
      <main>
        <SectionPerioada />
        <SectionIdentificare />
        <SectionTabel />
        <SectionFacturi />
        <SectionNedeductibil />
        <SectionBife />
        <SectionSemnatura />
      </main>
    </div>

    <aside class="side">
      <PanelTotaluri />
      <PanelMesaje />
    </aside>
  </div>
</template>
