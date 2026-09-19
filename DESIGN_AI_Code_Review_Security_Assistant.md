# DESIGN.md --- AI Code Review & Security Assistant

## 1. Design Document Purpose

This document defines the visual and interaction system for the **AI
Code Review & Security Assistant**.

The design direction is informed by the supplied references:

-   **Codex / ChatGPT coding experience** --- command-center feel,
    developer-first workflows, code/review context, clear task states,
    and a premium dark technical interface. The current Codex experience
    positions itself around engineering work, code review, task
    progress, changed-file review, and multi-agent workflows.
-   **CodeAnt AI** --- security-first product storytelling, strong
    editorial typography, dark/high-contrast presentation, security
    findings, severity-oriented review, dashboards, and a clear
    transition from marketing narrative into product evidence. CodeAnt's
    current site emphasizes SAST, SCA, Secrets, SBOM, CSPM, runtime
    security, and exploit-oriented findings.
-   **CodeAnt application-security concepts** --- severity, likelihood,
    confidence, multi-language analysis, CWE/OWASP classification, and
    structured security findings.

Reference URLs:

-   https://chatgpt.com/codex/
-   https://chatgpt.com/codex/code-review
-   https://codeant.ai/lp/code-security-in
-   https://codeant.ai/code-security
-   https://docs.codeant.ai/control_center/security

### Important design boundary

The goal is to reproduce the **interaction quality, information
architecture, visual confidence, density, motion language, and
developer/security-product feel** of the references.

Do **not** copy:

-   CodeAnt branding;
-   OpenAI/ChatGPT branding;
-   logos;
-   proprietary illustrations;
-   exact text;
-   proprietary screenshots;
-   exact source-code implementation;
-   copyrighted visual assets.

The product must have its own identity:

> **AI CODE REVIEW & SECURITY ASSISTANT**

------------------------------------------------------------------------

# 2. Product Design Direction

## Core visual idea

The application should feel like:

``` text
CODE EDITOR
      +
SECURITY COMMAND CENTER
      +
AI ENGINEERING ASSISTANT
```

It should not feel like:

``` text
generic chatbot
generic SaaS dashboard
generic AI landing page
basic code textarea
```

The user should feel that they are entering a professional
developer-security environment.

------------------------------------------------------------------------

# 3. Visual Personality

The visual personality should be:

-   technical;
-   premium;
-   confident;
-   dark;
-   precise;
-   restrained;
-   editorial;
-   security-oriented;
-   developer-first.

Use visual contrast rather than decorative effects.

### Preferred

``` text
Dark background
+
Bright code surface
+
Subtle borders
+
Muted secondary text
+
Strong typography
+
Small accent colors
+
Precise status indicators
```

### Avoid

-   neon cyberpunk;
-   excessive gradients;
-   glowing cards everywhere;
-   excessive glassmorphism;
-   giant AI robot graphics;
-   floating chat bubbles;
-   excessive rounded cards;
-   constant animation;
-   fake terminal effects.

------------------------------------------------------------------------

# 4. Design System

## 4.1 Background

Primary:

``` text
#07090D
```

Secondary:

``` text
#0B0E13
```

Elevated surface:

``` text
#10141B
```

Code surface:

``` text
#0D1117
```

Light contrast surface:

``` text
#F5F7FA
```

The exact palette can be adjusted during implementation, but the overall
direction should remain dark and high contrast.

------------------------------------------------------------------------

# 5. Typography

Use a modern developer-oriented sans-serif.

Recommended:

``` text
Inter
Geist
SF Pro Display
system-ui
```

Code:

``` text
JetBrains Mono
SFMono-Regular
ui-monospace
```

### Headline style

Large, concise and editorial.

Example:

``` text
YOUR CODE
SHOULD NOT
HIDE RISKS.
```

or:

``` text
FIND THE BUG.
UNDERSTAND THE RISK.
FIX IT.
```

Do not make every heading huge.

Use oversized typography primarily for:

-   hero;
-   major section transitions;
-   product statements.

------------------------------------------------------------------------

# 6. Navigation

The top navigation should be minimal and professional.

Recommended:

``` text
┌───────────────────────────────────────────────────────────────┐
│  ◆ CODEGUARD       Product   Security   How it works   Docs   │
│                                      [Try Review]             │
└───────────────────────────────────────────────────────────────┘
```

The actual product name can be finalized separately.

### Navigation behavior

