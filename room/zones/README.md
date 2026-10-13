# Room zones

A zone is a spot in the room the capybara can walk to: it glows on hover, has a floating label, says a line when
he arrives, and opens its own panel. Each zone is one file in this folder, and one `<script>` line in `index.html`
turns it on:

```html
<!-- Interactive zones: one file each in room/zones/, one line here turns a zone on (see room/zones/README.md) -->
<script src="room/zones/projects.js"></script>
<script src="room/zones/cv.js"></script>
<script src="room/zones/socials.js"></script>
<script src="room/zones/bookshelf.js"></script>
```

The order of these lines is the order of the shortcut buttons under the room. Zone files load right after
`room-scene.js` and before the rest of the room code, so they only *declare* things; anything that touches the
page runs later, inside the zone's own functions.

## Adding a zone

The easy way is the editor's **Zones** page (`start-editor.bat`, then Zones in the top bar):

1. Type a name in the **New zone** box under the list and press +. The editor creates `room/zones/<id>.js` from the
   template below and adds its `<script>` line to `index.html`.
2. Draw it on the room with the tools: **Select** (V: pick a zone, drag it to move it, click empty floor or press Esc
   to let go), **Outline** (the area that glows and takes clicks), **Stand spot** (where he stops), **Footprint**
   (floor he can't walk through; the red and green dots update as you draw) and **Test walk** (click the floor: a cyan
   hologram of him walks from there to the zone, in a loop). The wheel zooms, Space or the middle button drags the
   room, 0 fits it back.
   Press **Save zone file**.
3. Write its name and arrival line in the **Text** tab, then the top bar's Save (and Save + Publish).

Colours on that page tell the two kinds of change apart. **Cyan** is zone code (`room/zones/*.js` and the line in
`index.html`): it is saved with Save zone file and goes live only with a git push, never with Publish. **Gold** is
text (`content.json`): Save, then Save + Publish, as everywhere else in the editor. The thin bar at the bottom of the
page lists the site code waiting for a push; click it for the git command, which sends all of it (never half a change)
and leaves your text to Publish.

The floor brushes on the same page, **Walkable** (G) and **No-go** (X), work with or without a zone picked: drag over
tiles to make them walkable or not; Shift+drag or right-click gives tiles back to the footprints. Painted tiles show
bigger, with a dark rim. **Save floor** writes them into the `FLOOR` block of `room/room-scene.js`, which also goes live
with a git push.

The editor only ever rewrites the block between `// <zone-settings>` and `// </zone-settings>` in a zone file. It
checks the file before writing and keeps the old copy in `admin/backups/`. Everything else in the file (its panel,
`build()`, helpers, default text) is yours to write by hand. The red and green **switch** on each zone's row adds or
removes its line in `index.html` and keeps the file. You can still do it all by hand: copy the template below and add
the `<script>` line yourself.

## The fields

| Field      | Needed | What it does                                                                                                                     |
| ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | yes    | Short name. Used by the shortcut button, the dialogue, and `room.css` as `.dialog[data-panel="<id>"]`.                           |
| `name`     | yes    | UI copy id of the zone's name: room label, shortcut button and panel title.                                                      |
| `intro`    | yes    | UI copy id of what Seif says when he gets there.                                                                                 |
| `icon`     | yes    | Pixelarticon in front of the room label: a name in the `PXI` map of `icons.js` (copy new ones from `pixelarticons/svg`).          |
| `poly`     | yes    | Outline of the furniture for the hover glow and taps, as `d2([[x, y], ...])` in 2x room coordinates.                             |
| `stand`    | yes    | `[x, y]` in room pixels (1x) where the capybara stops to use it.                                                                 |
| `build()`  | yes\*  | Returns the panel content (a DOM node or fragment). Read text from `CONTENT` with `tr()` and `ui()`; build with `el()`.          |
| `float`    | no     | `true`: the content floats over the dimmed room and the dialogue banner stays up (all three current zones do this).              |
| `blocked`  | no     | Floor footprint he cannot walk through, `d2([...])`.                                                                             |
| `occluder` | no     | Image of the furniture cut out of the room (like `assets/occ-bureau.png`), repainted over him when he walks behind `blocked`.    |
| `copy`     | no     | Default text for the zone's own lines, shaped like `ui` in `content.json`: `{ titles: { id: {...} }, dialogue: { id: {...} } }`. |
| `css`      | no     | Path of the zone's own stylesheet (`room/zones/<id>.css`), loaded with the zone.                                                 |
| `shortcut` | no     | `false` leaves the zone out of the shortcut buttons.                                                                             |
| `panel`    | no     | `false`: no panel (\*so no `build()`, no shortcut button). He says his line and keeps playing the zone's animation until he walks off. |
| `anim`     | no     | The capybara's own animation at this zone instead of the shared reach-in (see below).                                            |
| `opened()` | no     | Runs once the panel is on screen: wire up listeners, draw canvases.                                                              |
| `closed()` | no     | Runs whenever any panel closes: put the zone's own state back (the CV unzooms, Projects closes its detail view).                 |
| `press(e)` | no     | A press on the dimmed backdrop while this zone's panel is open; return `true` to keep the panel open.                            |
| `init()`   | no     | Runs once when the room starts: room-wide listeners such as resize or keyboard.                                                  |

