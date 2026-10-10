// =================================================================================================
// PXI
// =================================================================================================

// Pixel art icons from Pixelarticons by Gerrit Halfmann (https://pixelarticons.com), MIT licensed:
// Copyright (c) 2019 Gerrit Halfmann. Only the icons this site uses are copied here, as 24x24 path data.
// Shared by the room (index.html) and the local editor (admin/).
const PXI = {
  languages:
    "M7 2h4v2H7zM2 5h14v2H2zm9 2h2v2h-2zM9 9h2v2H9zm-2 2h2v2H7zM5 9h2v2H5zm4 4h2v2H9z" +
    "m-4 0h2v2H5zm8 2h2v7h-2zm2-2h5v2h-5zm5 2h2v7h-2zm-5 2h5v2h-5z",
  "arrow-left": "M20 11v2H4v-2zM8 13v2H6v-2zm2 2v2H8v-2zm2 2v2h-2v-2zm-4-6V9H6v2z M10 15V7H8v8zm2 2V5h-2v12z",
  "arrow-right": "M4 11v2h16v-2zm12 2v2h2v-2zm-2 2v2h2v-2zm-2 2v2h2v-2zm4-6V9h2v2z M14 15V7h2v8zm-2 2V5h2v12z",
  "arrow-up": "M11 20h2V4h-2zm2-12h2V6h-2zm2 2h2V8h-2zm2 2h2v-2h-2zm-6-4H9V6h2z M15 10H7V8h8zm2 2H5v-2h12z",
  "arrow-down": "M13 12h6v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2h6V4h2v8Z",
  close:
    "M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H1" +
    "3V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7" +
    " 7H5V5H7V7ZM19 7H17V5H19V7Z",
  trash: "M18 22H6V20H18V22ZM9 6H15V4H17V6H22V8H20V20H18V8H6V20H4V8H2V6H7V4H9V6ZM15 4H9V2H15V4Z",
  pencil:
    "M4 16H6V18H8V20H10V22H2V14H4V16ZM12 20H10V18H12V20ZM14 18H12V16H14V18ZM10 16H8V14H10V16ZM16 16H1" +
    "4V14H16V16ZM6 14H4V12H6V14ZM12 14H10V12H12V14ZM18 14H16V12H18V14ZM8 12H6V10H8V12ZM14 12H12V10H14" +
    "V12ZM20 12H18V10H20V12ZM10 10H8V8H10V10ZM18 10H16V8H18V10ZM22 10H20V8H22V10ZM12 8H10V6H12V8ZM16 " +
    "8H14V6H16V8ZM20 8H18V6H20V8ZM14 6H12V4H14V6ZM18 6H16V4H18V6ZM16 4H14V2H16V4Z",
  image:
    "M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-4 8h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm-8 0h2" +
    "v2h-2zm2 2h2v2h-2zm2 2h2v2h-2z M20 16h2v2h-2zM8 16h2v2H8zm-2 2h2v2H6zM8 6h2v2H8zM6 8h2v2H6zm2 2h" +
    "2v2H8zm2-2h2v2h-2z",
  "chevron-down":
    "M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0" + "h-2V8h2v2Z",
  plus: "M13 11h7v2h-7v7h-2v-7H4v-2h7V4h2v7Z",
  save:
    "M20 22H4V20H6V14H8V20H16V14H18V20H20V22ZM4 20H2V4H4V20ZM22 20H20V6H22V20ZM16 14H8V12H16V14ZM12 1" +
    "0H6V6H12V10ZM20 6H18V4H20V6ZM18 4H4V2H18V4Z",
  upload: "M19 21H5v-2h14v2ZM5 19H3v-4h2v4Zm16 0h-2v-4h2v4ZM13 5h2v2h2v2h-4v8h-2V9H7V7h2V5h2V3h2v2Z",
  "external-link":
    "M11 5H5v2h6V5ZM5 7H3v12h2V7Zm12 12H5v2h12v-2Zm2-6h-2v6h2v-6Zm-8 0H9v2h2v-2Zm2-2h-2v2h2v-2Zm2-2h-" +
    "2v2h2V9Zm2-2h-2v2h2V7Zm2-2h-2v2h2V5Zm2-2h-2v8h2V3Z M21 3h-8v2h8V3Z",
  download:
    "M21 15v4h-2v-4zm-2 4v2H5v-2zM5 15v4H3v-4zm8-12v14h-2V3z M7 11v2h10v-2zm2 2v2h2v-2zm4 0v2h2v-2z M" +
    "15 11v2h2v-2z",
  briefcase: "M2 8h2v12H2zm18 0h2v12h-2zM4 6h16v2H4zm0 14h16v2H4zM8 4h2v2H8zm2-2h4v2h-4zm4 2h2v2h-2z",
  "file-text":
    "M6 4H4v16h2zm10-2H6v2h10zm4 4h-2v14h2zm-2 14H6v2h12zM16 4h2v2h-2zm-4 0h2v6h-2z M12 8h6v2h-6zm-4 " +
    "8h8v2H8zm0-4h8v2H8zm0-4h2v2H8z",
  contact:
    "M2 2h20v2H2zM0 4h2v16H0zm22 0h2v16h-2zM2 20h20v2H2zM14 7h6v2h-6zm0 4h6v2h-6zm0 4h4v2h-4zM6 7h4v4" +
    "H6zm0 6h4v2H6zm4 2h2v2h-2zm-6 0h2v2H4z",
  github:
    "M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-" +
    "2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v" +
    "2Zm0 0h2v4h-2v-4Z",
  linkedin:
    "M7 22H1V8h6v14Zm12-12h-8v10h2v-8h4v2h-2v8H9V8h10v2Zm4 12h-6v-8h2v6h2v-8h2v10ZM3 20h2V10H3v10Zm18" +
    "-8h-2v-2h2v2ZM5 7H3V5h2v2ZM3 5H1V3h2v2Zm4 0H5V3h2v2ZM5 3H3V1h2v2Z",
  gmail:
    "M20 20H4v-2h16v2ZM4 18H2V6h2v12Zm18 0h-2V6h2v12ZM8 10h2v2H8v4H6V8h2v2Zm10 6h-2v-4h-2v-2h2V8h2v8Z" +
    "m-4-2h-4v-2h4v2Zm6-8H4V4h16v2Z",
  link: "M4 6h7v2H4zm0 10h7v2H4zM2 8h2v8H2zm18-2h-7v2h7zm0 10h-7v2h7zm2-8h-2v8h2zM7 11h10v2H7z",
  mail:
    "M6 8h2v2H6zm2 2h2v2H8zm10-2h-2v2h2zm-2 2h-2v2h2zm-6 2h4v2h-4zM2 6h2v12H2zm18 0h2v12h-2zM4 4h16v2" +
    "H4zm0 14h16v2H4z",
};
// Builds one icon as an inline SVG element painted in the text colour (currentColor).
// size defaults to 24, the icon grid; keep it a multiple of 24 (or 12, 16 with crisp edges) so pixels stay square.
function pxi(name, size = 24, cls = "") {
  const ns = "http://www.w3.org/2000/svg",
    svg = document.createElementNS(ns, "svg"),
    path = document.createElementNS(ns, "path");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", ("pxi " + cls).trim());
  path.setAttribute("d", PXI[name] || "");
  svg.append(path);
  return svg;
}
// =================================================================================================
// LANGUAGE FLAGS (ROOM HEADER AND EDITOR FIELDS)
// =================================================================================================