-   transparent/dark over hero;
-   becomes slightly opaque after scrolling;
-   subtle backdrop;
-   thin border;
-   no oversized navbar;
-   sticky on desktop;
-   compact on mobile.

------------------------------------------------------------------------

# 7. Homepage Structure

The homepage should be one continuous product story:

``` text
HERO
  ↓
TRUST / DEVELOPER SIGNAL
  ↓
PARALLAX PRODUCT INTRO
  ↓
STICKY SECURITY WALKTHROUGH
  ↓
CODE REVIEW WORKSPACE
  ↓
FINDINGS / SEVERITY
  ↓
BEFORE → AFTER REMEDIATION
  ↓
SECURITY COVERAGE
  ↓
FINAL CTA
```

The page should transition naturally from:

``` text
marketing story
      ↓
product explanation
      ↓
actual code-review interface
```

------------------------------------------------------------------------

# 8. HERO SECTION

## Objective

Immediately communicate:

1.  this is for developers;
2.  this reviews code;
3.  this finds security risks;
4.  this explains and fixes them.

### Hero composition

``` text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                AI CODE REVIEW & SECURITY                    │
│                                                             │
│                 FIND THE RISK.                              │
│                 FIX THE CODE.                               │
│                                                             │
│      AI-assisted code review that identifies                │
│      potential bugs and security vulnerabilities             │
│      and explains exactly what to change.                   │
│                                                             │
│       [ Review Code ]       [ See how it works ]             │
│                                                             │
│                         ┌─────────────────────────────┐     │
│                         │ CODE REVIEW TERMINAL        │     │
│                         │                             │     │
│                         │ const user = ...            │     │
│                         │                             │     │
│                         │ ⚠ SQL Injection             │     │
│                         │                             │     │
│                         └─────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The product interface should be visible in the hero instead of relying
on abstract AI artwork.

------------------------------------------------------------------------

# 9. Hero Product Preview

The hero should contain a high-quality product mockup.

Possible composition:

``` text
┌──────────────────────────────────────────────────────┐
│ REVIEW                                                │
│ python                                                │
├───────────────────────────┬──────────────────────────┤
│ CODE                      │ AI FINDINGS               │
│                           │                           │
│ 10  query = ...           │ HIGH                      │
│ 11  user_id = ...         │ SQL Injection             │
│ 12  execute(query)  ←─────│                           │
│                           │ User input reaches query  │
│                           │ without parameterization │
│                           │                           │
│                           │ [View safer fix]         │
└───────────────────────────┴──────────────────────────┘
```

This communicates the actual product capability immediately.

------------------------------------------------------------------------

# 10. Hero Micro-Interactions

Use subtle interactions:

-   cursor movement creates slight product-preview movement;
-   code line highlight;
-   finding indicator appears;
-   status changes from `Scanning` → `Review complete`;
-   tiny severity indicators update.

Do not create a continuously moving fake dashboard.

Any displayed finding should be clearly identified as demonstration
content if it is not generated from the current user's code.

------------------------------------------------------------------------

# 11. PARALLAX SECTION

## Position

Place the parallax section **directly above the sticky scroll
sequence**.

Structure:

``` text
HERO
  ↓
TRUST / INTRO
  ↓
PARALLAX SECTION
  ↓
STICKY-SCROLL FEATURE WALKTHROUGH
```

The parallax section should feel like a cinematic transition from the
landing page into the product.

------------------------------------------------------------------------

# 12. Parallax Architecture

Create exactly three principal visual layers:

``` text
BACKGROUND
    ↓
MIDGROUND PRODUCT IMAGE
    ↓
HEADLINE
```

### Layer 1 --- Background

Examples:

-   subtle security grid;
-   code texture;
-   abstract dark gradient;
-   faint syntax fragments;
-   very subtle data flow.

Movement:

``` text
smallest offset
```

### Layer 2 --- Product image

A product screenshot/mockup of the code review interface.

Movement:

``` text
medium offset
```

### Layer 3 --- Headline

Large editorial headline.

Movement:

``` text
slightly different offset
```

The offsets must remain subtle.

------------------------------------------------------------------------

# 13. Exact Parallax Requirement

Use GSAP + ScrollTrigger.

Concept:

``` javascript
gsap.to(backgroundLayer, {
    yPercent: -4,
    scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});
