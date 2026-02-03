const pads = document.querySelectorAll(".pad");
const volumeSlider = document.getElementById("volumeSlider");
const stopAllBtn = document.getElementById("stopAllBtn");
const allowOverlap = document.getElementById("allowOverlap");
const fullscreenBtn = document.getElementById("fullscreenBtn");

let activeAudios = [];

/**
 * Plays an MP3 from /sounds/<Name>.mp3
 * Name comes from the button attribute: data-sound="Name"
 */
function playSound(name) {
  if (!allowOverlap.checked) stopAllSounds();

  const audio = new Audio(`sounds/${name}.mp3`);
  audio.volume = Number(volumeSlider.value);

  activeAudios.push(audio);

  audio.addEventListener("ended", () => {
    activeAudios = activeAudios.filter(a => a !== audio);
  });

  audio.play().catch(() => {
    // If a browser blocks playback for any reason, fail silently.
  });
}

function stopAllSounds() {
  activeAudios.forEach(a => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  });
  activeAudios = [];
}

// Hook up pad clicks
pads.forEach(btn => {
  btn.addEventListener("click", () => {
    const sound = btn.dataset.sound;
    if (sound) playSound(sound);
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
    // Hide the button if fullscreen isn't supported
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