Helpers declared at the top of a zone file share one global scope with the rest of the room, so give them names
that belong to the zone (`drawDesk`, `fitCv`) to keep two files from clashing.

## The capybara's animation at a zone

Without `anim`, every zone plays the shared `assets/capybara-interact.png`: reach in, keep working while the dialogue or
panel is up, then turn back. With `anim`, the zone plays its own sheet instead:

```js
anim: {
  sheet: "assets/capybara-sit.png", // same layout as the other capybara sheets: 64x64 frames, 4 per row
  frames: 12, // how many frames the sheet holds
  fps: 8, // speed, frames per second (10 if left out)
  intro: 4, // frames 0-3 play once when he starts (0 if left out)
  loop: [4, 5, 6, 7, 6, 5], // then these repeat while he is busy (every frame after the intro if left out)
  outro: [3, 2, 1, 0], // played once when he stops, before he walks off (nothing if left out)
},
```

`loopFps` and `outroFps` set different speeds for the loop and the outro. If the sheet fails to load, the zone falls
back to the shared animation. A zone with `panel: false` and an `anim` is a "rest" spot: he sits (or lies, or reads)
until you click elsewhere, then plays the outro and walks.

## Template

```js
// =================================================================================================
// BOOKSHELF ZONE
// =================================================================================================

// The bookshelf: walking up to it opens a shelf of books Seif likes.
zone({
  // <zone-settings> written by the editor's Zones page; edit it there, or by hand keeping both marker lines
  id: "bookshelf", // panel id: shortcut button, dialogue and room.css rules ([data-panel="bookshelf"])
  name: "name.bookshelf", // UI copy id of its room label, shortcut button and panel title
  intro: "bookshelf.intro", // UI copy id of Seif's line when he gets there
  icon: "file-text", // Pixelarticon in front of its room label (new ones go in icons.js, see its header)
  float: true, // the content floats over the dimmed room while the dialogue banner stays up
  css: "room/zones/bookshelf.css", // the zone's own styles
  // Outline for the hover glow and taps, in hi-res room coordinates (halved by d2).
  poly: d2([
    [100, 300],
    [180, 280],
    [180, 420],
    [100, 440],
  ]),

  stand: [110, 230], // where the capybara stands to use it
  // </zone-settings>

  // Default text of the zone's lines; the editor lists them and content.json overrides them.
  copy: {
    // Room label, shortcut button and panel title.
    titles: {
      "name.bookshelf": { section: "global", where: "Room label over the bookshelf.", text: { en: "Books" } },
    },

    // What Seif says when he reaches the shelf.
    dialogue: {
      "bookshelf.intro": { section: "global", where: "Dialogue at the bookshelf.", text: { en: "My shelf." } },
    },
  },

  // Builds the panel content.
  build() {
    const f = document.createDocumentFragment();
    f.append(el("p", "sample-note", "Books go here."));
    return f;
  },
});
```
