import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const [project, artifacts, ...extra] = process.argv.slice(2);
if (!project || !artifacts || extra.length) throw Error('Use node scripts/check-csv-all-trial.mjs PROJECT ARTIFACTS');
const run = spawnSync(process.execPath, [fileURLToPath(new URL('./check-csv-bom-trial.mjs', import.meta.url)), project, artifacts, 'cliewen-all'], {stdio: 'inherit'});
process.exitCode = run.status ?? 2;