// pixel-art flags, 22x15 pixels each, painted from a colour rule per pixel (px, py are pixel centres)
const FLAG_W = 22,
  FLAG_H = 15;
const LANGS = [
  { code: "en", name: "English", paint: flagUk },
  { code: "aeb", name: "Tounsi", paint: flagTn },
  { code: "fr", name: "Français", paint: flagFr },
  { code: "de", name: "Deutsch", paint: flagDe },
];
// Union Jack: blue field, white and red diagonals, white-edged red cross.
function flagUk(px, py) {
  if (Math.abs(px - 11) < 1.5 || Math.abs(py - 7.5) < 1.2) return "#c8102e";
  if (Math.abs(px - 11) < 2.8 || Math.abs(py - 7.5) < 2.4) return "#ffffff";
  const d1 = Math.abs(px * 15 - py * 22) / 26.6,
    d2 = Math.abs(px * 15 + py * 22 - 330) / 26.6;
  if (Math.min(d1, d2) < 0.65) return "#c8102e";
  if (Math.min(d1, d2) < 1.7) return "#ffffff";
  return "#012169";
}
// Tunisia: red field, white disc, red crescent and star.
function flagTn(px, py) {
  const r = (x, y) => Math.hypot(px - x, py - y);
  if (r(11, 7.5) > 5.2) return "#e70013";
  const star = Math.abs(px - 12.5) + Math.abs(py - 7.5) < 1.6;
  const moon = r(11, 7.5) < 3.9 && r(12, 7.5) > 3.1;
  return star || moon ? "#e70013" : "#ffffff";
}
// France: blue, white and red vertical bands.
function flagFr(px) {
  return px < 7 ? "#0055a4" : px < 15 ? "#ffffff" : "#ef4135";
}
// Germany: black, red and gold horizontal bands.
function flagDe(px, py) {
  return py < 5 ? "#1b1b1b" : py < 10 ? "#dd0000" : "#ffce00";
}
// Paints one language's flag into a small canvas and returns it as an image url (cached).
function flagUrl(code) {
  const l = LANGS.find((x) => x.code === code) || LANGS[0];
  if (l.url) return l.url;
  const paint = l.paint,
    cv = document.createElement("canvas");
  cv.width = FLAG_W;
  cv.height = FLAG_H;
  const g = cv.getContext("2d");
  for (let y = 0; y < FLAG_H; y++)
    for (let x = 0; x < FLAG_W; x++) {
      g.fillStyle = paint(x + 0.5, y + 0.5);
      g.fillRect(x, y, 1, 1);
    }
  return (l.url = cv.toDataURL());
}
// =================================================================================================
// flagPicker()
// =================================================================================================

