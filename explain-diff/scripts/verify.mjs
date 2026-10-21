#!/usr/bin/env node
/*
  verify.mjs <file.html>

  Checks a generated explainer for the failures that actually happen, so they get
  caught before a human opens the page:

    format   code blocks that will collapse into one line, or that swallowed
             their own contents because the code inside was not escaped
    safety   live remote references and raw-HTML sinks in the page's own markup
    quiz     an answer that gives itself away by being the longest option, and
             references to options by position, which break under shuffling

  Pure string analysis: this reads the file, it never executes it. Exits 1 if any
  check FAILs, so it can gate "am I done?".
*/

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node verify.mjs <file.html>");
  process.exit(2);
}
const src = readFileSync(file, "utf8");

let fails = 0;
let warns = 0;
const line = (i) => src.slice(0, i).split("\n").length;

const fail = (msg) => { console.log(`  FAIL  ${msg}`); fails++; };
const warn = (msg) => { console.log(`  WARN  ${msg}`); warns++; };
const ok = (msg) => console.log(`  ok    ${msg}`);

/* ---------------- format ---------------- */
console.log("\nFORMAT");

if (/white-space:\s*pre(-wrap)?\b/.test(src)) {
  ok("code blocks have white-space: pre or pre-wrap");
} else {
  fail("no `white-space: pre|pre-wrap` anywhere; code blocks will render as one line");
}

// A <pre> whose text content is empty almost always means the code inside was
// not escaped, so the browser parsed it as markup and the code vanished.
const pres = [...src.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)];
if (!pres.length) {
  warn("no <pre> code blocks found; expected at least one in a code walkthrough");
} else {
  let empty = 0;
  for (const m of pres) {
    const text = m[1].replace(/<[^>]+>/g, "").replace(/&[a-z]+;|&#\d+;/gi, "x").trim();
    if (!text) { fail(`<pre> at line ${line(m.index)} renders empty; its code was probably not escaped`); empty++; }
  }
  if (!empty) ok(`${pres.length} code block(s), all with visible content`);

  /*
    Unescaped markup inside a code block is the whole ballgame: a snippet
    containing <script> does not render as code, it runs. Only the handful of
    tags used to style a block are allowed through; everything else should have
    arrived as &lt; entities.
  */
  const ALLOWED_IN_PRE = /^\/?(code|span|b|i|em|strong|mark)\b/i;
  let rawTags = 0;
  for (const m of pres) {
    for (const t of m[1].matchAll(/<(\/?[a-zA-Z][^>\s/]*)/g)) {
      if (!ALLOWED_IN_PRE.test(t[1])) {
        fail(`unescaped <${t[1]}> inside the code block at line ${line(m.index)}; escape & < > or it executes instead of rendering`);
        rawTags++;
      }
    }
  }
  if (!rawTags) ok("code blocks contain no unescaped markup");
}

const placeholders = [...src.matchAll(/REPLACE/g)];
if (placeholders.length) {
  fail(`${placeholders.length} unreplaced REPLACE placeholder(s), first at line ${line(placeholders[0].index)}`);
} else {
  ok("no template placeholders left");
}

/* ---------------- safety ---------------- */
console.log("\nSAFETY");

// Strip escaped code blocks before looking for sinks. Quoting hostile code inside
// an escaped <pre> is legitimate and expected when explaining a risky change; the
// question is only ever whether a sink is LIVE in the page.
const live = src.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, "<pre></pre>");

