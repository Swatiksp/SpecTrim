# SpecTrim: notes for Claude Code

Owner: Swatik (NC State, GD 503). She presented SpecTrim at the IBM symposium and is running live user tests with this site.

## What is here
- `index.html`: the story page, generated from `src/story/` by `python3 src/story/build.py`. Never edit `index.html` by hand; edit the sources and rebuild.
- `prototype/`: a compiled React and Tailwind bundle (no source) plus `test-tasks.js`. Do not edit the bundle unless asked; the task panel is separate on purpose.
- Source parts: `part1_head.html` (tokens and base CSS), `part2_body.html` (markup), `part3.js` to `part6.js` and `ws_code.js` (behaviour, one IIFE that `build.py` joins), `part4/5/6.css`, `ws_data.js` and `ex_data.js` (interface scene lifted from her website), `lenis.min.js` (smooth scroll, bundled).

## How she works
- Short answers. No unrequested changes. Ask before changing wording; she decides copy.
- Dark UI only. Type scale 12 / 14 / 20 / 36. Eyebrows in sentence case.
- Buttons all share one style (rounded rectangle, grey fill, thin grey border, icon chip with an arrow). On hover the chip fades into the button, the button grows 10px and the arrow turns. Start and Pass it on point right, then turn down; the others point top-right, then turn right. The CSS is the "v25 buttons" block at the end of `part6.css`.

## Testing
Playwright (Chromium) was used. Block the font requests (`/fonts\.(googleapis|gstatic)/`) so pages render offline. Check no horizontal overflow and no page errors at 1360x800, 1280x640 and 400x800.

## Open items
- Test scenarios are final unless she says otherwise; see `SCN` in `part6.js`.
- Q&A answers in the hidden presenter panel are still "[add your answer]". The presenter panel, feedback panel and slide counter are hidden by CSS, not deleted.
- Check "MGXD" on the cover (she once wrote "MGXT").
