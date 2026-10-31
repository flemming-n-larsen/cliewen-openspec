import {stringify} from 'yaml';
import {template, instruction, routing} from './schema-source.js';

export function allFiles(): Record<string, string> {
  const base = 'openspec/schemas/cliewen-all/';
  const testing = instruction('base/instructions/testing-approach.md');
  const artifacts = [
    {id: 'proposal', generates: 'proposal.md', description: 'Question, intent, and limits', template: 'proposal.md', requires: []},
    {id: 'investigation', generates: 'investigation.md', description: 'Alternatives and observed evidence', template: 'investigation.md', requires: ['proposal']},
    {id: 'decision', generates: 'decision.md', description: 'Outcome, chosen approach, and approval', template: 'decision.md', requires: ['investigation']},
    {id: 'specs', generates: 'specs/**/*.md', description: 'Agreed behavior deltas, or native skip_specs', template: 'spec.md', requires: ['decision']},
    {id: 'tasks', generates: 'tasks.md', description: 'Delivery tasks or genuine closure checks', template: 'tasks.md', requires: ['decision', 'specs']},
  ].map(artifact => {
    const shared = artifact.id === 'investigation' ? instruction('discovery/instructions/investigation.md')
      : artifact.id === 'specs' ? instruction('delivery/instructions/specs.md')
      : artifact.id === 'tasks' ? instruction('delivery/instructions/tasks.md').replace('${testingApproach}', testing) : '';
    return {...artifact, instruction: [routing, shared, instruction(`all/instructions/${artifact.id}.md`)].filter(Boolean).join(' ')};
  });
  return {
    [base + 'schema.yaml']: stringify({name: 'cliewen-all', version: 1, description: 'Investigation through delivery or explicit no-delivery closure in one change', artifacts,
      apply: {requires: ['tasks'], tracks: 'tasks.md', instruction: [routing, instruction('delivery/instructions/apply.md').replace('${testingApproach}', testing), instruction('all/instructions/apply.md')].join(' ')}}),
    [base + 'templates/proposal.md']: template('all/templates/proposal.md'),
    [base + 'templates/investigation.md']: template('discovery/templates/investigation.md'),
    [base + 'templates/decision.md']: template('all/templates/decision.md'),
    [base + 'templates/spec.md']: template('delivery/templates/spec.md'),
    [base + 'templates/tasks.md']: template('all/templates/tasks.md'),
  };
}