const SINKS = [
  [/<script[^>]+\bsrc\s*=/i, "remote <script src>"],
  [/<link[^>]+href\s*=\s*["']https?:\/\//i, "remote stylesheet"],
  [/<img[^>]+src\s*=\s*["']https?:\/\//i, "remote image"],
  [/@import\s+(url\()?["']?https?:\/\//i, "@import of a remote stylesheet"],
  [/\burl\(\s*["']?https?:\/\//i, "remote url() in CSS (font or image)"],
  [/\.innerHTML\s*=/, "innerHTML assignment"],
  [/\.outerHTML\s*=/, "outerHTML assignment"],
  [/document\.write\s*\(/, "document.write"],
  [/\bnew\s+Function\s*\(/, "new Function"],
  [/(^|[^.\w])eval\s*\(/, "eval"],
  [/\bfetch\s*\(/, "fetch"],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bnew\s+WebSocket\b/, "WebSocket"],
  [/\bnavigator\.sendBeacon\b/, "sendBeacon"],
  [/<form[^>]*\baction\s*=\s*["']?https?:\/\//i, "form posting to a remote URL"],
];
let sinkHits = 0;
for (const [re, label] of SINKS) {
  const m = live.match(re);
  if (m) { fail(`live ${label} at line ${line(m.index)}; the page must stay inert and offline`); sinkHits++; }
}
if (!sinkHits) ok("no live remote references and no raw-HTML or dynamic-eval sinks");

if (/<meta[^>]+Content-Security-Policy[^>]+default-src\s+'none'/i.test(src)) {
  ok("restrictive CSP present (default-src 'none')");
} else {
  fail("missing the `default-src 'none'` CSP meta tag from the template");
}

// Common shapes of a committed secret. Deliberately loose: a hit is a prompt to
// look, not a verdict.
const SECRETS = [
  [/\bsk-[A-Za-z0-9]{16,}/, "OpenAI-style key"],
  [/\b(gh[pousr]|github_pat)_[A-Za-z0-9_]{20,}/, "GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key id"],
  [/\bey[A-Za-z0-9_-]{10,}\.ey[A-Za-z0-9_-]{10,}\./, "JWT"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/\b(SERVICE_ROLE_KEY|SECRET_KEY|API_KEY|ACCESS_TOKEN|PASSWORD)\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}/, "assigned credential"],
];
let secretHits = 0;
for (const [re, label] of SECRETS) {
  const m = src.match(re);
  if (m) { fail(`possible ${label} at line ${line(m.index)}; redact it to <redacted>`); secretHits++; }
}
if (!secretHits) ok("no obvious secrets embedded");

/* ---------------- quiz ---------------- */
console.log("\nQUIZ");

/*
  Tolerant parse of the QUIZ literal. Properties are only recognised at a real
  property position (after `{` or `,`), which keeps the words "stem:" or "text:"
  inside a feedback string from being mistaken for one. A hand-rolled quiz with
  no `const QUIZ` block is reported as skipped rather than silently passing.
*/
function readStringLiteral(s, from) {
  let i = from;
  while (i < s.length && /\s/.test(s[i])) i++;
  const q = s[i];
  if (q !== '"' && q !== "'" && q !== "`") return null;
  let out = "";
  for (i++; i < s.length; i++) {
    if (s[i] === "\\") { out += s[i + 1] ?? ""; i++; continue; }
    if (s[i] === q) return { value: out, end: i + 1 };
    out += s[i];
  }
  return null;
}
const propAt = (s, name) => {
  const hits = [];
  const re = new RegExp(`(^|[{,])\\s*["']?${name}["']?\\s*:`, "g");
  let m;
  while ((m = re.exec(s))) hits.push({ start: m.index, after: m.index + m[0].length });
  return hits;
};

const quizStart = src.search(/\bconst\s+QUIZ\s*=/);
if (quizStart === -1) {
  /*
    Not a style preference. The `const QUIZ` shape is what makes option lengths
    readable from outside the document, so a hand-rolled quiz is an UNAUDITED
    quiz: the length tells and the render-time shuffle both quietly stop
    applying, and this file would otherwise report a clean pass.
  */
  fail("no `const QUIZ` block: a hand-rolled quiz cannot be audited for length tells and probably is not shuffled. Use the renderer from assets/page-template.html");
} else {
  const quizSrc = src.slice(quizStart, src.indexOf("/* ---------- renderer", quizStart) + 1 || undefined);
  const stems = propAt(quizSrc, "stem");
  if (!stems.length) warn("QUIZ block found but no `stem:` entries parsed");

  const BANNED = ["all of the above", "none of the above", "both of these", "both a and b", "any of these"];
  let problems = 0;
  console.log(`  ${stems.length} question(s)`);

  stems.forEach((s, qi) => {
    const end = stems[qi + 1] ? stems[qi + 1].start : quizSrc.length;
    const region = quizSrc.slice(s.start, end);
    const texts = propAt(region, "text");
    const opts = [];
    texts.forEach((t, ti) => {
      const lit = readStringLiteral(region, t.after);
      if (!lit) return;
      const tail = region.slice(lit.end, texts[ti + 1] ? texts[ti + 1].start : region.length);
      opts.push({ text: lit.value, correct: /(^|[{,])\s*["']?correct["']?\s*:\s*true/.test(tail) });
    });
    if (opts.length < 2) { console.log(`  Q${qi + 1}  WARN only ${opts.length} option(s) parsed`); warns++; return; }

    const words = opts.map((o) => o.text.trim().split(/\s+/).length);
    const hi = Math.max(...words), lo = Math.min(...words);
    const ratio = lo ? hi / lo : 99;
    const keys = opts.filter((o) => o.correct).length;
    console.log(`  Q${qi + 1}  words=[${words.join(", ")}] spread=${ratio.toFixed(2)}x`);

    if (keys !== 1) { fail(`Q${qi + 1}: exactly one option must be correct, found ${keys}`); problems++; }
    const keyIdx = opts.findIndex((o) => o.correct);
    if (ratio > 1.3) {
      // The remedy depends on WHERE the spread comes from. Telling an author to
      // "shorten the answer" is useless when the key sits mid-pack and the two
      // extremes are both distractors.
      const remedy = keyIdx > -1 && words[keyIdx] === hi
        ? "shorten the answer, do not pad the distractors"
        : `the answer is mid-pack (${words[keyIdx]} words), so level the distractors toward each other`;
      fail(`Q${qi + 1}: length spread ${ratio.toFixed(2)}x > 1.30x; ${remedy}`); problems++;
    }
    // A uniquely-longest answer is THE tell this skill exists to prevent, so it
    // fails rather than warns: a warning at exit 0 reads as "done".
    if (keyIdx > -1 && words[keyIdx] === hi && words.filter((w) => w === hi).length === 1) {
      fail(`Q${qi + 1}: the answer is the only longest option (${hi} words); shorten it or bring a distractor level`); problems++;
    }
    for (const o of opts) {
      for (const b of BANNED) {
        if (o.text.toLowerCase().includes(b)) { fail(`Q${qi + 1}: banned option "${b}"`); problems++; }
      }
    }
  });
  if (!problems && stems.length) ok("no length tells and no banned options");
}

// Option order is shuffled per page load, so any reference by position is wrong
// the moment someone opens the file. Comments are stripped first: authoring notes
// that discuss the rule are not violations of it.
const prose = src.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const positional = prose.match(/\b(option|answer|choice)\s+[A-D]\b|\bthe\s+(first|second|third|fourth|last)\s+(option|answer|choice)\b/i);
if (positional) {
  // Re-locate in the original file, since indexes into the comment-stripped copy
  // would point at the wrong line.
  const at = src.indexOf(positional[0]);
  fail(`refers to an option by position ("${positional[0]}")${at > -1 ? ` at line ${line(at)}` : ""}; options are shuffled, name the content instead`);
} else {
  ok("no positional references to options");
}

/* ---------------- verdict ---------------- */
console.log(`\n${fails ? `${fails} FAIL` : "No failures"}${warns ? `, ${warns} warning(s)` : ""}.`);
if (!fails) console.log("Open the page and read it once at phone width before handing it over.");
process.exit(fails ? 1 : 0);
