# Writing a quiz that cannot be gamed

Read this before writing the quiz section. The quiz is the only part of the
explainer that tells the reader whether they actually understood the change, and
it is the part that most reliably degrades into theatre.

## The failure it keeps degrading into

A model writing a multiple-choice question reaches for the answer first, writes it
as a *complete, true statement*, and then invents three *short, false* ones to sit
beside it. Nothing in that process is wrong on its face, and the result is still
a quiz that a reader can ace without reading a line of the diff:

- **The answer is the longest option.** The key carries a mechanism and a reason
  ("because the join code is signed into the ticket, rotating the code revokes
  every existing one"), while the distractors are glib ("for performance").
  Length is a proxy for how much the author knew, so it leaks the answer.
- **The answer drifts to the same position**, usually second, because that is
  where "write the answer, then pad around it" tends to land it.
- **The answer is the only specific option.** Three options say "the config" and
  one says `reveal_at`. The specific one is always right.
- **The distractors are absurd**, so the question is really a 1-of-2.

The first two are handled structurally and you mostly do not have to think about
them. The last two are on you, and they are the ones that actually matter.

## What the template already handles

`assets/page-template.html` shuffles each question's options with Fisher-Yates at
render time. Position is therefore decided by the reader's browser, not by your
authoring order, and it is different on every load. So:

- Write the options in whatever order is convenient, including correct-first.
- **Never refer to an option by position.** No "as option B showed", no "the
  second choice". Name the content instead, in stems and in feedback. A letter
  reference becomes wrong the moment the page loads.

`scripts/verify.mjs` reports the word count of every option, the spread per
question, and whether the answer is the only longest one. Fix what it flags
before you hand the file over.

## Rule 1: the option asserts, the feedback explains

This single change removes most of the length asymmetry at its source, because
"because..." is what makes the key long.

Put *what is true* in `text`. Put *why it is true, and the mechanism* in `why`,
which the reader sees only after committing to an answer. The feedback is also
where the teaching happens, so this makes the quiz better as well as fairer.

```
BAD   text: "The cookie is scoped to the event path, so a read surface outside
             that subtree never receives it and therefore fails closed"
      why:  "Correct."

GOOD  text: "The cookie is scoped to the event's own path"
      why:  "Right. A read surface outside that subtree is never sent the cookie,
             so it refuses rather than silently allowing the read: it fails closed."
```

## Rule 2: build each distractor from a belief a real reader might hold

Do not invent wrong answers. *Derive* them. A distractor grown from a plausible
misreading is naturally as concrete and as long as the key, which is why this
rule fixes the length tell more durably than any word limit.

Five generators that between them cover almost every good question. Pick the
three that fit:

| Generator | What it is | Who picks it |
| --- | --- | --- |
| **The old behavior** | What the code did *before* this change | Anyone who skimmed the diff, or knows the old system |
| **The rejected alternative** | The approach the change deliberately did not take | Anyone reasoning from first principles instead of reading |
| **The adjacent mechanism** | A real thing nearby that does something similar but is not at play here | Anyone who knows the codebase but not this change |
| **Right answer, wrong question** | A true statement about the change that does not answer what was asked | Anyone pattern-matching on keywords |
| **The plausible inversion** | The right mechanism with the direction, order, or actor flipped | Anyone who got the gist but not the detail |

The first two are the strongest. A reader who picks "the old behavior" has told
you precisely what they misunderstood, and the feedback can say so.

## Rule 3: parallel construction

Every option in a question should be the same *kind* of thing, in the same
grammatical shape, at the same level of specificity.

- All four name a concrete artifact (a file, a function, a column, a state), or
  none do. One option naming `reveal_at` among three saying "the setting" is a
  giveaway.
- All four start the same way: all noun phrases, or all verb phrases. Do not mix
  "Because the server..." with "Validation".
- Hedges and absolutes appear in all options or none. If "always" and "never"
  only ever show up in wrong answers, the reader learns to avoid them.
- No "all of the above", "none of the above", "both of these". They collapse the
  question into a different, easier one about test-taking.

## Rule 4: hold the length spread under 1.3x

After drafting, count the words in each option. The longest should be no more
than about 1.3 times the shortest.

**When it fails, cut the key. Do not pad the distractors.** Padding produces a
new and worse tell: the vague, waffly option is obviously filler, and the reader
learns to pick the crisp one. If the key cannot be stated briefly, the question
is trying to test two things at once. Split it.

## Rule 5: the cover test

The one check worth running on every question. Cover the stem and look only at
the four options. **Could someone who has never seen this change pick the answer?**

If yes, the options are leaking, and it is nearly always one of: length,
specificity asymmetry, three absurd options, or the key being the only one that
sounds like something an engineer would actually write.

## Rule 6: medium difficulty means substance, not trickery

Aim for a reader who read the explainer attentively getting 4 of 5, and a reader
who skimmed getting 2.

- **Test the substance**, not trivia. Not "which file was changed" or "how many
  lines", but why the change works, what it prevents, what would break without it.
- **No gotchas.** Nothing hinging on a misread word, a double negative, or an
  off-by-one in a variable name. Negative stems ("which is NOT true") test
  reading, not understanding; prefer a positive framing.
- **One idea per question.** If answering requires two independent leaps, the
  reader who gets it wrong learns nothing about which leap they missed.
- **Ground it in a scenario** where you can. "A guest clears their browser data
  and reopens the link. What happens now that did not happen before?" beats
  "Which of the following statements about the cookie is true?"

## Rule 7: spread the questions across the change

Questions all probing the same function waste each other. This ladder is the unit
of coverage, and one pass through it covers one idea properly:

1. **Why** this change exists: the problem, or the failure it prevents.
2. **Mechanism**: how it actually works, the step that does the real work.
3. **Edge case**: what happens at a boundary the change had to handle.
4. **Blast radius**: what else is affected, what a caller now has to do differently.
5. **Counterfactual**: what would break if a specific piece were removed, or what
   the old code would have done in this situation.

The counterfactual is usually the best question in the set. It cannot be answered
by recall.

**Scaling.** One pass through the ladder is the whole quiz. Five is the default
and eight is the ceiling, so a change spanning several subsystems does not get a
ladder pass per area: it gets one pass aimed at the spine, plus a closing note
naming the areas left unquizzed.

This is a deliberate reversal. An earlier version said ten or twelve questions
across four groups was a reasonable shape for a large PR, and the result was 11
questions on a six-file change — a third of the page and nine minutes of reading,
because "one question per distinct idea" has no ceiling when the author also
decides what counts as an idea. The reader came for the explanation.

## Worked example

Take a change that replaced "knowing the event's join code" with a signed,
httpOnly cookie as the credential for reading an event gallery.

### The version to avoid

> **Why was the cookie introduced?**
> - A) For performance
> - B) Because anyone who knew the join code could read the entire gallery without
>   ever having joined the event, which meant the join code was functioning as a
>   read credential when it was only ever meant to be an invitation
> - C) To support dark mode
> - D) Because of a database migration