```

Midground:

``` text
approximately -7%
```

Headline:

``` text
approximately -10%
```

These are starting values, not mandatory final values.

The visual goal is:

``` text
small depth difference
```

not:

``` text
large floating movement
```

------------------------------------------------------------------------

# 14. Parallax Headline

Example:

``` text
SECURITY
SHOULD BE
VISIBLE.
```

Secondary copy:

``` text
Turn every review into an understandable
path from finding to fix.
```

The headline should remain separated from the product image at every
breakpoint.

------------------------------------------------------------------------

# 15. Parallax Mobile Layout

On mobile:

``` text
BACKGROUND
    ↓
HEADLINE
    ↓
PRODUCT IMAGE
```

or:

``` text
HEADLINE
    ↓
PRODUCT IMAGE
```

depending on the supplied visual assets.

Never allow:

``` text
headline
overlaps
product image
```

At:

``` text
375px
390px
412px
```

the text and image must remain independently readable.

------------------------------------------------------------------------

# 16. Reduced Motion --- Parallax

For:

``` text
prefers-reduced-motion: reduce
```

disable all layer offsets.

The section should become:

``` text
static background
+
static product image
+
static headline
```

No ScrollTrigger parallax should be initialized for this section.

------------------------------------------------------------------------

# 17. STICKY-SCROLL SECURITY WALKTHROUGH

The sticky section follows immediately after the parallax section.

Purpose:

> Explain the complete review pipeline while the product visualization
> remains visible.

Layout:

``` text
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  LEFT                                    RIGHT            │
│                                                           │
│  01  SUBMIT CODE                         ┌─────────────┐  │
│                                          │             │  │
│  Paste or upload your source.            │ PRODUCT     │  │
│                                          │ VISUAL      │  │
│                                          │             │  │
│  ↓                                       │             │  │
│                                          └─────────────┘  │
│                                                           │
│  02  FIND RISKS                                           │
│                                                           │
│  Security patterns and AI reasoning                       │
│  identify potential problems.                             │
│                                                           │
│                                                           │
│  03  FIX WITH CONTEXT                                     │
│                                                           │
│  Understand the issue and see a safer version.            │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 18. Sticky Visual

The right-side visual remains pinned.

It should change based on the active step.

### Step 1

``` text
CODE INPUT
```

Visual:

``` text
┌───────────────────────┐
│ Python                │
│                       │
│ query = ...           │
│ user_id = ...         │
│                       │
└───────────────────────┘
```

### Step 2

``` text
ANALYSIS
```

Visual:

``` text
┌───────────────────────┐
│ ANALYZING             │
│                       │
│ ✓ Syntax              │
│ ✓ Security patterns   │
│ ● AI context review   │
└───────────────────────┘
```

### Step 3

``` text
FIX
```

Visual:

``` text
┌───────────────────────┐
│ HIGH                  │
│ SQL INJECTION         │
│                       │
│ Why it matters        │
│ Suggested fix         │
│                       │
│ [View safer code]     │
└───────────────────────┘
```

------------------------------------------------------------------------

# 19. Sticky Copy Blocks

Exactly three major blocks should be used for the initial walkthrough.

## Block 01

### `01 — SUBMIT`

**Your code goes in.**

Paste a snippet or upload a source file. Select the language and start
the review.

Active state:

``` text
opacity: 1
transform: translateY(0)
accent: visible
```

Inactive:

``` text
opacity: 0.35
```

------------------------------------------------------------------------

## Block 02

### `02 — UNDERSTAND`

**Findings become understandable.**

Potential bugs and security risks are connected to relevant code and
explained in simple language.

------------------------------------------------------------------------

## Block 03

### `03 — FIX`

**Leave with an actionable change.**

See a safer or improved version instead of receiving only a warning.

------------------------------------------------------------------------

# 20. Sticky Active-State Animation

Use GSAP ScrollTrigger.

When a block becomes active:

``` text
opacity:
0.35 → 1

translateY:
20px → 0

border/accent:
inactive → active
```

Timing:

``` text
300–600ms
```

Use restrained easing.

Do not create aggressive slides.

------------------------------------------------------------------------

# 21. Sticky Scroll Trigger Logic

Concept:

``` javascript
ScrollTrigger.create({
    trigger: stickySection,
    start: "top top",
    end: "bottom bottom",
    pin: visual,
    scrub: false
});
```

Each copy block should have its own trigger.

The active state must be based on scroll position, not mouse
interaction.

At the end of block three:

``` text
visual releases
        ↓
next section continues
```

