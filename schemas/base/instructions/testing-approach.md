Read testing.approach from config (default flexible).
Flexible permits tests before or after code within the selected placement.
For tdd, each implementation task must describe one red-green-refactor cycle: write a focused test first, run it and observe failure for the intended missing behavior, implement the minimum behavior to make it pass, then refactor while keeping relevant tests green.
Fix setup, import, or syntax errors rather than treating them as the intended red result.
Record the red and green commands and observed outcomes in the task completion notes; if the test already passes, report that instead of claiming a red phase.
Documentation-only tasks use suitable validation rather than a forced TDD cycle.
Final passing evidence alone does not prove TDD was followed.