// Flag dropdown: a button with the current language's flag, and a menu of the four languages under it.
// get() returns the current language code; pick(code) runs when one is chosen; aria(lang) names the button.
function flagPicker(get, pick, aria = (l) => "Language: " + l.name) {
  const box = document.createElement("span"),
    btn = document.createElement("button"),
    menu = document.createElement("ul");
  box.className = "flagpick";
  btn.type = "button";
  btn.className = "lang-btn";
  btn.setAttribute("aria-haspopup", "true");
  menu.className = "lang-menu";
  menu.hidden = true;
  // Shows the current language on the button and marks it in the menu.
  box.refresh = () => {
    const l = LANGS.find((x) => x.code === get()) || LANGS[0],
      img = new Image();
    img.src = flagUrl(l.code);
    img.alt = "";
    btn.replaceChildren(img);
    btn.title = l.name;
    btn.setAttribute("aria-label", aria(l));
    menu.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === l.code));
  };
  LANGS.forEach((l) => {
    const li = document.createElement("li"),
      b = document.createElement("button"),
      img = new Image();
    b.type = "button";
    b.dataset.lang = l.code;
    img.src = flagUrl(l.code);
    img.alt = "";
    b.append(img, l.name);
    b.onclick = (e) => {
      e.stopPropagation();
      menu.hidden = true;
      pick(l.code);
      box.refresh();
    };
    li.append(b);
    menu.append(li);
  });
  btn.onclick = (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  };
  box.append(btn, menu);
  box.refresh();
  return box;
}
// a click outside an open flag menu, or Escape, closes it
addEventListener("pointerdown", (e) =>
  document.querySelectorAll(".lang-menu:not([hidden])").forEach((m) => {
    if (!m.parentElement.contains(e.target)) m.hidden = true;
  }),
);
addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".lang-menu").forEach((m) => (m.hidden = true));
});
