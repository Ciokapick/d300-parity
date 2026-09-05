<script setup lang="ts">
// Rd.47–49 (facturi emise şi primite) şi „alte informaţii”. În PDF cele două blocuri
// stau sub tabelul principal şi au trei, respectiv două coloane.
import FieldInput from './FieldInput.vue';
import { groupRows, labelFor, onlyCell } from './display';
</script>

<template>
  <section
    class="card"
    aria-labelledby="sec-facturi"
  >
    <h2 id="sec-facturi">
      Facturi emise şi primite
    </h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">
              Denumirea operaţiunii
            </th>
            <th
              scope="col"
              class="c-val"
            >
              Număr facturi
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
            v-for="r in groupRows('facturi')"
            :key="r.key"
          >
            <th
              scope="row"
              class="c-label"
            >
              {{ r.label }}
            </th>
            <td class="c-val">
              <FieldInput
                v-if="r.cells.c1"
                :path="r.cells.c1.path"
                :label="labelFor(r.cells.c1.path)"
              />
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

    <h3>Alte informaţii</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">
              Denumirea operaţiunii
            </th>
            <th
              scope="col"
              class="c-val"
            >
              Valoare
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in groupRows('alteInfo', true)"
            :key="r.key"
          >
            <th
              scope="row"
              class="c-label"
            >
              {{ r.label }}
            </th>
            <td class="c-val">
              <FieldInput
                v-if="onlyCell(r)"
                :path="onlyCell(r)!.path"
                :label="labelFor(onlyCell(r)!.path)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
