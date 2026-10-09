# content.json contract (v1)

`index.html` (public site) and the local admin editor both read **one file**: `content.json`. The site only displays it. The admin writes it. Nothing else in the app holds text, links or images for the three panels.

```
Seif-portfolio room/
  index.html            the room (display only)
  content.json          ALL panel content (committed and pushed)
  content.schema.json   machine-readable version of this contract (for validation / the admin form)
  private.json          your private notes and progress (NEVER pushed, never read by the site)
  admin.html            local editor (NEVER pushed), added later
  assets/               room art, sprites, cursors
  content/              your own images and files: thumbnails, photo, gallery, cv.pdf
```

Add `private.json` and `admin.html` to `.gitignore`.

## Running it

`content.json` is loaded with `fetch`, which browsers block for files opened by double-click. Use a local server from the project folder:

- `python -m http.server 8000`, then open http://localhost:8000
- or `npx serve`

If `content.json` can't be loaded (double-click, or the file is missing), the site shows the built-in placeholder content and logs a warning in the browser console. It never shows a blank page.

## Rules

- Valid JSON: double quotes, no trailing commas, no comments.
- `schemaVersion` must be `1`. If the shape changes later it becomes `2`, and the site refuses to guess.
- Text is plain text. HTML is not rendered. `\n` in `intro` fields = a new line in the dialogue.
- Paths are relative to `index.html` (e.g. `content/thumbs/pixel-planner.png`) or full `https://` URLs.
- Links: `https://`, `mailto:` or `tel:` only. Anything else is ignored.
- Empty string `""` means "not set". Optional fields can be left out or empty.
- `"placeholder": true` on a section shows the purple "Placeholder content" tag. Set it to `false` when the section has real data.

## site

| Field | Type | Req | Notes |
|---|---|---|---|
| `title` | string, 60 chars max | yes | Browser tab title |
| `description` | string, 160 chars max | yes | Search and link-preview text |
| `previewImage` | string | no | 1200x630, for shared links |

## projects

| Field | Type | Req | Notes |
|---|---|---|---|
| `placeholder` | boolean | no | |
| `intro` | string | yes | What Seif says on arrival |
| `items` | array, 12 max | yes | Order = order on screen. 2 to 6 is ideal. Best first |

Each item (every project has the same shape):

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string `a-z 0-9 -` | yes | Unique, never changes |
| `name` | string, 28 | yes | 1 to 3 words |
| `thumbnail` | string | no | 16:9, 960x540 or larger, under 300 KB. Empty = generated placeholder art |
| `description` | string, 80 | yes | One line: what it does and for whom |
| `tags` | string[], 3 max, 14 chars each | no | |
| `badge` | string, 10 | no | "Featured", "New", "Soon" or empty |
| `cta.label` | string, 14 | yes | Button text ("Live demo", "Repo") |
| `cta.url` | string | yes | Empty = card does nothing on click |
| `say` | string, 100 | no | Seif's line when the card is hovered |
| `detail` | object | no | Reserved for the project detail view (next step). Fill it now, it is not shown yet |

`detail`: `summary` (400), `role` (40, also shown on the card footer), `stack` (string[]), `highlight` (160), `gallery` (4 max, each `{ "type": "image"|"video", "src", "alt" }`, images 16:9, video MP4 under 10 MB or a YouTube/Vimeo link), `links` (`[{ "label", "url" }]`).

## cv

| Field | Type | Req | Notes |
|---|---|---|---|
| `placeholder` | boolean | no | |
| `intro` | string | yes | What Seif says at the bureau |
| `photo` | string | no | Square, 400x400 or larger. Empty = silhouette |
| `name` | string, 32 | yes | |
| `role` | string, 48 | yes | |
| `summary` | string, 240 | no | 2 to 3 sentences |
| `experience` | array, 3 max | no | `{ company, role, start, end, bullets[2 max, 90 chars] }` |
| `education` | array, 2 max | no | `{ school, degree, start, end }` |
| `skills` | array, 3 groups max | no | `{ group, items[] }`, about 10 items total |
| `languages` | string[] | no | Spoken languages |
| `pdf` | string | no | Empty hides the "Download CV" button |

It is one paper. If the content is long, the text shrinks to fit (down to a floor), so stay inside the limits above or it gets tiny. Click the paper to zoom.

## contact

| Field | Type | Req | Notes |
|---|---|---|---|
| `placeholder` | boolean | no | |
| `intro` | string | yes | What Seif says at the corkboard |
| `links` | array, 1 to 6 | yes | Order = order on the board. An odd last pin is centered |

Each link: `id` (string), `label` (14), `url`, and optionally `icon` and `iconImage`.

- `icon`: `linkedin`, `github`, `gmail` are built in. Anything else falls back to a generic arrow-link pin.
- `iconImage`: optional 24x24 pixel PNG, used when `icon` isn't built in.

## Images

- Under 300 KB each. Big files slow the first visit.
- Same size and look for all thumbnails.
- Keep pixel art as PNG. Don't re-export it blurry.

## private.json

Your own notes, progress and TODOs, in whatever shape you like. The site never reads it. Keep it in `.gitignore`.