There must be no jump.

------------------------------------------------------------------------

# 22. Sticky Mobile Behavior

At:

``` text
390px
```

change from two columns to one:

``` text
VISUAL
  ↓
01
  ↓
02
  ↓
03
```

The visual appears above the copy.

Do not pin the visual in the same way on mobile if that causes:

-   overlap;
-   excessive viewport consumption;
-   scroll trapping.

Use a normal-flow visual with lightweight transitions.

------------------------------------------------------------------------

# 23. PRODUCT CARDS

Product/security features should use cards inspired by modern
developer-security interfaces.

Recommended cards:

``` text
┌─────────────────────────────┐
│ SAST                        │
│                             │
│ Detect suspicious patterns  │
│ before they become issues.  │
│                             │
│ [Explore →]                 │
└─────────────────────────────┘
```

Potential cards:

1.  AI Code Review
2.  Security Findings
3.  Severity Analysis
4.  Safe Fix Suggestions
5.  Secrets Detection
6.  Code Quality
7.  Multi-language Review
8.  Before/After Diff

Only display capabilities actually implemented.

------------------------------------------------------------------------

# 24. Product Card Grid

Desktop:

``` text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ AI REVIEW    │ │ SECURITY     │ │ BUGS         │
│              │ │              │ │              │
│ visual       │ │ visual       │ │ visual       │
│              │ │              │ │              │
│ Learn →      │ │ Learn →      │ │ Learn →      │
└──────────────┘ └──────────────┘ └──────────────┘
```

Tablet:

``` text
2 columns
```

Mobile:

``` text
1 column
```

------------------------------------------------------------------------

# 25. HOVER ANIMATION --- PRODUCT CARDS

Every interactive product card should use the same motion system.

On desktop hover:

``` text
card:
translateY(-4px)

shadow:
small → medium

image:
scale(1.03)

CTA:
opacity 0 → 1
translateY(8px) → 0
```

The image must be clipped:

``` css
overflow: hidden;
```

so the image never spills outside the card.

------------------------------------------------------------------------

# 26. Hover Timing

Use GSAP.

Total transition:

``` text
< 300ms
```

Suggested:

``` text
duration: 0.22–0.28s
ease: power2.out
```

The interaction should feel:

``` text
springy
controlled
responsive
```

not:

``` text
bouncy
slow
dramatic
```

------------------------------------------------------------------------

# 27. Reduced Motion --- Cards

With:

``` text
prefers-reduced-motion: reduce
```

disable:

-   image scaling;
-   card translation;
-   CTA movement.

Allow only:

``` text
shadow change
```

or no animation at all.

------------------------------------------------------------------------

# 28. Touch Devices

Do not leave cards stuck in a hover state.

On touch:

``` text
tap
 ↓
temporary active state
 ↓
release
```

The card should return naturally.

The CTA must remain accessible without relying on hover.

------------------------------------------------------------------------

# 29. CODE REVIEW WORKSPACE

After the marketing/story sections, transition into the actual
application.

Heading:

``` text
REVIEW YOUR CODE.
```

The workspace should resemble a professional engineering tool.

------------------------------------------------------------------------

# 30. Workspace Layout

Desktop:

``` text
┌──────────────────────────────────────────────────────────────┐
│ REVIEW                                    Python ▼           │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│ CODE                         │ REVIEW                        │
│                              │                               │
│ 01 import ...                │ 02 FINDINGS                   │
│ 02 user_id = ...             │                               │
│ 03 query = ...        ←──────│ HIGH                          │
│ 04 execute(query)            │ SQL Injection                 │
│                              │                               │
│                              │ User-controlled input reaches │
│                              │ the SQL query.                 │
│                              │                               │
│                              │ [View fix]                     │
│                              │                               │
└──────────────────────────────┴───────────────────────────────┘
```

------------------------------------------------------------------------

# 31. Code Panel

The code panel should feel like an IDE.

Use:

-   line numbers;
-   syntax highlighting;
-   monospaced font;
-   subtle current-line highlight;
-   highlighted finding ranges;
-   horizontal scrolling where needed.

Do not over-style the code.

------------------------------------------------------------------------

# 32. Findings Panel

Use a structured security-review layout.

Top:

``` text
REVIEW COMPLETE

8 findings
```

Severity summary:

``` text
● 0 Critical
● 2 High
● 4 Medium
● 2 Low
```

Then findings.

------------------------------------------------------------------------

