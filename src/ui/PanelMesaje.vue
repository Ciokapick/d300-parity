<script setup lang="ts">
// Jurnalul mesajelor, în ordinea în care le-a emis motorul, câmpurile evidenţiate şi
// conţinutul „Erori si avertizari.txt”. Textele sunt cele din original, netraduse şi
// nemodificate.
import { useFormStore } from '../store/form';
import { labelFor } from './display';

const store = useFormStore();

const TIP: Readonly<Record<string, string>> = {
  alert: 'alert',
  messageBox: 'messageBox',
  respins: 'valoare respinsă',
};
</script>

<template>
  <section
    class="panel"
    aria-labelledby="pan-mesaje"
  >
    <h2 id="pan-mesaje">
      Mesaje
    </h2>

    <div aria-live="polite">
      <p
        v-if="store.journal.length === 0"
        class="muted"
      >
        Niciun mesaj încă.
      </p>

      <ol
        v-else
        class="journal"
      >
        <li
          v-for="(m, i) in store.journal"
          :key="i"
          :class="['msg', m.kind]"
        >
          <p class="msg-head">
            <span class="tag">{{ TIP[m.kind] }}</span>
            <span
              v-if="m.title"
              class="msg-title"
            >{{ m.title }}</span>
            <span
              v-if="m.field"
              class="msg-field"
            >{{ labelFor(m.field) }}</span>
            <span class="msg-step">pasul {{ m.step }}</span>
          </p>
          <pre class="msg-text">{{ m.text }}</pre>
        </li>
      </ol>

      <template v-if="store.highlightedFields.length > 0">
        <h3>Câmpuri evidenţiate</h3>
        <ul class="highlighted">
          <li
            v-for="p in store.highlightedFields"
            :key="p"
          >
            {{ labelFor(p) }}
          </li>
        </ul>
      </template>

      <template v-if="store.last?.erori">
        <h3>Erori si avertizari.txt</h3>
        <pre class="erori">{{ store.last.erori }}</pre>
      </template>
    </div>
  </section>
</template>
