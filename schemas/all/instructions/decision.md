Use decision.md for both the outcome and chosen design, linking to investigation findings instead of copying them. Do not create a separate design.md artifact.
Frontmatter must include type: decision, status: proposed or accepted, and outcome: delivery, no-change, or further-investigation.
Only human agreement permits accepted status. Stop before production implementation while a delivery decision remains proposed; record the actual approval source instead of inventing it.
Describe exactly what agreement authorizes; do not include unverified commands in the continuation request.
For delivery, describe agreed behavior, constraints, approach, risks, and verification. Keep schema: cliewen-all and leave skip_specs absent or false in .openspec.yaml.
For no-change or further-investigation, explain why and what would reopen the question, set skip_specs: true in .openspec.yaml, and do not create product spec deltas or allocate acceptance IDs for unanswered questions.
When decisions are enabled and the choice merits a durable record, use the shared decision template under configured docsRoot/decisions. Preserve existing document paths and ID authority; new-project filenames use sequential numbers padded to at least three digits. Link the authoritative record rather than repeat it. Human agreement remains required for acceptance.