# 33. Finding Card

Example:

``` text
┌─────────────────────────────────────────┐
│ HIGH                                     │
│ Possible SQL Injection                  │
│                                         │
│ Python · Lines 12–13                   │
│                                         │
│ User input appears to reach a SQL       │
│ query without parameterization.         │
│                                         │
│ Why it matters                          │
│ The input may alter the query.          │
│                                         │
│ [ View safer fix ]                      │
└─────────────────────────────────────────┘
```

Severity must use both:

-   text;
-   icon/badge;
-   restrained color.

Never rely on color alone.

------------------------------------------------------------------------

# 34. Severity Visual Language

Suggested:

``` text
CRITICAL  — strong red
HIGH      — red/orange
MEDIUM    — amber
LOW       — muted blue/gray
INFO      — neutral gray
```

Use these colors sparingly.

The interface should remain mostly monochrome.

------------------------------------------------------------------------

# 35. Finding Filters

At the top of the findings panel:

``` text
ALL    CRITICAL    HIGH    MEDIUM    LOW
```

Optional:

``` text
Security
Bugs
Quality
```

If confidence is implemented:

``` text
Severity
Likelihood
Confidence
```

CodeAnt's application-security documentation describes severity,
likelihood and confidence filtering as part of its security workflow;
these concepts can inform the product's filtering model, without copying
its interface. citeturn0search3

------------------------------------------------------------------------

# 36. Finding Detail Drawer

Clicking a finding opens a detail view.

Desktop:

``` text
┌──────────────────────────────────────────┐
│ HIGH                                 ×   │
│ Possible SQL Injection                   │
│                                          │
│ Location                                 │
│ app.py:12–13                             │
│                                          │
│ Problem                                  │
│ ...                                      │
│                                          │
│ Why it matters                           │
│ ...                                      │
│                                          │
│ Suggested fix                            │
│ ...                                      │
│                                          │
│ [ Apply / Copy fix ]                     │
└──────────────────────────────────────────┘
```

Do not turn the product into a chatbot.

The assistant should feel like an engineering review tool.

------------------------------------------------------------------------

# 37. BEFORE / AFTER SECTION

Create a dedicated remediation section.

Headline:

``` text
DON'T JUST FIND IT.
FIX IT.
```

Layout:

``` text
BEFORE                         AFTER
──────────────────             ──────────────────
unsafe code                    safer code

query = "..."+id               query = "... ?"
                               execute(query,(id,))
```

Use a diff-like visual.

------------------------------------------------------------------------

# 38. Before / After Animation

As the user scrolls:

``` text
BEFORE
  ↓
finding highlight
  ↓
transition
  ↓
AFTER
```

The animation should be short.

Do not animate code character-by-character unless it is purely
decorative and does not delay comprehension.

------------------------------------------------------------------------

# 39. SECURITY COVERAGE SECTION

Use an editorial security section inspired by the category structure of
CodeAnt's security product.

Possible categories:

``` text
SAST
SCA
SECRETS
DEPENDENCIES
CODE QUALITY
```

Only include categories actually implemented.

The CodeAnt reference groups code-security capabilities around SAST,
SCA, Secrets, SBOM and other security layers; use this as an
information-architecture reference, not as a claim that this project
implements all of them. citeturn0view0

------------------------------------------------------------------------

# 40. Coverage Visual

Example:

``` text
WHAT WE CHECK

┌───────────────┐
│ CODE          │
│ ───────────── │
│ Logic         │
│ Security      │
│ Input         │
└───────────────┘

┌───────────────┐
│ DEPENDENCIES  │
│ ───────────── │
│ Risk          │
│ Versions      │
└───────────────┘

┌───────────────┐
│ SECRETS       │
│ ───────────── │
│ Tokens        │
│ Credentials   │
└───────────────┘
```

------------------------------------------------------------------------

# 41. Trust / Engineering Section

Use a dark editorial section:

``` text
SECURITY SHOULD
NOT REQUIRE A
SECURITY EXPERT.
```

Supporting text:

``` text
Every finding is connected to the code,
explained in plain language, and paired
with an actionable improvement.
```

This communicates the product's main differentiation.

------------------------------------------------------------------------

# 42. FINAL CTA

Final section:

``` text
┌──────────────────────────────────────────────┐
│                                              │
│       READY TO REVIEW YOUR CODE?             │
│                                              │
│       Find the risk before it ships.         │
│                                              │
│             [ Review Code ]                  │
│                                              │
└──────────────────────────────────────────────┘
```

