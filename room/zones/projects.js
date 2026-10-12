// =================================================================================================
// PROJECTS ZONE
// =================================================================================================

// The tech lab: walking up to it opens a CRT screen of project cards; a card grows into that project's details.
zone({
  // <zone-settings> written by the editor's Zones page; edit it there, or by hand keeping both marker lines
  id: "projects", // panel id: shortcut button, dialogue and room.css rules ([data-panel="projects"])
  name: "name.projects", // UI copy id of its room label, shortcut button and panel title
  intro: "projects.intro", // UI copy id of Seif's line when he gets there
  icon: "briefcase", // Pixelarticon in front of its room label
  float: true, // the content floats over the dimmed room while the dialogue banner stays up
  // Outline for the hover glow and taps, in hi-res room coordinates (halved by d2).
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

  stand: [270, 165], // where the capybara stands to use it, in room pixels
  // Floor footprint he cannot walk through, in hi-res room coordinates.
  blocked: d2([
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

  // </zone-settings>

  // Default text of the zone's own lines; the editor lists them and content.json overrides them.
  copy: {
    // The enlarge / shrink chip in the screen's corner.
    buttons: {
      // Its label while the screen has its normal size.
      "projects.enlarge": {
        section: "projects",
        where: "Chip in the top right corner of the Projects screen; it makes the screen bigger.",
        text: { en: "Enlarge" },
      },

      // Its label while the screen is enlarged.
      "projects.shrink": {
        section: "projects",
        where: "Same chip while the Projects screen is enlarged; it puts the screen back.",
        text: { en: "Shrink" },
      },
    },
  },

  // ===============================================================================================
  // build()
  // ===============================================================================================

  // Builds the Projects panel: a CRT screen with a horizontal row of project cards.
  build() {
    // The Projects content, a fragment to fill, and the CRT monitor and its screen.
    const P = CONTENT.projects,
      f = document.createDocumentFragment(),
      mon = el("div", "monitor"),
      scr = el("div", "screen");

    const note = el("p", "sample-note");
    note.dataset.prompt = ui("projects.prompt") + " ";
    if (P.placeholder) note.append(el("span", "sample", ui("placeholder.tag")), " ");
    note.append(ui("projects.pick"));
    // The enlarge / shrink chip in the screen's corner (a click on the bare screen does the same).
    const zoom = el("button", "pzoom");
    zoom.type = "button";
    zoom.addEventListener("click", () => projectsFocus(!document.body.classList.contains("pfocus")));
    scr.append(zoom, note);
    // A click on the screen itself, not on a card, its link or the scrollbar, enlarges it or puts it back.
    scr.addEventListener("click", (e) => {
      if (!e.target.closest(".pcard, .pscroll, .pzoom")) projectsFocus(!document.body.classList.contains("pfocus"));
    });

    const row = el("div", "pcards");
    // =============================================================================================
    // P.items.forEach(...)
    // =============================================================================================

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
      // A click on the card opens its details; a click on its link chip goes to the link instead.
      card.addEventListener("click", (e) => {
        const url = it.cta && it.cta.url;
        if (url && e.target.closest(".pcta")) window.open(url, "_blank", "noopener");
        else openProject(it, card, i);
      });
      row.append(card);
    });

    scr.append(row);
    const bar = el("div", "pscroll");
    bar.setAttribute("aria-hidden", "true");
    bar.append(el("i"));
    scr.append(bar);
    mon.append(scr);
    // Two faint screens beside the main one, like a multi-monitor desk (decoration only).
    for (const side of ["left", "right"]) {
      const s = el("div", "sidescreen " + side);
      s.setAttribute("aria-hidden", "true");
      mon.append(s);
    }

    const stand = el("div", "stand");
    stand.setAttribute("aria-hidden", "true");
    f.append(mon, stand);
    return f;
  },

  // Wires the panel once it is up: placeholder thumbnails and the card row's own scrollbar.
  opened() {
    projectsFocus(false);
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
  },

  // Closing the panel also closes an open project detail view, without its shrink animation.
  closed() {
    if (closeProject) closeProject(true);
    projectsFocus(false);
  },

  // With the screen enlarged, a press outside the monitor only puts it back (true keeps the panel open).
  press(e) {
    if (!document.body.classList.contains("pfocus") || e.target.closest(".monitor, .close, .pmodal, .pback"))
      return false;
    projectsFocus(false);
    return true;
  },

  // Runs once when the room starts: Escape puts an enlarged screen back first, before it closes anything.
  init() {
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape" && document.body.classList.contains("pfocus") && !closeProject) {
          e.stopImmediatePropagation();
          projectsFocus(false);
        }
      },
      true,
    );
  },
});

// =================================================================================================
// projectsFocus()
// =================================================================================================

// Enlarges the Projects screen into the most dominant thing on the page (the banner steps aside), or puts it back.
function projectsFocus(on) {
  document.body.classList.toggle("pfocus", on);
  const zoom = document.querySelector("#dlg-body .pzoom");
  if (!zoom) return;
  zoom.replaceChildren(pxi(on ? "minus" : "plus", 12), ui(on ? "projects.shrink" : "projects.enlarge"));
  zoom.setAttribute("aria-pressed", on ? "true" : "false");
}

// =================================================================================================
// drawThumb()
// =================================================================================================

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
      if (rnd() > 0.45) g.fillRect(x + 1 + Math.floor(rnd() * (w - 2)), H - h + 1 + Math.floor(rnd() * (h - 2)), 1, 1);
  }

  g.fillStyle = "#0c0912";
  g.fillRect(0, H - 3, W, 3);
}

// =================================================================================================
// PROJECT DETAIL VIEW
// =================================================================================================

let closeProject = null; // closes the open project detail view, null when none is open
// =================================================================================================
// mediaEl()
// =================================================================================================

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
// =================================================================================================
// carousel()
// =================================================================================================

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

// =================================================================================================
// openProject()
// =================================================================================================

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
