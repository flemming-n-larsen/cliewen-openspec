import {readFileSync} from 'node:fs';

// Resolve packaged sources independently of the consumer's working directory.
export function template(relative: string): string {
  return readFileSync(new URL('../schemas/' + relative, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
}

export function instruction(relative: string): string {
  return template(relative).trim().split(/\n/).map(line => line.trim()).join(' ');
}

export const routing = ['writing', 'diagrams', 'routing'].map(name => instruction(`base/instructions/${name}.md`)).join(' ');
