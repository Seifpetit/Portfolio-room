// =================================================================================================
// PXI
// =================================================================================================

// Pixel art icons from Pixelarticons by Gerrit Halfmann (https://pixelarticons.com), MIT licensed:
// Copyright (c) 2019 Gerrit Halfmann. Only the icons this site uses are copied here, as 24x24 path data.
// Shared by the room (index.html) and the local editor (admin/).
const PXI = {
  // Two-script translation glyph for the editor's Translation tiles.
  languages:
    "M7 2h4v2H7zM2 5h14v2H2zm9 2h2v2h-2zM9 9h2v2H9zm-2 2h2v2H7zM5 9h2v2H5zm4 4h2v2H9z" +
    "m-4 0h2v2H5zm8 2h2v7h-2zm2-2h5v2h-5zm5 2h2v7h-2zm-5 2h5v2h-5z",

  "arrow-left": "M20 11v2H4v-2zM8 13v2H6v-2zm2 2v2H8v-2zm2 2v2h-2v-2zm-4-6V9H6v2z M10 15V7H8v8zm2 2V5h-2v12z",
  "arrow-right": "M4 11v2h16v-2zm12 2v2h2v-2zm-2 2v2h2v-2zm-2 2v2h2v-2zm4-6V9h2v2z M14 15V7h2v8zm-2 2V5h2v12z",
  "arrow-up": "M11 20h2V4h-2zm2-12h2V6h-2zm2 2h2V8h-2zm2 2h2v-2h-2zm-6-4H9V6h2z M15 10H7V8h8zm2 2H5v-2h12z",
  "arrow-down": "M13 12h6v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2h6V4h2v8Z",
  // X cross for closing modals and removing images.
  close:
    "M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H1" +
    "3V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7" +
    " 7H5V5H7V7ZM19 7H17V5H19V7Z",

  trash: "M18 22H6V20H18V22ZM9 6H15V4H17V6H22V8H20V20H18V8H6V20H4V8H2V6H7V4H9V6ZM15 4H9V2H15V4Z",
  // Pencil shown over an editable image or icon on hover.
  pencil:
    "M4 16H6V18H8V20H10V22H2V14H4V16ZM12 20H10V18H12V20ZM14 18H12V16H14V18ZM10 16H8V14H10V16ZM16 16H1" +
    "4V14H16V16ZM6 14H4V12H6V14ZM12 14H10V12H12V14ZM18 14H16V12H18V14ZM8 12H6V10H8V12ZM14 12H12V10H14" +
    "V12ZM20 12H18V10H20V12ZM10 10H8V8H10V10ZM18 10H16V8H18V10ZM22 10H20V8H22V10ZM12 8H10V6H12V8ZM16 " +
    "8H14V6H16V8ZM20 8H18V6H20V8ZM14 6H12V4H14V6ZM18 6H16V4H18V6ZM16 4H14V2H16V4Z",

  // Framed landscape picture shown in empty image slots.
  image:
    "M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-4 8h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm-8 0h2" +
    "v2h-2zm2 2h2v2h-2zm2 2h2v2h-2z M20 16h2v2h-2zM8 16h2v2H8zm-2 2h2v2H6zM8 6h2v2H8zM6 8h2v2H6zm2 2h" +
    "2v2H8zm2-2h2v2h-2z",

  // Down chevron prompting the reader on to the next line.
  "chevron-down":
    "M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0" + "h-2V8h2v2Z",

  plus: "M13 11h7v2h-7v7h-2v-7H4v-2h7V4h2v7Z",
  // Up chevron on the Zones page's folded bottom bar.
  "chevron-up": "M7 16H5v-2h2v-2h2v-2h2V8h2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2h-2v2H9v2H7v2z",
  // Tick for the Zones page's Walkable floor brush.
  check:
    "M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8z" +
    "m-2-2h2v2H6v-2zm0 0H4v-2h2v2z",
  // Standing figure for the Zones page's Test walk, the one who walks the zone.
  human: "M10 2h4v4h-4V2zM3 7h18v2h-6v13h-2v-6h-2v6H9V9H3V7z",
  // Minus for the Zones page's zoom out.
  minus: "M4 11h16v2H4z",
  // Four arrows for the Zones page's Select tool, which also moves a zone.
  move:
    "M13 0h-2v2H9v2H7v2h2V4h2v7H4V9h2V7H4v2H2v2H0v2h2v2h2v2h2v-2H4v-2h7v7H9v-2H7v2h2v2h2v2h2v-2h2v-2h2v-2h-2v2h-2v-" +
    "7h7v2h-2v2h2v-2h2v-2h2v-2h-2V9h-2V7h-2v2h2v2h-7V4h2v2h2V4h-2V2h-2V0z",
  // Floppy disk for the editor's Save button.
  save:
    "M20 22H4V20H6V14H8V20H16V14H18V20H20V22ZM4 20H2V4H4V20ZM22 20H20V6H22V20ZM16 14H8V12H16V14ZM12 1" +
    "0H6V6H12V10ZM20 6H18V4H20V6ZM18 4H4V2H18V4Z",

  upload: "M19 21H5v-2h14v2ZM5 19H3v-4h2v4Zm16 0h-2v-4h2v4ZM13 5h2v2h2v2h-4v8h-2V9H7V7h2V5h2V3h2v2Z",
  // Box with an outgoing arrow for links that open elsewhere.
  "external-link":
    "M11 5H5v2h6V5ZM5 7H3v12h2V7Zm12 12H5v2h12v-2Zm2-6h-2v6h2v-6Zm-8 0H9v2h2v-2Zm2-2h-2v2h2v-2Zm2-2h-" +
    "2v2h2V9Zm2-2h-2v2h2V7Zm2-2h-2v2h2V5Zm2-2h-2v8h2V3Z M21 3h-8v2h8V3Z",

  // Arrow dropping into a tray for the CV PDF download.
  download:
    "M21 15v4h-2v-4zm-2 4v2H5v-2zM5 15v4H3v-4zm8-12v14h-2V3z M7 11v2h10v-2zm2 2v2h2v-2zm4 0v2h2v-2z M" +
    "15 11v2h2v-2z",

  briefcase: "M2 8h2v12H2zm18 0h2v12h-2zM4 6h16v2H4zm0 14h16v2H4zM8 4h2v2H8zm2-2h4v2h-4zm4 2h2v2h-2z",
  // Page of text for the CV label and tile.
  "file-text":
    "M6 4H4v16h2zm10-2H6v2h10zm4 4h-2v14h2zm-2 14H6v2h12zM16 4h2v2h-2zm-4 0h2v6h-2z M12 8h6v2h-6zm-4 " +
    "8h8v2H8zm0-4h8v2H8zm0-4h2v2H8z",

  // Contact card with a portrait for the Contact label and tile.
  contact:
    "M2 2h20v2H2zM0 4h2v16H0zm22 0h2v16h-2zM2 20h20v2H2zM14 7h6v2h-6zm0 4h6v2h-6zm0 4h4v2h-4zM6 7h4v4" +
    "H6zm0 6h4v2H6zm4 2h2v2h-2zm-6 0h2v2H4z",

  // GitHub octocat logo.
  github:
    "M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-" +
    "2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v" +
    "2Zm0 0h2v4h-2v-4Z",

  // LinkedIn "in" logo.
  linkedin:
    "M7 22H1V8h6v14Zm12-12h-8v10h2v-8h4v2h-2v8H9V8h10v2Zm4 12h-6v-8h2v6h2v-8h2v10ZM3 20h2V10H3v10Zm18" +
    "-8h-2v-2h2v2ZM5 7H3V5h2v2ZM3 5H1V3h2v2Zm4 0H5V3h2v2ZM5 3H3V1h2v2Z",

  // Gmail M-envelope logo.
  gmail:
    "M20 20H4v-2h16v2ZM4 18H2V6h2v12Zm18 0h-2V6h2v12ZM8 10h2v2H8v4H6V8h2v2Zm10 6h-2v-4h-2v-2h2V8h2v8Z" +
    "m-4-2h-4v-2h4v2Zm6-8H4V4h16v2Z",

  link: "M4 6h7v2H4zm0 10h7v2H4zM2 8h2v8H2zm18-2h-7v2h7zm0 10h-7v2h7zm2-8h-2v8h2zM7 11h10v2H7z",
  // Plain envelope for a generic email link.
  mail:
    "M6 8h2v2H6zm2 2h2v2H8zm10-2h-2v2h2zm-2 2h-2v2h2zm-6 2h4v2h-4zM2 6h2v12H2zm18 0h2v12h-2zM4 4h16v2" +
    "H4zm0 14h16v2H4z",
  // More room-label icons for the Zones page's icon picker (pages 2 and 3).
  book: "M8 2h12v20H4V2h4zm4 8h-2v2H8V4H6v16h12V4h-4v8h-2v-2z",
  "book-open": "M3 3h8v2H3v12h8V5h2v12h8V5h-8V3h10v16H13v2h-2v-2H1V3h2zm16 7h-4v2h4v-2zm-4-3h4v2h-4V7zm2 6h-2v2h2v-2z",
  music: "M8 4h12v16h-8v-8h6V8h-8v12H2v-8h6V4zm0 10H4v4h4v-4zm10 0h-4v4h4v-4z",
  headphone: "M19 4H5v2H3v14h7v-8H5V6h14v6h-5v8h7V6h-2V4zm-3 10h3v4h-3v-4zm-8 0v4H5v-4h3z",
  gamepad: "M2 5h20v14H2V5zm18 12V7H4v10h16zM8 9h2v2h2v2h-2v2H8v-2H6v-2h2V9zm6 0h2v2h-2V9zm4 4h-2v2h2v-2z",
  camera: "M9 3H7v2H2v16h20V5h-5V3H9zm8 4h3v12H4V7h5V5h6v2h2zm-7 2h4v2h-4V9zm4 6h-4v2h4v-2h2v-4h-2v4zm-6-4h2v4H8v-4z",
  coffee: "M4 4h18v7h-4v5H4V4zm14 5h2V6h-2v3zm-2-3H6v8h10V6zm3 14H3v-2h16v2z",
  // heart
  heart:
    "M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2" +
    "V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z",
  // home
  home:
    "M14 2h-4v2H8v2H6v2H4v2H2v2h2v10h7v-6h2v6h7V12h2v-2h-2V8h-2V6h-2V4h-2V2zm0 2v2h2v2h2v2h2v2h-2v8h-3v-6H9v6H6" +
    "v-8H4v-2h2V8h2V6h2V4h4z",
  user: "M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z",
  // users
  users:
    "M11 0H5v2H3v6h2v2h6V8H5V2h6V0zm0 2h2v6h-2V2zM0 14h2v4h12v2H0v-6zm2 0h12v-2H2v2zm14 0h-2v6h2v-6zM15 0h4v2h-4" +
    "V0zm4 8h-4v2h4V8zm0-6h2v6h-2V2zm5 12h-2v4h-4v2h6v-6zm-6-2h4v2h-4v-2z",
  message: "M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2z",
  chat: "M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2z",
  // map
  map:
    "M8 2h2v2h2v2h-2v10H8V6H6V4h2V2zM4 8V6h2v2H4zm2 10v2H4v2H2V8h2v10h2zm0 0h2v-2H6v2zm6 0h-2v-2h2v2zm2-10V6h-2v2" +
    "h2zm2 0h-2v10h-2v2h2v2h2v-2h2v-2h2v-2h2V2h-2v2h-2v2h-2v2zm0 0h2V6h2v10h-2v2h-2V8z",
  calendar: "M15 2h2v2h4v18H3V4h4V2h2v2h6V2zM5 8h14V6H5v2zm0 2v10h14V10H5z",
  clock: "M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z",
  trophy: "M16 3H6v2H2v10h6V5h8v10h6V5h-4V3h-2zm4 4v6h-2V7h2zM6 13H4V7h2v6zm12 2H6v2h12v-2zm-7 2h2v2h3v2H8v-2h3v-2z",
  gift: "M19 12v8h-7m7-8h2V8h-3m1 4H5m13-4V4h-6m6 4H6m0 0V4h6M6 8H3v4h2m0 0v8h7m0 0V4",
  // code
  code:
    "M8 5h2v2H8V5zM6 7h2v2H6V7zM4 9h2v2H4V9zm-2 2h2v2H2v-2zm2 2h2v2H4v-2zm2 2h2v2H6v-2zm2 2h2v2H8v-2zm8-12h-2v2h2" +
    "V5zm2 2h-2v2h2V7zm2 2h-2v2h2V9zm2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm-2 2h-2v2h2v-2z",
  monitor: "M20 3H2v14h8v2H8v2h8v-2h-2v-2h8V3h-2zm-6 12H4V5h16v10h-6z",
  "device-laptop": "M6 4H4v12h16V4H6zm12 2v8H6V6h12zm4 12H2v2h20v-2z",
  "device-phone": "M6 3h12v18H6V3zm10 16V5h-2v2h-4V5H8v14h8zm-5-4h2v2h-2v-2z",
  // cloud
  cloud:
    "M16 4h-6v2H8v2H4v2H2v2H0v6h2v2h20v-2h2v-6h-2v-2h-2V8h-2V6h-2V4zm2 8h4v6H2v-6h2v-2h4v2h2v-2H8V8h2V6h6v2h2v4z" +
    "m0 0v2h-2v-2h2z",
  // lightbulb
  lightbulb:
    "M8 2h8v2H8V2ZM6 6V4h2v2H6Zm0 6H4V6h2v6Zm2 2H6v-2h2v2Zm8 0v4H8v-4h2v2h4v-2h2Zm2-2v2h-2v-2h2Zm0-6h2v6h-2V6Z" +
    "m0 0V4h-2v2h2Zm-2 14H8v2h8v-2Z",
  // zap
  zap:
    "M12 1h2v8h8v4h-2v-2h-8V5h-2V3h2V1zM8 7V5h2v2H8zM6 9V7h2v2H6zm-2 2V9h2v2H4zm10 8v2h-2v2h-2v-8H2v-4h2v2h8v6h2z" +
    "m2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0 0h2v-2h-2v2z",
  // sun
  sun:
    "M13 3h-2v2h2V3zm4 2h2v2h-2V5zm-6 6h2v2h-2v-2zm-8 0h2v2H3v-2zm18 0h-2v2h2v-2zM5 5h2v2H5V5zm14 14h-2v-2h2v2z" +
    "m-8 2h2v-2h-2v2zm-4-2H5v-2h2v2zM9 7h6v2H9V7zm0 8H7V9h2v6zm0 0v2h6v-2h2V9h-2v6H9z",
  // moon
  moon:
    "M6 2h8v2h-2v2h-2V4H6V2ZM4 6V4h2v2H4Zm0 10H2V6h2v10Zm2 2H4v-2h2v2Zm2 2H6v-2h2v2Zm10 0v2H8v-2h10Zm2-2v2h-2v-2" +
    "h2Zm-2-4h2v4h2v-8h-2v2h-2v2Zm-6 0v2h6v-2h-6Zm-2-2h2v2h-2v-2Zm0 0V6H8v6h2Z",
  "paint-bucket": "M8 3h8v2H8V3zm0 2H6v4H4v12h16V9h-2V5h-2v4H8V5zm8 6h2v8H6v-8h2v6h2v-4h2v2h2v-2h2v-2z",
  notes: "M5 2h16v20H3V2h2zm14 18V4H5v16h14zM7 6h10v2H7V6zm10 4H7v2h10v-2zM7 14h7v2H7v-2z",
  note: "M3 2h18v14h-2v2h-2v-2h-2v2h2v2h-2v2H3V2zm2 2v16h8v-6h6V4H5z",
  clipboard: "M10 2h6v2h4v18H4V4h4V2h2zm6 4v2H8V6H6v14h12V6h-2zm-2 0V4h-4v2h4z",
  folder: "M4 4h8v2h10v14H2V4h2zm16 4H10V6H4v12h16V8z",
  archive: "M22 4H2v6h2v10h16V10h2V4zM6 10h12v8H6v-8zm14-4v2H4V6h16zm-5 6H9v2h6v-2z",
  // briefcase check
  "briefcase-check":
    "M16 3H8v4H2v14h20V7h-6V3zm-2 4h-4V5h4v2zM4 19V9h16v10H4zm10-8h2v2h-2v-2zm-2 4v-2h2v2h-2zm-2 0h2v2h-2v-2zm0 0" +
    "H8v-2h2v2z",
  bookmark: "M18 2H6v2h12v16h-2v-2h-2v-2h-4v2H8v2H6V2H4v20h4v-2h2v-2h4v2h2v2h4V2h-2z",
  flag: "M3 2h10v2h8v14H11v-2H5v6H3V2zm2 12h8v2h6V6h-8V4H5v10z",
  // search
  search:
    "M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2" +
    "v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z",
  // eye
  eye:
    "M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4" +
    "v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z",
  lock: "M15 2H9v2H7v4H4v14h16V8h-3V4h-2V2zm0 2v4H9V4h6zm-6 6h9v10H6V10h3zm4 3h-2v4h2v-4z",
  "shopping-bag": "M9 2h6v2H9V2zm6 4V4h2v2h4v16H3V6h4V4h2v2h6zm0 2H9v2H7V8H5v12h14V8h-2v2h-2V8z",
  cart: "M2 2h4v4h16v11H4V4H2V2zm4 13h14V8H6v7zm0 4h3v3H6v-3zm14 0h-3v3h3v-3z",
  // coin
  coin:
    "M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0" +
    "V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z",
  // building community
  "building-community":
    "M20 2h2v20H2v-8h2v6h4v-4h2v4h4v-6h2v6h4V4H10v2H8V2h12zm-8 10h2v2h-2v-2zm-2-2h2v2h-2v-2zm-2 0V8h2v2H8zm-2 2" +
    "v-2h2v2H6zm0 0H4v2h2v-2zm10-6h2v2h-2V6zm-2 0h-2v2h2V6zm2 4h2v2h-2v-2z",
  // building
  building:
    "M3 2h18v20H3V2zm12 16v2h4V4H5v16h4v-2h6zM7 6h2v2H7V6zm6 0h-2v2h2V6zm2 0h2v2h-2V6zm-6 4H7v2h2v-2zm2 0h2v2h-2" +
    "v-2zm6 0h-2v2h2v-2zM7 14h2v2H7v-2zm6 0h-2v2h2v-2zm4 0h-2v2h2v-2z",
  video: "M2 5h14v4h2V7h2V5h2v14h-2v-2h-2v-2h-2v4H2V5zm2 12h10V7H4v10z",
  play: "M10 20H8V4h2v2h2v3h2v2h2v2h-2v2h-2v3h-2v2z",
  // sliders
  sliders:
    "M17 4h2v10h-2V4zm0 12h-2v2h2v2h2v-2h2v-2h-4zm-4-6h-2v10h2V10zm-8 2H3v2h2v6h2v-6h2v-2H5zm8-8h-2v2H9v2h6V6h-2" +
    "V4zM5 4h2v6H5V4z",
  // script text
  "script-text":
    "M6 3h14v2h2v6h-2v8h-2V5H6V3zm8 14v-2H6V5H4v10H2v4h2v2h14v-2h-2v-2h-2zm0 0v2H4v-2h10zM8 7h8v2H8V7zm8 4H8v2h8" +
    "v-2z",
  // human run
  "human-run":
    "M10 3H8v2H6v2h2V5h2v2h2v2h-2v2H8v2H6v2H4v-2H2v2h2v2h2v-2h4v2h2v2h-2v2h2v-2h2v-2h-2v-4h2v-2h2v2h2v2h2v-2h2v-2" +
    "h-2v2h-2v-2h-2V9h2V5h-4v2h-2V5h-2V3z",
  // cake
  cake:
    "M6 2h2v2H6V2zm2 3H6v3H2v9h6v-2h2v2h4v-2h2v2h6V8h-4V5h-2v3h-3V5h-2v3H8V5zm12 10h-4v-3h-2v3h-4v-3H8v3H4v-5h16" +
    "v5zM2 20h20v2H2v-2zM13 2h-2v2h2V2zm3 0h2v2h-2V2zM2 17h2v3H2zm18 0h2v3h-2z",
  server: "M3 3h18v18H3V3zm2 2v6h14V5H5zm14 8H5v6h14v-6zM7 7h2v2H7V7zm2 8H7v2h2v-2z",
  // mood happy
  "mood-happy":
    "M5 3h14v2H5V3zm0 16H3V5h2v14zm14 0v2H5v-2h14zm0 0h2V5h-2v14zM10 8H8v2h2V8zm4 0h2v2h-2V8zm-5 6v-2H7v2h2zm6 0" +
    "v2H9v-2h6zm0 0h2v-2h-2v2z",
};

