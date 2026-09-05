<script setup lang="ts">
// Datele de identificare a persoanei impozabile: denumire, CIF, adresă, contact, bancă,
// CAEN și pro-rata. Sectorul se deblochează singur când judeţul devine Bucureşti —
// decizia e a motorului (`exit.ts`), aici se citeşte doar `store.readOnly`.
import FieldInput from './FieldInput.vue';
</script>

<template>
  <section
    class="card"
    aria-labelledby="sec-ident"
  >
    <h2 id="sec-ident">
      Date de identificare a persoanei impozabile
    </h2>

    <div class="grid">
      <label class="field wide">
        <span>Denumire / Nume şi prenume <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.denumire.den" />
      </label>

      <label class="field">
        <span>Cod de identificare fiscală <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.denumire.cif" />
      </label>

      <label class="field">
        <span>Judeţ <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.adresa.judet" />
      </label>

      <label class="field">
        <span>Sector</span>
        <FieldInput path="identifCntr.adresa.sect" />
      </label>

      <label class="field">
        <span>Localitate <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.adresa.loc" />
      </label>

      <label class="field wide">
        <span>Strada</span>
        <FieldInput path="identifCntr.adresa.str" />
      </label>

      <label class="field">
        <span>Număr</span>
        <FieldInput path="identifCntr.adresa.nr" />
      </label>

      <label class="field">
        <span>Bloc</span>
        <FieldInput path="identifCntr.adresa.bloc" />
      </label>

      <label class="field">
        <span>Scara</span>
        <FieldInput path="identifCntr.adresa.scara" />
      </label>

      <label class="field">
        <span>Etaj</span>
        <FieldInput path="identifCntr.adresa.etaj" />
      </label>

      <label class="field">
        <span>Apartament</span>
        <FieldInput path="identifCntr.adresa.apt" />
      </label>

      <label class="field">
        <span>Cod poştal</span>
        <FieldInput path="identifCntr.adresa.codPst" />
      </label>

      <label class="field">
        <span>Telefon</span>
        <FieldInput path="identifCntr.contact.telefon" />
      </label>

      <label class="field">
        <span>Fax</span>
        <FieldInput path="identifCntr.contact.fax" />
      </label>

      <label class="field">
        <span>E-mail</span>
        <FieldInput path="identifCntr.contact.email" />
      </label>

      <label class="field">
        <span>Banca <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.banca.den" />
      </label>

      <label class="field wide">
        <span>Cont bancar (IBAN) <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.banca.iban" />
      </label>

      <label class="field wide">
        <span>Cod CAEN (rev. 3)</span>
        <FieldInput path="identifCntr.caen" />
      </label>

      <label class="field wide">
        <span>Cod CAEN (rev. 2)</span>
        <FieldInput path="identifCntr.caen1" />
      </label>

      <label class="field">
        <span>Pro-rata de deducere (%) <abbr title="obligatoriu">*</abbr></span>
        <FieldInput path="identifCntr.proRata" />
      </label>
    </div>
  </section>
</template>
