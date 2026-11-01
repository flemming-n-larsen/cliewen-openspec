import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {parse} from 'yaml';
import {local} from './core.js';
import type {Finding} from './core.js';

type Method = 'tdd' | 'characterization' | 'refactor' | 'verification';
type Phase = 'start' | 'red' | 'green' | 'baseline' | 'verify';
type Task = {id: string; done: boolean; description: string; method: Method; command: string[]; tests: string[]; implementation: string[]; reason?: string};
type Snapshot = Record<string, string | null>;
type Event = {version: 1; change: string; task: string; definition: string; phase: Phase; time: string; before: Snapshot; after: Snapshot; command?: string[]; exitCode?: number; reason?: string; stdout?: string; stderr?: string};
const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const name = (change: string) => { if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change)) throw Error('Change must be a kebab-case name'); return change; };
const historyPath = (root: string, change: string) => local(root, `.cliewen-openspec/tdd/${name(change)}.jsonl`);
const definition = ({done, ...task}: Task) => digest(JSON.stringify(task));
function object(value: unknown): value is Record<string, any> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function only(value: Record<string, any>, allowed: string[]) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw Error(`Unknown task metadata key: ${key}`);
}
function tasks(root: string, change: string): Task[] {
  const source = fs.readFileSync(local(root, `openspec/changes/${name(change)}/tasks.md`), 'utf8');
  const blocks = [...source.matchAll(/^```yaml cliewen-tasks\r?\n([\s\S]*?)^```\s*$/gm)];
  if (blocks.length !== 1) throw Error('tasks.md requires exactly one fenced yaml cliewen-tasks block');
  const metadata = parse(blocks[0][1]);
  if (!object(metadata) || metadata.version !== 1 || !object(metadata.tasks)) throw Error('Expected version: 1 and a tasks mapping');
  only(metadata, ['version', 'tasks']);
  // OpenSpec owns checkbox syntax. Ignore examples inside code fences and comments.
  let fence = ''; const rows: {id: string; done: boolean; description: string}[] = [];
  for (const line of source.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const boundary = line.match(/^\s*(`{3,}|~{3,})/);
    if (boundary) { if (!fence) fence = boundary[1]; else if (boundary[1][0] === fence[0] && boundary[1].length >= fence.length) fence = ''; continue; }
    if (fence) continue;
    const checkbox = line.match(/^\s*- \[([ xX])\]\s+(.+)$/);
    if (!checkbox) continue;
    const label = checkbox[2].match(/^(\d+(?:\.\d+)+)\s+(.+)$/);
    if (!label || rows.some(row => row.id === label[1])) throw Error('Each task needs a unique numeric ID such as 1.1');
    rows.push({id: label[1], done: checkbox[1].toLowerCase() === 'x', description: label[2]});
  }
  if (!rows.length) throw Error('No numbered tasks found');
  if (Object.keys(metadata.tasks).some(id => !rows.some(row => row.id === id))) throw Error('Metadata references an unknown task');
  return rows.map(row => {
    const entry = metadata.tasks[row.id];
    if (!object(entry)) throw Error(`Missing metadata for task ${row.id}`);
    only(entry, ['method', 'command', 'tests', 'implementation', 'reason']);
    if (!['tdd', 'characterization', 'refactor', 'verification'].includes(entry.method)) throw Error(`Invalid method for task ${row.id}`);
    if (!Array.isArray(entry.command) || !entry.command.length || entry.command.some((arg: unknown) => typeof arg !== 'string' || !arg.length)) throw Error(`Task ${row.id} needs a command argument list`);
    for (const key of ['tests', 'implementation']) {
      if (!Array.isArray(entry[key]) || entry[key].some((file: unknown) => typeof file !== 'string' || !file.length)) throw Error(`Task ${row.id} needs a ${key} file list`);
      entry[key] = entry[key].map((file: string) => {
        const canonical = path.relative(path.resolve(root), local(root, file)).split(path.sep).join('/');
        return canonical;
      });
    }
    const files = [...entry.tests, ...entry.implementation];
    const resolved = files.map(file => {
      const full = local(root, file);
      return process.platform === 'win32' ? full.toLowerCase() : full;
    });
    if (!files.length || new Set(resolved).size !== files.length) throw Error(`Task ${row.id} needs distinct test and implementation file paths`);
    if (files.some(file => /^(?:\.git|\.cliewen-openspec\/tdd)(?:[\\/]|$)/.test(file.replaceAll('\\', '/')))) throw Error('History and Git internals cannot be task inputs');
    if (entry.method !== 'verification' && !entry.tests.length) throw Error(`Task ${row.id} requires test files`);
    if (entry.method === 'tdd' && !entry.implementation.length) throw Error(`Task ${row.id} requires implementation files`);
    if (entry.reason !== undefined && (typeof entry.reason !== 'string' || !entry.reason.trim())) throw Error(`Invalid reason for task ${row.id}`);
    if (entry.method !== 'tdd' && !entry.reason?.trim()) throw Error(`Task ${row.id} requires a reason for departing from the red-green cycle`);
    return {...row, method: entry.method, command: entry.command, tests: entry.tests, implementation: entry.implementation, ...(entry.reason ? {reason: entry.reason} : {})};
  });
}
function snapshot(root: string, task: Task): Snapshot {
  return Object.fromEntries([...task.tests, ...task.implementation].map(file => {
    const full = local(root, file);
    return [file, fs.existsSync(full) ? digest(fs.readFileSync(full)) : null];
  }));
}
function history(root: string, change: string): Event[] {
  const file = historyPath(root, change);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => {
    const entry = JSON.parse(line);
    if (!object(entry) || entry.version !== 1 || entry.change !== change || typeof entry.task !== 'string' || typeof entry.definition !== 'string' || !['start', 'red', 'green', 'baseline', 'verify'].includes(entry.phase) || !object(entry.before) || !object(entry.after) || typeof entry.time !== 'string' || !Number.isFinite(Date.parse(entry.time))) throw Error('Invalid history event');
    for (const values of [entry.before, entry.after]) if (Object.values(values).some(value => value !== null && (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)))) throw Error('Invalid history file hash');
    if (entry.phase !== 'start' && (!Array.isArray(entry.command) || !entry.command.length || entry.command.some((arg: unknown) => typeof arg !== 'string') || !Number.isInteger(entry.exitCode) || entry.exitCode < 0 || typeof entry.stdout !== 'string' || typeof entry.stderr !== 'string')) throw Error('Invalid recorded command result');
    return entry as Event;
  });
}
function locked<T>(root: string, change: string, action: () => T): T {
  const file = historyPath(root, change); fs.mkdirSync(path.dirname(file), {recursive: true});
  const lock = local(root, `.cliewen-openspec/tdd/${change}.lock`);
  let handle: number;
  try { handle = fs.openSync(lock, 'wx'); } catch { throw Error(`TDD recorder is locked for ${change}; check for a running command before removing ${lock}`); }
  try { return action(); } finally { fs.closeSync(handle); fs.unlinkSync(lock); }
}
function taskFor(root: string, change: string, id: string): Task {
  const task = tasks(root, change).find(task => task.id === id);
  if (!task) throw Error(`Unknown task: ${id}`);
  return task;
}
function append(root: string, change: string, entry: Event) { fs.appendFileSync(historyPath(root, change), JSON.stringify(entry) + '\n'); }
export function startTask(root: string, change: string, id: string): void {
  const task = taskFor(root, change, id);
  locked(root, change, () => {
    history(root, change);
    const current = snapshot(root, task);
    append(root, change, {version: 1, change, task: id, definition: definition(task), phase: 'start', time: new Date().toISOString(), before: current, after: current});
  });
}
export function runTask(root: string, change: string, id: string, phase: string, command: string[], reason?: string) {
  if (!['red', 'green', 'baseline', 'verify'].includes(phase)) throw Error('Phase must be red, green, baseline, or verify');
  const task = taskFor(root, change, id);
  if (!isDeepStrictEqual(command, task.command)) throw Error('Command must match the task metadata command argument list');
  if (phase === 'red' && !reason?.trim()) throw Error('A red run requires --reason describing the intended missing behavior; review the actual failure');
  return locked(root, change, () => {
    const events = history(root, change);
    if (!events.some(event => event.task === id && event.phase === 'start' && event.definition === definition(task))) throw Error('Run tdd start for the current task definition first');
    const before = snapshot(root, task);
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(command[0], command.slice(1), {cwd: root, env, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, windowsHide: true});
    // Failed launches and terminated processes cannot establish a test outcome.
    if (result.error || result.status === null) throw Error(`Cannot record test execution: ${result.error?.message ?? result.signal}`);
    const entry: Event = {version: 1, change, task: id, definition: definition(task), phase: phase as Phase, time: new Date().toISOString(), before, after: snapshot(root, task), command, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, ...(reason ? {reason} : {})};
    append(root, change, entry);
    return {exitCode: result.status, stdout: result.stdout, stderr: result.stderr};
  });
}
function equalFiles(a: Snapshot, b: Snapshot, files: string[]) { return files.every(file => Object.hasOwn(a, file) && Object.hasOwn(b, file) && a[file] === b[file]); }
function validSequence(task: Task, events: Event[]) {
  const first = events[0]; const last = events.at(-1);
  if (!first || first.phase !== 'start' || !last || events.length < 2) return false;
  const files = [...task.tests, ...task.implementation];
  if (events.some(event => event.definition !== definition(task) || !isDeepStrictEqual(Object.keys(event.before).sort(), [...files].sort()) || !isDeepStrictEqual(Object.keys(event.after).sort(), [...files].sort()) || !equalFiles(event.before, event.after, files))) return false;
  if (events.slice(1).some(event => !isDeepStrictEqual(event.command, task.command))) return false;
  if (task.method === 'verification') return last.exitCode === 0 && events.slice(1).every(event => event.phase === 'verify');
  const second = events[1];
  if (task.method === 'tdd') {
    if (second.phase !== 'red' || !second.exitCode || !second.reason?.trim() || equalFiles(first.before, second.before, task.tests) || !equalFiles(first.before, second.before, task.implementation)) return false;
    if (last.phase !== 'green' || last.exitCode !== 0 || equalFiles(second.after, last.after, task.implementation)) return false;
    return events.slice(2).every(event => event.phase === 'green' && equalFiles(second.after, event.before, task.tests));
  }
  if (second.phase !== 'baseline' || second.exitCode !== 0 || !equalFiles(first.before, second.before, task.implementation)) return false;
  if (task.method === 'refactor' && !equalFiles(first.before, second.before, task.tests)) return false;
  return events.length >= 3 && last.phase === 'green' && last.exitCode === 0 && events.slice(2).every(event => event.phase === 'green' && equalFiles(second.after, event.before, task.tests));
}
export function checkTdd(root: string, change?: string): Finding[] {
  const findings: Finding[] = [];
  const add = (code: string, message: string, severity: Finding['severity'] = 'error') => findings.push({code, message, severity});
  if (!change) { add('tdd-change-required', 'Use --change NAME to assess task completion history. Permanent-spec checks do not assess TDD ordering.', 'warning'); return findings; }
  let planned: Task[];
  try { planned = tasks(root, change); } catch (error) { add('tdd-task-metadata-invalid', String(error)); return findings; }
  let recorded: Event[];
  try { recorded = history(root, change); } catch (error) { add('tdd-history-invalid', String(error)); return findings; }
  if (fs.existsSync(local(root, `.cliewen-openspec/tdd/${name(change)}.lock`))) add('tdd-recording-in-progress', 'A recorder lock remains; do not assess completion while a command may still be running');
  const currentCycles = new Set<Event>();
  for (const task of planned) {
    if (!task.done) add('tdd-task-incomplete', `${task.id}: task remains unchecked`);
    const events = recorded.filter(event => event.task === task.id);
    let start = -1;
    for (let i = events.length - 1; i >= 0; i--) if (events[i].phase === 'start') { start = i; break; }
    if (start < 0) { add('tdd-history-missing', `${task.id}: no recorded start and execution history`); continue; }
    const cycle = events.slice(start);
    for (const event of cycle) currentCycles.add(event);
    try {
      if (cycle.some(event => event.definition !== definition(task))) { add('tdd-history-stale', `${task.id}: task definition changed after recording`); continue; }
      if (!validSequence(task, cycle)) add('tdd-sequence-invalid', `${task.id}: recorded ${task.method} sequence is incomplete or out of order`);
    } catch (error) { add('tdd-history-invalid', `${task.id}: ${String(error)}`); }
  }
  // Later tasks may legitimately edit files verified by earlier tasks. Check
  // continuity at task starts and compare the final recorded state per file.
  const latest: Snapshot = {};
  for (const event of recorded.filter(event => currentCycles.has(event))) {
    if (event.phase === 'start') for (const [file, value] of Object.entries(event.before)) {
      if (Object.hasOwn(latest, file) && latest[file] !== value) add('tdd-sequence-invalid', `${event.task}: ${file} changed between recorded task cycles`);
    }
    Object.assign(latest, event.after);
  }
  for (const task of planned) {
    try {
      for (const [file, value] of Object.entries(snapshot(root, task))) if (Object.hasOwn(latest, file) && latest[file] !== value) add('tdd-history-stale', `${file}: changed after its last recorded run`);
    } catch (error) { add('tdd-history-invalid', String(error)); }
  }
  add('tdd-review-required', 'Recorded commands and declared file hashes do not prove assertion quality, failure cause, complete file coverage, or exception suitability. Review the task plan and captured output; local history is not tamper-proof.', 'info');
  return findings;
}
