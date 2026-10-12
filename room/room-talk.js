  // ===============================================================================================
  // DIALOGUE
  // ===============================================================================================

  // Dialogue banner and the element its typed text goes into.
  const banner = document.getElementById("banner"),
    bText = document.getElementById("banner-text");

  // Current dialogue state and the project card being hovered.
  let talkState = null,
    hoverCard = null; // hoverCard: project card under the pointer, shown once his intro line is done

  // Starts the dialogue banner for an object, then opens its panel when the lines are done.
  function talk(id) {
    talkState = { id, i: 0, shown: 0, timer: null };
    if (!hasPanel(id)) restZone = id; // no panel: he stays in the zone's animation until he walks off
    banner.hidden = false;
    say();
    if (floats(id)) openPanel(id); // cards and icons pop up right away while he talks
  }

  // Types the current dialogue line one character at a time.
  function say() {
    // The talk state and the line being typed.
    const st = talkState,
      line = LINES[st.id][st.i];

    st.shown = 0;
    bText.textContent = "";
    clearInterval(st.timer);
    // Reveals one more character every 28 ms.
    st.timer = setInterval(() => {
      bText.textContent = line.slice(0, ++st.shown);
      // Line fully typed: stop the typing timer.
      if (st.shown >= line.length) {
        clearInterval(st.timer);
        // After a short pause, swaps in the hovered card's line if there is one.
        st.hold = setTimeout(() => {
          st.held = true;
          if (hoverCard && talkState === st) bText.textContent = hoverCard.dataset.say;
        }, 1200);
      }
    }, 28);
  }

  // ===============================================================================================
  // advance()
  // ===============================================================================================

  // Click or key on the banner: finish the line, go to the next one, or end the talk.
  function advance() {
    const st = talkState;
    if (!st) return;
    const line = LINES[st.id][st.i];
    // Still typing: show the whole line at once.
    if (st.shown < line.length) {
      clearInterval(st.timer);
      st.shown = line.length;
      bText.textContent = line;
      // For floating panels, let a hovered card take over after the same pause.
      if (floats(st.id))
        st.hold = setTimeout(() => {
          st.held = true;
          if (hoverCard && talkState === st) bText.textContent = hoverCard.dataset.say;
        }, 1200);

      return;
    }

    if (floats(st.id)) return; // the floating content is already up
    // Moves on to the next dialogue line if there is one.
    if (st.i < LINES[st.id].length - 1) {
      st.i++;
      say();
      return;
    }

    endTalk(true);
  }

  // Ends the dialogue; opens the panel when asked to.
  function endTalk(open) {
    if (!talkState) return;
    clearInterval(talkState.timer);
    const id = talkState.id;
    talkState = null;
    banner.hidden = !(open && floats(id)); // floating panels keep the capybara talking under the floating cards
    if (open && hasPanel(id)) openPanel(id);
  }

  document.getElementById("banner-inner").addEventListener("pointerdown", advance);
  // Enter or Space advances the dialogue; Escape closes it.
  addEventListener("keydown", (e) => {
    if (talkState && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      advance();
    } else if (talkState && e.key === "Escape") endTalk(false);
  });

