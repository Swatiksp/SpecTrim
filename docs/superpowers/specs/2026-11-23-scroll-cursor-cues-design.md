# Scroll and cursor cues: design

## Why
Visitors go through SpecTrim alone during live user tests. The page should show them how to move through it (when to scroll, what to click) so they finish the presentation in **4 minutes at most**. The time is never shown; it only sets how long and how often cues run.

## Goals
- Show, don't tell: a ghost cursor acts out the one action each section needs.
- A scroll cue says "move on" once a section has played.
- Never slow down someone who already knows what to do.

## Non-goals and anti-goals
- No timer, progress clock or auto-advance on screen.
- No new copy unless Swatik approves it (cues are wordless by default).
- A cue that plays while the visitor is busy, repeats, or blocks a click counts as a failure.

## Approaches
- **A. Ghost cursor plus scroll cue (picked).** Shows how to use each section; most work; needs a touch version.
- B. Static pulsing rings and a "Scroll" chip. Cheap, but points rather than teaches.
- C. Auto-advancing tour. Ruled out: fights self-paced testing.

## Behaviour
- **Trigger:** a section becomes active and the visitor is idle (no pointer, key, wheel or touch) for **4 s**.
- **Demo:** at most **2.5 s**, once per section per visit. Any input cancels it at once and marks it done.
- **Scroll cue:** a mouse outline with a moving wheel, bottom centre, above the existing key hint. Shows when a section's demo is done or skipped and the visitor is idle for 4 s; hides on scroll. On the last section it never shows.
- **Budget:** cues only fire on idle, so an active visitor loses nothing. Worst case added wait: 8 sections × ~6.5 s ≈ 52 s, which keeps a hesitant visitor within 4 minutes when sections average about 20 s each.

## Per section
| Section | Cue |
|---|---|
| Start (b0) | Cursor glides to Start, click ripple |
| Where we are (b1) | Scroll cue only (scroll-scrubbed) |
| The catch (b2) | Cursor clicks Pass it on; scroll cue after the chain finishes |
| Not alone (bS1) | Scroll cue only |
| Making sense of it (b5) | Cursor hovers one map dot, then clicks it to pin |
| The idea (b11) | Cursor clicks the second tab |
| The interface (b9) | Scroll cue only (scroll-scrubbed) |
| Let's test it out (b12) | Cursor clicks the first scenario card; no scroll cue |

The demo only shows the gesture (cursor plus ripple); it does not press the real control, so the visitor still does it themselves.

## Look
- Dark UI only. Cursor: white arrow, about 20 px, soft shadow. Click: ring ripple in `--hi`.
- Phones and touch (`pointer:coarse`): a fingertip dot that taps instead of an arrow; the scroll cue becomes a short swipe-up stroke. The current key hint stays hidden there.
- Reduced motion: no gliding; the target gets a static ring for 2.5 s; the scroll cue holds still.

## Build notes (builder's calls)
- New `cues.js` and a CSS block in `part6.css`, joined by `build.py`; `index.html` is rebuilt, never hand-edited.
- Hooks into the existing active-beat state (`cur` / `activate` in `part3.js`) instead of adding new scroll maths.
- Overlay is `pointer-events:none`, `aria-hidden`, and sits under the presenter panels.
- Test with Playwright at 1360x800, 1280x640 and 400x800: no horizontal overflow, no page errors.
