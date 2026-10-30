---
type: testing
---
# CSV pilot reference prompt

Use this prompt to evaluate whether the installed Cliewen schema provides enough workflow guidance from a concrete task description.

Prerequisite: OpenSpec and Cliewen are initialized, and the `add-csv-export` change uses `cliewen-delivery`.

## Prompt

> Create a change proposal for a CSV export function. The function must accept a list of records and export them as CSV with a header row. Specify the columns explicitly so their order is stable. Fields containing commas, quotation marks, or line breaks must be escaped correctly. An empty list must produce a CSV containing only the header. Use the existing OpenSpec change `add-csv-export`, and stop after the proposal, specs, design, and tasks so I can review the proposal before implementation.

## What are we evaluating?

The prompt describes the task and the review boundary. The schema supplies the workflow guidance, including stable AC IDs and consideration of evidence, documentation, and decisions when relevant and enabled.

During review, assess whether the agent follows the schema without additional workflow instructions, whether the scenarios cover the requested behavior, and whether uncertainties become visible before implementation. With the default testing configuration, each implementation task should include its own tests and completion check.

The user reported that the first pilot worked. This is informal feedback; detailed pilot results have not been recorded here.
