import DefaultTheme from 'vitepress/theme';
import { defineAsyncComponent } from 'vue';
import type { Theme } from 'vitepress';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('MermaidDiagram', defineAsyncComponent(() => import('./MermaidDiagram.vue')));
  },
} satisfies Theme;
