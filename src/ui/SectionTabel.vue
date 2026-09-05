<script setup lang="ts">
// Rândurile 1–45, în grupele şi cu numerotarea din PDF. Structura vine din
// `src/domain/rows.ts`; aici nu se calculează nimic, celulele calculate se afişează
// ca text prin FieldInput.
import { ref } from 'vue';

import FieldInput from './FieldInput.vue';
import { SECTIONS, groupRows, labelFor } from './display';

const root = ref<HTMLElement | null>(null);

/** Enter coboară o celulă pe aceeaşi coloană, Shift+Enter urcă. */
function onEnter(e: KeyboardEvent): void {
  const el = root.value;
  const target = e.target as HTMLElement | null;
  const col = target?.dataset?.['col'];
  if (!el || !col) return;
  e.preventDefault();
  const cells = Array.from(
    el.querySelectorAll<HTMLInputElement>(`input[data-col="${col}"]:not([readonly]):not([disabled])`),
  );
  const i = cells.indexOf(target as HTMLInputElement);
  if (i < 0) return;
  cells[i + (e.shiftKey ? -1 : 1)]?.focus();
}
</script>

<template>
  <div
    ref="root"
    @keydown.enter="onEnter"
  >
    <section
      v-for="s in SECTIONS"
      :key="s.id"
      class="card"
      :aria-label="s.title"
    >
      <h2>{{ s.title }}</h2>
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
              v-for="r in groupRows(s.id)"
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
                  data-col="c2"
                />
              </td>
              <td class="c-val">
                <FieldInput
                  v-if="r.cells.c3"
                  :path="r.cells.c3.path"
                  :label="labelFor(r.cells.c3.path)"
                  data-col="c3"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
