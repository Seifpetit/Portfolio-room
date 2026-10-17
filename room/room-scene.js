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

  // ===============================================================================================
  // ANIMATIONS
  // ===============================================================================================

  // Every sprite sheet animation, by sprite key: who plays it, its sheet (64x64 frames, 4 per row), frame count and
  // speed in frames a second. vary marks the idle variations. seq is a play order (walk and idle loop it, the
  // variations play it once; every frame in turn when left out). interact plays intro (a frame count, or a list)
  // once, then loop, then outro at their own speeds. Frame numbers count from 0, left to right, row by row.
  // <anim-settings> written by the editor's Animation page; edit it there, or by hand keeping both marker lines
  const ANIMS = {
    walk: { entity: "Capybara", name: "Walk", sheet: "assets/capybara-walk-sheet.png", frames: 8, fps: 10 },
    idle: { entity: "Capybara", name: "Idle", sheet: "assets/capybara-idle3.png", frames: 16, fps: 5 },
    idle2: { entity: "Capybara", name: "Idle 2", sheet: "assets/capybara-idle2.png", frames: 8, fps: 6, vary: true },
    idle4: { entity: "Capybara", name: "Idle 4", sheet: "assets/capybara-idle4.png", frames: 16, fps: 6, vary: true },
    drink: {
      entity: "Capybara",
      name: "Drink",
      sheet: "assets/capybara-drink.png",
      frames: 16,
      fps: 6,
      vary: true,
      seq: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 4, 3, 2, 0],
    },
    interact: {
      entity: "Capybara",
      name: "Interact",
      sheet: "assets/capybara-interact.png",
      frames: 16,
      fps: 10,
      intro: 8,
      loop: [8, 9, 10, 11, 12, 13, 14, 13, 12, 11, 10, 9],
      loopFps: 6,
      outro: [15, 6, 5, 4, 3, 2, 1, 0],
      outroFps: 14,
    },
  };
  // </anim-settings>

  // Image files to preload: the room, every animation sheet and furniture cutouts (zones add their own cutouts).
  const SPRITES = {
    room: "assets/room.png",
    ...Object.fromEntries(Object.entries(ANIMS).map(([k, a]) => [k, a.sheet])),
    "occ-gear": "assets/occ-gear.png",
    "occ-plant": "assets/occ-plant.png",
  };

  // Capybara frames: 64x64, 4 per row, drawn facing right and mirrored for left; feet 60 px down the frame.
  const CHAR = { frame: 64, cols: 4, frames: ANIMS.walk.frames, footY: 60, scale: 1.15, facesLeft: false };

  // Room coordinates are measured on the 2x room art, so outlines are halved: d2 maps them to room.png pixels.
  const d2 = (pts) => pts.map(([x, y]) => [x / 2, y / 2]);
  // ===============================================================================================
  // ZONES
  // ===============================================================================================

  // Interactive zones (Projects, CV, Contact...): one file each in room/zones/, loaded by index.html right after
  // this file. Each file calls zone({...}) with its outline, stand spot, label, dialogue and panel (see the README).
  const ZONES = [];
  // Registers a zone, and loads its own stylesheet when it names one.
  function zone(z) {
    ZONES.push(z);
    if (z.css) document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: z.css }));
  }

  // The registered zone with this id, if any.
  const zoneById = (id) => ZONES.find((z) => z.id === id);

  // ===============================================================================================
  // BLOCKED
  // ===============================================================================================

  // Floor areas that are not walkable: the furniture footprints that belong to no zone (zones bring their own)
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
  ];

  // Floor tiles painted by hand on the editor's Zones page, on top of the footprints: tiles he can always walk on
  // (walk) and tiles he never walks on (block), as "i,j" grid keys.
  // <floor-settings> written by the editor's Zones page; edit it there, or by hand keeping both marker lines
  const FLOOR = { walk: [], block: [] };
  // </floor-settings>

