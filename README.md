# SpecTrim: story and prototype

Two static pages. No build step is needed to deploy them.

| Path | What it is |
|---|---|
| `index.html` | **SpecTrim Story**, the symposium presentation (scroll-driven). Its "Open in prototype" buttons open the prototype below. |
| `prototype/index.html` | **SpecTrim prototype**, used for the live user test. |
| `prototype/test-tasks.js` | The bottom-left "Tasks" panel that shows the scenario tasks during testing (drag it by its title; tabs 1 and 2 switch scenario; `?scenario=2` in the link picks the scenario). |
| `src/story/` | Sources of the story and `build.py`, which regenerates `index.html`. |

## Run it locally
```
python3 -m http.server 8000
```
Open http://localhost:8000/. (Opening the files directly also works.)

## Deploy
Any static host works. The site root is this folder.
- **GitHub Pages:** push to GitHub, then Settings, Pages, deploy from branch `main`, folder `/ (root)`.
- **Vercel or Netlify:** import the repository. Framework: none. Build command: none. Output directory: `.`
- Send testers the root URL. The scenario buttons on the last slide open the prototype with the right task list.

## Edit the story
Change files in `src/story/`, then run `python3 src/story/build.py`. It rewrites `index.html`.
- Test scenarios and tasks: `const SCN=[...]` near the end of `src/story/part6.js`.
- The prototype link is `PU` just above it.
- The prototype is a compiled bundle with no source here, so edit its tasks in `prototype/test-tasks.js` (keep them identical to the story).

## Notes
- The IBM Plex fonts load from Google Fonts, so the pages need a network connection to look right.
- The prototype keeps no saved state. Reload it before each test pair.
- The deployed pages are public to anyone with the link. The story shows a quote from a participant with a job title (P5, Director of Software Engineering); decide whether you are happy for that to be public.
