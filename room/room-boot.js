  // ===============================================================================================
  // LANGUAGE FLAGS
  // ===============================================================================================

  // the flag in the header switches the room's language (remembered on this device)
  const langBox = document.getElementById("lang");
  // Adds the language flag picker to the header.
  if (langBox)
    langBox.append(
      flagPicker(
        () => LANG,
        (code) => {
          LANG = code;
          // Remembers the chosen language on this device, if storage allows.
          try {
            localStorage.setItem("lang", code);
          } catch (e) {}

          applyContent();
        },
        (l) => ui("sr.language", { name: l.name }),
      ),
    );

  document.querySelector(".banner-next").replaceChildren(pxi("chevron-down"));

  resize();
  // Once everything has loaded, starts the animation and lets the title be dismissed.
  Promise.all(loads).then(() => {
    requestAnimationFrame(frame);
    setTimeout(() => title && title.classList.add("ready"), 150);
  });