Do not use a generic:

``` text
Get Started
```

as the only CTA.

Use action-oriented product language.

------------------------------------------------------------------------

# 43. Motion System

All animation should use a consistent motion language.

## Fast UI

``` text
180–300ms
```

Examples:

-   card hover;
-   button state;
-   dropdown;
-   finding selection.

## Medium

``` text
400–700ms
```

Examples:

-   section reveal;
-   sticky active state;
-   detail drawer.

## Scroll-linked

``` text
scrubbed
```

Examples:

-   parallax;
-   sticky product walkthrough.

Avoid long animations that make the interface feel slow.

------------------------------------------------------------------------

# 44. GSAP Architecture

Use one GSAP installation.

Recommended:

``` javascript
gsap.registerPlugin(ScrollTrigger);
```

Organize animation modules:

``` text
animations/
├── hero.js
├── parallax.js
├── stickyWalkthrough.js
├── cards.js
└── reveals.js
```

If the existing application is vanilla JavaScript, keep this
architecture compatible with it.

Do not introduce another animation framework.

------------------------------------------------------------------------

# 45. Scroll Reveal

Use subtle section reveals.

Example:

``` text
opacity:
0 → 1

y:
24px → 0
```

Duration:

``` text
500–700ms
```

Use only on major content groups.

Do not animate every paragraph and icon individually.

------------------------------------------------------------------------

# 46. Parallax + Sticky + Cards Interaction Priority

The page should contain three major motion moments:

``` text
1. PARALLAX
   Establish depth

2. STICKY WALKTHROUGH
   Explain workflow

3. HOVER CARDS
   Add tactile product interaction
```

This creates enough motion without making the page chaotic.

------------------------------------------------------------------------

# 47. Scroll Rhythm

The experience should feel continuous:

``` text
Hero
 ↓
small transition
 ↓
Parallax
 ↓
small transition
 ↓
Sticky walkthrough
 ↓
Product workspace
 ↓
Findings
 ↓
Remediation
 ↓
CTA
```

Avoid huge empty spaces.

Premium whitespace is allowed, but every large gap should have a design
reason.

------------------------------------------------------------------------

# 48. Mobile Design

Mandatory test widths:

``` text
375px
390px
412px
768px
1024px
1440px
1920px
```

At 390px:

-   no horizontal page overflow;
-   navigation remains usable;
-   hero remains readable;
-   parallax layers stack;
-   headline never overlaps image;
-   sticky visual becomes normal-flow content;
-   product cards become one column;
-   code panel scrolls horizontally if required;
-   findings stack;
-   before/after becomes vertical or horizontally scrollable.

------------------------------------------------------------------------

# 49. Mobile Navigation

Desktop:

``` text
Logo
Product
Security
How it works
Docs
[Review]
```

Mobile:

``` text
LOGO                         ☰
```

Menu opens as a compact full-width panel.

Do not create an oversized mobile dashboard.

------------------------------------------------------------------------

# 50. Accessibility

Required:

-   semantic headings;
-   keyboard navigation;
-   visible focus;
-   `aria-label` for icon-only controls;
-   sufficient contrast;
-   severity communicated through text;
-   reduced-motion support;
-   code selectable;
-   findings readable without animation;
-   no essential information hidden behind hover.

------------------------------------------------------------------------

# 51. Reduced Motion Global Behavior

For:

``` text
prefers-reduced-motion: reduce
```

Disable:

-   parallax offsets;
-   sticky transition movement;
-   decorative scroll reveals;
-   card translation;
-   image scaling.

Keep:

-   content;
-   navigation;
-   product interactions;
-   code review;
-   findings;
-   fixes.

For cards, a shadow-only state change is acceptable.

------------------------------------------------------------------------

# 52. Performance

Prioritize:

-   GPU-friendly transforms;
-   opacity;
-   `will-change` only where useful;
-   no continuous animation loops;
-   no excessive blur;
-   lazy loading of below-fold images;
-   optimized product screenshots;
-   no oversized videos unless necessary;
-   avoid layout-triggering animation.

The page should remain responsive while the security workspace is
loaded.

------------------------------------------------------------------------

# 53. Loading States

Use product-specific loading states.

Example:

``` text
ANALYZING CODE

✓ Parsing source
✓ Checking security patterns
● AI review
○ Preparing recommendations
```

