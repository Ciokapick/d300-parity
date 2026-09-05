<script setup lang="ts">
// Cele patru bife de taxare inversă şi solicitarea de rambursare. În PDF sunt perechi
// DA/NU exclusive (exclGroup), aşa că aici sunt butoane radio, nu casete de bifat.
import FieldInput from './FieldInput.vue';
import { FIELD_LABELS } from './display';

const BIFE = [
  'date.bife.caption.bifa_cereale',
  'date.bife.caption.bifa_mob',
  'date.bife.caption.bifa_disp',
  'date.bife.caption.bifa_cons',
] as const;
</script>

<template>
  <section
    class="card"
    aria-labelledby="sec-bife"
  >
    <h2 id="sec-bife">
      Livrări de bunuri cu taxare inversă şi rambursare
    </h2>

    <ul class="bife">
      <li
        v-for="p in BIFE"
        :key="p"
      >
        <span class="bifa-text">{{ FIELD_LABELS[p] }}</span>
        <FieldInput :path="p" />
      </li>
      <li>
        <span class="bifa-text">{{ FIELD_LABELS['date.rambursare.bifa_rambursare'] }}</span>
        <FieldInput path="date.rambursare.bifa_rambursare" />
      </li>
    </ul>
  </section>
</template>
