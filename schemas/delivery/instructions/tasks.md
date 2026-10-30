Use - [ ] numbered tasks, each with a completion check. ${testingApproach} Read testing.placement from config; the default is per-task.
In per-task mode, every implementation task must include its own relevant tests, test command and completion check: complete a small slice in the configured testing.approach order, run its tests, fix failures, then proceed to the next task.
Do not defer these tests to a final testing phase.
Documentation-only tasks may use an appropriate validation check instead.
In end-of-change mode, group implementation tests in a final verification section with explicit task-to-test links.
Include relevant documentation with each task.
Identify the concrete test, its configured type, and the verification boundary for each implementation task. With the Node adapter, tag mapped test titles with one AC ID and one [Test-type: NAME] tag matching the scenario. Other adapters must export the declared type as testType.
With evidence enabled, name the AC IDs served and record execution outcomes for the tested revision.
Review whether assertions prove the scenario at the declared boundary, including relevant negative and boundary cases.
Separate review is optional.
Do not require post-implementation evidence before implementation.
Archive is an untracked follow-up.
