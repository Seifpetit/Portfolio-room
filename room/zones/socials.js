// =================================================================================================
// CONTACT ZONE
// =================================================================================================

// The corkboard: walking up to it opens the board with a pixel icon pinned for every contact link.
zone({
  // <zone-settings> written by the editor's Zones page; edit it there, or by hand keeping both marker lines
  id: "socials", // panel id: shortcut button, dialogue and room.css rules ([data-panel="socials"])
  name: "name.contact", // UI copy id of its room label, shortcut button and panel title
  intro: "contact.intro", // UI copy id of Seif's line when he gets there
  icon: "contact", // Pixelarticon in front of its room label
  float: true, // the content floats over the dimmed room while the dialogue banner stays up
  // Outline for the hover glow and taps, in hi-res room coordinates (halved by d2).
  poly: d2([
    [1012, 245],
    [1065, 232],
    [1110, 272],
    [1105, 350],
    [1060, 355],
    [1012, 320],
  ]),

  stand: [470, 190], // where the capybara stands to use it, in room pixels
  // </zone-settings>

  // Lines of the menu an email pin opens.
  copy: {
    buttons: {
      // Writes the email in Gmail on the web.
      "contact.mail.gmail": {
        section: "contact",
        where: "Menu under the email pin: writes the email in Gmail, in the browser.",
        text: { en: "Write in Gmail" },
      },

      // Writes the email in Outlook on the web.
      "contact.mail.outlook": {
        section: "contact",
        where: "Menu under the email pin: writes the email in Outlook, in the browser.",
        text: { en: "Write in Outlook" },
      },

      // Opens the visitor's own mail program.
      "contact.mail.app": {
        section: "contact",
        where: "Menu under the email pin: opens the visitor's own mail app.",
        text: { en: "Open my mail app" },
      },

      // Copies the address.
      "contact.mail.copy": {
        section: "contact",
        where: "Menu under the email pin: copies the email address.",
        text: { en: "Copy address" },
      },

      // Shown on the copy line once it worked.
      "contact.mail.copied": {
        section: "contact",
        where: "The copy line of the email pin's menu, right after the address was copied.",
        text: { en: "Copied!" },
      },
    },
  },

  // ===============================================================================================
  // build()
  // ===============================================================================================

  // Builds the Contact panel: pixel icons pinned on the corkboard.
  build() {
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

    // =============================================================================================
    // K.links.forEach(...)
    // =============================================================================================

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

      // An email pin opens a small menu to write from the browser (Gmail, Outlook) or a mail app, or copy it.
      if (/^mailto:/i.test(url)) a.addEventListener("click", (e) => (e.preventDefault(), mailMenu(a, url)));
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

  // Puts away the email menu along with the panel.
  closed() {
    mailMenu(null);
  },

  // Draws the pinned logos once the panel is up, each with a little random tilt.
  opened() {
    document.querySelectorAll("#dlg-body canvas[data-logo], #dlg-body canvas[data-img]").forEach(drawLogo);
    // Gives each contact logo a small random tilt, like a pinned note.
    document
      .querySelectorAll("#dlg-body .slogo")
      // a little random tilt each time
      .forEach((el) => el.style.setProperty("--tilt", (Math.random() * 14 - 7).toFixed(1) + "deg"));
  },
});

// =================================================================================================
// mailMenu()
// =================================================================================================

// Opens the email menu under pin a for the mailto: link url, or closes it (a = null). Most visitors write email in
// the browser, where a plain mailto: link does nothing without a mail app, so the menu offers Gmail and Outlook on
// the web first, then the mail app and copying the address. Escape or a click elsewhere closes it.
function mailMenu(a, url) {
  const old = document.querySelector(".mailmenu");
  if (old) old.remove();
  removeEventListener("pointerdown", mailMenu.off, true);
  removeEventListener("keydown", mailMenu.key, true);
  if (!a || old?.dataset.for === url) return; // a second click on the same pin closes it
  const to = decodeURIComponent(url.replace(/^mailto:/i, "").split("?")[0]),
    q = encodeURIComponent(to);

  const menu = el("div", "mailmenu");
  menu.dataset.for = url;
  menu.setAttribute("role", "menu");
  // One line of the menu: a link that opens in a new tab, or a button that runs fn.
  const item = (id, icon, href, fn) => {
    const b = el(href ? "a" : "button", "mailitem");
    b.setAttribute("role", "menuitem");
    b.append(pxi(icon, 16), el("span", null, ui(id)));
    if (href) {
      b.href = href;
      if (/^https:/.test(href)) {
        b.target = "_blank";
        b.rel = "noopener";
      }

      b.addEventListener("click", () => setTimeout(() => mailMenu(null)));
    } else {
      b.type = "button";
      b.addEventListener("click", () => fn(b));
    }

    return b;
  };

  menu.append(
    el("span", "mailto", to),
    item("contact.mail.gmail", "gmail", "https://mail.google.com/mail/?view=cm&fs=1&to=" + q),
    item("contact.mail.outlook", "mail", "https://outlook.live.com/mail/0/deeplink/compose?to=" + q),
    item("contact.mail.app", "external-link", url),
    // Copies the address and says so for a moment.
    item("contact.mail.copy", "clipboard", null, (b) =>
      navigator.clipboard
        .writeText(to)
        .then(() => (b.lastChild.textContent = ui("contact.mail.copied")))
        .catch(() => getSelection().selectAllChildren(menu.firstChild)),
    ),
  );

  document.body.append(menu);
  // Sits centred under the pin's logo, kept on screen.
  const r = (a.querySelector(".slogo") || a).getBoundingClientRect(),
    w = menu.offsetWidth;

  menu.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
  menu.style.top = Math.min(innerHeight - menu.offsetHeight - 8, r.bottom + 6) + "px";
  menu.querySelector(".mailitem").focus({ preventScroll: true });
  // Closes on a press outside the menu and its pin.
  mailMenu.off = (e) => !menu.contains(e.target) && !a.contains(e.target) && mailMenu(null);
  // Escape closes the menu before it can close the panel.
  mailMenu.key = (e) => {
    if (e.key !== "Escape") return;
    e.stopImmediatePropagation();
    mailMenu(null);
    a.focus();
  };

  addEventListener("pointerdown", mailMenu.off, true);
  addEventListener("keydown", mailMenu.key, true);
}

// =================================================================================================
// LOGOS
// =================================================================================================

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

// =================================================================================================
// drawLogo()
// =================================================================================================

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
