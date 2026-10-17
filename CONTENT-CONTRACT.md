# content.json contract (v1)

`index.html` (public site) and the local admin editor both read **one file**: `content.json`. The site only displays it.
The admin writes it. Nothing else in the app holds text, links or images for the room.

```
portfolio-room/
  index.html            the room (display only); room.js and room.css hold its code and styles
  style.css             shared by the room and the editor: palette, cursors, pixel scrollbars, flag menu
  icons.js              shared Pixelarticons (MIT) and the language flags
  content.json          ALL room text and panel content, every language (committed and pushed)
  content.schema.json   machine-readable version of this contract
  assets/               room art, sprites, cursors
  content/              your own images and files: thumbnails, photo, gallery, cv.pdf
  private.json          your private notes (NEVER pushed, never read by the site)
  start-editor.bat      starts server.js and opens the editor (NEVER pushed)
  server.js, admin/     the local editor (NEVER pushed)
```

Everything marked NEVER pushed is listed in `.gitignore`.

## Running it

`content.json` is loaded with `fetch`, which browsers block for files opened by double-click. Double-click
`start-editor.bat` (it serves the site at http://localhost:8080 too), or use any local server from the project folder:

- `python -m http.server 8000`, then open http://localhost:8000
- or `npx serve`

If `content.json` can't be loaded (double-click, or the file is missing), the site shows the built-in placeholder
content and logs a warning in the browser console. It never shows a blank page.

## Rules

- Valid JSON: double quotes, no trailing commas, no comments.
- `schemaVersion` must be `1`. If the shape changes later it becomes `2`, and the site refuses to guess.
- Text is plain text. HTML is not rendered. `\n` in dialogue lines = a new line in the dialogue.
- Paths are relative to `index.html` (e.g. `content/thumbs/pixel-planner.png`) or full `https://` URLs.
- Links: `https://`, `mailto:` or `tel:` only. Anything else is ignored.
- Empty string `""` means "not set". Optional fields can be left out or empty.
- `"placeholder": true` on a section shows the purple "Placeholder content" tag. Set it to `false` when the section has
  real data.

## site

| Field          | Type                | Req | Notes                        |
| -------------- | ------------------- | --- | ---------------------------- |
| `title`        | text, 60 chars max  | yes | Browser tab title            |
| `description`  | text, 160 chars max | yes | Search and link-preview text |
| `previewImage` | string              | no  | 1200x630, for shared links   |

## projects

| Field         | Type          | Req | Notes                                                |
| ------------- | ------------- | --- | ---------------------------------------------------- |
| `placeholder` | boolean       | no  |                                                      |
| `items`       | array, 12 max | yes | Order = order on screen. 2 to 6 is ideal. Best first |

Each item (every project has the same shape):

| Field         | Type                     | Req | Notes                                                     |
| ------------- | ------------------------ | --- | --------------------------------------------------------- |
| `id`          | string `a-z 0-9 -`       | yes | Unique, never changes                                     |
| `name`        | string, 28               | yes | 1 to 3 words                                              |
| `thumbnail`   | string                   | no  | 16:9 photo, GIF or MP4/WebM clip. Empty = placeholder art |
| `description` | string, 80               | yes | One line: what it does and for whom                       |
| `tags`        | string[], 3 max, 14 each | no  |                                                           |
| `badge`       | string, 10               | no  | "Featured", "New", "Soon" or empty                        |
| `cta.label`   | string, 14               | yes | Button text ("Live demo", "Repo")                         |
| `cta.url`     | string                   | yes | Main button of the detail view. Empty = no button         |
| `say`         | text, 100                | no  | Seif's line when the card is hovered                      |
| `detail`      | object                   | no  | Detail view the card grows into when clicked              |

`detail`: `summary` (400), `role` (40, also shown on the card footer), `stack` (string[]), `highlight` (160), `gallery`
(6 max, each `{ "type": "image"|"video", "src", "alt" }`: photos, GIFs, MP4/WebM clips under 15 MB that play muted on a
loop, or a YouTube/Vimeo link; the thumbnail is shown first), `links` (`[{ "label", "url" }]`).

## cv

| Field         | Type                | Req | Notes                                                     |
| ------------- | ------------------- | --- | --------------------------------------------------------- |
| `placeholder` | boolean             | no  |                                                           |
| `photo`       | string              | no  | Square, 400x400 or larger. Empty = silhouette             |
| `name`        | string, 32          | yes |                                                           |
| `role`        | string, 48          | yes |                                                           |
| `summary`     | string, 240         | no  | 2 to 3 sentences                                          |
| `experience`  | array, 6 max        | no  | `{ company, role, start, end, bullets[6 max] }`           |
| `education`   | array, 4 max        | no  | `{ school, degree, start, end }`                          |
| `skills`      | array, 6 groups max | no  | `{ group, items[] }`                                      |
| `extra`       | array, 4 max        | no  | `{ title, text }` other CV sections, one line per row     |
| `languages`   | string[]            | no  | Spoken languages                                          |
| `pdf`         | text                | no  | CV file (PDF best; Word, ODT, RTF, text). Empty hides it  |
| `say`         | text, 100           | no  | Seif's line while the CV paper is hovered                 |

It is one paper. If the content is long, the text shrinks to fit (down to a floor), so stay inside the limits above or
it gets tiny. Click the paper to zoom.

## contact

| Field         | Type          | Req | Notes                                                   |
| ------------- | ------------- | --- | ------------------------------------------------------- |
| `placeholder` | boolean       | no  |                                                         |
| `links`       | array, 1 to 6 | yes | Order = order on the board. An odd last pin is centered |

Each link: `id` (string), `label` (14), `url`, and optionally `icon`, `iconImage` and `say` (100, Seif's line while the
pin is hovered).

- `icon`: `linkedin`, `github`, `gmail` are built in. Anything else falls back to a generic arrow-link pin.
- `iconImage`: optional 24x24 pixel PNG, used when `icon` isn't built in.

## Languages

The room speaks English, Tounsi (`aeb`), French (`fr`) and German (`de`); visitors pick one with the flag in the corner.
Fields marked _text_ (and every `say` line) take either a plain string, which is English, or one string per language:

```json
"say": { "en": "Click the paper to read it.", "fr": "Clique sur la feuille pour la lire." }
```

A language left out uses the English text. Translatable: the site title and description; each project's name,
description, button text, `say` and detail summary, role and highlight; the CV role, summary, `say`, experience roles
and bullets, education degrees and skill group names; each contact pin's label and `say`. Names, companies, schools,
dates, tags and links stay as they are. The editor's Translation screen lists all of them, page by page.

## ui

Every other piece of room text: the dialogue intros, the room title, button labels, hints and the screen-reader names.
Lines are grouped by type (`dialogue`, `titles`, `buttons`, `hints`, `screenReader`) and keyed by id:

```json
"ui": {
  "dialogue": {
    "projects.intro": {
      "section": "projects",
      "where": "Dialogue banner when Seif reaches the tech lab (Projects).",
      "text": { "en": "The tech lab, this is where the experiments grow...\nLet me pull up the projects." }
    }
  }
}
```

- `section`: the editor page that shows the line. `global` lines are on the editor's Translation screen; the others sit
  under "Room text" on the Projects, CV or Contact page (the intro is the banner at the top of each page).
- `where`: where the line appears. The editor keeps `section` and `where` in sync with the built-in list.
- `text`: always `{ "en": ..., "aeb": ..., "fr": ..., "de": ... }`. `{name}` slots are filled in by the room. In
  `site.name`, the part in `{braces}` is drawn in amber.
- A line missing from content.json uses the built-in default. Older files kept the intros in `projects.intro`,
  `cv.intro` and `contact.intro`; the room still reads those, and the editor moves them into `ui` on load.

## Images

- Under 300 KB each. Big files slow the first visit.
- Same size and look for all thumbnails.
- Keep pixel art as PNG. Don't re-export it blurry.

## private.json

Your own notes, progress and TODOs, in whatever shape you like. The site never reads it. Keep it in `.gitignore`.
