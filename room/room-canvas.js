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

  // The interactive zone under a room point, if any.
  const objectAt = (p) => ZONES.find((o) => inPoly(p, o.poly));
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
    const o = zoneById(hover);
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

  // Idle variation sheets (vary in ANIMS), played in this order between stretches of the base idle loop. drink ends
  // by lowering the bottle again, through its play order.
  const IDLE_VARS = Object.entries(ANIMS)
    .filter(([, a]) => a.vary)
    .map(([key, a]) => {
      const seq = a.seq && a.seq.length ? a.seq : [...Array(a.frames).keys()];
      return { key, frames: seq.length, seq, fps: a.fps || 6 };
    });

  // Idle variation timing, the queued drink and interact start and end times.
  let idleVar = null,
    varAt = 0,
    curVar = null,
    wantDrink = false,
    nextVar = 3,
    busyAt = null,
    freeAt = null,
    busyAnim = null;

  // The frame to show at tick k of an animation: its play order (seq) when it has one, else every frame in turn.
  const frameAt = (a, k) => (a.seq && a.seq.length ? a.seq[k % a.seq.length] : k % a.frames);

  // An animation ready to play while he is busy at a zone, with the defaults filled in: the intro is a frame count
  // (frames 0 up) or a list of frames, then the loop (every frame after the intro if left out), no turn-back, all at
  // the same speed. introSeq is the intro as a list of frames.
  function busyPlan(key, a) {
    const fps = a.fps || 10,
      introSeq = Array.isArray(a.intro) ? a.intro : [...Array(a.intro || 0).keys()];

    return {
      key,
      fps,
      intro: introSeq.length,
      introSeq,
      loop: a.loop && a.loop.length ? a.loop : [...Array(a.frames).keys()].slice(introSeq.length),
      loopFps: a.loopFps || fps,
      outro: a.outro || [],
      outroFps: a.outroFps || fps,
    };
  }

  // The interact sheet every zone plays unless it has its own: reach in, keep working, then turn back (see ANIMS).
  const INTERACT = busyPlan("interact", ANIMS.interact);

  // ===============================================================================================
  // zoneAnim()
  // ===============================================================================================

  // The animation for the zone he is busy with: its own anim sheet when it has one that loaded, else INTERACT.
  // A zone anim gives sheet and frames; intro, loop, outro and their speeds are optional (see room/zones/README.md).
  function zoneAnim() {
    // The zone he rests at, else the one he is talking about, else the one whose panel is open.
    const panel = !overlay.hidden && document.querySelector(".dialog").dataset.panel,
      z = zoneById(restZone || (talkState && talkState.id) || panel),
      a = z && z.anim;

    if (!a || !imgs["anim-" + z.id]) return INTERACT;
    return busyPlan("anim-" + z.id, a);
  }

  // "d" makes the capybara drink once; it waits for any other animation to finish and is ignored mid-drink
  addEventListener("keydown", (e) => {
    if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat) {
      if (!curVar || curVar.key !== "drink") wantDrink = true;
    }
  });

  // ===============================================================================================
  // interactFrame()
  // ===============================================================================================

  // interacting: play the zone's intro once and loop it while the banner or panel is up (or while he rests at a
  // zone without a panel), then play its turn-back. Returns the frame number, or null when he is not interacting.
  function interactFrame() {
    const busy = !!talkState || !overlay.hidden || !!restZone;
    // Remembers when the banner or panel opened to start the reach-in, and which animation to play.
    if (busy && busyAt === null) {
      busyAt = clock;
      freeAt = null;
      busyAnim = zoneAnim();
    }

    // Remembers when it closed to start the turn-back.
    if (!busy && busyAt !== null) {
      busyAt = null;
      freeAt = clock;
    }

    const A = busyAnim;
    // While busy: play the reach-in once, then loop the working frames.
    if (busyAt !== null) {
      const k = Math.floor((clock - busyAt) * A.fps);
      return k < A.intro ? A.introSeq[k] : A.loop[Math.floor(((k - A.intro) * A.loopFps) / A.fps) % A.loop.length];
    }

    // After closing: play the turn-back frames once, then return to idle.
    if (freeAt !== null) {
      const k = Math.floor((clock - freeAt) * A.outroFps);
      if (k < A.outro.length) return A.outro[k];
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
    if (player.rising && busyAt === null && freeAt === null) player.rising = false; // turn-back done: he can walk
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
    if (idleVar !== null && clock - idleVar >= curVar.frames / curVar.fps) {
      idleVar = curVar = null;
      nextVar = clock + 4 + Math.random() * 5;
    }

    // Chooses the sprite sheet for the current state: walk, interact, variation or idle.
    const im = walking
      ? imgs.walk
      : act !== null
        ? imgs[busyAnim.key]
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
      ? frameAt(ANIMS.walk, Math.floor(player.t * ANIMS.walk.fps))
      : act !== null
        ? act
        : idleVar !== null
          ? curVar.seq[Math.min(curVar.frames - 1, Math.floor((clock - idleVar) * curVar.fps))]
          : imgs.idle
            ? frameAt(ANIMS.idle, Math.floor(clock * ANIMS.idle.fps))
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

  // a Pixelarticon in front of each room label (each zone names its own; same icons as the editor's home tiles).
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
    for (const o of ZONES) {
      // Horizontal and vertical extents of the hotspot outline.
      const xs = o.poly.map((p) => p[0]),
        ys = o.poly.map((p) => p[1]);

      // Centres the label above the hotspot with a gentle floating bob.
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
        cy = Math.min(...ys) - 14 + Math.sin(t * 2.4 + cx) * 1.6;

      // Label text (with an arrow when hovered), box width and left edge.
      const text = (hover === o.id ? "▸ " : "") + ui(o.name),
        w = ctx.measureText(text).width + 30,
        x0 = Math.round(cx - w / 2);

      ctx.fillStyle = "rgba(14,10,22,.85)";
      ctx.fillRect(x0, cy - 10, w, 20);
      ctx.fillStyle = hover === o.id ? "#7ff3ff" : "#f4ead8";
      labelIcon(o.icon, x0 + 6, Math.round(cy) - 6);
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
    // Follows the queued route one tile at a time (once he is up from a rest at a zone without a panel).
    if (player.path.length && !player.rising) {
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

  // True for a zone that opens a panel when he gets there (every zone unless it sets panel: false).
  const hasPanel = (id) => !!zoneById(id) && zoneById(id).panel !== false;
  // True for a zone whose panel content floats over the dimmed room, with the dialogue banner kept up.
  const floats = (id) => hasPanel(id) && !!zoneById(id).float;
  // all text, links and images shown in the panels come from content.json (see CONTENT-CONTRACT.md)
  const DEFAULT = JSON.parse(document.getElementById("content-default").textContent);
  // A zone may bring the default copy for its own lines (its name, its intro...); content.json still wins.
  for (const z of ZONES)
    for (const [type, lines] of Object.entries(z.copy || {}))
      DEFAULT.ui[type] = { ...lines, ...DEFAULT.ui[type] };

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

  // One shortcut button per zone in the header nav, before its hint (none for shortcut: false or panel: false).
  const nav = document.querySelector(".app nav");
  const quick = document.querySelector(".title-quick");
  // Adds the zone's button, and its twin in the start screen's quick links; applyStatic() writes their names.
  ZONES.filter((z) => z.shortcut !== false && z.panel !== false).forEach((z) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.open = z.id;
    nav.insertBefore(b, nav.querySelector("small"));
    if (quick) quick.append(b.cloneNode());
  });

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
    document
      .querySelectorAll("nav [data-open], .title-quick [data-open]")
      .forEach((b) => (b.textContent = ui(zoneById(b.dataset.open).name)));
    document.querySelectorAll(".title-quick small").forEach((x) => (x.textContent = ui("start.quick")));
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

  // Copies content.json (or the built-in placeholder) into each zone's dialogue lines, the page text, title and
  // description.
  function applyContent() {
    ZONES.forEach((z) => (LINES[z.id] = [ui(z.intro)]));
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
