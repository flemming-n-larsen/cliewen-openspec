import { defineConfig } from 'vitepress';
import { pages } from '../pages.mjs';

const sidebar = [...new Set(pages.map(page => page.group))].map(group => ({
  text: group,
  items: pages.filter(page => page.group === group).map(page => ({text: page.title, link: '/' + page.output})),
}));

export default defineConfig({
  lang: 'en-US',
  title: 'Cliewen for OpenSpec',
  description: 'Practical OpenSpec workflows with decisions, documentation, acceptance IDs, and test evidence.',
  base: '/cliewen-openspec/',
  srcDir: '../.tmp/vitepress-content',
  outDir: '../site-dist',
  cacheDir: '../.tmp/vitepress-cache',
  appearance: true,
  cleanUrls: false,
  ignoreDeadLinks: false,
  markdown: {
    anchor: {slugify: value => value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')},
    config(md) {
      const fence = md.renderer.rules.fence!;
      md.renderer.rules.fence = (tokens, i, options, env, self) => tokens[i].info.trim() === 'mermaid'
        ? `<MermaidDiagram source="${encodeURIComponent(tokens[i].content)}" />`
        : fence(tokens, i, options, env, self);
    },
  },
  themeConfig: {
    siteTitle: 'Cliewen / OpenSpec',
    nav: [
      {text: 'Guide', link: '/getting-started.html'},
      {text: 'Configuration', link: '/configuration.html'},
    ],
    sidebar,
    search: {provider: 'local'},
    outline: {level: [2, 3], label: 'On this page'},
    socialLinks: [{icon: 'github', link: 'https://github.com/flemming-n-larsen/cliewen-openspec'}],
    editLink: {
      pattern: ({frontmatter}) => `https://github.com/flemming-n-larsen/cliewen-openspec/edit/main/${frontmatter.sourcePath}`,
    },
    footer: {message: 'Independent community project. MIT license. No npm release yet.'},
  },
});
