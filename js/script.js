const pads = document.querySelectorAll(".pad");
const volumeSlider = document.getElementById("volumeSlider");
const stopAllBtn = document.getElementById("stopAllBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

let activeAudios = [];
let activeButtons = new Set();

/**
 * Plays an MP3 from /sounds/<Name>.mp3
 * Name comes from the button attribute: data-sound="Name"
 * Behavior: ALWAYS stop all currently playing audio before starting a new one.
 * Adds a "playing" ring to the pressed pad while audio is playing.
 */
function playSound(name, buttonEl) {
  stopAllSounds();

  const audio = new Audio(`audio/${name}.mp3`);
  audio.volume = Number(volumeSlider.value);

  // Add active ring to the clicked button
  if (buttonEl) {
    buttonEl.classList.add("is-playing");
    activeButtons.add(buttonEl);
  }

  activeAudios.push(audio);

  audio.addEventListener("ended", () => {
    // Remove ring when audio finishes
    if (buttonEl) {
      buttonEl.classList.remove("is-playing");
      activeButtons.delete(buttonEl);
    }
    activeAudios = activeAudios.filter(a => a !== audio);
  });

  audio.play().catch(() => {
    // If playback fails, remove ring
    if (buttonEl) {
      buttonEl.classList.remove("is-playing");
      activeButtons.delete(buttonEl);
    }
  });
}

function stopAllSounds() {
  // Stop audio
  activeAudios.forEach(a => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  });
  activeAudios = [];

  // Remove any active rings
  activeButtons.forEach(btn => btn.classList.remove("is-playing"));
  activeButtons.clear();
}

// Hook up pad clicks
pads.forEach(btn => {
  btn.addEventListener("click", () => {
    const sound = btn.dataset.sound;
    if (sound) playSound(sound, btn);
  });
});

// Stop All button
stopAllBtn.addEventListener("click", stopAllSounds);

// Live volume update
volumeSlider.addEventListener("input", () => {
  const v = Number(volumeSlider.value);
  activeAudios.forEach(a => a.volume = v);
});

// Fullscreen toggle (works on most desktop/tablet browsers; may be blocked on some mobile browsers)
function fullscreenSupported() {
  return !!document.documentElement.requestFullscreen;
}

if (fullscreenBtn) {
  if (!fullscreenSupported()) {
    fullscreenBtn.style.display = "none";
  } else {
    fullscreenBtn.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch {
        // Some browsers block fullscreen; ignore
      }
    });
  }
}
