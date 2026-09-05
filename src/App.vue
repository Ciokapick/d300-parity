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
