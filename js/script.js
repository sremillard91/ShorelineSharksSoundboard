const pads = document.querySelectorAll(".pad");
const volumeSlider = document.getElementById("volumeSlider");
const stopAllBtn = document.getElementById("stopAllBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

let activeAudios = [];
let activeButtons = new Set();
let currentAudio = null;      // the one audio we’re playing (no-overlap mode)
let currentButton = null;     // the pad associated with currentAudio

/* Keep controls stuck directly under the header on all devices */
function updateStickyOffsets() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  document.documentElement.style.setProperty("--topbar-h", `${topbar.offsetHeight}px`);
}
window.addEventListener("load", updateStickyOffsets);
window.addEventListener("resize", updateStickyOffsets);

function setPlayPauseLabel() {
  if (!playPauseBtn) return;
  if (currentAudio && !currentAudio.paused) playPauseBtn.textContent = "Pause";
  else playPauseBtn.textContent = "Play";
}

function setPlaying(btn, isPlaying) {
  if (!btn) return;
  if (isPlaying) {
    btn.classList.add("is-playing");
    activeButtons.add(btn);
  } else {
    btn.classList.remove("is-playing");
    activeButtons.delete(btn);
  }
}

function playSound(name, buttonEl) {
  stopAllSounds();

  const audio = new Audio(`audio/${name}.mp3`);
  audio.volume = Number(volumeSlider.value);

  currentAudio = audio;
  currentButton = buttonEl;

  if (buttonEl) setPlaying(buttonEl, true);

  activeAudios.push(audio);

  audio.addEventListener("ended", () => {
    if (buttonEl) setPlaying(buttonEl, false);
    activeAudios = activeAudios.filter(a => a !== audio);

    // clear current pointers
    if (currentAudio === audio) {
      currentAudio = null;
      currentButton = null;
      setPlayPauseLabel();
    }
  });

  audio.addEventListener("pause", () => {
    setPlayPauseLabel();
  });

  audio.addEventListener("play", () => {
    setPlayPauseLabel();
  });

  audio.play().then(() => {
    setPlayPauseLabel();
  }).catch(() => {
    // playback failed, remove ring and clear current audio
    if (buttonEl) setPlaying(buttonEl, false);
    currentAudio = null;
    currentButton = null;
    setPlayPauseLabel();
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

  activeButtons.forEach(btn => btn.classList.remove("is-playing"));
  activeButtons.clear();

  currentAudio = null;
  currentButton = null;
  setPlayPauseLabel();
}

/* Pads */
pads.forEach(btn => {
  btn.addEventListener("click", () => {
    const sound = btn.dataset.sound;
    if (sound) playSound(sound, btn);
  });
});

/* Stop All */
stopAllBtn.addEventListener("click", stopAllSounds);

/* Volume live updates */
volumeSlider.addEventListener("input", () => {
  const v = Number(volumeSlider.value);
  activeAudios.forEach(a => a.volume = v);
});

/* Play/Pause toggle */
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (!currentAudio) return; // nothing to control
    try {
      if (currentAudio.paused) currentAudio.play();
      else currentAudio.pause();
    } catch {}
  });
  setPlayPauseLabel();
}

/* Fullscreen toggle */
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
      } catch {}
    });
  }
}
