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
  // Marks every tile whose centre lies inside a furniture footprint as blocked: the room's furniture, then each
  // zone's own, then the tiles painted by hand (FLOOR). The editor's Zones page calls it again after each edit.
  function markBlocked() {
    const prints = BLOCKED.concat(ZONES.filter((z) => z.blocked).map((z) => z.blocked));
    blocked.clear();
    SQUEEZE.forEach((k) => blocked.add(k));
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) if (prints.some((p) => inPoly(center(i, j), p))) blocked.add(i + "," + j);
    FLOOR.block.forEach((k) => blocked.add(k)); // tiles painted no-go
    FLOOR.walk.forEach((k) => blocked.delete(k)); // tiles painted walkable win over the footprints
  }

  markBlocked();

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
  // repaint its pixels (assets/occ-*.png) over him. A zone with an occluder image adds its own, over its footprint.
  const OCC = [
    ["gear", BLOCKED[1]],
    ["plant", BLOCKED[2]],
    ...ZONES.filter((z) => z.occluder && z.blocked).map((z) => [z.id, z.blocked, z.occluder]),
  ].map(([id, poly, src]) => {
    if (src) SPRITES["occ-" + id] = src; // preload the zone's cutout with the other sprites
    // Keeps the furniture footprint and its left and right edges for quick checks.
    const xs = poly.map((p) => p[0]);
    return { id, poly, minX: Math.min(...xs), maxX: Math.max(...xs) };
  });

  // Zones with their own capybara animation: preload each sheet with the other sprites.
  ZONES.forEach((z) => z.anim && z.anim.sheet && (SPRITES["anim-" + z.id] = z.anim.sheet));

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

  // Floor marker for the clicked spot, the id of the hovered hotspot, and the panel-less zone he is resting at
  // (he keeps playing its animation until he walks off).
  let marker = null,
    hover = null,
    restZone = null;

  const SPEED = 80; // room px per second

  // Walks the capybara to the room point (px, py), optionally heading for an object to interact with.
  function goTo(px, py, obj) {
    const target = obj ? obj.stand : [px, py];
    if (restZone) player.rising = true; // walking off a rest: he plays the zone's turn-back before he moves
    restZone = null;
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

