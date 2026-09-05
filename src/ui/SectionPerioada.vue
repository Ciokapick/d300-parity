<script setup lang="ts">
// Antetul formularului: perioada de raportare și bifele care o însoțesc.
import FieldInput from './FieldInput.vue';
</script>

<template>
  <section
    class="card"
    aria-labelledby="sec-perioada"
  >
    <h2 id="sec-perioada">
      Perioada de raportare
    </h2>

    <div class="grid">
      <label class="field">
        <span>Anul <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="Antet.metaDate.an_r" />
      </label>

      <label class="field">
        <span>Perioada de raportare <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="Antet.metaDate.tipDecont" />
      </label>

      <label class="field">
        <span>Luna / trimestrul / semestrul <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="Antet.metaDate.luna_r" />
      </label>

      <label class="field">
        <span>Perioada de la</span>
        <FieldInput path="Antet.metaDate.perioada.dataInceput" />
      </label>

      <label class="field">
        <span>Perioada până la</span>
        <FieldInput path="Antet.metaDate.perioada.dataSfarsit" />
      </label>
    </div>

    <fieldset class="bifa-set">
      <legend>Bifele din antet</legend>

      <label class="bifa">
        <FieldInput path="Antet.metaDate.d_rez" />
        <span>Decont depus după anularea rezervei verificării ulterioare</span>
      </label>

      <label class="field indent">
        <span>Temei legal</span>
        <FieldInput path="Antet.temeiLegal" />
      </label>

      <label class="bifa">
        <FieldInput path="Antet.metaDate.d_scc" />
        <span>Decont depus de succesor</span>
      </label>

      <label class="field indent">
        <span>Cod de identificare fiscală al succesorului</span>
        <FieldInput path="Antet.cifS" />
      </label>

      <label class="bifa">
        <FieldInput path="Antet.metaDate.d_rec" />
        <span>Declaraţie rectificativă</span>
      </label>

      <label class="bifa">
        <FieldInput path="Antet.d_reprezentant" />
        <span>Decont depus prin reprezentant fiscal</span>
      </label>

      <label class="bifa">
        <FieldInput path="Antet.opInterne.mtdSimplificata" />
        <span>Aplic metoda simplificată (numai operaţiuni interne)</span>
      </label>
    </fieldset>
  </section>
</template>
