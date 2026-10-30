<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue';
import { useData } from 'vitepress';

const props = defineProps<{source: string}>();
const { isDark } = useData();
const svg = ref('');
const error = ref('');
const id = 'mermaid-' + useId().replaceAll(':', '-');
let generation = 0;
onMounted(() => watch([() => props.source, isDark], async () => {
  const current = ++generation;
  try {
    const {default: mermaid} = await import('mermaid');
    mermaid.initialize({startOnLoad: false, securityLevel: 'strict', theme: isDark.value ? 'dark' : 'default', flowchart: {htmlLabels: false}});
    const result = await mermaid.render(id + '-' + current, decodeURIComponent(props.source));
    if (current === generation) { svg.value = result.svg; error.value = ''; }
  } catch (cause) { error.value = String(cause); }
}, {immediate: true}));
</script>

<template>
  <figure class="mermaid-diagram">
    <p v-if="error" role="alert" class="diagram-error">Diagram could not render: {{ error }}</p>
    <div v-else v-html="svg" />
    <figcaption>The workflow steps are also described in the surrounding text.</figcaption>
  </figure>
</template>
