export function expandDocumentation(text, read) {
  return text.replace(/\{\{include:([^}]+)\}\}/g, (_, source) => {
    if (!/^docs\/examples\/csv\/[\w./-]+$/.test(source) || source.includes('..')) throw Error(`Invalid include ${source}`);
    const content = read(source);
    if (source.endsWith('.md')) return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^# .+\r?\n/, '');
    return `\n\`\`\`${source.endsWith('.yaml') ? 'yaml' : 'js'}\n${content.trimEnd()}\n\`\`\`\n`;
  });
}