Do not fake progress percentages.

If the backend does not expose stage progress, use a simple
indeterminate state.

------------------------------------------------------------------------

# 54. Error States

Example:

``` text
REVIEW FAILED

We couldn't complete this review.

[Try again]
```

For malformed code:

``` text
CODE COULD NOT BE PARSED

Check the selected language and try again.
```

For unsupported language:

``` text
LANGUAGE NOT SUPPORTED

Choose one of the available analysis languages.
```

------------------------------------------------------------------------

# 55. Product Empty State

Before code is entered:

``` text
NO CODE TO REVIEW

Paste a snippet or upload a source file
to start your security review.

[Paste code]    [Upload file]
```

The empty state should still look polished and technical.

------------------------------------------------------------------------

# 56. Microcopy

Prefer:

``` text
Review code
Analyze
Potential issue
Why it matters
Suggested fix
View code
Compare changes
Copy fix
Review again
```

Avoid:

``` text
Ask AI anything
Magic
AI magic
Super intelligence
Your code is definitely vulnerable
```

The product should sound like engineering software.

------------------------------------------------------------------------

# 57. AI Assistant Behavior

If an AI assistant/chat interface is included, it should be secondary.

Do not make the homepage primarily a chatbot.

Preferred:

``` text
Finding
 ↓
Explain
 ↓
Suggested fix
 ↓
Optional "Ask about this finding"
```

Not:

``` text
Chatbot
 ↓
Everything
```

------------------------------------------------------------------------

# 58. Code Review Interaction

The central interaction should be:

``` text
USER
  ↓
CODE
  ↓
REVIEW
  ↓
FINDING
  ↓
EXPLANATION
  ↓
FIX
```

Every visual decision should reinforce this path.

------------------------------------------------------------------------

# 59. Security Dashboard Direction

If a dashboard route exists, it should resemble a security operations
workspace rather than a generic analytics dashboard.

Example:

``` text
┌─────────────────────────────────────────────────────────┐
│ SECURITY OVERVIEW                                       │
│                                                         │
│  24 Findings       3 High       8 Medium       13 Low │
│                                                         │
├──────────────────────────────┬──────────────────────────┤
│ FINDINGS                     │ RISK DISTRIBUTION        │
│                              │                          │
│ HIGH  SQL Injection          │       HIGH               │
│ HIGH  Hard-coded secret      │      ███                 │
│ MED   Unsafe input           │                          │
│                              │       MEDIUM             │
└──────────────────────────────┴──────────────────────────┘
```

Do not invent real metrics.

------------------------------------------------------------------------

# 60. CodeAnt-Inspired Information Architecture

The reference demonstrates a strong security-product hierarchy:

``` text
CODE SECURITY
      ↓
SECURITY FINDINGS
      ↓
SEVERITY / CONTEXT
      ↓
REMEDIATION
      ↓
SECURITY POSTURE
```

The assistant should adapt this to the smaller hackathon scope:

``` text
CODE REVIEW
      ↓
FINDINGS
      ↓
SEVERITY
      ↓
EXPLANATION
      ↓
SAFER CODE
```

CodeAnt's public security pages emphasize security findings, SAST, SCA,
Secrets and structured security workflows.
citeturn0search0turn0view0

------------------------------------------------------------------------

# 61. Codex-Inspired Interaction Principles

The Codex reference emphasizes an engineering command-center workflow
around tasks, code context, reviews and changed files.
citeturn0search2turn0search1

Adapt those principles as:

``` text
CODE CONTEXT
     +
REVIEW STATE
     +
FINDINGS
     +
ACTION
```

The interface should always make clear:

``` text
What was reviewed?
What was found?
Why does it matter?
What should I change?
```

------------------------------------------------------------------------

# 62. Do Not Build a Copy

The implementation must not reproduce the reference websites
pixel-for-pixel.

Instead:

``` text
REFERENCE QUALITY
      +
PROJECT REQUIREMENTS
      +
OWN BRANDING
      =
FINAL UI
```

The resulting application should be recognizably its own product.

------------------------------------------------------------------------

# 63. Recommended Homepage Wireframe

