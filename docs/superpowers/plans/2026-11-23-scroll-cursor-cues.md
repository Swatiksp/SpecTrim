# Scroll and Cursor Cues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wordless ghost-cursor demos and a scroll cue that play only when a visitor is idle, so the story fits in 4 minutes.

**Architecture:** One new source file, `src/story/cues.js`, joined into the page's single IIFE by `build.py` after `part6.js`, so it can read `beats`, `cur` and `tdone`. It watches each beat's `active` class with a MutationObserver, so nothing existing is rewired. Styles go in a "cues" block at the end of `part6.css`.

**Tech Stack:** Plain JS and CSS in the existing build. No new libraries.

**Spec:** `docs/superpowers/specs/2026-11-23-scroll-cursor-cues-design.md`

## Global Constraints
- Idle trigger 4 s; demo ≤ 2.5 s; each section's demo plays at most once per visit.
- Any `pointerdown`, `pointermove` (over 8 px), `wheel`, `keydown`, `touchstart` or `scroll` cancels a running cue and resets the idle timer.
- No text in cues. Dark UI only. Click ripple uses `--hi`.
- The demo never clicks the real control.
- Overlay: `pointer-events:none`, `aria-hidden="true"`, z-index below `#pr`/`#fb` panels and above content.
- Edit sources only; rebuild `index.html` with `python3 src/story/build.py`.
- No commits or pushes unless Swatik asks.

## Review Focus
- Visitor jumps sections fast (keys or wheel) while a demo is mid-glide → the demo stops at once and never plays on the wrong section.
- Visitor returns to a section already demoed → no replay; the scroll cue may still show.
- Window resized mid-demo → the cursor targets the control's current position (measure on each frame, not once).
- Target control is off screen or hidden (phone layout) → skip that demo silently and mark it done.
- `prefers-reduced-motion` → no gliding; a static ring on the target for 2.5 s.

---

### Task 1: Cue engine and scroll cue

**Files:**
- Create: `src/story/cues.js`
- Modify: `src/story/build.py` (append `r('cues.js')` after `r('part6.js')` in `js=`)
- Modify: `src/story/part6.css` (append a `/* cues */` block)

**Interfaces:**
- Produces: `CUE` object in the IIFE scope: `CUE.done:Set<string>` (beat ids demoed), `CUE.cancel():void`, `CUE.idleMs=4000`, `CUE.demoMs=2500`; DOM `#cue-scroll` (mouse outline with `i` wheel dot) and `#cue-ptr` (cursor layer); `html.cue-touch` set when `matchMedia('(pointer:coarse)')`.

- [ ] **Step 1: Write the check** in the scratchpad (`cues_check.js`, run in the page with the browser tool): after loading, `document.querySelector('#cue-scroll')` and `#cue-ptr` exist with `aria-hidden="true"` and `pointer-events:none`; with no input for 4.2 s on b1, `#cue-scroll.on` is true; a `wheel` event removes `.on` within 100 ms; on b12 `.on` never appears.
- [ ] **Step 2: Run it on the current build** → expect FAIL (elements missing).
- [ ] **Step 3: Implement** the idle timer, cancel listeners, `active`-class observer and scroll cue in `cues.js`. Scroll cue shows on idle when the active beat's demo is done or it has none, except on b12. On b2 it waits for `tdone`. Touch: swipe-up stroke instead of the wheel. Position: bottom centre, 44 px above `#hint`.
- [ ] **Step 4: Rebuild and run the check** → PASS, no console errors.

### Task 2: Ghost cursor demos

**Files:**
- Modify: `src/story/cues.js`, `src/story/part6.css`

**Interfaces:**
- Consumes: `CUE` from Task 1.
- Produces: `DEMO` map, beat id → `{target:()=>Element|null, hover?:boolean}`:
  - `b0` → `#b0 .btn` (Start), click
  - `b2` → `#tgo`, click
  - `b5` → first visible `#b5 .qd`, hover, then click
  - `b11` → second tab button in `#b11`, click
  - `b12` → `#scn .scn-item:first-child .scn`, click

- [ ] **Step 1: Extend the check:** idle 4.2 s on b2 → `#cue-ptr` gains `.on` and its box ends within 12 px of `#tgo`'s chip centre by 2.5 s; `CUE.done.has('b2')`; `#tgo` was not clicked (`#wh` lacks `.run`); a keydown mid-demo removes `.on` within 100 ms; re-entering b2 does not replay. Reduced motion (emulate in the browser): target gets `.cue-ring` and no transform transition.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the glide (from the bottom-right of the viewport to the target centre, ease-out, ~1.4 s), ripple (0.5 s), hold, then fade, all within 2.5 s. Re-measure the target every frame. Missing or off-screen target → mark done and skip. Touch: a 22 px fingertip dot with a tap scale instead of the arrow.
- [ ] **Step 4: Rebuild and run** → PASS.

### Task 3: Viewport and regression check

- [ ] **Step 1:** At 1360x800, 1280x640 and 400x800: `document.documentElement.scrollWidth <= innerWidth`, no page errors, and a screenshot of one demo and the scroll cue at each size.
- [ ] **Step 2:** Click through Start → test section with no idling; confirm no cue ever appears (an active visitor loses no time).
- [ ] **Step 3:** Report to Swatik with screenshots; wait for her to ask before committing.