Everything is wrong here. B is 4x the length of any other option, B is in the
second slot, and A, C and D are jokes. The cover test fails instantly: you can
pick B without reading the stem, let alone the diff.

### The version to ship

> **A guest opens an event link in a private window, having never joined that
> event. What do they see?**
>
> - *The join form, because reads require a ticket the join step mints*  — **correct**
>   <br>`why`: Right. Access comes from a signed cookie, and the join step is the
>   only thing that mints one, because it is the only place that has already
>   checked the event is paid for and has room.
> - *The full gallery, because the join code in the URL is the credential*
>   <br>`why`: This was exactly the old behavior, and it is the hole the change
>   closed. The code is an invitation now, not a credential.
> - *An error page, because the gallery refuses requests without a device token*
>   <br>`why`: Close, but the device token is a stand-in for an account, not a
>   permission. A missing one sends you to the join form, not an error.
> - *The gallery, but with photos hidden until the reveal time passes*
>   <br>`why`: That is a real and separate gate. It decides *when* photos appear,
>   not *whether* you may look at the gallery at all.

Word counts: 11, 11, 11, 11. The spread is 1.0x. Every option names a concrete
mechanism, all four are noun phrases of the same shape, and the three distractors
come from the old behavior, the adjacent mechanism, and right-answer-wrong-question
respectively. Each one is a belief someone could genuinely hold after skimming,
and the feedback tells them which misreading they just made.
