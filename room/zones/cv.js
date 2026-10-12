// =================================================================================================
// CV ZONE
// =================================================================================================

// The bureau: walking up to it opens the CV paper over a faint desk; clicking the paper zooms it.
zone({
  // <zone-settings> written by the editor's Zones page; edit it there, or by hand keeping both marker lines
  id: "cv", // panel id: shortcut button, dialogue and room.css rules ([data-panel="cv"])
  name: "name.cv", // UI copy id of its room label, shortcut button and panel title
  intro: "cv.intro", // UI copy id of Seif's line when he gets there
  icon: "file-text", // Pixelarticon in front of its room label
  float: true, // the content floats over the dimmed room while the dialogue banner stays up
  // Outline for the hover glow and taps, in hi-res room coordinates (halved by d2).
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

  stand: [430, 238], // where the capybara stands to use it, in room pixels
  // Floor footprint he cannot walk through, in hi-res room coordinates.
  blocked: d2([
    [878, 450],
    [950, 425],
    [1080, 455],
    [1090, 500],
    [960, 550],
    [905, 540],
    [878, 500],
  ]),

  occluder: "assets/occ-bureau.png", // furniture cutout repainted over him behind the footprint
  // </zone-settings>

  // ===============================================================================================
  // build()
  // ===============================================================================================

  // Builds the CV panel: the paper document over the faint bureau.
  build() {
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

    // Spoken languages: one translatable line (older files kept a list).
    const langs = Array.isArray(C.languages) ? C.languages.join(", ") : tr(C.languages);
    if (langs) sec(ui("cv.languages"), [el("p", "cvskill", langs)]);
    // CV footer and the PDF link, kept only when it is a safe URL.
    const foot = el("div", "cvfoot"),
      pdf = safeUrl(tr(C.pdf));

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

  // Wires the panel once it is up: the desk drawing, the paper's zoom, and the text fit.
  opened() {
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

    fitCv();
    if (document.fonts) document.fonts.ready.then(fitCv);
  },

  // Closing the panel puts a zoomed paper back.
  closed() {
    cvZoom(false);
  },

  // With the paper zoomed, a press outside it only zooms it back out (true keeps the panel open).
  press(e) {
    if (!document.body.classList.contains("cvzoom") || e.target.closest(".cvdoc")) return false;
    cvZoom(false);
    return true;
  },

  // Runs once when the room starts: refits and re-zooms the paper on resize, and lets Escape unzoom first.
  init() {
    // Refits the CV text when the window is resized with a panel open.
    addEventListener("resize", () => {
      if (!overlay.hidden) fitCv();
    });

    // Recomputes the CV zoom when the window is resized.
    addEventListener("resize", () => {
      if (document.body.classList.contains("cvzoom")) {
        cvZoom(false);
        cvZoom(true);
      }
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
  },
});

// =================================================================================================
// drawDesk()
// =================================================================================================

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
