  // ===============================================================================================
  // PANELS
  // ===============================================================================================

  const overlay = document.getElementById("overlay");
  let opener = null;

  // ===============================================================================================
  // openPanel()
  // ===============================================================================================

  // Opens a zone's panel (built by its zone file) and wires up the hover lines in the banner.
  function openPanel(id) {
    const z = zoneById(id);
    opener = document.activeElement;
    document.getElementById("dlg-title").textContent = ui(z.name);
    document.getElementById("dlg-body").replaceChildren(z.build());
    const floating = !!z.float;
    document.querySelector(".dialog").classList.toggle("wide", floating);
    document.querySelector(".dialog").dataset.panel = id;
    overlay.classList.toggle("floating", floating);
    document.body.classList.toggle("floating", floating);
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

    overlay.hidden = false;
    document.getElementById("close").focus();
    if (z.opened) z.opened(); // the zone wires its own panel now that it is on screen
  }

  // Closes the panel and returns to the room.
  function closePanel() {
    ZONES.forEach((z) => z.closed && z.closed()); // each zone puts its own panel state back
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
  // Presses on the dimmed backdrop close the panel, unless the open zone handles them first (the CV unzooms).
  overlay.addEventListener("pointerdown", (e) => {
    const z = zoneById(document.querySelector(".dialog").dataset.panel);
    if (z && z.press && z.press(e)) return;

    // A press on the backdrop or empty panel space closes the panel.
    if (e.target === overlay || (overlay.classList.contains("floating") && e.target.matches(".dialog, #dlg-body")))
      closePanel();
  });

  // Escape closes an open panel.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closePanel();
  });

  // The header shortcut buttons, and the start screen's quick links, open their panel directly, skipping the walk.
  document.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.closest(".title-quick")) startRoom(); // a quick link also puts the start screen away
      endTalk(false);
      openPanel(b.dataset.open);
    }),
  );

  ZONES.forEach((z) => z.init && z.init()); // zones set up their own room-wide listeners once
