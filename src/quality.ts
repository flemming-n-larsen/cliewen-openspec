import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parse} from 'yaml';
import type {Config, Finding} from './core.js';

type Mode = 'off' | 'review' | 'enforce';
type Category = 'positive' | 'negative' | 'boundary';
type Policy = 'coverage' | 'effectiveness' | 'lifecycle';
export type QualitySettings = {
  quality: {coverage: {mode: Mode; minimumCases: Record<Category, number>}; effectiveness: {mode: Mode}};
  lifecycle: {mode: Mode};
};
const categories: Category[] = ['positive', 'negative', 'boundary'];
const object = (v: any): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: any): v is string => typeof v === 'string' && !!v.trim();
function only(v: any, allowed: string[], label: string) {
  if (!object(v)) throw Error(`${label} must be an object`);
  for (const key of Object.keys(v)) if (!allowed.includes(key)) throw Error(`Unknown ${label} key: ${key}`);
}
function mode(v: any, label: string): Mode {
  if (!['off', 'review', 'enforce'].includes(v)) throw Error(`${label} must be off, review, or enforce`);
  return v;
}
export function qualityDefaults(): QualitySettings {
  return {quality: {coverage: {mode: 'review', minimumCases: {positive: 1, negative: 1, boundary: 0}}, effectiveness: {mode: 'review'}}, lifecycle: {mode: 'review'}};
}
export function configureQuality(settings: QualitySettings, raw: Record<string, any>) {
  if (raw.quality !== undefined) {
    only(raw.quality, ['coverage', 'effectiveness'], 'testing.quality');
    for (const policy of ['coverage', 'effectiveness'] as const) {
      const value = raw.quality[policy]; if (value === undefined) continue;
      only(value, policy === 'coverage' ? ['mode', 'minimumCases'] : ['mode'], `testing.quality.${policy}`);
      if (value.mode !== undefined) settings.quality[policy].mode = mode(value.mode, `testing.quality.${policy}.mode`);
      if (policy === 'coverage' && value.minimumCases !== undefined) {
        only(value.minimumCases, categories, 'testing.quality.coverage.minimumCases');
        for (const [key, count] of Object.entries(value.minimumCases)) {
          if (!Number.isSafeInteger(count) || (count as number) < 0) throw Error(`testing.quality.coverage.minimumCases.${key} must be a nonnegative safe integer`);
          settings.quality.coverage.minimumCases[key as Category] = count as number;
        }
      }
    }
  }
  if (raw.lifecycle !== undefined) {
    only(raw.lifecycle, ['mode'], 'testing.lifecycle');
    if (raw.lifecycle.mode !== undefined) settings.lifecycle.mode = mode(raw.lifecycle.mode, 'testing.lifecycle.mode');
  }
}

type Scenario = {id: string; file: string; testTypes: string[]};
type Resolve = (root: string, relative: string) => string;
const git = (root: string, ...args: string[]) => execFileSync('git', ['-C', root, ...args], {stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024});

