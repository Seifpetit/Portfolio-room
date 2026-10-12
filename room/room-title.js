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

