# Tasks

## 1. Implementation

<!-- Follow testing.approach (default: flexible). With tdd, write each task as one red-green-refactor cycle: run the test first, observe the intended behavior failure, implement until green, then refactor with green tests. Include commands and observed red/green outcomes in completion notes. Follow testing.placement in config (default: per-task). For end-of-change, move tests to a final verification section and link them to each implementation task. -->

<!-- When tdd is selected, add one fenced yaml cliewen-tasks block with version: 1 and metadata for every numbered checkbox. Declare method, command argument list, explicit tests/implementation file lists, and a reason for each exception. Follow the installed configuration reference. Record start and real runs through the tdd CLI before marking tasks complete. Omit this metadata in flexible mode. -->

- [ ] 1.1 Complete one small behavior slice and its relevant tests in the configured testing.approach order; name the AC IDs, run <test command>, fix failures, and update relevant documentation before continuing.
- [ ] 1.2 Complete the next behavior slice and its relevant tests in the configured testing.approach order; name the AC IDs, run <test command>, and fix failures before continuing.

## 2. Final verification

- [ ] 2.1 Finish documentation and result notes, run the final regression command, and review assertion quality. In TDD mode, record this task's actual regression or documentation check with a justified verification method. This supplements each task's tests.

## Workflow follow-up

- After verified tasks are complete, commit project inputs, collect evidence when enabled, and run check on clean final HEAD. Recollect and check again after any later commit. Keep evidence collection and the completion check outside numbered checkboxes and recorded task commands.
- Review evidence; archive only when authorized after project requirements are satisfied.