export function checkQuality(root: string, config: Config, specs: Scenario[], report: any, change: string | undefined, resolve: Resolve): Finding[] {
  const findings: Finding[] = [];
  const modes: Record<Policy, Mode> = {coverage: config.testing.quality.coverage.mode, effectiveness: config.testing.quality.effectiveness.mode, lifecycle: config.testing.lifecycle.mode};
  const add = (policy: Policy, code: string, message: string) => {
    if (modes[policy] !== 'off') findings.push({code, message, severity: modes[policy] === 'enforce' ? 'error' : 'warning'});
  };
  if (Object.values(modes).every(value => value === 'off')) return findings;
  const ids = new Set(specs.map(s => s.id));
  const recordPath = `.cliewen-openspec/reviews/${change ? `change-${change}` : 'specs'}.yaml`;
  let review: any;
  let usable = false;
  try {
    const file = resolve(root, recordPath);
    if (!fs.existsSync(file)) {
      for (const policy of Object.keys(modes) as Policy[]) if (policy !== 'coverage') add(policy, 'test-review-missing', `Create ${recordPath} for ${policy} review.`);
    } else {
      review = parse(fs.readFileSync(file, 'utf8'));
      const committed = git(root, 'show', `HEAD:${recordPath}`).toString().replaceAll('\r\n', '\n');
      if (committed !== fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n')) throw Error('test-review-stale: commit the reviewed record before collecting evidence');
      only(review, ['version', 'scope', 'baseline', 'inputs', 'effectiveness', 'lifecycle', 'exceptions'], 'test review');
      if (review.version !== 1 || !object(review.inputs) || !Object.keys(review.inputs).length || ![review.effectiveness, review.lifecycle, review.exceptions].every(Array.isArray)) throw Error('Expected version 1, nonempty inputs, and effectiveness/lifecycle/exceptions lists');
      if (!object(review.scope) || Object.keys(review.scope).length !== 1 || (change ? review.scope.change !== change : review.scope.specs !== true)) throw Error('test-review-scope-mismatch');
      if (typeof review.baseline !== 'string' || !/^[a-f0-9]{40,64}$/.test(review.baseline)) throw Error('baseline must be a full Git commit ID');
      git(root, 'merge-base', '--is-ancestor', review.baseline, 'HEAD');
      const required = ['.cliewen-openspec/config.yaml', ...specs.map(s => s.file.replaceAll('\\', '/'))];
      const tasks = change ? `openspec/changes/${change}/tasks.md` : undefined;
      if (tasks && fs.existsSync(resolve(root, tasks))) required.push(tasks);
      for (const file of required) if (!Object.hasOwn(review.inputs, file)) throw Error(`inputs must include ${file}`);
      for (const [file, digest] of Object.entries(review.inputs)) {
        resolve(root, file);
        if (file.replaceAll('\\', '/') !== file || file === recordPath || (digest !== null && (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)))) throw Error(`Invalid input: ${file}`);
        let current: Buffer | undefined;
        try { current = git(root, 'show', `HEAD:${file}`); } catch { /* A null digest records an absent file. */ }
        if (digest === null ? current !== undefined || fs.existsSync(resolve(root, file)) : !current || createHash('sha256').update(current).digest('hex') !== digest) throw Error(`test-review-stale: ${file}`);
      }
      usable = true;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = message.startsWith('test-review-stale') ? 'test-review-stale' : message === 'test-review-scope-mismatch' ? message : 'test-review-invalid';
    for (const policy of Object.keys(modes) as Policy[]) add(policy, code, `${recordPath}: ${message}`);
  }
  const exceptions = new Map<string, any>();
  if (usable) for (const entry of review.exceptions) {
    try {
      only(entry, ['policy', 'scenario', 'category', 'reason', 'status'], 'exception');
      if (!['coverage', 'effectiveness', 'lifecycle'].includes(entry.policy) || !text(entry.scenario) || !text(entry.reason) || !['proposed', 'reviewed'].includes(entry.status)) throw Error('Invalid exception fields');
      if (entry.policy === 'coverage' ? !categories.includes(entry.category) : entry.category !== undefined) throw Error('Invalid exception category');
      if (!ids.has(entry.scenario)) throw Error('Exception references a scenario outside active scope');
      const key = `${entry.policy}:${entry.scenario}:${entry.category ?? ''}`;
      if (exceptions.has(key)) { exceptions.set(key, null); throw Error(`Duplicate exception: ${key}`); }
      exceptions.set(key, entry);
    } catch (error) { for (const policy of Object.keys(modes) as Policy[]) add(policy, 'test-review-invalid', String(error)); }
  }
  const waived = (policy: Policy, scenario: string, category = '') => exceptions.get(`${policy}:${scenario}:${category}`)?.status === 'reviewed';
  const counts = new Map<string, Record<Category, number>>();
  const cases = new Map<string, Set<string>>();
  const duplicate = new Set<string>(), seenCases = new Set<string>();
  for (const row of report.results) if (typeof row.caseId === 'string') {
    const key = `${row.scenario}:${row.caseId}`;
    if (seenCases.has(key)) duplicate.add(key);
    seenCases.add(key);
  }
  const fresh = (() => { try { return report.revision === git(root, 'rev-parse', 'HEAD').toString().trim() && !git(root, 'status', '--porcelain', '--untracked-files=all').toString().trim(); } catch { return false; } })();
  for (const row of report.results) {
    if (!ids.has(row.scenario)) continue;
    if (row.caseId === undefined || row.coverage === undefined) { add('coverage', 'coverage-metadata-missing', `${row.scenario}: ${row.test}; recollect with Case and Coverage tags.`); continue; }
    if (typeof row.caseId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.caseId) || !categories.includes(row.coverage) || duplicate.has(`${row.scenario}:${row.caseId}`)) {
      add('coverage', 'coverage-case-invalid', `${row.scenario}: ${row.test}; case IDs must be unique slugs and categories positive, negative, or boundary.`); continue;
    }
    const scenario = specs.find(s => s.id === row.scenario);
    if (!fresh || row.outcome !== 'passed' || scenario?.testTypes.length !== 1 || scenario.testTypes[0] !== row.testType || !Object.hasOwn(config.testing.types, row.testType)) continue;
    const count = counts.get(row.scenario) ?? {positive: 0, negative: 0, boundary: 0};
    count[row.coverage as Category]++; counts.set(row.scenario, count);
    const set = cases.get(row.scenario) ?? new Set(); set.add(row.caseId); cases.set(row.scenario, set);
  }
  for (const id of ids) for (const category of categories) {
    if ((counts.get(id)?.[category] ?? 0) < config.testing.quality.coverage.minimumCases[category] && !waived('coverage', id, category)) add('coverage', 'coverage-minimum-unmet', `${id}: needs ${config.testing.quality.coverage.minimumCases[category]} distinct passed ${category} cases.`);
  }
  if (usable) {
    checkEffectiveness();
    checkLifecycle();
  }
  findings.push({code: 'test-policy-review-required', severity: 'info', message: 'Record checks cannot prove case distinctness, assertion meaning, complete dependency/impact analysis, or human approval. Review these claims.'});
  return findings;

  function paths(values: any) {
    if (!Array.isArray(values) || !values.length || !values.every(text)) throw Error('Expected nonempty file list');
    for (const file of values) if (!Object.hasOwn(review.inputs, file) || review.inputs[file] === null) throw Error(`Missing inspected input: ${file}`);
  }
  function checkEffectiveness() {
    if (modes.effectiveness === 'off') return;
    const covered = new Map<string, Set<string>>();
    for (const entry of review.effectiveness) try {
      only(entry, ['scenario', 'cases', 'testFiles', 'sourceFiles', 'method', 'assertion', 'defect', 'command', 'observation', 'failureKind', 'status'], 'effectiveness');
      if (!ids.has(entry.scenario) || !Array.isArray(entry.cases) || !entry.cases.length || !entry.cases.every(text) || new Set(entry.cases).size !== entry.cases.length || !['controlled-fault', 'tdd'].includes(entry.method) || ![entry.assertion, entry.defect, entry.observation].every(text) || !Array.isArray(entry.command) || !entry.command.length || !entry.command.every(text) || !['behavior', 'setup', 'unrelated'].includes(entry.failureKind) || !['proposed', 'reviewed'].includes(entry.status)) throw Error('Invalid effectiveness assessment');
      paths(entry.testFiles); paths(entry.sourceFiles);
      const known = new Set(report.results.filter((row: any) => row.scenario === entry.scenario).map((row: any) => row.caseId));
      if (entry.cases.some((id: string) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !known.has(id) || duplicate.has(`${entry.scenario}:${id}`))) throw Error('Assessment references unknown, malformed, or ambiguous case IDs');
      if (entry.status === 'reviewed' && entry.failureKind === 'behavior') {
        const set = covered.get(entry.scenario) ?? new Set(); entry.cases.forEach((id: string) => set.add(id)); covered.set(entry.scenario, set);
      }
    } catch (error) { add('effectiveness', 'test-review-invalid', String(error)); }
    for (const id of ids) if (!waived('effectiveness', id) && (!covered.get(id)?.size || [...(cases.get(id) ?? [])].some(caseId => !covered.get(id)?.has(caseId)))) add('effectiveness', 'effectiveness-unreviewed', `${id}: review a relevant behavior failure covering its cases or record a scoped exception.`);
  }
  function checkLifecycle() {
    if (modes.lifecycle === 'off') return;
    // Scenario projection and baseline comparison are performed without changing OpenSpec files.
    try { lifecycleReview(root, review, change, ids, report, add, waived, resolve); }
    catch (error) { add('lifecycle', 'lifecycle-unresolved', String(error)); }
  }
}

