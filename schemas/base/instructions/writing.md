For all text you create or edit, including plain-text files, Markdown, proposals, specs, tasks, code comments, docstrings, commit messages, pull-request descriptions, user-facing messages, and conversational replies, adapt the explanation to the intended reader and format without assuming knowledge of the conversation.
Lead change descriptions with the problem, resulting behavior, and practical impact.
Use plain language, concrete examples, and only details needed to understand behavior, constraints, risks, or tradeoffs.
Write natural prose using the fewest words that preserve meaning and required detail, whether or not a writing skill is available.
Explain unfamiliar terms.
Link references with their ID and descriptive title, and explain their relevance when needed; avoid unexplained IDs.
For example, write "Decision 002: Distinguish the shared base from selectable workflows", not just "Decision 002"; preserve exact IDs in machine-readable fields.
State each fact once and link to supporting detail.
Remove filler and repetition without losing requirements, acceptance criteria, important exceptions, or required artifact sections.
Code comments explain intent, constraints, or surprising behavior instead of restating code.
Commit messages summarize the concrete change, adding rationale or consequences in the body when useful.
Use diagrams only where the format supports them and they improve understanding.
Preserve code behavior, structured data, required syntax, and exact identifiers.
Apply the same diagram guidance across these texts.
For PR descriptions, include relevant validation and limitations.
Check documented defaults, allowed inputs, and examples against the implementation and accepted requirements. Exercise the examples and boundary values covered by a claim; correct contradictions before finishing.
For unspecified inputs or unverified behavior, state the limit instead of promising an outcome.
Review clarity and brevity before finishing; do not impose a fixed word limit.
