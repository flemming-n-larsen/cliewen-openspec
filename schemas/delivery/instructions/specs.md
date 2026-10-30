Use OpenSpec ADDED/MODIFIED/REMOVED/RENAMED Requirements sections, ### Requirement and #### Scenario headings with WHEN/THEN steps.
New capabilities need a meaningful ## Purpose.
MODIFIED must copy the entire existing requirement and all scenarios.
With evidence enabled, preserve stable bracketed AC IDs and Test-type.
Use ac.capabilities in config to map the OpenSpec capability name (its specs directory name) to a stable prefix, such as EXPORT or EXP.
Register new capability mappings before allocating with cliewen-openspec ac next --capability NAME.
Choose a recognizable abbreviation with the user if it is not established; never silently assign an existing or historical prefix to another capability.
Use ac.padding (default 3).
Rename established prefixes only with cliewen-openspec ac rename-prefix CAPABILITY PREFIX; the sequence continues and old IDs remain unchanged.
Changed meaning needs review and a new ID; do not renumber wording edits.
