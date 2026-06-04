---
name: daily-git-flow
description: >-
  Global git workflow: branch naming, Conventional Commit messages, PR body from
  the bundled template, and an ordered “git full flow” that always uses a
  feature branch, pushes only that branch, and opens a PR into DEFAULT (never
  push to main unless the user explicitly asks). Use when the user asks for
  daily git, morning sync, shipping a branch, opening a PR, or phrases like git
  full flow, full git flow, or branch commit push pr. For splitting one pile of
  work into multiple PRs, use the split-to-prs skill instead.
---

# Daily Git Flow (global)

Project-agnostic: use plain git. For checks before push, use whatever the **current repo** documents (e.g. `package.json` scripts, CI, or `AGENTS.md` / `CLAUDE.md`)—do not assume a package manager or monorepo layout.

## Rule: feature branch + PR only (no direct push to DEFAULT)

**Unless the user explicitly says** to push to `main` (or whatever `DEFAULT` is)—for example _“push this straight to main”_ or _“commit on main”_—you must:

1. **Never** `git push origin DEFAULT` or `git push` while checked out on `DEFAULT`.
2. **Always** create a **feature branch** off an up-to-date `DEFAULT`, commit there, **`git push -u origin <feature-branch>`**, then **open a PR** targeting `DEFAULT` (`gh pr create --base <DEFAULT>` or the GitHub compare URL into `DEFAULT`).

Phrases like “full git flow”, “git flow”, or “ship it” **do not** override this rule; they still mean branch → push branch → PR.

## Safety

Do not run destructive git (`reset --hard`, `clean -fdx`, branch delete, `push --force`) unless the user explicitly approves. Prefer explicit paths over `git add -A` when the change set is mixed or the user is splitting work.

## Default branch

Resolve once per run: `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'` → if empty, use `main`. Call it `DEFAULT`. Remote is `origin` unless the user says otherwise.

## Branch names

- Pattern: `type/summary-in-kebab-case` **or**, if the user gave a ticket: `type/TICKET-summary-in-kebab-case` (ticket uppercase, hyphen before summary).
- `type`: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `revert` (same as commit types).
- ASCII only; no spaces; keep the slug readable and under ~50 chars after `type/`.

Create from updated `DEFAULT`: `git fetch origin`, `git checkout DEFAULT`, `git pull` (or `git merge origin/DEFAULT`), then **`git checkout -b <branch>`** so commits never land on `DEFAULT` until merged via PR.

If you are already on a feature branch with local commits and the user asked for “flow” without a new branch name, keep that branch; do not switch to `DEFAULT` to commit.

## Commit messages (concise and complete)

- Format: `type(scope): imperative summary` — [Conventional Commits](https://www.conventionalcommits.org/). Subject **≤72 chars**, imperative (“add”, not “added”).
- `scope`: optional but preferred when it narrows the change (e.g. `checkout`, `auth`).
- **Body**: use when the reason is not obvious (breaking change, migration, security, non-obvious bug). Short bullets; no filler.

**Good:** `fix(form): validate email before submit`  
**Bad:** `fixed stuff` / `WIP` / `updates` (missing type and intent).

**Good (with body):**

```text
feat(api): return pagination cursor

- Aligns with RFC on cursor-based lists
- Clients sending page number still get 400 with clear message
```

**Bad:** subject-only for a breaking API change with no migration note.

## PR title and body

- **Title:** mirror the primary commit subject, or a slightly more product-facing line; still clear and scannable.
- **Body:** read [references/pr-body-template.md](references/pr-body-template.md), copy the structure, and **fill every required section**. Optional sections: include when useful, else omit or one-line “N/A”.

## Git full flow

When the user asks for **git full flow** (or equivalent: end-to-end ship + PR):

1. Confirm uncommitted changes are intentional; `git fetch origin`.
2. If **not** already on a feature branch: `git checkout DEFAULT`, update from `origin/DEFAULT`, then **`git checkout -b <branch>`** per **Branch names** (derive `type`/`summary` from the work). If already on a feature branch, skip creating a new branch unless the user asked for a fresh one.
3. Stage the right paths; commit with **Commit messages** (multiple commits if logically separate). All commits stay on the feature branch.
4. **`git push -u origin HEAD`** (first push) or **`git push`** — must push **the feature branch only**, never `git push origin DEFAULT` unless the user **explicitly** requested pushing to default (see **Rule** above).
5. Build PR **title** and **body** from the template + conversation + `git diff` / commit list.
6. Open the PR **into `DEFAULT`**: e.g. `gh pr create --base DEFAULT` with the drafted title/body (and compare branch `HEAD` → `DEFAULT`). If `gh` is missing or unauthenticated, give the compare URL `https://github.com/<owner>/<repo>/compare/DEFAULT...<branch>?expand=1` or exact UI steps.

## Other day-to-day

- **Sync:** `git fetch`; on `DEFAULT` merge or pull `origin/DEFAULT`; on a feature branch, merge or rebase from `DEFAULT` per user preference—if unknown, **merge** is safer for shared branches.
- **Splitting many PRs from one workspace:** use the **split-to-prs** Cursor skill; do not duplicate its stash/slice workflow here.
