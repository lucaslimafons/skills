# Pull request body (copy and fill)

Use this scaffold when opening a PR. **Remove** the HTML comments before submitting when the host should not show them.

## Field guide

| Section                  | Required | What to write (one line)                                            |
| ------------------------ | -------- | ------------------------------------------------------------------- |
| Summary                  | Yes      | What changed and why the reviewer should care.                      |
| How to test              | Yes      | Repro steps, commands, or "N/A" + why.                              |
| Screenshots or recording | Yes      | UI proof, or "N/A — no user-facing UI" + what you verified instead. |
| Out of scope             | No       | What you intentionally did not do.                                  |
| Risks / rollback         | No       | Deploy risk, flags, rollback; or "None identified."                 |
| Ticket / tracking link   | No       | Link or ID; omit if none.                                           |
| Follow-ups               | No       | Next PRs or debt; omit if none.                                     |

---

## Required (paste under PR description)

### Summary

<!-- What changed and why (1–3 short paragraphs or bullets). -->

### How to test

<!-- Exact steps: env, commands, URLs, test accounts. If none, state "Not applicable" in one line and why. -->

### Screenshots or recording

<!-- User-facing UI: add images or short clip. Not UI: write "N/A — no user-facing UI" plus what you verified instead (e.g. unit tests, API). -->

## Optional

### Out of scope

<!-- Deliberate exclusions so reviewers do not ask for them. Omit section if nothing to say. -->

### Risks / rollback

<!-- Data migrations, feature flags, breaking API, perf. If none, omit or "None identified." -->

### Ticket / tracking link

<!-- Issue URL, ticket ID, or spec. Omit if internal-only with no link. -->

### Follow-ups

<!-- Known tech debt or next PRs. Omit if none. -->
