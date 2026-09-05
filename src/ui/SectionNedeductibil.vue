<script setup lang="ts">
// Rândurile A / A1 / B / B1: TVA neexigibilă şi TVA nededusă, cu numerotarea din PDF.
import FieldInput from './FieldInput.vue';
import { groupRows, labelFor } from './display';
</script>

<template>
  <section
    class="card"
    aria-labelledby="sec-nededuct"
  >
    <h2 id="sec-nededuct">
      TVA neexigibilă şi TVA pentru care nu s-a exercitat dreptul de deducere
    </h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th
              scope="col"
              class="c-nr"
            >
              Nr. rd.
            </th>
            <th scope="col">
              Denumirea operaţiunii
            </th>
            <th
              scope="col"
              class="c-val"
            >
              Valoare
            </th>
            <th
              scope="col"
              class="c-val"
            >
              TVA
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in groupRows('nedeductibil')"
            :key="r.key"
          >
            <th
              scope="row"
              class="c-nr"
            >
              {{ r.row ?? '' }}
            </th>
            <td class="c-label">
              {{ r.label }}
            </td>
            <td class="c-val">
              <FieldInput
                v-if="r.cells.c2"
                :path="r.cells.c2.path"
                :label="labelFor(r.cells.c2.path)"
              />
            </td>
            <td class="c-val">
              <FieldInput
                v-if="r.cells.c3"
                :path="r.cells.c3.path"
                :label="labelFor(r.cells.c3.path)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
