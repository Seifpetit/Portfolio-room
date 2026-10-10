(() => {
  // ===============================================================================================
  // SCENE CONFIG
  // ===============================================================================================

  // Room pixels: room.png is 568x368, the 2752x1536 room-wide-hd.png cropped and averaged 4x.
  const ROOM_W = 568,
    ROOM_H = 368,
    K = 3; // K = internal resolution multiplier

  // Floor corners measured from room.png: back, right, front, left (the AI-drawn floor is not a perfect parallelogram)
  const CORNERS = { top: [260, 85], right: [555, 228], bottom: [310, 350], left: [15, 207] };
  const N = 26; // floor grid is N x N tiles

  // Image files to preload: the room, capybara animations and furniture cutouts.
  const SPRITES = {
    room: "assets/room.png",
    walk: "assets/capybara-walk-sheet.png",
    idle: "assets/capybara-idle3.png",
    interact: "assets/capybara-interact.png",
    idle2: "assets/capybara-idle2.png",
    idle4: "assets/capybara-idle4.png",
    drink: "assets/capybara-drink.png",
    "occ-gear": "assets/occ-gear.png",
    "occ-plant": "assets/occ-plant.png",
    "occ-bureau": "assets/occ-bureau.png",
  };

  // capybara.png: 4 cols x 2 rows of 64x64 frames, one walk cycle drawn facing right; mirrored for left
  const CHAR = { frame: 64, cols: 4, frames: 8, footY: 60, scale: 1.15, facesLeft: false };

  // Objects are painted into the room; each has an outline for hover glow and taps, and a spot to stand on
  const d2 = (pts) => pts.map(([x, y]) => [x / 2, y / 2]);
  // ===============================================================================================
  // OBJECTS
  // ===============================================================================================

  // Clickable furniture hotspots that open the Projects, CV and Contact panels.
  const OBJECTS = [
    {
      id: "projects",
      // Outline of the Projects hotspot, halved from the hi-res room coordinates.
      poly: d2([
        [375, 135],
        [420, 128],
        [445, 150],
        [455, 115],
        [530, 105],
        [600, 110],
        [660, 170],
        [670, 260],
        [600, 265],
        [560, 290],
        [505, 300],
        [470, 300],
        [445, 290],
        [375, 250],
      ]),

      stand: [270, 165],
    },
    {
      id: "cv",
      // Outline of the CV hotspot, halved from the hi-res room coordinates.
      poly: d2([
        [880, 430],
        [960, 400],
        [1040, 355],
        [1075, 375],
        [1075, 470],
        [960, 545],
        [900, 540],
        [878, 500],
      ]),

      stand: [430, 238],
    },
    {
      id: "socials",
      // Outline of the Contact hotspot, halved from the hi-res room coordinates.
      poly: d2([
        [1012, 245],
        [1065, 232],
        [1110, 272],
        [1105, 350],
        [1060, 355],
        [1012, 320],
      ]),

      stand: [470, 190],
    },
  ];

  // ===============================================================================================
  // BLOCKED
  // ===============================================================================================

  // Floor areas that are not walkable (furniture footprints)
  const BLOCKED = [
    d2([
      [25, 420],
      [70, 435],
      [150, 405],
      [190, 390],
      [220, 370],
      [240, 365],
      [320, 375],
      [400, 410],
      [465, 380],
      [470, 340],
      [440, 290],
      [380, 260],
      [300, 225],
      [260, 235],
      [200, 300],
      [90, 330],
    ]),
    d2([
      [370, 260],
      [415, 300],
      [445, 295],
      [505, 305],
      [560, 290],
      [600, 275],
      [675, 265],
      [690, 215],
      [650, 190],
      [520, 195],
      [440, 215],
      [385, 230],
    ]),
    d2([
      [395, 570],
      [420, 520],
      [470, 490],
      [610, 500],
      [700, 545],
      [745, 625],
      [755, 650],
      [650, 705],
      [620, 700],
      [540, 640],
      [470, 610],
      [420, 595],
    ]),
    d2([
      [830, 345],
      [870, 330],
      [890, 350],
      [880, 365],
      [840, 365],
    ]),
    d2([
      [878, 450],
      [950, 425],
      [1080, 455],
      [1090, 500],
      [960, 550],
      [905, 540],
      [878, 500],
    ]),
  ];

  // ===============================================================================================
  // GEOMETRY
  // ===============================================================================================

  const { top: P00, right: P10, left: P01, bottom: P11 } = CORNERS;
  // Maps floor coordinates (u, v in 0..1) to room pixels with the bilinear floor-corner mapping.
  const toScreen = (u, v) =>
    [0, 1].map((k) => P00[k] * (1 - u) * (1 - v) + P10[k] * u * (1 - v) + P01[k] * (1 - u) * v + P11[k] * u * v);

  // Screen position of the centre of floor tile (i, j).
  const center = (i, j) => toScreen((i + 0.5) / N, (j + 0.5) / N);
  // Point-in-polygon test (ray casting), used for hotspots and blocked footprints.
  const inPoly = ([x, y], poly) => {
    let c = false;
    // Walks each polygon edge, pairing every vertex with the previous one.
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      // Flips inside/outside each time this edge crosses the ray from the point.
      const [xi, yi] = poly[i],
        [xj, yj] = poly[j];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }

    return c;
  };

  // tiles where he'd be mostly hidden behind tall furniture (computed by occ.py)
  const SQUEEZE = [];
  const blocked = new Set(SQUEEZE);
  // Marks every tile whose centre lies inside a furniture footprint as blocked.
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) if (BLOCKED.some((p) => inPoly(center(i, j), p))) blocked.add(i + "," + j);

  // True when tile (i, j) is on the grid and not blocked by furniture.
  const walkable = (i, j) => i >= 0 && j >= 0 && i < N && j < N && !blocked.has(i + "," + j);

  // ===============================================================================================
  // bfs()
  // ===============================================================================================

  // Breadth-first search over the walkable tiles from (si, sj); returns the parent map used to build paths.
  function bfs(si, sj) {
    // Starts the search at the capybara's tile with distance zero.
    const dist = new Map([[si + "," + sj, 0]]),
      prev = new Map(),
      q = [[si, sj]];

    // Visits tiles in order of distance from the start.
    while (q.length) {
      const [i, j] = q.shift();
      // Tries the four neighbouring tiles: right, left, down and up.
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        // Queues each unvisited walkable neighbour and remembers where it came from.
        const ni = i + di,
          nj = j + dj,
          k = ni + "," + nj;

        if (!walkable(ni, nj) || dist.has(k)) continue;
        dist.set(k, dist.get(i + "," + j) + 1);
        prev.set(k, [i, j]);
        q.push([ni, nj]);
      }
    }

    // Returns the reached distances and a helper that rebuilds the route to a tile.
    return {
      dist,
      // Lists the tiles from the start to (ti, tj), not counting the start tile.
      path: (ti, tj) => {
        const out = [];
        let c = [ti, tj];
        // Follows the parent links back from the target until the start is reached.
        while (c && !(c[0] === si && c[1] === sj)) {
          out.unshift(c);
          c = prev.get(c[0] + "," + c[1]);
        }

        return out;
      },
    };
  }

  // Tall furniture: when the character's feet are behind an object's front edge,
  // repaint its pixels (assets/occ-*.png) over him.
  const OCC = [
    ["gear", 2],
    ["plant", 3],
    ["bureau", 4],
  ].map(([id, bi]) => {
    // Keeps the furniture footprint and its left and right edges for quick checks.
    const poly = BLOCKED[bi],
      xs = poly.map((p) => p[0]);

    return { id, poly, minX: Math.min(...xs), maxX: Math.max(...xs) };
  });

  // lowest screen y of the footprint outline at x (its front edge)
  function frontY(o, x) {
    x = Math.min(Math.max(x, o.minX + 0.5), o.maxX - 0.5);
    let best = -Infinity;
    // Checks every edge of the footprint outline.
    for (let i = 0, j = o.poly.length - 1; i < o.poly.length; j = i++) {
      // The two end points of this edge.
      const [x1, y1] = o.poly[j],
        [x2, y2] = o.poly[i];

      // Keeps the lowest point where this edge passes over x.
      if ((x1 <= x && x <= x2) || (x2 <= x && x <= x1))
        best = Math.max(best, x1 === x2 ? Math.max(y1, y2) : y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
    }

    return best;
  }

  // ===============================================================================================
  // STATE
  // ===============================================================================================

  // Spawn tile: the walkable tile closest to a spot near the room's middle.
  const start = (() => {
    let b = null;
    // Scans every walkable tile on the grid.
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        if (!walkable(i, j)) continue;
        // Measures how far this tile's centre is from the preferred spawn spot.
        const c = center(i, j),
          e = Math.hypot(c[0] - 300, c[1] - 215);

        if (!b || e < b.e) b = { i, j, e };
      }

    return [b.i, b.j];
  })();

  // Capybara state: tile, screen position, route, facing, walk time and target object.
  const player = {
    gi: start[0],
    gj: start[1],
    pos: center(start[0], start[1]),
    path: [],
    left: true,
    moving: false,
    t: 0,
    pending: null,
  };

  // Floor marker for the clicked spot and the id of the hovered hotspot.
  let marker = null,
    hover = null;

  const SPEED = 80; // room px per second

  // Walks the capybara to the room point (px, py), optionally heading for an object to interact with.
  function goTo(px, py, obj) {
    const target = obj ? obj.stand : [px, py];
    const { dist, path } = bfs(player.gi, player.gj);
    let best = null;
    // Looks through every tile reachable from the capybara's current tile.
    for (const k of dist.keys()) {
      // Keeps the reachable tile closest to the target point.
      const [i, j] = k.split(",").map(Number),
        c = center(i, j),
        e = Math.hypot(c[0] - target[0], c[1] - target[1]);

      if (!best || e < best.e) best = { i, j, e };
    }

    if (!best) return;
    player.path = path(best.i, best.j).map(([i, j]) => ({ i, j, p: center(i, j) }));
    player.pending = obj || null;
    marker = obj ? null : { p: center(best.i, best.j), t: 0 };
    if (!player.path.length) arrive();
  }

  // Called when the walk ends: faces the object and starts its talk, or just idles.
  function arrive() {
    marker = null;
    // Arriving at an object: turn toward it and open its dialogue a moment later.
    if (player.pending) {
      const o = player.pending;
      player.pending = null;
      const cx = o.poly.reduce((a, p) => a + p[0], 0) / o.poly.length;
      player.left = cx < player.pos[0] - 10; // turn toward the object
      setTimeout(() => talk(o.id), 150);
    }
  }

  // ===============================================================================================
  // TITLE SCREEN: THE FIRST CLICK, TAP OR KEY ONLY DISMISSES IT
  // ===============================================================================================

  const title = document.getElementById("title");
  // Dismisses the title screen on the first click, tap or key once everything has loaded.
  function startRoom(e) {
    if (!title || title.classList.contains("out")) return;
    // Ignores input while the assets are still loading.
    if (!title.classList.contains("ready")) {
      // Swallows the event so it does not also walk the capybara.
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      return;
    } // still loading: keep the title up

    // Stops the dismissing input from reaching the room underneath.
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    title.classList.add("out");
    removeEventListener("keydown", startRoom, true);
    setTimeout(() => title.remove(), 400);
  }

  // Lets a pointer press or any key dismiss the title screen.
  if (title) {
    title.addEventListener("pointerdown", startRoom);
    addEventListener("keydown", startRoom, true);
  }

  // show the title in its pixel font only, never a fallback flash (give up waiting after 1.5 s)
  Promise.race([
    document.fonts ? document.fonts.load('600 1em "Pixelify Sans"') : 0,
    new Promise((r) => setTimeout(r, 1500)),
  ]).then(() => document.documentElement.classList.add("fonts"));

  // ===============================================================================================
  // CANVAS
  // ===============================================================================================

  // Room canvas, its drawing context and the stage that holds it.
  const canvas = document.getElementById("c"),
    ctx = canvas.getContext("2d"),
    stage = document.getElementById("stage");

  canvas.width = ROOM_W * K;
  canvas.height = ROOM_H * K;
  // Fits the canvas to the stage at an integer-friendly scale and redraws.
  function resize() {
    const r = stage.getBoundingClientRect();
    const s = Math.max(1, Math.min(r.width / ROOM_W, r.height / ROOM_H));
    canvas.style.width = Math.floor(ROOM_W * s) + "px";
    canvas.style.height = Math.floor(ROOM_H * s) + "px";
  }

  new ResizeObserver(resize).observe(stage);

  // a long-press on the room must not open a menu or select it
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("selectstart", (e) => e.preventDefault());
  const imgs = {};
  let loaded = 0;
  // Items to load (every sprite plus content.json) and the loading bar.
  const total = Object.keys(SPRITES).length + 1,
    bar = document.getElementById("load-bar");

  // Advances the loading bar by one loaded item.
  const tick = () => {
    loaded++;
    if (bar) bar.style.width = (100 * loaded) / total + "%";
  };

  // content.json next to index.html wins; if it can't be read (opened as a plain file, or missing)
  // the placeholder content built into index.html stays.
  const contentLoad = fetch("content.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((j) => {
      if (j && j.schemaVersion === 1) {
        CONTENT = j;
        applyContent();
      } else console.warn("content.json: unsupported schemaVersion");
    })
    .catch((e) => console.warn("content.json not loaded, using built-in placeholder content", e))
    .finally(tick);

  // Every load to wait for before the room starts: content.json and each sprite.
  const loads = [contentLoad].concat(
    Object.entries(SPRITES).map(
      ([k, src]) =>
        new Promise((res) => {
          const im = new Image();
          // Keeps the loaded image and advances the loading bar.
          im.onload = () => {
            imgs[k] = im;
            tick();
            res();
          };

          // Skips a missing image but still counts it so loading can finish.
          im.onerror = () => {
            tick();
            res();
          };

          im.src = src;
        }),
    ),
  );

  // Converts a pointer event to room pixel coordinates.
  function roomPoint(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * ROOM_W, ((e.clientY - r.top) / r.height) * ROOM_H];
  }

  // The interactive object under a room point, if any.
  const objectAt = (p) => OBJECTS.find((o) => inPoly(p, o.poly));
  // Tapping the room closes any dialogue and walks to the spot or object.
  canvas.addEventListener("pointerdown", (e) => {
    if (!overlay.hidden) return;
    endTalk(false);
    const p = roomPoint(e);
    goTo(p[0], p[1], objectAt(p));
  });

  // Highlights the hotspot under the pointer and shows the hand cursor over it.
  canvas.addEventListener("pointermove", (e) => {
    const o = objectAt(roomPoint(e));
    hover = o ? o.id : null;
    canvas.style.cursor = o ? "var(--hand)" : "var(--arrow)";
  });

  // Clears the hover highlight when the pointer leaves the room.
  canvas.addEventListener("pointerleave", () => {
    hover = null;
  });

  // Traces a closed polygon on the canvas context.
  const path = (poly) => {
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  };

  // Draws the glowing outline of the hovered or focused hotspot.
  function drawHover(t) {
    const o = OBJECTS.find((o) => o.id === hover);
    if (!o || !imgs.room) return;
    // brighten the painted object inside its outline
    ctx.save();
    path(o.poly);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.16 + 0.06 * Math.sin(t * 5);
    ctx.drawImage(imgs.room, 0, 0);
    ctx.restore();
  }

  // idle variation sheets, played in this order between stretches of the base idle loop
  const IDLE_VARS = [
    { key: "idle2", frames: 8 },
    { key: "idle4", frames: 16 },
    // drink ends by lowering the bottle again: frame 15, then row 1 col 0, row 0 col 3, then back to frame 0
    { key: "drink", frames: 19, seq: [...Array(16).keys(), 4, 3, 0] },
  ];

  // Idle variation timing, the queued drink and interact start and end times.
  let idleVar = null,
    varAt = 0,
    curVar = null,
    wantDrink = false,
    nextVar = 3,
    busyAt = null,
    freeAt = null;

  // Interact sheet frames: reach-in length, working loop and turn-back sequence.
  const INTRO = 8,
    LOOP = [8, 9, 10, 11, 12, 13, 14, 13, 12, 11, 10, 9],
    OUTRO = [15, 6, 5, 4, 3, 2, 1, 0];

  // "d" makes the capybara drink once; it waits for any other animation to finish and is ignored mid-drink
  addEventListener("keydown", (e) => {
    if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat) {
      if (!curVar || curVar.key !== "drink") wantDrink = true;
    }
  });

  // ===============================================================================================
  // interactFrame()
  // ===============================================================================================

  // interacting: reach in (0-7), keep working (8-14 back and forth) while the banner or panel is up, then turn back
  function interactFrame() {
    const busy = !!talkState || !overlay.hidden;
    // Remembers when the banner or panel opened to start the reach-in.
    if (busy && busyAt === null) {
      busyAt = clock;
      freeAt = null;
    }

    // Remembers when it closed to start the turn-back.
    if (!busy && busyAt !== null) {
      busyAt = null;
      freeAt = clock;
    }

    // While busy: play the reach-in once, then loop the working frames.
    if (busyAt !== null) {
      const k = Math.floor((clock - busyAt) * 10);
      return k < INTRO ? k : LOOP[Math.floor((k - INTRO) * 0.6) % LOOP.length];
    }

    // After closing: play the turn-back frames once, then return to idle.
    if (freeAt !== null) {
      const k = Math.floor((clock - freeAt) * 14);
      if (k < OUTRO.length) return OUTRO[k];
      freeAt = null;
    }

    return null;
  }

  // ===============================================================================================
  // drawPlayer()
  // ===============================================================================================

  // Draws the capybara: walk, idle, idle variation or interact frames, mirrored when facing left.
  function drawPlayer() {
    // Whether he is walking and where his feet are in the room.
    const walking = player.moving,
      [x, y] = player.pos;

    const act = walking || !imgs.interact ? (busyAt = freeAt = null) : interactFrame();
    // idle: base loop, with a variation sheet played once now and then; the variations take turns.
    // Pressing "d" queues the drink, which starts as soon as nothing else is playing.
    if (walking || act !== null) idleVar = curVar = null;
    else if (idleVar === null) {
      const loaded = IDLE_VARS.filter((v) => imgs[v.key]);
      // Picks the queued drink first, otherwise the next variation when it is due.
      if (wantDrink && imgs.drink) curVar = IDLE_VARS.find((v) => v.key === "drink");
      else if (clock > nextVar && loaded.length) curVar = loaded[varAt++ % loaded.length];

      // Starts the chosen variation and clears the drink request.
      if (curVar) {
        idleVar = clock;
        if (curVar.key === "drink") wantDrink = false;
      }
    }

    // Ends a finished variation and schedules the next one 4 to 9 seconds later.
    if (idleVar !== null && clock - idleVar >= curVar.frames / 6) {
      idleVar = curVar = null;
      nextVar = clock + 4 + Math.random() * 5;
    }

    // Chooses the sprite sheet for the current state: walk, interact, variation or idle.
    const im = walking
      ? imgs.walk
      : act !== null
        ? imgs.interact
        : idleVar !== null
          ? imgs[curVar.key]
          : imgs.idle || imgs.walk;

    ctx.fillStyle = "rgba(10,6,16,.35)";
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 5, 0, 0, 7);
    ctx.fill();
    if (!im) return;
    // Frame size and drawing scale of the capybara sprite.
    const f = CHAR.frame,
      s = CHAR.scale;

    // Picks the frame number within the chosen sheet for the current state.
    const n = walking
      ? Math.floor(player.t * 10) % CHAR.frames
      : act !== null
        ? act
        : idleVar !== null
          ? (curVar.seq || [...Array(curVar.frames).keys()])[
              Math.min(curVar.frames - 1, Math.floor((clock - idleVar) * 6))
            ]
          : imgs.idle
            ? Math.floor(clock * 5) % 16
            : 0;

    // Source position of that frame in the sheet grid.
    const sx = (n % CHAR.cols) * f,
      sy = Math.floor(n / CHAR.cols) * f;

    const flip = CHAR.facesLeft ? !player.left : player.left;
    ctx.save();
    ctx.translate(x, y - CHAR.footY * s);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, sx, sy, f, f, (-f * s) / 2, 0, f * s, f * s);
    ctx.restore();
  }

  // Repaints furniture cutouts over the capybara when he is behind them.
  function drawOccluders() {
    const [x, y] = player.pos;
    // Draws each furniture cutout he is partly behind, over the capybara.
    for (const o of OCC) {
      const im = imgs["occ-" + o.id];
      if (!im) continue;
      if (x + 18 < o.minX || x - 20 > o.maxX || y >= frontY(o, x)) continue; // sprite clear of it, or standing in front
      ctx.drawImage(im, 0, 0);
    }
  }

  // a Pixelarticon in front of each room label (same icons as the editor's home tiles)
  const LABEL_ICON = { projects: "briefcase", cv: "file-text", socials: "contact" };
  // Draws a Pixelarticon at 12 room pixels (one icon pixel = one room pixel), in the current fill colour.
  // The icons sit on an odd or even 2-unit grid; the offset lines their pixels up with the room's pixels.
  function labelIcon(name, x, y) {
    // The icon's SVG path and its first point, used to snap it to the room's pixels.
    const d = PXI[name],
      m = /M\s*(\d+)[ ,]+(\d+)/.exec(d) || [0, 0, 0];

    ctx.save();
    ctx.translate(x - (m[1] % 2) / 2, y - (m[2] % 2) / 2);
    ctx.scale(0.5, 0.5);
    ctx.fill(new Path2D(d));
    ctx.restore();
  }

  // Draws the floating name labels above the hotspots.
  function drawLabels(t) {
    ctx.font = `600 12px "Pixelify Sans", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Draws one label per hotspot.
    for (const o of OBJECTS) {
      // Horizontal and vertical extents of the hotspot outline.
      const xs = o.poly.map((p) => p[0]),
        ys = o.poly.map((p) => p[1]);

      // Centres the label above the hotspot with a gentle floating bob.
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
        cy = Math.min(...ys) - 14 + Math.sin(t * 2.4 + cx) * 1.6;

      // Label text (with an arrow when hovered), box width and left edge.
      const text = (hover === o.id ? "▸ " : "") + ui(NAME[o.id]),
        w = ctx.measureText(text).width + 30,
        x0 = Math.round(cx - w / 2);

      ctx.fillStyle = "rgba(14,10,22,.85)";
      ctx.fillRect(x0, cy - 10, w, 20);
      ctx.fillStyle = hover === o.id ? "#7ff3ff" : "#f4ead8";
      labelIcon(LABEL_ICON[o.id], x0 + 6, Math.round(cy) - 6);
      ctx.fillText(text, x0 + 22 + (w - 30) / 2, cy + 1);
    }
  }

  // Time of the last frame and the running animation clock in seconds.
  let last = performance.now(),
    clock = 0;

  // ===============================================================================================
  // frame()
  // ===============================================================================================

  // Main animation loop: moves the capybara along its path and redraws the scene each frame.
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    // Follows the queued route one tile at a time.
    if (player.path.length) {
      // Distance to the next tile and how far he can move this frame.
      const n = player.path[0],
        dx = n.p[0] - player.pos[0],
        dy = n.p[1] - player.pos[1],
        d = Math.hypot(dx, dy),
        step = SPEED * dt;

      player.moving = true;
      player.t += dt;
      if (Math.abs(dx) > 0.01) player.left = dx < 0;
      // Close enough: snap onto the tile and take it off the route.
      if (d <= step) {
        player.pos = n.p.slice();
        player.gi = n.i;
        player.gj = n.j;
        player.path.shift();
        // Route finished: stop walking and handle the arrival.
        if (!player.path.length) {
          player.moving = false;
          arrive();
        }
      } else player.pos = [player.pos[0] + (dx / d) * step, player.pos[1] + (dy / d) * step];
    } else player.moving = false;

    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, ROOM_W, ROOM_H);
    if (imgs.room) ctx.drawImage(imgs.room, 0, 0);
    drawHover(clock);
    // Draws the pulsing ring on the floor where the player clicked.
    if (marker) {
      marker.t += dt;
      const r = 6 + Math.abs(Math.sin(marker.t * 4)) * 3;
      ctx.strokeStyle = "#7ff3ff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(marker.p[0], marker.p[1], r * 1.8, r * 0.9, 0, 0, 7);
      ctx.stroke();
    }

    drawPlayer();
    drawOccluders();
    drawLabels(clock);
    requestAnimationFrame(frame);
  }

  // ===============================================================================================
  // DIALOGUE BANNER
  // ===============================================================================================

  const FLOAT = new Set(["projects", "cv", "socials"]); // panels whose content floats over the dimmed room, banner kept
  // all text, links and images shown in the panels come from content.json (see CONTENT-CONTRACT.md)
  const DEFAULT = JSON.parse(document.getElementById("content-default").textContent);
  let CONTENT = DEFAULT;
  const LINES = {};

  // ===============================================================================================
  // LANGUAGE AND UI COPY
  // ===============================================================================================

  // every piece of room text lives in content.json: section copy in its section, the rest under "ui",
  // grouped by type. A translatable value is a plain string or { en, aeb, fr, de }; English fills the gaps.
  let LANG = "en";
  // Restores the language chosen on a previous visit, if storage allows.
  try {
    LANG = localStorage.getItem("lang") || "en";
  } catch (e) {}

  if (!LANGS.some((l) => l.code === LANG)) LANG = "en";
  // The current language's text from a translatable value.
  const tr = (v) => (v && typeof v === "object" ? v[LANG] || v.en || "" : v || "");
  // Finds a UI copy entry by id in a ui block.
  const uiEntry = (block, id) => Object.values(block || {}).find((g) => g && g[id])?.[id];
  // older content.json files kept the dialogue intros inside their sections
  const LEGACY = { "projects.intro": "projects", "cv.intro": "cv", "contact.intro": "contact" };
  // A UI line in the current language: content.json, then an older intro field, then the built-in default.
  // {name}-style slots are filled from vars.
  function ui(id, vars) {
    // Looks up the line in content.json, then a legacy intro, then the built-in default.
    let e = uiEntry(CONTENT.ui, id),
      t = e ? tr(e.text) : "";

    if (!t && LEGACY[id] && CONTENT[LEGACY[id]]) t = tr(CONTENT[LEGACY[id]].intro);
    if (!t) t = tr((uiEntry(DEFAULT.ui, id) || { text: "" }).text);
    return t.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
  }

  const NAME = { projects: "name.projects", cv: "name.cv", socials: "name.contact" };
  // Sets an attribute on the first element matching a selector, if it is there.
  const attr = (sel, a, v) => document.querySelector(sel)?.setAttribute(a, v);
  // ===============================================================================================
  // applyStatic()
  // ===============================================================================================

  // Writes every fixed piece of page text (titles, buttons, hints, screen-reader names) in the current language.
  function applyStatic() {
    const parts = ui("site.name").split(/[{}]/); // "Seif's {Room}": the braced part is amber
    // Writes the site name into the header and title screen, braced part highlighted.
    document.querySelectorAll("header h1, .title-name").forEach((h) => {
      const s = document.createElement("span");
      s.textContent = parts[1] || "";
      h.replaceChildren(parts[0] || "", s, parts.slice(2).join(""));
    });

    document.querySelectorAll(".title-hint .mouse").forEach((x) => (x.textContent = ui("start.click")));
    document.querySelectorAll(".title-hint .touch").forEach((x) => (x.textContent = ui("start.tap")));
    document.querySelectorAll("nav [data-open]").forEach((b) => (b.textContent = ui(NAME[b.dataset.open])));
    const back = document.getElementById("close");
    back.replaceChildren(pxi("arrow-left"), ui("panel.back"));
    back.setAttribute("aria-label", ui("sr.back"));
    document.querySelector(".banner-name").textContent = ui("banner.name");
    attr(".banner-portrait", "alt", ui("sr.portrait"));
    attr("#c", "aria-label", ui("sr.room"));
    attr(".app nav", "aria-label", ui("sr.shortcuts"));
    attr("#title", "aria-label", ui("sr.start"));
    attr(".title-load", "aria-label", ui("sr.loading"));
    document.documentElement.lang = LANG;
    document.querySelectorAll(".flagpick").forEach((p) => p.refresh());
  }

  // Copies content.json (or the built-in placeholder) into the dialogue lines, the page text, title and description.
  function applyContent() {
    LINES.projects = [ui("projects.intro")];
    LINES.cv = [ui("cv.intro")];
    LINES.socials = [ui("contact.intro")];
    const site = CONTENT.site || {};
    if (tr(site.title)) document.title = tr(site.title);
    const d = document.querySelector('meta[name="description"]');
    if (d && tr(site.description)) d.content = tr(site.description);
    applyStatic();
  }

  applyContent();
  // Returns the url only when it is http(s), mailto, tel or a relative path; anything else becomes empty.
  const safeUrl = (u) => (/^(https?:|mailto:|tel:|\.{0,2}\/?[\w%-][\w%./-]*$)/i.test(u || "") ? u : "");
  // Creates an element with an optional class and text content (text only, never HTML).
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  // True for a video file path (MP4 or WebM).
  const isVid = (p) => /\.(mp4|webm)(\?|#|$)/i.test(p || "");
  // ===============================================================================================
  // BUILD
  // ===============================================================================================

  // Panel builders: each returns the DOM content for one panel.
  const BUILD = {
    // =============================================================================================
    // projects()
    // =============================================================================================

    // Builds the Projects panel: a CRT screen with a horizontal row of project cards.
    projects() {
      // The Projects content, a fragment to fill, and the CRT monitor and its screen.
      const P = CONTENT.projects,
        f = document.createDocumentFragment(),
        mon = el("div", "monitor"),
        scr = el("div", "screen");

      const note = el("p", "sample-note");
      note.dataset.prompt = ui("projects.prompt") + " ";
      if (P.placeholder) note.append(el("span", "sample", ui("placeholder.tag")), " ");
      note.append(ui("projects.pick"));
      scr.append(note);
      const row = el("div", "pcards");
      // ===========================================================================================
      // P.items.forEach(...)
      // ===========================================================================================

      // One clickable card per project, opening its details on click.
      P.items.forEach((it, i) => {
        const card = el("button", "pcard");
        card.type = "button";
        card.dataset.say = tr(it.say) || ui("projects.hoverFallback", { name: tr(it.name) });
        const th = el("span", "pthumb");
        const shots = projectShots(it, "").filter((g) => g.type !== "video" || isVid(g.src)); // no players on cards
        // Thumbnail: a slideshow of the project's images, or a generated pixel canvas.
        if (shots.length) carousel(th, shots, "", 0, true);
        else {
          const c = el("canvas");
          c.width = 48;
          c.height = 32;
          c.dataset.seed = i + 3;
          th.append(c);
        }

        if (it.badge) th.append(el("span", "pbadge", it.badge));
        // Card body with the title, description and tag chips.
        const body = el("span", "pbody"),
          tags = el("span", "ptags");

        (it.tags || []).forEach((t) => tags.append(el("span", null, t)));
        body.append(el("span", "ptitle", tr(it.name)), el("span", "pdesc", tr(it.description)), tags);
        const foot = el("span", "pfoot");
        // Card footer: the role on the left, the call-to-action link on the right.
        foot.append(
          el("span", null, tr(it.detail && it.detail.role)),
          el("span", "pcta", ((it.cta && tr(it.cta.label)) || ui("projects.ctaFallback")) + " "),
        );

        foot.lastChild.append(pxi("arrow-right", 12));
        card.append(th, body, foot);
        card.setAttribute("aria-haspopup", "dialog");
        card.addEventListener("click", () => openProject(it, card, i));
        row.append(card);
      });

      scr.append(row);
      const bar = el("div", "pscroll");
      bar.setAttribute("aria-hidden", "true");
      bar.append(el("i"));
      scr.append(bar);
      mon.append(scr);
      const stand = el("div", "stand");
      stand.setAttribute("aria-hidden", "true");
      f.append(mon, stand);
      return f;
    },

    // =============================================================================================
    // cv()
    // =============================================================================================

    // Builds the CV panel: the paper document over the faint bureau.
    cv() {
      // The CV content, a fragment to fill, the scene and the bureau canvas behind it.
      const C = CONTENT.cv,
        f = document.createDocumentFragment(),
        scene = el("div", "cvscene"),
        desk = el("canvas", "desk");

      desk.width = 200;
      desk.height = 140;
      desk.setAttribute("aria-hidden", "true");
      const doc = el("article", "cvdoc");
      if (tr(C.say)) doc.dataset.say = tr(C.say); // Seif's line while the paper is hovered
      doc.tabIndex = 0;
      doc.setAttribute("aria-label", ui("sr.cv"));
      // CV header with the photo frame and the name and role.
      const top = el("div", "cvtop"),
        ph = el("div", "cvphoto");

      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", C.photo ? ui("sr.photo", { name: C.name }) : ui("sr.noPhoto"));
      // Shows the photo when one is set; otherwise the frame stays empty.
      if (C.photo) {
        ph.classList.add("has");
        const im = el("img");
        im.src = C.photo;
        im.alt = "";
        ph.append(im);
      }

      const who = el("div");
      who.append(el("p", "cvname", C.name), el("p", "cvrole", tr(C.role)));
      top.append(ph, who);
      doc.append(top);
      if (tr(C.summary)) doc.append(el("p", "cvsum", tr(C.summary)));
      // Adds a titled CV section when it has entries.
      const sec = (title, kids) => {
        if (!kids.length) return;
        const s2 = el("div", "cvsec");
        s2.append(el("h4", null, title));
        kids.forEach((k) => s2.append(k));
        doc.append(s2);
      };

      // Experience section: one entry per job.
      sec(
        ui("cv.experience"),
        (C.experience || []).map((x) => {
          const e = el("div", "cvent");
          // Job dates, role and company on one line.
          e.append(
            el("span", "cvwhen", [x.start, x.end].filter(Boolean).join(" - ")),
            el("b", null, tr(x.role)),
            " \u00B7 " + x.company,
          );

          // Bullet list of the job's highlights, when it has any.
          if ((x.bullets || []).length) {
            const ul = el("ul");
            x.bullets.forEach((b) => tr(b) && ul.append(el("li", null, tr(b))));
            e.append(ul);
          }

          return e;
        }),
      );

      // Education section: one entry per school.
      sec(
        ui("cv.education"),
        (C.education || []).map((x) => {
          const e = el("div", "cvent");
          // Study dates, degree and school on one line.
          e.append(
            el("span", "cvwhen", [x.start, x.end].filter(Boolean).join(" - ")),
            el("b", null, tr(x.degree)),
            " \u00B7 " + x.school,
          );

          return e;
        }),
      );

      // Skills section: one line per skill group with its items.
      sec(
        ui("cv.skills"),
        (C.skills || []).map((g) => {
          const e = el("p", "cvskill");
          if (tr(g.group)) e.append(el("b", null, tr(g.group) + ": "));
          e.append((g.items || []).join(", "));
          return e;
        }),
      );

      if ((C.languages || []).length) sec(ui("cv.languages"), [el("p", "cvskill", C.languages.join(", "))]);
      // CV footer and the PDF link, kept only when it is a safe URL.
      const foot = el("div", "cvfoot"),
        pdf = safeUrl(C.pdf);

      // Adds the download button for the CV PDF without zooming the paper.
      if (pdf) {
        const a = el("a", "cvdl", ui("cv.download"));
        a.prepend(pxi("download", 24));
        a.href = pdf;
        a.download = "";
        a.addEventListener("click", (e) => e.stopPropagation());
        a.addEventListener("keydown", (e) => e.stopPropagation());
        foot.append(a);
      }

      if (C.placeholder) foot.append(el("span", "sample", ui("placeholder.tag")));
      if (foot.children.length) doc.append(foot);
      scene.append(desk, doc);
      f.append(scene);
      return f;
    },

    // =============================================================================================
    // socials()
    // =============================================================================================

    // Builds the Contact panel: pixel icons pinned on the corkboard.
    socials() {
      // The Contact content, a fragment to fill, and the hint line above the board.
      const K = CONTENT.contact,
        f = document.createDocumentFragment(),
        note = el("p", "sample-note");

      if (K.placeholder) note.append(el("span", "sample", ui("placeholder.tag")), " ");
      note.append(ui("contact.pick"));
      f.append(note);
      // The corkboard, the icon grid pinned on it and the number of links.
      const cork = el("div", "cork"),
        grid = el("div", "socials"),
        n = K.links.length;

      // ===========================================================================================
      // K.links.forEach(...)
      // ===========================================================================================

      // One pinned icon per contact link.
      K.links.forEach((l, i) => {
        const a = el("a", "sicon");
        const url = safeUrl(l.url);
        a.href = url || "#";
        // Opens outside links in a new tab.
        if (/^https?:/i.test(url)) {
          a.target = "_blank";
          a.rel = "noopener";
        }

        if (n % 2 === 1 && i === n - 1 && n > 1) a.classList.add("mail"); // an odd last icon sits centered underneath
        // Logo badge styled per brand and the 24px canvas the logo is drawn on.
        const lg = el("span", "slogo " + ({ linkedin: "li", github: "gh", gmail: "gm" }[l.icon] || "gm")),
          cv = el("canvas");

        cv.width = 24;
        cv.height = 24;
        cv.setAttribute("aria-hidden", "true");
        // Uses a built-in logo, the link's own image, or the generic link pin.
        if (LOGOS[l.icon]) cv.dataset.logo = l.icon;
        else if (l.iconImage) cv.dataset.img = l.iconImage;
        else cv.dataset.logo = "link";

        lg.append(cv);
        a.append(lg, el("span", "slabel", tr(l.label)));
        if (tr(l.say)) a.dataset.say = tr(l.say); // Seif's line while this pin is hovered
        grid.append(a);
      });

      cork.append(grid);
      f.append(cork);
      return f;
    },
  };

  // Dialogue banner and the element its typed text goes into.
  const banner = document.getElementById("banner"),
    bText = document.getElementById("banner-text");

  // Current dialogue state and the project card being hovered.
  let talkState = null,
    hoverCard = null; // hoverCard: project card under the pointer, shown once his intro line is done

  // Starts the dialogue banner for an object, then opens its panel when the lines are done.
  function talk(id) {
    talkState = { id, i: 0, shown: 0, timer: null };
    banner.hidden = false;
    say();
    if (FLOAT.has(id)) openPanel(id); // cards and icons pop up right away while he talks
  }

  // Types the current dialogue line one character at a time.
  function say() {
    // The talk state and the line being typed.
    const st = talkState,
      line = LINES[st.id][st.i];

    st.shown = 0;
    bText.textContent = "";
    clearInterval(st.timer);
    // Reveals one more character every 28 ms.
    st.timer = setInterval(() => {
      bText.textContent = line.slice(0, ++st.shown);
      // Line fully typed: stop the typing timer.
      if (st.shown >= line.length) {
        clearInterval(st.timer);
        // After a short pause, swaps in the hovered card's line if there is one.
        st.hold = setTimeout(() => {
          st.held = true;
          if (hoverCard && talkState === st) bText.textContent = hoverCard.dataset.say;
        }, 1200);
      }
    }, 28);
  }

  // ===============================================================================================
  // advance()
  // ===============================================================================================

  // Click or key on the banner: finish the line, go to the next one, or end the talk.
  function advance() {
    const st = talkState;
    if (!st) return;
    const line = LINES[st.id][st.i];
    // Still typing: show the whole line at once.
    if (st.shown < line.length) {
      clearInterval(st.timer);
      st.shown = line.length;
      bText.textContent = line;
      // For floating panels, let a hovered card take over after the same pause.
      if (FLOAT.has(st.id))
        st.hold = setTimeout(() => {
          st.held = true;
          if (hoverCard && talkState === st) bText.textContent = hoverCard.dataset.say;
        }, 1200);

      return;
    }

    if (FLOAT.has(st.id)) return; // the floating content is already up
    // Moves on to the next dialogue line if there is one.
    if (st.i < LINES[st.id].length - 1) {
      st.i++;
      say();
      return;
    }

    endTalk(true);
  }

  // Ends the dialogue; opens the panel when asked to.
  function endTalk(open) {
    if (!talkState) return;
    clearInterval(talkState.timer);
    const id = talkState.id;
    talkState = null;
    banner.hidden = !(open && FLOAT.has(id)); // floating panels keep the capybara talking under the floating cards
    if (open) openPanel(id);
  }

  document.getElementById("banner-inner").addEventListener("pointerdown", advance);
  // Enter or Space advances the dialogue; Escape closes it.
  addEventListener("keydown", (e) => {
    if (talkState && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      advance();
    } else if (talkState && e.key === "Escape") endTalk(false);
  });

  // ===============================================================================================
  // PANELS
  // ===============================================================================================

  const overlay = document.getElementById("overlay");
  let opener = null;
  // ===============================================================================================
  // drawThumb()
  // ===============================================================================================

  // placeholder pixel-art thumbnails: a tiny night scene per seed
  function drawThumb(cv, seed) {
    // Thumbnail canvas, its context and size.
    const g = cv.getContext("2d"),
      W = cv.width,
      H = cv.height;

    let r = seed * 9301 + 49297;
    // Seeded pseudo-random number in 0..1, so each placeholder thumbnail looks the same every time.
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    // Colour palettes for the placeholder thumbnails: sky, ground, windows, moon.
    const pals = [
      ["#1b2a49", "#2f4f7a", "#7ff3ff", "#ffb347"],
      ["#2b1b3f", "#5a2f6a", "#ff7ab8", "#ffe9b8"],
      ["#12302c", "#1f6b5c", "#7bffb0", "#ffd36b"],
      ["#3a1f2b", "#8a4a3a", "#ffb347", "#7ff3ff"],
    ];

    const p = pals[seed % pals.length];
    // Paints the sky and ground one row at a time.
    for (let y = 0; y < H; y++) {
      g.fillStyle = y < H * 0.45 ? p[0] : p[1];
      g.fillRect(0, y, W, 1);
      // Adds a dithered band where the sky meets the ground.
      if (y % 4 === 0) {
        g.fillStyle = p[1];
        for (let x = (y / 4) % 2; x < W; x += 2) if (y < H * 0.45 + 3 && y > H * 0.3) g.fillRect(x, y, 1, 1);
      }
    }

    g.fillStyle = p[3];
    g.fillRect(6 + Math.floor(rnd() * 30), 3 + Math.floor(rnd() * 5), 4, 4);
    // Draws six building silhouettes along the bottom.
    for (let i = 0; i < 6; i++) {
      // Random width and height for this building.
      const w = 5 + Math.floor(rnd() * 7),
        h = 8 + Math.floor(rnd() * 14),
        x = i * 8 - 2;

      g.fillStyle = "#0c0912";
      g.fillRect(x, H - h, w, h);
      g.fillStyle = p[2];
      // Scatters a few lit windows on the building.
      for (let k = 0; k < 4; k++)
        if (rnd() > 0.45)
          g.fillRect(x + 1 + Math.floor(rnd() * (w - 2)), H - h + 1 + Math.floor(rnd() * (h - 2)), 1, 1);
    }

    g.fillStyle = "#0c0912";
    g.fillRect(0, H - 3, W, 3);
  }

  // ===============================================================================================
  // LOGOS
  // ===============================================================================================

  // brand logos rendered at 24px then snapped to hard pixels (no anti-aliasing), shown scaled up
  const LOGOS = {
    // GitHub: light octocat mark on a dark round badge.
    github: {
      bg: "#1c1530",
      circle: true,
      fg: "#f4ead8",
      // GitHub octocat outline on a 24-unit grid.
      d:
        "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-" +
        "1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084" +
        "-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1" +
        ".305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105" +
        "-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.28" +
        "5-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.47" +
        "5 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24" +
        " 17.592 24 12.297c0-6.627-5.373-12-12-12",
    },

    link: { bg: "#241d33", circle: true, fg: "#f4ead8", d: "M8 6h10v10h-2.5V9.8L7.8 17.5 6 15.7 13.7 8H8z" },
    // Gmail: red envelope mark on a white tile.
    gmail: {
      bg: "#ffffff",
      fg: "#ea4335",
      // Gmail envelope outline on a 24-unit grid.
      d:
        "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.6" +
        "36 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.5" +
        "28-1.145C21.69 2.28 24 3.434 24 5.457z",

      box: [1.6, 4.2, 20.8, 16.8],
    },

    // LinkedIn: blue mark on a white tile.
    linkedin: {
      bg: "#ffffff",
      fg: "#0a66c2",
      // LinkedIn "in" logo outline on a 24-unit grid.
      d:
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.66" +
        "7H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5." +
        "337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2." +
        "063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 ." +
        "774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23." +
        "2 0 22.222 0h.003z",
    },
  };

  // ===============================================================================================
  // drawLogo()
  // ===============================================================================================

  // Draws a contact icon: a built-in logo, the link's own image, or the generic link pin.
  function drawLogo(cv) {
    // Custom icon image: draws it unsmoothed to fill the canvas.
    if (cv.dataset.img) {
      const im = new Image();
      // Paints the image once it has loaded.
      im.onload = () => {
        const g = cv.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.drawImage(im, 0, 0, cv.width, cv.height);
      };

      im.src = cv.dataset.img;
      return;
    }

    // The built-in logo, the canvas context and its size in pixels.
    const L = LOGOS[cv.dataset.logo],
      g = cv.getContext("2d"),
      n = cv.width;

    g.clearRect(0, 0, n, n);
    g.save();
    g.scale(n / 24, n / 24);
    // Paints the logo's background badge, if it has one.
    if (L.bg) {
      g.fillStyle = L.bg;
      // A round badge for circular logos, otherwise a square tile.
      if (L.circle) {
        g.beginPath();
        g.arc(12, 12.3, 11, 0, 7);
        g.fill();
      } else g.fillRect(...(L.box || [2, 2, 20, 20]));
    }

    g.fillStyle = L.fg;
    g.fill(new Path2D(L.d));
    g.restore();
    // The rendered pixels and the logo's colours as RGB triples.
    const im = g.getImageData(0, 0, n, n),
      p = im.data,
      cols = [L.fg, L.bg].filter(Boolean).map((h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)));

    // Snaps every pixel to hard edges and the logo's own colours.
    for (let k = 0; k < p.length; k += 4) {
      // Mostly transparent pixels become fully transparent.
      if (p[k + 3] < 110) {
        p[k + 3] = 0;
        continue;
      }

      // Starts looking for the closest logo colour.
      let best = cols[0],
        bd = 1e9;

      // Compares the pixel with each logo colour.
      for (const c of cols) {
        const d = (p[k] - c[0]) ** 2 + (p[k + 1] - c[1]) ** 2 + (p[k + 2] - c[2]) ** 2;
        // Keeps the colour with the smallest difference.
        if (d < bd) {
          bd = d;
          best = c;
        }
      }

      p[k] = best[0];
      p[k + 1] = best[1];
      p[k + 2] = best[2];
      p[k + 3] = 255;
    }

    g.putImageData(im, 0, 0);
  }

  // ===============================================================================================
  // drawDesk()
  // ===============================================================================================

  // the bureau behind the CV: desk top, scattered papers, a grey and a gold trophy
  function drawDesk(cv) {
    // Desk canvas, its size and a helper that fills a rectangle.
    const g = cv.getContext("2d"),
      W = cv.width,
      H = cv.height,
      R = (c, x, y, w, h) => {
        g.fillStyle = c;
        g.fillRect(x, y, w, h);
      };

    g.clearRect(0, 0, W, H);
    R("#6a4430", 0, 66, W, 58);
    R("#8a5a3c", 0, 66, W, 4);
    R("#3a2419", 0, 124, W, 16);
    R("#4e3021", 0, 124, W, 3);
    for (let x = 6; x < W; x += 23) R("#7a4e36", x, 76 + (x % 7), 14, 1); // wood grain
    // Draws one sheet of paper on the desk.
    const paper = (x, y, w, h) => {
      R("#120e1a", x - 1, y - 1, w + 2, h + 2);
      R("#d9ccb0", x, y, w, h);
      for (let k = y + 4; k < y + h - 3; k += 4) R("#b8a888", x + 3, k, w - 8 - (k % 3) * 2, 1);
    };

    paper(20, 86, 30, 22);
    paper(54, 96, 26, 18);
    paper(128, 92, 28, 20);
    paper(150, 84, 26, 24);
    // Draws a pixel trophy in the given colours.
    const trophy = (x, y, c, hi, lo) => {
      R("#120e1a", x - 1, y - 1, 20, 18);
      R(c, x, y, 18, 16);
      R(hi, x + 2, y + 2, 3, 10);
      R(lo, x + 13, y + 2, 4, 13); // cup
      R("#120e1a", x - 6, y + 2, 6, 9);
      R(c, x - 5, y + 3, 4, 7);
      R(lo, x - 4, y + 4, 2, 5); // handles
      R("#120e1a", x + 18, y + 2, 6, 9);
      R(c, x + 19, y + 3, 4, 7);
      R(lo, x + 20, y + 4, 2, 5);
      R("#120e1a", x + 6, y + 16, 6, 9);
      R(lo, x + 7, y + 16, 4, 8); // stem
      R("#120e1a", x + 1, y + 24, 16, 8);
      R("#2a2238", x + 2, y + 25, 14, 6);
      R(hi, x + 3, y + 25, 12, 1);
    };

    trophy(30, 46, "#9aa0ab", "#d4d8de", "#636874");
    trophy(152, 42, "#e0a83a", "#ffe08a", "#9a6418");
  }

  // a long CV shrinks its own text until it fits the paper
  function fitCv() {
    const doc = document.querySelector("#dlg-body .cvdoc");
    if (!doc) return;
    doc.style.fontSize = "";
    let fs = parseFloat(getComputedStyle(doc).fontSize);
    // Shrinks the font half a pixel at a time until the CV fits, down to 8px.
    while (doc.scrollHeight > doc.clientHeight + 1 && fs > 8) {
      fs -= 0.5;
      doc.style.fontSize = fs + "px";
    }
  }

  // Refits the CV text when the window is resized with a panel open.
  addEventListener("resize", () => {
    if (!overlay.hidden) fitCv();
  });

  // ===============================================================================================
  // openPanel()
  // ===============================================================================================

  // Opens a panel (projects, cv or socials) and wires up its hover lines, scrollbar and zoom.
  function openPanel(id) {
    opener = document.activeElement;
    document.getElementById("dlg-title").textContent = ui(NAME[id]);
    document.getElementById("dlg-body").replaceChildren(BUILD[id]());
    const floating = FLOAT.has(id);
    document.querySelector(".dialog").classList.toggle("wide", floating);
    document.querySelector(".dialog").dataset.panel = id;
    overlay.classList.toggle("floating", floating);
    document.body.classList.toggle("floating", floating);
    document.querySelectorAll("#dlg-body canvas[data-logo], #dlg-body canvas[data-img]").forEach(drawLogo);
    // Gives each contact logo a small random tilt, like a pinned note.
    document
      .querySelectorAll("#dlg-body .slogo")
      // a little random tilt each time
      .forEach((el) => el.style.setProperty("--tilt", (Math.random() * 14 - 7).toFixed(1) + "deg"));

    // Floating panels keep the banner up and swap its line as cards are hovered.
    if (floating) {
      banner.hidden = false;
      if (!talkState) bText.textContent = LINES[id].join("\n");
      // hovering or focusing a card swaps the capybara's line (placeholder per project for now)
      document.querySelectorAll("#dlg-body [data-say]").forEach((c) => {
        const typing = () => talkState && !talkState.held; // still typing, or holding the finished intro for a moment
        // Shows this card's line in the banner.
        const say = () => {
          hoverCard = c;
          if (!typing()) bText.textContent = c.dataset.say;
        };

        // Restores the panel's intro line in the banner.
        const back = () => {
          if (hoverCard === c) hoverCard = null;
          if (!typing()) bText.textContent = LINES[id].join("\n");
        };

        c.addEventListener("pointerenter", say);
        c.addEventListener("focus", say);
        c.addEventListener("pointerleave", back);
        c.addEventListener("blur", back);
      });
    }

    document.querySelectorAll("#dlg-body canvas.desk").forEach(drawDesk);
    const doc = document.querySelector("#dlg-body .cvdoc");
    // Clicking the CV paper zooms it in or out.
    if (doc) {
      doc.addEventListener("click", () => cvZoom(!doc.classList.contains("zoom")));
      // Enter or Space zooms the CV paper from the keyboard.
      doc.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          cvZoom(!doc.classList.contains("zoom"));
        }
      });
    }

    document.querySelectorAll("#dlg-body canvas[data-seed]").forEach((cv) => drawThumb(cv, +cv.dataset.seed));
    // The project card row and its custom scrollbar.
    const row = document.querySelector("#dlg-body .pcards"),
      bar = document.querySelector("#dlg-body .pscroll");

    // Wires the custom scrollbar to the project card row.
    if (row && bar) {
      const thumb = bar.firstElementChild;
      let hide;
      // Sizes and positions the custom scrollbar thumb to match the card row.
      const place = () => {
        // How far the row can scroll and how wide the thumb should be.
        const max = row.scrollWidth - row.clientWidth,
          w = Math.max(24, (bar.clientWidth * row.clientWidth) / row.scrollWidth);

        thumb.style.width = w + "px";
        thumb.style.transform = `translateX(${Math.round(max ? ((bar.clientWidth - w) * row.scrollLeft) / max : 0)}px)`;
        bar.hidden = max <= 0;
      };

      // Shows the scrollbar briefly while the row moves.
      const flash = () => {
        bar.classList.add("on");
        clearTimeout(hide);
        hide = setTimeout(() => bar.classList.remove("on"), 600);
      };

      // Moves the scrollbar thumb and shows it while the row scrolls.
      row.addEventListener(
        "scroll",
        () => {
          place();
          flash();
        },
        { passive: true },
      );

      // a mouse wheel scrolls the row sideways
      row.addEventListener(
        "wheel",
        (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            row.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        },
        { passive: false },
      );

      // drag the thumb, or tap the track to jump
      bar.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        bar.setPointerCapture(e.pointerId);
        // Track position and thumb width, measured once at the start of the drag.
        const r = bar.getBoundingClientRect(),
          w = thumb.offsetWidth;

        // Scrolls the card row so the thumb follows the pointer.
        const go = (ev) => {
          row.scrollLeft = ((ev.clientX - r.left - w / 2) / (r.width - w)) * (row.scrollWidth - row.clientWidth);
        };

        go(e);
        bar.onpointermove = go;
        // Stops following the pointer when the button is released.
        bar.onpointerup = () => {
          bar.onpointermove = null;
        };
      });

      requestAnimationFrame(place);
    }

    overlay.hidden = false;
    document.getElementById("close").focus();
    fitCv();
    if (document.fonts) document.fonts.ready.then(fitCv);
  }

  // focusing the CV brings the paper front and center, over the banner, as big as the screen allows
  function cvZoom(on) {
    const doc = document.querySelector("#dlg-body .cvdoc");
    if (!doc) return;
    doc.classList.toggle("zoom", on);
    document.body.classList.toggle("cvzoom", on);
    // Zooming out: put the paper back in its place.
    if (!on) {
      doc.style.transform = "";
      return;
    }

    // Where the paper is now, to move its centre to the screen centre.
    const r = doc.getBoundingClientRect(),
      cx = r.left + r.width / 2,
      cy = r.top + r.height / 2;

    const k = Math.min((innerHeight * 0.94) / doc.offsetHeight, (innerWidth * 0.94) / doc.offsetWidth);
    doc.style.transform = `translate(${innerWidth / 2 - cx}px, ${innerHeight / 2 - cy}px) scale(${k.toFixed(3)})`;
  }

  // Recomputes the CV zoom when the window is resized.
  addEventListener("resize", () => {
    if (document.body.classList.contains("cvzoom")) {
      cvZoom(false);
      cvZoom(true);
    }
  });

  // Closes the panel and returns to the room.
  function closePanel() {
    if (closeProject) closeProject(true);
    cvZoom(false);
    hoverCard = null;
    // Stops any dialogue typing still running.
    if (talkState) {
      clearInterval(talkState.timer);
      clearTimeout(talkState.hold);
      talkState = null;
    }

    overlay.hidden = true;
    if (document.body.classList.contains("floating")) banner.hidden = true;
    document.body.classList.remove("floating");
    if (opener && opener.focus) opener.focus();
  }

  document.getElementById("close").addEventListener("click", closePanel);
  // Presses on the dimmed backdrop close the zoom or the panel.
  overlay.addEventListener("pointerdown", (e) => {
    // With the CV zoomed, a press outside the paper only zooms it back out.
    if (document.body.classList.contains("cvzoom") && !e.target.closest(".cvdoc")) {
      cvZoom(false);
      return;
    }

    // A press on the backdrop or empty panel space closes the panel.
    if (e.target === overlay || (overlay.classList.contains("floating") && e.target.matches(".dialog, #dlg-body")))
      closePanel();
  });

  // Escape zooms the CV back out first, before anything else sees the key.
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && document.body.classList.contains("cvzoom")) {
        e.stopImmediatePropagation();
        cvZoom(false);
      }
    },
    true,
  );

  // Escape closes an open panel.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closePanel();
  });

  // The header shortcut buttons open their panel directly, skipping the walk.
  document.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => {
      endTalk(false);
      openPanel(b.dataset.open);
    }),
  );

  // Debug: add #debug to the URL to see the walkable grid and object outlines
  if (location.hash === "#debug") {
    // Debug overlay drawn on top of each frame.
    window.__debug = () => {
      // Green dots on walkable tiles, red on blocked ones.
      for (let i = 0; i < N; i++)
        for (let j = 0; j < N; j++) {
          const c = center(i, j);
          ctx.fillStyle = walkable(i, j) ? "rgba(0,255,120,.6)" : "rgba(255,0,0,.6)";
          ctx.fillRect(c[0] - 2, c[1] - 2, 4, 4);
        }

      ctx.strokeStyle = "#ff0";
      ctx.lineWidth = 1;
      // Yellow hotspot outlines with a square on each stand spot.
      OBJECTS.forEach((o) => {
        path(o.poly);
        ctx.stroke();
        ctx.fillStyle = "#ff0";
        ctx.fillRect(o.stand[0] - 3, o.stand[1] - 3, 6, 6);
      });
    };

    const orig = drawLabels;
    // Draws the debug overlay right after the labels each frame.
    drawLabels = (t) => {
      orig(t);
      window.__debug();
    };
  }

  // ===============================================================================================
  // PROJECT DETAIL VIEW
  // ===============================================================================================

  let closeProject = null; // closes the open project detail view, null when none is open
  // ===============================================================================================
  // mediaEl()
  // ===============================================================================================

  // One gallery item as an image or GIF, an MP4/WebM clip or a YouTube/Vimeo player; null for a bad address.
  function mediaEl(g, name) {
    const src = safeUrl(g.src);
    if (!src) return null;
    // Pictures and GIFs become a plain image.
    if (g.type !== "video" && !isVid(src)) {
      const im = el("img");
      im.src = src;
      im.alt = g.alt || name;
      return im;
    }

    // Picks a YouTube or Vimeo video id out of the address.
    const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(src),
      vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(src);

    // YouTube and Vimeo links become an embedded player.
    if (yt || vm) {
      const f = el("iframe");
      f.src = yt ? "https://www.youtube-nocookie.com/embed/" + yt[1] : "https://player.vimeo.com/video/" + vm[1];
      f.title = g.alt || name;
      f.allow = "fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      return f;
    }

    // short clips play like a GIF: muted, looped, started right away; controls let people unmute or pause
    const v = el("video");
    v.src = src;
    v.muted = true;
    v.autoplay = true;
    v.loop = true;
    v.controls = true;
    v.playsInline = true;
    v.preload = "metadata";
    v.setAttribute("aria-label", g.alt || name);
    return v;
  }

  // A project's media in show order: the card thumbnail first, then the gallery items with an allowed address.
  function projectShots(it, name) {
    const shots = ((it.detail && it.detail.gallery) || []).filter((g) => safeUrl(g.src));
    const t = shots.findIndex((g) => g.src === it.thumbnail);
    // Puts the card thumbnail first, adding it when it is not in the gallery.
    if (t > 0) shots.unshift(shots.splice(t, 1)[0]);
    else if (t < 0 && safeUrl(it.thumbnail))
      shots.unshift({ type: isVid(it.thumbnail) ? "video" : "image", src: it.thumbnail, alt: name });

    return shots;
  }

  const SLIDE_MS = 5000; // a project frame moves to its next picture or clip after this long
  // ===============================================================================================
  // carousel()
  // ===============================================================================================

  // Fills box with a slideshow of shots: arrows on each side and a dot per item (shown on hover), and it moves
  // on by itself every 5 s. On a card (inCard) the controls are plain spans, since the card itself is a button.
  function carousel(box, shots, name, start, inCard) {
    // The slot that holds the current item and the list of dots.
    const slide = el("span", "pslide"),
      dots = [];

    // Current item index, auto-advance timer and whether a video is being watched.
    let k = start,
      timer = 0,
      held = false; // set once someone plays with a video's controls, so it is not cut off

    box.classList.add("pcar");
    box.append(slide);
    // Restarts the 5 s countdown (after every change, so a click on an arrow gives a full 5 s).
    const restart = () => {
      clearInterval(timer);
      if (shots.length > 1) timer = setInterval(tick, SLIDE_MS);
    };

    // Moves on unless the frame is gone, hidden, or a video is being watched.
    const tick = () => {
      if (!box.isConnected) return clearInterval(timer);
      if (!held && box.offsetParent && !document.hidden) show(k + 1);
    };

    // Shows item n (wrapping around both ways).
    const show = (n) => {
      k = (n + shots.length) % shots.length;
      const m = mediaEl(shots[k], name);
      // On a card, clips play silently without controls and images load lazily.
      if (m && inCard) {
        m.controls = false; // a card plays clips like GIFs
        m.removeAttribute("controls");
        if (m.tagName === "IMG") m.loading = "lazy";
      }

      // Pauses the slideshow once someone unmutes or seeks a video.
      if (m && m.tagName === "VIDEO" && !inCard)
        ["volumechange", "seeking"].forEach((ev) => m.addEventListener(ev, () => (held = true)));

      if (m) m.classList.add("pin");
      slide.replaceChildren(m || "");
      dots.forEach((d, j) => d.classList.toggle("on", j === k));
      restart();
    };

    // Several items: add arrows, dots and swiping.
    if (shots.length > 1) {
      const tag = inCard ? "span" : "button";
      // A control that changes the picture without letting the click reach the card.
      const ctl = (cls, label, fn, kid) => {
        const b = el(tag, cls);
        // Real buttons in the big frame; hidden spans inside a card.
        if (!inCard) {
          b.type = "button";
          b.setAttribute("aria-label", label);
        } else b.setAttribute("aria-hidden", "true");

        if (kid) b.append(kid);
        // Changes the picture without opening the card underneath.
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          fn();
        });

        return b;
      };

      const bar = el("span", "pdots");
      // One dot per item that jumps straight to it.
      shots.forEach((g, j) => {
        const d = ctl("pdot", (g.alt || name) + " (" + (j + 1) + "/" + shots.length + ")", () => show(j));
        dots.push(d);
        bar.append(d);
      });

      // Previous and next arrows plus the dot bar.
      box.append(
        ctl("parr prev", ui("projects.media.prev"), () => show(k - 1), pxi("arrow-left", 16)),
        ctl("parr next", ui("projects.media.next"), () => show(k + 1), pxi("arrow-right", 16)),
        bar,
      );

      // swipe left or right on the big frame (cards keep swipes for scrolling the row)
      if (!inCard) {
        let x0 = null;
        box.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
        // A horizontal swipe of more than 40px goes to the next or previous item.
        box.addEventListener("touchend", (e) => {
          const dx = x0 == null ? 0 : e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 40) show(k + (dx < 0 ? 1 : -1));
          x0 = null;
        });
      }
    }

    show(start);
  }

  // A link button that opens in a new tab, or null when the address is not allowed.
  function linkBtn(label, url, cls) {
    const u = safeUrl(url);
    if (!u || !label) return null;
    const a = el("a", cls, label + " ");
    a.href = u;
    // Web links open in a new tab; mail and phone links do not.
    if (!/^(mailto|tel):/i.test(u)) {
      a.target = "_blank";
      a.rel = "noopener";
    }

    a.append(pxi("external-link", 12));
    return a;
  }

  // ===============================================================================================
  // openProject()
  // ===============================================================================================

  // Grows project card i into a centred detail view while the room dims; it shrinks back into the card on close.
  function openProject(it, card, i) {
    if (closeProject) closeProject(true);
    // The project's detail fields and its name in the current language.
    const D = it.detail || {},
      name = tr(it.name);

    // Dimmed backdrop and the detail dialog box.
    const back = el("div", "pback"),
      modal = el("div", "pmodal");

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", ui("sr.projectDetail", { name }));
    const x = el("button", "pclose");
    x.type = "button";
    x.setAttribute("aria-label", ui("projects.detail.close"));
    x.title = ui("projects.detail.close");
    x.append(pxi("close"));
    // media: the card thumbnail first, then the rest of the gallery; placeholder art when there is none
    const shots = projectShots(it, name);
    // Media column and the large frame at its top.
    const left = el("div", "pmedia"),
      hero = el("div", "phero");

    // Big slideshow of the media, or a placeholder pixel scene when there is none.
    if (shots.length) carousel(hero, shots, name, 0, false);
    else {
      const c = el("canvas");
      c.width = 48;
      c.height = 32;
      hero.append(c);
      drawThumb(c, i + 3);
    }

    left.append(hero);
    if (it.badge) left.append(el("span", "pbadge", it.badge));
    // text side: name, role, description, summary, highlight, stack, links
    const info = el("div", "pinfo");
    info.append(el("h2", "pname", name));
    if (tr(D.role)) info.append(el("p", "prole", tr(D.role)));
    if (tr(it.description)) info.append(el("p", "plead", tr(it.description)));
    if (tr(D.summary)) info.append(el("p", "psum", tr(D.summary)));
    // Highlight box with its heading, when the project has one.
    if (tr(D.highlight)) {
      const h = el("div", "phigh");
      h.append(el("h3", null, ui("projects.detail.highlight")), el("p", null, tr(D.highlight)));
      info.append(h);
    }

    const stack = (D.stack && D.stack.length ? D.stack : it.tags) || [];
    // Tech stack section, from the stack list or else the card tags.
    if (stack.length) {
      // Stack heading and its tag chips.
      const st = el("div", "pstack"),
        chips = el("div", "ptags");

      stack.forEach((t) => chips.append(el("span", null, t)));
      st.append(el("h3", null, ui("projects.detail.stack")), chips);
      info.append(st);
    }

    const links = el("div", "plinks");
    const cta = it.cta && linkBtn(tr(it.cta.label) || ui("projects.ctaFallback"), it.cta.url, "pbtn main");
    if (cta) links.append(cta);
    // Extra link buttons, skipping ones without a safe address.
    (D.links || []).forEach((l) => {
      const a = linkBtn(tr(l.label), l.url, "pbtn");
      if (a) links.append(a);
    });

    if (links.children.length) info.append(links);
    modal.append(x, left, info);
    document.body.append(back, modal);
    // FLIP: start the modal on top of the card, then let it grow into the centre
    const to = modal.getBoundingClientRect();
    // Transform that places the modal exactly over a given box.
    const flip = (r) =>
      `translate(${r.left - to.left}px, ${r.top - to.top}px) scale(${r.width / to.width}, ${r.height / to.height})`;

    modal.style.transition = "none";
    modal.style.transform = flip(card.getBoundingClientRect());
    modal.getBoundingClientRect();
    modal.style.transition = "";
    modal.style.transform = "";
    modal.classList.add("in");
    back.classList.add("in");
    card.classList.add("lifted");
    // Escape closes the detail view only (the projects panel stays open); Tab stays inside the modal.
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        closeProject();
      } else if (e.key === "Tab") {
        const f = [...modal.querySelectorAll("button, a[href], iframe, video")];
        // First and last focusable items in the modal.
        const first = f[0],
          last = f[f.length - 1];

        // Wraps Tab and Shift+Tab focus around inside the modal.
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };

    document.addEventListener("keydown", onKey, true);
    // Shrinks the modal back into its card (or just removes it when now is set), then gives focus back.
    closeProject = (now) => {
      closeProject = null;
      document.removeEventListener("keydown", onKey, true);
      modal.querySelectorAll("video").forEach((v) => v.pause());
      // Removes the modal and backdrop and puts the card back.
      const done = () => {
        modal.remove();
        back.remove();
        card.classList.remove("lifted");
      };

      if (now || !card.isConnected) return done();
      modal.style.transform = flip(card.getBoundingClientRect());
      modal.classList.remove("in");
      back.classList.remove("in");
      setTimeout(() => (done(), card.focus({ preventScroll: true })), 260);
    };

    x.addEventListener("click", () => closeProject());
    back.addEventListener("click", () => closeProject());
    setTimeout(() => x.focus({ preventScroll: true }), 60);
  }

  // ===============================================================================================
  // LANGUAGE FLAGS
  // ===============================================================================================

  // the flag in the header switches the room's language (remembered on this device)
  const langBox = document.getElementById("lang");
  // Adds the language flag picker to the header.
  if (langBox)
    langBox.append(
      flagPicker(
        () => LANG,
        (code) => {
          LANG = code;
          // Remembers the chosen language on this device, if storage allows.
          try {
            localStorage.setItem("lang", code);
          } catch (e) {}

          applyContent();
        },
        (l) => ui("sr.language", { name: l.name }),
      ),
    );

  document.querySelector(".banner-next").replaceChildren(pxi("chevron-down"));

  resize();
  // Once everything has loaded, starts the animation and lets the title be dismissed.
  Promise.all(loads).then(() => {
    requestAnimationFrame(frame);
    setTimeout(() => title && title.classList.add("ready"), 150);
  });
})();
