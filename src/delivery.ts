import { stringify } from 'yaml';
import { template, instruction, routing } from './schema-source.js';

// Common source for the delivery bundle; future workflows reuse these artifacts.
const testingApproach = instruction('base/instructions/testing-approach.md');

const artifacts = [
  { id: 'proposal', generates: 'proposal.md', description: 'Intent and impact', template: 'proposal.md', requires: [], instruction: [routing, instruction('delivery/instructions/proposal.md')].join(' ') },
  { id: 'specs', generates: 'specs/**/*.md', description: 'Behavior deltas', template: 'spec.md', requires: ['proposal'], instruction: [routing, instruction('delivery/instructions/specs.md')].join(' ') },
  { id: 'design', generates: 'design.md', description: 'Approach and durable decisions', template: 'design.md', requires: ['proposal'], instruction: [routing, instruction('delivery/instructions/design.md')].join(' ') },
  { id: 'tasks', generates: 'tasks.md', description: 'Implementation and verification', template: 'tasks.md', requires: ['specs', 'design'], instruction: [routing, instruction('delivery/instructions/tasks.md').replace('${testingApproach}', testingApproach)].join(' ') }
];
export function deliveryFiles(): Record<string, string> {
  const base = 'openspec/schemas/cliewen-delivery/';
  return {
    '.cliewen-openspec/templates/decision.md': template('base/templates/decision.md'),
    [base + 'schema.yaml']: stringify({ name: 'cliewen-delivery', version: 1, description: 'Delivery with shared documentation, decisions and evidence', artifacts, apply: { requires: ['tasks'], tracks: 'tasks.md', instruction: [routing, instruction('delivery/instructions/apply.md').replace('${testingApproach}', testingApproach)].join(' ') } }),
    [base + 'templates/proposal.md']: template('delivery/templates/proposal.md'),
    [base + 'templates/spec.md']: template('delivery/templates/spec.md'),
    [base + 'templates/design.md']: template('delivery/templates/design.md'),
    [base + 'templates/tasks.md']: template('delivery/templates/tasks.md'),
  };
}
