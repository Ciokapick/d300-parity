<script setup lang="ts">
// Blocul de semnătură din josul formularului: nume, prenume, funcţie. Toate obligatorii.
import FieldInput from './FieldInput.vue';
</script>

<template>
  <section
    class="card"
    aria-labelledby="sec-semn"
  >
    <h2 id="sec-semn">
      Semnătură
    </h2>
    <div class="grid">
      <label class="field">
        <span>Nume <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="semnatura.nume" />
      </label>
      <label class="field">
        <span>Prenume <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="semnatura.prenume" />
      </label>
      <label class="field">
        <span>Funcţia <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="semnatura.smnFnc" />
      </label>
    </div>
  </section>
</template>
