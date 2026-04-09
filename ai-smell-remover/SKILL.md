---
name: ai-smell-remover
description: >-
  Rewrites AI-generated text to sound human. Fixes verbosity, hedging, infinite
  lists, corporate tone, hidden repetition, over-structuring, abstract nouns,
  and textbook word choices. Use this skill when the user asks to "humanize", "humanize this",
  "fix AI smells", "make this sound more human", "rewrite this to sound less
  like AI", "remove AI tone", "this sounds too robotic", "clean up this
  AI-generated text", or wants to improve the naturalness of written content.
---

# AI Smell Remover

AI text without human curation has predictable weaknesses. Find them, fix them, keep the author's intent.

## When to Use This Skill

- User asks to **humanize** text or writing
- User says the text **sounds like AI**, robotic, or unnatural
- User asks to **fix AI smells** or AI tells
- User wants to **rewrite AI-generated content** to sound more like a person
- User asks to make writing **less formal**, less corporate, or more conversational
- User mentions the text has **hedging**, **bullet overload**, or **corporate jargon**
- User shares a piece of writing and asks if it sounds human

## What to Look For

**Verbosity** — long intros and inflated phrases that delay the point.
Before: "It is important to highlight that documentation plays a fundamental role in ensuring alignment and efficiency across teams."
After: "Documentation keeps teams aligned and efficient."

**Excessive hedging** — hiding behind "can," "might," "potentially" instead of making a decision.
Before: "This approach can potentially help improve system reliability."
After: "This approach improves system reliability." Or if uncertainty is real: "This improves reliability, but increases operational cost."

**Infinite lists** — 10 bullets where 3 would do.
Before: "Key benefits: scalability, flexibility, improved collaboration, enhanced visibility, lower costs, better governance, increased automation, faster onboarding and improved alignment."
After: "The main benefits are scalability, faster onboarding, and lower operational cost."

**Corporate tone** — sounds like policy, not a person.
Before: "With the goal of optimizing processes and ensuring excellence, this solution enables a robust and future-proof architecture."
After: "This solution simplifies the process and scales without additional complexity."

**Hidden repetition** — same idea in the title, intro, and first paragraph.
Before: Title "Improving Document Quality" / Intro "This document focuses on improving documentation quality." / Para "Documentation quality is essential for..."
After: Title "How We Improve Document Quality" / Para "We improve document quality by cutting unnecessary text, stating decisions clearly, and prioritizing what matters."

**Over-structuring** — H2 > H3 > H4 for three sentences of content.
Before: `## Overview / ### Components / #### Services / (2 sentences)`
After: `## Overview / (2 sentences that say what the components are)`

**Textbook word choices** — technically correct words that sound formal, translated, or learned-from-a-textbook rather than natural. Common in non-native writing, and amplified by AI. Applies to English by default, but can be applied to any language if specified.
Before: "Utilize the interface to accomplish the task prior to commencing the next step."
After: "Use the interface to finish the task before starting the next one."

Common swaps: utilize -> use, commence -> start, prior to -> before, subsequently -> then, endeavor -> try, ensure that -> make sure, in order to -> to, regarding -> about, it is necessary to -> you need to, accomplish -> finish / get done.

The test: would a non-native English speaker understand and feel comfortable writing this word? If not, find a simpler, more internationally common word.

**Decorative formatting** — emojis and em-dashes used for effect, not meaning. AI reaches for emojis and — as substitute for good writing. Real writers use them sparingly, if at all.
Before: "We're launching AI Cafe — a space to learn and share AI together."
After: "We're launching AI Cafe, a space to learn and share AI at work."

The test: remove every emoji and em-dash. If the sentence still works, they were decoration. Cut them.

**Abstract nouns** — vague words that hide the real thing doing the work. AI often writes about "solutions," "approaches," or "capabilities" instead of naming the concrete mechanism.
Before: "This solution improves performance."
After: "Caching database queries improves performance."

Common vague nouns: solution, approach, capability, initiative, process, functionality, framework, strategy, system.

The test: replace the noun with "thing." If the sentence still works, the noun is probably vague. Rewrite with the actual mechanism.

## How to Fix

1. Cut 50-70% of the text. Shorter is almost always better.
2. Delete the introduction. Start with substance.
3. Replace hedging with a clear claim or an honest trade-off.
4. If a list has more than 5 items, cut it to the 3 that actually matter.
5. Flatten heading hierarchy. If content is short, it doesn't need a subsection.
6. Add opinion where the text is neutral by default. Good writing takes a stance.
7. Replace formal or textbook words with a plain, internationally common word — one a non-native English speaker would know and feel comfortable writing.
8. Remove decorative emojis and em-dashes. If the meaning survives without them, they were noise.
9. Replace abstract nouns (solution, approach, capability) with the specific mechanism or component responsible for the outcome.

## Output

**IMPORTANT — Always run Phase 1 first. Never rewrite without it, even if the user says "humanize this" or "fix everything."**

**Phase 1 — Diagnose (always)**

Analyze the text. List every smell found, one line each, grouped by type. Then ask:
"Fix all of these, or only specific ones?"

If nothing significant is wrong, say: "No major issues. The text reads as direct and human." and stop.

**Phase 2 — Rewrite (only after user confirms)**

Wait for the user's answer. Apply only the fixes they confirmed.

Output:

- **Rewritten**: the clean version.
- **What changed**: 2-3 lines max, only the most important edits.
