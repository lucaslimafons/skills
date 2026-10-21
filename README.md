# Agent Skills

A collection of agent skills that extend capabilities across writing, development, and tooling.

## Writing & Communication

Skills that help you write clearly and sound like a human.

**ai-smell-remover** — Rewrites AI-generated text to sound human. Fixes verbosity, hedging, infinite lists, corporate tone, hidden repetition, over-structuring, and textbook word choices.

```
npx skills@latest add lucaslimafons/skills/ai-smell-remover
```

## Development & Workflow

Skills that streamline how you build and ship.

**daily-git-flow** — Opinionated git workflow: branch naming, Conventional Commit messages, a PR body from a bundled template, and an ordered "git full flow" that always uses a feature branch and opens a PR into the default branch (never pushes straight to main unless you ask).

```
npx skills@latest add lucaslimafons/skills/daily-git-flow
```

**explain-diff** — Turns a diff, branch or PR into a self-contained interactive HTML explainer: layered background, the core intuition with real diagrams, a code walkthrough, and a quiz sized to the change whose options are built so you can't pass by picking the longest one. Keeps the generated page inert — no network, no eval, everything escaped. Based on [Geoffrey Litt's explain-diff-html](https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524).

```
npx skills@latest add lucaslimafons/skills/explain-diff
```

**feature-deep-dive** — Pre-build research and approach analysis: clarifies the use case, discovers the project's stack and conventions, researches how top apps solve it via live web search, then recommends a grounded, buildable approach — without silent assumptions, asking when scope or intent is unclear.

```
npx skills@latest add lucaslimafons/skills/feature-deep-dive
```
