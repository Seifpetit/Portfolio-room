# Seif's Room

A pointer-only isometric pixel-art portfolio room. Walk the capybara to the tech lab (Projects), the bureau (CV) or the corkboard (Contact).

All panel content lives in `content.json` (see `CONTENT-CONTRACT.md`).

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` by double-click shows the built-in placeholders only, because browsers block `fetch` on local files.

## Deploy

Static files only. GitHub Pages: Settings > Pages > Deploy from branch `main`, root.
