import {stringify} from 'yaml';
import {template, instruction, routing} from './schema-source.js';

export function discoveryFiles(): Record<string, string> {
  const base = 'openspec/schemas/cliewen-discovery/';
  const artifacts = [
    {id: 'proposal', generates: 'proposal.md', description: 'Question, scope, and investigation limits', template: 'proposal.md', requires: []},
    {id: 'investigation', generates: 'investigation.md', description: 'Alternatives, observations, and uncertainty', template: 'investigation.md', requires: ['proposal']},
    {id: 'decision', generates: 'decision.md', description: 'Recommendation and delivery or no-change handoff', template: 'decision.md', requires: ['investigation']},
  ].map(artifact => ({...artifact, instruction: [routing, instruction(`discovery/instructions/${artifact.id}.md`)].join(' ')}));
  return {
    [base + 'schema.yaml']: stringify({name: 'cliewen-discovery', version: 1, description: 'Investigation and decision handoff without required production implementation', artifacts,
      apply: {requires: ['decision'], tracks: null, instruction: [routing, instruction('discovery/instructions/apply.md')].join(' ')}}),
    ...Object.fromEntries(['proposal', 'investigation', 'decision'].map(name => [base + `templates/${name}.md`, template(`discovery/templates/${name}.md`)])),
  };
}
