<script setup lang="ts">
// Totalurile, recalculate de motor la fiecare intrare. Panoul nu adună nimic:
// citeşte celulele calculate din stare.
import { useFormStore } from '../store/form';

const store = useFormStore();
</script>

<template>
  <section
    class="panel"
    aria-labelledby="pan-total"
  >
    <h2 id="pan-total">
      Totaluri
    </h2>
    <dl class="totals">
      <template
        v-for="t in store.totaluri"
        :key="t.path"
      >
        <dt>{{ t.label }}</dt>
        <dd class="num">
          {{ t.text || '—' }}
        </dd>
      </template>
    </dl>
  </section>
</template>