``` text
══════════════════════════════════════════════════════════════

NAVIGATION

CODE REVIEW & SECURITY
Product   Security   How it works   Docs       [Review]

══════════════════════════════════════════════════════════════

HERO

                 FIND THE RISK.
                 FIX THE CODE.

      AI-assisted code review for safer software.

                [ REVIEW CODE ]

              ┌───────────────────┐
              │ CODE              │
              │                   │
              │ ⚠ HIGH RISK       │
              │ SQL Injection     │
              └───────────────────┘

══════════════════════════════════════════════════════════════

PARALLAX

       SECURITY
       SHOULD BE
       VISIBLE.

                 [PRODUCT IMAGE]

══════════════════════════════════════════════════════════════

STICKY WALKTHROUGH

SUBMIT                 ┌───────────────┐
Paste your code       │               │
                      │ PRODUCT       │
UNDERSTAND            │ VISUAL        │
Find the risk        │               │
                      └───────────────┘
FIX
See the safer version

══════════════════════════════════════════════════════════════

REVIEW WORKSPACE

┌──────────────────────┬─────────────────────────────────────┐
│ CODE                 │ FINDINGS                            │
│                      │                                     │
│ source...            │ HIGH — SQL Injection                │
│                      │                                     │
│                      │ MEDIUM — Input Handling             │
└──────────────────────┴─────────────────────────────────────┘

══════════════════════════════════════════════════════════════

DON'T JUST FIND IT.
FIX IT.

BEFORE                  AFTER
unsafe                  safer

══════════════════════════════════════════════════════════════

SECURITY COVERAGE

SAST       BUGS       SECRETS       QUALITY

══════════════════════════════════════════════════════════════

READY TO REVIEW?

             [ REVIEW CODE ]

══════════════════════════════════════════════════════════════
```

------------------------------------------------------------------------

# 64. Acceptance Criteria

## Visual

-   [ ] Dark premium developer/security aesthetic.
-   [ ] Strong editorial typography.
-   [ ] Product UI is visible early.
-   [ ] No generic AI-dashboard appearance.
-   [ ] Consistent spacing and border system.
-   [ ] Responsive at all required widths.

## Parallax

-   [ ] Three visual layers.
-   [ ] Background moves subtly.
-   [ ] Product image moves at a different speed.
-   [ ] Headline moves at a different speed.
-   [ ] GSAP ScrollTrigger used.
-   [ ] Headline never overlaps product image.
-   [ ] Mobile stacking works.
-   [ ] Reduced motion disables offsets.

## Sticky Walkthrough

-   [ ] Three copy blocks.
-   [ ] Right visual pins on desktop.
-   [ ] Active block fades/highlights.
-   [ ] GSAP ScrollTrigger used.
-   [ ] Pin releases cleanly.
-   [ ] No end-of-section jump.
-   [ ] Mobile becomes one column.
-   [ ] Visual appears above copy on mobile.
-   [ ] 390px readability verified.

## Product Cards

-   [ ] Card lifts slightly.
-   [ ] Shadow increases.
-   [ ] Image scales slightly.
-   [ ] Image remains clipped.
-   [ ] CTA fades from bottom.
-   [ ] Transition is under 300ms.
-   [ ] GSAP controls timing.
-   [ ] Reduced motion disables movement.
-   [ ] Touch state works without hover trapping.

## Code Review

-   [ ] Code input works.
-   [ ] File upload works.
-   [ ] Review action works.
-   [ ] Findings render.
-   [ ] Severity renders.
-   [ ] Explanation renders.
-   [ ] Suggested fix renders.
-   [ ] Before/after comparison works.

------------------------------------------------------------------------

# 65. Final Design Philosophy

The experience should feel like:

``` text
A SECURITY PRODUCT
BUILT FOR DEVELOPERS
```

not:

``` text
AN AI LANDING PAGE
WITH A CODE EDITOR
```

The visual story should progress:

``` text
ATTENTION
   ↓
DEPTH
   ↓
UNDERSTANDING
   ↓
INTERACTION
   ↓
EVIDENCE
   ↓
ACTION
```

The three requested motion systems have distinct jobs:

``` text
PARALLAX
= establish depth

STICKY SCROLL
= explain the workflow

HOVER
= provide tactile product feedback
```

Motion must remain subordinate to the product.

The final user journey should be:

``` text
SEE THE PRODUCT
      ↓
UNDERSTAND THE VALUE
      ↓
SEE HOW REVIEW WORKS
      ↓
SUBMIT CODE
      ↓
SEE THE RISK
      ↓
UNDERSTAND THE RISK
      ↓
FIX THE CODE
```

That is the core visual and interaction identity of the **AI Code Review
& Security Assistant**.