function lifecycleReview(root: string, review: any, change: string | undefined, ids: Set<string>, report: any, add: (p: Policy, code: string, message: string) => void, waived: (p: Policy, id: string) => boolean, resolve: Resolve) {
  type Requirement = {operation: string; context: string; scenarios: Map<string, string>};
  const requirements = (source: string) => {
    const result = new Map<string, Requirement>();
    let operation = 'permanent', current: Requirement | undefined, scenario: string | undefined, fence = '';
    const append = (line: string) => {
      if (scenario && current) current.scenarios.set(scenario, current.scenarios.get(scenario) + '\n' + line);
      else if (current) current.context += '\n' + line;
    };
    for (const line of source.replaceAll('\r\n', '\n').replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
      const boundary = line.match(/^\s*(`{3,}|~{3,})/);
      if (boundary) { append(line); if (!fence) fence = boundary[1]; else if (fence[0] === boundary[1][0] && boundary[1].length >= fence.length) fence = ''; continue; }
      if (fence) { append(line); continue; }
      const section = line.match(/^## (ADDED|MODIFIED|REMOVED|RENAMED) Requirements\s*$/);
      if (section) { operation = section[1]; current = undefined; scenario = undefined; if (operation === 'RENAMED') throw Error('Requirement renames need explicit lifecycle review; automated projection is unavailable.'); continue; }
      if (/^#{1,2} /.test(line)) { current = undefined; scenario = undefined; continue; }
      const heading = line.match(/^### Requirement:\s*(.+?)\s*$/);
      if (heading) {
        if (result.has(heading[1])) throw Error(`Duplicate requirement: ${heading[1]}`);
        current = {operation, context: line, scenarios: new Map()}; result.set(heading[1], current); scenario = undefined; continue;
      }
      if (/^### /.test(line)) { current = undefined; scenario = undefined; continue; }
      if (/^#### Scenario:/.test(line) && current) {
        const id = line.match(/\[([A-Z][A-Z0-9]*-\d+)\]\s*$/)?.[1];
        if (!id) throw Error('Lifecycle comparison requires scenario IDs');
        if (current.scenarios.has(id)) throw Error(`Duplicate scenario: ${id}`);
        scenario = id; current.scenarios.set(id, line); continue;
      }
      append(line);
    }
    return result;
  };
  const tree = (revision: string) => {
    const files = git(root, 'ls-tree', '-r', '--name-only', revision, '--', 'openspec/specs').toString().trim().split(/\r?\n/).filter(f => f.endsWith('.md'));
    const result = new Map<string, Map<string, Requirement>>();
    for (const file of files) {
      if (revision === 'HEAD' && !Object.hasOwn(review.inputs, file)) throw Error(`inputs must include assessed permanent spec ${file}`);
      result.set(file.slice('openspec/specs/'.length), requirements(git(root, 'show', `${revision}:${file}`).toString()));
    }
    return result;
  };
  const flatten = (tree: Map<string, Map<string, Requirement>>) => {
    const result = new Map<string, string>();
    for (const entries of tree.values()) for (const requirement of entries.values()) for (const [id, source] of requirement.scenarios) {
      if (result.has(id)) throw Error(`Duplicate scenario: ${id}`);
      result.set(id, requirement.context.trim() + '\n' + source.trim());
    }
    return result;
  };
  const baseline = flatten(tree(review.baseline));
  const targetTree = tree('HEAD');
  if (change) {
    const folder = `openspec/changes/${change}/specs`;
    const walk = (relative: string): string[] => {
      const dir = resolve(root, relative);
      return fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
        const child = `${relative}/${e.name}`;
        resolve(root, child);
        return e.isDirectory() ? walk(child) : e.isFile() && e.name.endsWith('.md') ? [child] : [];
      }) : [];
    };
    for (const file of walk(folder)) {
      if (!Object.hasOwn(review.inputs, file)) throw Error(`inputs must include delta ${file}`);
      const key = file.slice(folder.length + 1);
      const projected = targetTree.get(key) ?? new Map<string, Requirement>();
      for (const [name, requirement] of requirements(fs.readFileSync(resolve(root, file), 'utf8'))) {
        if (!['ADDED', 'MODIFIED', 'REMOVED'].includes(requirement.operation)) throw Error('Delta requirements need explicit ADDED/MODIFIED/REMOVED sections');
        if (requirement.operation === 'ADDED' ? projected.has(name) : !projected.has(name)) throw Error(`Delta requirement conflicts with permanent specs: ${name}`);
        if (requirement.operation === 'REMOVED') projected.delete(name); else projected.set(name, requirement);
      }
      targetTree.set(key, projected);
    }
  }
  const target = flatten(targetTree);
  const required = new Set([...baseline.keys()].filter(id => !target.has(id) || baseline.get(id) !== target.get(id)));
  const dispositions = new Set<string>();
  for (const entry of review.lifecycle) {
    try {
      only(entry, ['scenario', 'change', 'reason', 'status', 'tests', 'retirement'], 'lifecycle');
      if (!text(entry.scenario) || dispositions.has(entry.scenario) || !['unchanged', 'modified', 'retired'].includes(entry.change) || !text(entry.reason) || !['proposed', 'reviewed'].includes(entry.status) || !Array.isArray(entry.tests)) throw Error('Invalid or duplicate lifecycle disposition');
      dispositions.add(entry.scenario);
      if (!baseline.has(entry.scenario)) throw Error('Lifecycle scenario must exist at baseline');
      const isRetired = !target.has(entry.scenario);
      if (isRetired !== (entry.change === 'retired') || (!isRetired && (baseline.get(entry.scenario) !== target.get(entry.scenario)) !== (entry.change === 'modified'))) throw Error('Disposition differs from observed scenario change');
      if (isRetired) {
        only(entry.retirement, ['status', 'source'], 'retirement');
        if (entry.retirement.status !== 'accepted' || !text(entry.retirement.source) || !Object.hasOwn(review.inputs, entry.retirement.source) || review.inputs[entry.retirement.source] === null) { add('lifecycle', 'retirement-unaccepted', `${entry.scenario}: accepted retirement source required.`); continue; }
      } else if (entry.retirement !== undefined) throw Error('Retirement metadata requires a retired criterion');
      if (!entry.tests.length) throw Error('A disposition needs affected tests');
      for (const test of entry.tests) {
        only(test, ['file', 'test', 'action', 'remainingScenarios', 'replacementScenarios'], 'lifecycle test');
        if (!text(test.file) || !text(test.test) || !['retain', 'update', 'remap', 'remove'].includes(test.action) || !Array.isArray(test.remainingScenarios) || new Set(test.remainingScenarios).size !== test.remainingScenarios.length || test.remainingScenarios.some((id: string) => !target.has(id))) throw Error('Invalid test disposition');
        resolve(root, test.file);
        if (!Object.hasOwn(review.inputs, test.file)) throw Error('Test file must be inspected');
        if (test.action === 'remove' && test.remainingScenarios.length) { add('lifecycle', 'active-test-removal', `${test.test}: preserve its active assertions.`); continue; }
        if (test.action === 'remove' && !isRetired) { add('lifecycle', 'active-test-removal', `${test.test}: criterion remains active; remap instead.`); continue; }
        if (!isRetired && ['retain', 'update'].includes(test.action) && !test.remainingScenarios.includes(entry.scenario)) throw Error('Retained or updated tests must declare the active criterion');
        if (review.inputs[test.file] === null) git(root, 'cat-file', '-e', `${review.baseline}:${test.file}`);
        const replacements = test.action === 'remap' ? test.replacementScenarios : test.remainingScenarios;
        if (test.action === 'remap' && (!Array.isArray(replacements) || !replacements.length)) throw Error('Remapping needs replacement scenarios');
        if (test.action !== 'remap' && test.replacementScenarios !== undefined) throw Error('Replacement scenarios require remap');
        for (const id of replacements ?? []) if (!target.has(id) || ((test.action === 'remap' || ids.has(id)) && !report.results.some((row: any) => row.scenario === id && row.outcome === 'passed'))) throw Error('Remapped or in-scope obligations require target scenarios and passing evidence');
      }
      if (entry.status !== 'reviewed') add('lifecycle', 'lifecycle-unresolved', `${entry.scenario}: review its disposition.`);
      required.delete(entry.scenario);
    } catch (error) { add('lifecycle', 'lifecycle-unresolved', String(error)); }
  }
  for (const id of required) if (!target.has(id) || !waived('lifecycle', id)) add('lifecycle', !target.has(id) ? 'retirement-unaccepted' : 'lifecycle-unresolved', `${id}: record an explicit reviewed disposition.`);
  if (!required.size && !review.lifecycle.length && baseline.size && ![...ids].every(id => !baseline.has(id) || waived('lifecycle', id))) add('lifecycle', 'lifecycle-unresolved', 'Record affected unchanged criteria or scoped lifecycle exceptions for implementation-only changes.');
}
