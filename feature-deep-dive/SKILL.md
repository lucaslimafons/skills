---
name: feature-deep-dive
description: >-
  Deep-dive research and approach analysis before building a feature. Takes one
  specific use case, screen, or interaction; researches how top, currently-popular
  apps and products handle it using live web search; then grounds concrete,
  buildable recommendations in THIS project's actual codebase, design tokens, and
  conventions. Operates without assumptions — when scope, intent, or a product
  decision is ambiguous, it stops and asks rather than guessing. Use this whenever
  the user wants to scope, explore, or decide how to approach a feature before any
  code is written, or says things like "how should we do X", "how are the top apps
  doing Y", "analyze this use case", "deep dive on Z", or "research this before we
  build". Lean toward triggering for any "how should we approach this / how do
  others do this" question that precedes implementation.
---

# Feature Deep-Dive

Turn a fuzzy "I want to build X" into a grounded, no-assumptions plan of attack —
informed by how the best apps in the wild solve the same problem, and by what
already exists in this codebase.

The output is research and a recommended approach. It is **not** code. Resist the
urge to start implementing — the whole point is to think first so the eventual
build is fast and right.

## Core principle: no assumptions

This is the part that matters most. The user would much rather be asked than
guessed at. Whenever you hit a fork where you'd otherwise have to assume — the
exact scope, who the feature is for, an unstated product decision, which of two
readings of the request they mean, a constraint you can't verify — stop and ask a
short, concrete question instead of quietly picking one.

Ask early, before you've spent effort researching down the wrong path. A useful
rule: if getting it wrong would waste the research, ask now; if it's a minor
detail you can caveat, state the assumption explicitly and keep going. Either way
the user should never be surprised by a silent guess.

## Workflow

### 1. Clarify the target
Restate the specific use case in a sentence or two so the user can confirm you're
both looking at the same thing. If the request is broad ("improve onboarding"),
narrow it to the concrete slice worth analyzing and confirm that slice. Surface
any unknowns here, up front.

### 2. Discover the project
Don't assume the stack or conventions — read them. Before researching solutions,
understand the ground you're building on:
- Identify the platform and framework (package.json, lockfiles, config files).
- Read the project's own engineering reference / conventions if present (a
  CLAUDE.md, an AI_CORE_CONTEXT.md, README, `docs/`).
- Find the design system / tokens and existing UI primitives so recommendations
  fit what's already there rather than fighting it.
- Locate any existing code touching this use case — often part of the answer is
  already in the repo.

This step is what keeps the final recommendation grounded in *this* project
instead of generic advice.

### 3. Research how the best apps do it
Use **live web search** to find how leading, currently-popular apps and products
handle this exact use case — not what you remember, but what's current. For a
mobile project that means top mobile apps; adapt to whatever platform you detected
in step 2.
- Look for the established pattern, the emerging standard, and notable variations.
- Prefer concrete, recent sources and cite them so the user can dig deeper.
- Capture *why* a pattern won, not just what it looks like — the reasoning
  transfers across contexts far better than the surface design.
- Flag where "best practice" is genuinely contested, so the user can decide rather
  than be handed a false consensus.

### 4. Synthesize a recommended approach
Bring the two threads together: here's how the best apps solve it, here's what
this codebase already has, so here's how *we* should approach it.
- Give a concrete recommendation, plus one or two alternatives with their
  tradeoffs.
- Map it onto real files, components, and tokens in this project.
- List every assumption you had to make and every open question still blocking a
  confident build.
- Keep it buildable — the natural next step should be a plan or implementation,
  not another layer of abstraction.

## Output format

Default to an **inline analysis** in the conversation. That's how this is used most
of the time and it keeps the discussion moving. Structure it clearly around the
four stages: Use case → Project grounding → How the top apps do it → Recommended
approach + open questions.

If the user asks to save it, write a markdown file — default `docs/research/<feature>.md`,
or a path they specify. Don't save proactively; only when asked.

To hand the analysis to a *different* session to act on, don't invent a temp-file
scheme here — point the user at the **handoff** skill, which is built for exactly
that.

## What good looks like
- The user is never surprised by a silent assumption.
- Recommendations name real files, components, and tokens — not generic advice.
- Research reflects what top apps do *now*, with sources, not vague memory.
- It ends with a clear, buildable direction and an explicit list of anything still
  open.