// Builds one icon as an inline SVG element painted in the text colour (currentColor).
// size defaults to 24, the icon grid; keep it a multiple of 24 (or 12, 16 with crisp edges) so pixels stay square.
function pxi(name, size = 24, cls = "") {
  // Creates the SVG element and its single path in the SVG namespace.
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

// The four site languages, each with its menu name and flag painter.
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
  // Distance to each diagonal: red saltire edged in white on the blue field.
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
  // Offscreen canvas exactly one flag in size.
  const paint = l.paint,
    cv = document.createElement("canvas");

  cv.width = FLAG_W;
  cv.height = FLAG_H;
  const g = cv.getContext("2d");
  // Colours every pixel from the flag's rule, sampled at its centre.
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
  // Wrapper, flag button and the hidden language list.
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
    // Current language (English if unknown) and its flag image.
    const l = LANGS.find((x) => x.code === get()) || LANGS[0],
      img = new Image();

    img.src = flagUrl(l.code);
    img.alt = "";
    btn.replaceChildren(img);
    btn.title = l.name;
    btn.setAttribute("aria-label", aria(l));
    menu.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === l.code));
  };

  // Adds one menu entry per language.
  LANGS.forEach((l) => {
    // Each entry is a list item holding a flag-and-name button.
    const li = document.createElement("li"),
      b = document.createElement("button"),
      img = new Image();

    b.type = "button";
    b.dataset.lang = l.code;
    img.src = flagUrl(l.code);
    img.alt = "";
    b.append(img, l.name);
    // Choosing a language closes the menu, applies it and updates the button.
    b.onclick = (e) => {
      e.stopPropagation();
      menu.hidden = true;
      pick(l.code);
      box.refresh();
    };

    li.append(b);
    menu.append(li);
  });

  // The flag button toggles the menu without counting as an outside click.
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

// Escape closes every open flag menu.
addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".lang-menu").forEach((m) => (m.hidden = true));
});
