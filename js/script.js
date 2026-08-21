/* =========================
   PAGE ELEMENTS
========================= */

const pads =
  document.querySelectorAll(".pad");

const volumeSlider =
  document.getElementById("volumeSlider");

const stopAllBtn =
  document.getElementById("stopAllBtn");

const playPauseBtn =
  document.getElementById("playPauseBtn");

const fullscreenBtn =
  document.getElementById("fullscreenBtn");


/* =========================
   PLAYLIST ELEMENTS
========================= */

const playlistEl =
  document.getElementById("playlist");

const playlistCount =
  document.getElementById("playlistCount");

const nowPlayingTitle =
  document.getElementById("nowPlayingTitle");

const nowPlayingArtist =
  document.getElementById("nowPlayingArtist");

const currentTimeEl =
  document.getElementById("currentTime");

const durationEl =
  document.getElementById("duration");

const songProgress =
  document.getElementById("songProgress");

const prevSongBtn =
  document.getElementById("prevSongBtn");

const nextSongBtn =
  document.getElementById("nextSongBtn");

const playlistPlayPauseBtn =
  document.getElementById(
    "playlistPlayPauseBtn"
  );

const shuffleBtn =
  document.getElementById("shuffleBtn");


/* =========================
   AUDIO STATE
========================= */

let activeAudios = [];

let activeButtons =
  new Set();

let currentAudio = null;

let currentButton = null;

let currentSourceType = null;


/* Playlist */

let currentPlaylistIndex = -1;

let shuffleEnabled = false;


/* =========================
   FULL SONG PLAYLIST
========================= */

const playlist = [

  {
    title: "Cotton Eye Joe",
    artist: "Rednex",
    file: "CEJFull"
  }
  ,
  {
    title: "Party In The U.S.A.",
    artist: "Miley Cyrus",
    file: "Party In The U.S.A.Full"
  }
  ,
  {
    title: "Thunderstruck",
    artist: "AC/DC",
    file: "ThunderstruckFull"
  }
  ,
  {
    title: "Shake It Off",
    artist: "Taylor Swift",
    file: "Shake It OffFull"
  }
  ,
  {
    title: "Takedown",
    artist: "Huntrix - KPop Demon Hunters",
    file: "TakedownkpopFull"
  }
  ,
  {
    title: "Sweet Caroline",
    artist: "Neil Diamond",
    file: "SweetCarolineFull"
  }
  ,
  {
    title: "I'm Shipping Up To Boston",
    artist: "Dropkick Murphys",
    file: "I'm Shipping Up To Boston Full"
  }
  ,
  {
    title: "Lush Life",
    artist: "Zara Larsson",
    file: "Lush Life Full"
  }
  ,
  {
    title: "Centuries",
    artist: "Fall Out Boy",
    file: "CenturiesFull"
  }
  ,
  {
    title: "My House",
    artist: "Flo Rida",
    file: "My House Full"
  }
  ,
  {
    title: "I Gotta Feeling",
    artist: "The Black Eyed Peas",
    file: "I Gotta Feeling Full"
  }
  ,
  {
    title: "Man! I Feel Like A Woman",
    artist: "Shania Twain",
    file: "Man I Feel Like A WomanFull"
  }
  ,
  {
    title: "Beautiful Things",
    artist: "Benson Boone",
    file: "Beautiful Things Full"
  }
  ,
  {
    title: "Seven Nation Army",
    artist: "The White Stripes",
    file: "Seven Nation Army Full"
  }
  ,
  {
    title: "Unstoppable",
    artist: "Sia",
    file: "UnstoppableFull"
  }
];


/* =========================
   STICKY HEADER
========================= */

function updateStickyOffsets(){

  const topbar =
    document.querySelector(".topbar");

  if (!topbar){
    return;
  }

  document.documentElement
    .style
    .setProperty(
      "--topbar-h",
      `${topbar.offsetHeight}px`
    );
}

window.addEventListener(
  "load",
  updateStickyOffsets
);

window.addEventListener(
  "resize",
  updateStickyOffsets
);


/* =========================
   HELPERS
========================= */

function formatTime(seconds){

  if (!Number.isFinite(seconds)){
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.floor(seconds % 60);

  return (
    `${minutes}:` +
    remainingSeconds
      .toString()
      .padStart(2, "0")
  );
}


/* =========================
   MASTER PLAY/PAUSE LABEL
========================= */

function setPlayPauseLabel(){

  if (playPauseBtn){

    if (
      currentAudio &&
      !currentAudio.paused
    ){

      playPauseBtn.textContent =
        "Pause";

    }else{

      playPauseBtn.textContent =
        "Play";
    }
  }

  updatePlaylistPlayButton();
}


/* =========================
   PLAYLIST PLAY BUTTON
========================= */

function updatePlaylistPlayButton(){

  if (!playlistPlayPauseBtn){
    return;
  }

  if (
    currentAudio &&
    currentSourceType === "playlist" &&
    !currentAudio.paused
  ){

    playlistPlayPauseBtn.textContent =
      "❚❚";

    playlistPlayPauseBtn.setAttribute(
      "aria-label",
      "Pause song"
    );

  }else{

    playlistPlayPauseBtn.textContent =
      "▶";

    playlistPlayPauseBtn.setAttribute(
      "aria-label",
      "Play song"
    );
  }
}



/* =========================
   SOUNDBOARD PAD STATE
========================= */

function setPlaying(
  button,
  isPlaying
){

  if (!button){
    return;
  }

  if (isPlaying){

    button.classList.add(
      "is-playing"
    );

    activeButtons.add(
      button
    );

  }else{

    button.classList.remove(
      "is-playing"
    );

    activeButtons.delete(
      button
    );
  }
}


/* =========================
   CREATE PLAYLIST
========================= */

function renderPlaylist(){

  if (!playlistEl){
    return;
  }

  playlistEl.innerHTML = "";

  playlist.forEach(
    (song, index) => {

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        "playlist-song";

      button.dataset.index =
        index;

      button.innerHTML = `
        <span class="playlist-song-number">
          ${index + 1}
        </span>

        <span class="playlist-song-info">

          <span class="playlist-song-title">
            ${song.title}
          </span>

          <span class="playlist-song-artist">
            ${song.artist}
          </span>

        </span>

        <span
          class="playlist-song-duration"
          id="playlist-duration-${index}"
        >
          --:--
        </span>
      `;


      /*
        Clicking any row immediately
        starts that song.
      */

      button.addEventListener(
        "click",
        () => {

          playPlaylistSong(
            index
          );
        }
      );


      playlistEl.appendChild(
        button
      );


      /*
        Create a temporary audio object
        that only loads metadata.

        This lets the page discover the
        song length automatically.
      */

      const metadataAudio =
        new Audio(
          `audio/${song.file}.mp3`
        );

      metadataAudio.preload =
        "metadata";


      metadataAudio.addEventListener(
        "loadedmetadata",
        () => {

          const display =
            document.getElementById(
              `playlist-duration-${index}`
            );

          if (display){

            display.textContent =
              formatTime(
                metadataAudio.duration
              );
          }
        }
      );


      /*
        If an MP3 doesn't exist,
        leave duration blank rather
        than throwing a visible error.
      */

      metadataAudio.addEventListener(
        "error",
        () => {

          const display =
            document.getElementById(
              `playlist-duration-${index}`
            );

          if (display){

            display.textContent =
              "--:--";
          }
        }
      );

    }
  );


  if (playlistCount){

    playlistCount.textContent =
      `${playlist.length} ${
        playlist.length === 1
          ? "SONG"
          : "SONGS"
      }`;
  }
}


/* =========================
   UPDATE PLAYLIST HIGHLIGHT
========================= */

function updatePlaylistHighlight(){

  const rows =
    document.querySelectorAll(
      ".playlist-song"
    );


  rows.forEach(
    (row, index) => {

      const isCurrent =
        (
          index ===
          currentPlaylistIndex
        ) &&
        (
          currentSourceType ===
          "playlist"
        );


      row.classList.toggle(
        "is-playing",
        isCurrent
      );


      const number =
        row.querySelector(
          ".playlist-song-number"
        );


      if (!number){
        return;
      }


      if (
        isCurrent &&
        currentAudio &&
        !currentAudio.paused
      ){

        number.textContent =
          "▶";

      }else{

        number.textContent =
          index + 1;
      }
    }
  );


  /*
    If Next / Previous / Shuffle
    changes the song, automatically
    keep the active song visible
    inside the playlist scrollbar.
  */

  const activeRow =
    document.querySelector(
      ".playlist-song.is-playing"
    );

  if (activeRow){

    activeRow.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
}


/* =========================
   RESET PLAYLIST DISPLAY
========================= */

function resetPlaylistDisplay(){

  currentPlaylistIndex = -1;


  if (nowPlayingTitle){

    nowPlayingTitle.textContent =
      "Select a song";
  }


  if (nowPlayingArtist){

    nowPlayingArtist.textContent =
      "Shoreline Sharks Playlist";
  }


  if (currentTimeEl){

    currentTimeEl.textContent =
      "0:00";
  }


  if (durationEl){

    durationEl.textContent =
      "0:00";
  }


  if (songProgress){

    songProgress.value = 0;
  }


  updatePlaylistHighlight();

  updatePlaylistPlayButton();
}


/* =========================
   REMOVE AUDIO FROM ACTIVE LIST
========================= */

function removeActiveAudio(audio){

  activeAudios =
    activeAudios.filter(
      activeAudio =>
        activeAudio !== audio
    );
}


/* =========================
   STOP CURRENT AUDIO
========================= */

function stopCurrentAudio(
  resetTime = true
){

  if (!currentAudio){
    return;
  }


  const audioToStop =
    currentAudio;


  try{

    audioToStop.pause();

    if (resetTime){

      audioToStop.currentTime =
        0;
    }

  }catch{}


  if (currentButton){

    setPlaying(
      currentButton,
      false
    );
  }


  removeActiveAudio(
    audioToStop
  );


  currentAudio = null;

  currentButton = null;
}


/* =========================
   STOP ALL AUDIO
========================= */

function stopAllSounds(){

  activeAudios.forEach(
    audio => {

      try{

        audio.pause();

        audio.currentTime =
          0;

      }catch{}
    }
  );


  activeAudios = [];


  activeButtons.forEach(
    button => {

      button.classList.remove(
        "is-playing"
      );
    }
  );


  activeButtons.clear();


  currentAudio = null;

  currentButton = null;

  currentSourceType = null;


  resetPlaylistDisplay();

  setPlayPauseLabel();
}


/* =========================
   SOUNDBOARD AUDIO
========================= */

function playSound(
  name,
  buttonElement
){

  /*
    No audio overlap.

    If a full song is playing,
    hitting a goal horn, penalty
    song, or short clip stops it.
  */

  stopCurrentAudio();


  currentPlaylistIndex =
    -1;

  currentSourceType =
    "soundboard";


  updatePlaylistHighlight();


  const audio =
    new Audio(
      `audio/${name}.mp3`
    );


  audio.volume =
    Number(
      volumeSlider.value
    );


  currentAudio =
    audio;

  currentButton =
    buttonElement;


  if (buttonElement){

    setPlaying(
      buttonElement,
      true
    );
  }


  activeAudios.push(
    audio
  );


  audio.addEventListener(
    "ended",
    () => {

      if (buttonElement){

        setPlaying(
          buttonElement,
          false
        );
      }


      removeActiveAudio(
        audio
      );


      if (
        currentAudio === audio
      ){

        currentAudio =
          null;

        currentButton =
          null;

        currentSourceType =
          null;


        setPlayPauseLabel();
      }
    }
  );


  audio.addEventListener(
    "pause",
    () => {

      setPlayPauseLabel();
    }
  );


  audio.addEventListener(
    "play",
    () => {

      setPlayPauseLabel();
    }
  );


  audio.play()

    .then(
      () => {

        setPlayPauseLabel();
      }
    )

    .catch(
      () => {

        if (buttonElement){

          setPlaying(
            buttonElement,
            false
          );
        }


        currentAudio =
          null;

        currentButton =
          null;

        currentSourceType =
          null;


        setPlayPauseLabel();
      }
    );
}


/* =========================
   PLAY FULL SONG
========================= */

function playPlaylistSong(index){

  if (!playlist[index]){
    return;
  }


  /*
    Stop whatever is currently playing.
  */

  stopCurrentAudio();


  currentPlaylistIndex =
    index;

  currentSourceType =
    "playlist";


  const song =
    playlist[index];


  const audio =
    new Audio(
      `audio/${song.file}.mp3`
    );


  audio.volume =
    Number(
      volumeSlider.value
    );


  currentAudio =
    audio;

  currentButton =
    null;


  activeAudios.push(
    audio
  );


  /* Now Playing */

  if (nowPlayingTitle){

    nowPlayingTitle.textContent =
      song.title;
  }


  if (nowPlayingArtist){

    nowPlayingArtist.textContent =
      song.artist;
  }


  if (currentTimeEl){

    currentTimeEl.textContent =
      "0:00";
  }


  if (durationEl){

    durationEl.textContent =
      "0:00";
  }


  if (songProgress){

    songProgress.value =
      0;
  }


  updatePlaylistHighlight();


  /* Song metadata */

  audio.addEventListener(
    "loadedmetadata",
    () => {

      if (durationEl){

        durationEl.textContent =
          formatTime(
            audio.duration
          );
      }
    }
  );


  /* Progress bar */

  audio.addEventListener(
    "timeupdate",
    () => {

      if (!audio.duration){
        return;
      }


      if (currentTimeEl){

        currentTimeEl.textContent =
          formatTime(
            audio.currentTime
          );
      }


      if (songProgress){

        songProgress.value =
          (
            audio.currentTime /
            audio.duration
          ) * 100;
      }
    }
  );


  /* Playing */

  audio.addEventListener(
    "play",
    () => {

      updatePlaylistHighlight();

      setPlayPauseLabel();
    }
  );


  /* Paused */

  audio.addEventListener(
    "pause",
    () => {

      updatePlaylistHighlight();

      setPlayPauseLabel();
    }
  );


  /* Automatically advance */

  audio.addEventListener(
    "ended",
    () => {

      removeActiveAudio(
        audio
      );


      /*
        Only advance if this is still
        the current audio object.
      */

      if (
        currentAudio === audio
      ){

        currentAudio =
          null;


        playNextSong();
      }
    }
  );


  /* Missing/bad file */

  audio.addEventListener(
    "error",
    () => {

      removeActiveAudio(
        audio
      );


      if (
        currentAudio === audio
      ){

        currentAudio =
          null;

        currentSourceType =
          null;
      }


      setPlayPauseLabel();

      updatePlaylistHighlight();
    }
  );


  audio.play()

    .then(
      () => {

        setPlayPauseLabel();

        updatePlaylistHighlight();
      }
    )

    .catch(
      () => {

        removeActiveAudio(
          audio
        );


        if (
          currentAudio === audio
        ){

          currentAudio =
            null;

          currentSourceType =
            null;
        }


        setPlayPauseLabel();

        updatePlaylistHighlight();
      }
    );
}


/* =========================
   NEXT SONG
========================= */

function playNextSong(){

  if (!playlist.length){
    return;
  }


  let nextIndex;


  /*
    Shuffle
  */

  if (
    shuffleEnabled &&
    playlist.length > 1
  ){

    do{

      nextIndex =
        Math.floor(
          Math.random() *
          playlist.length
        );

    }while(
      nextIndex ===
      currentPlaylistIndex
    );

  }else{

    /*
      Normal sequential playback
    */

    if (
      currentPlaylistIndex < 0
    ){

      nextIndex = 0;

    }else{

      nextIndex =
        currentPlaylistIndex + 1;
    }


    /*
      Loop playlist
    */

    if (
      nextIndex >=
      playlist.length
    ){

      nextIndex = 0;
    }
  }


  playPlaylistSong(
    nextIndex
  );
}


/* =========================
   PREVIOUS SONG
========================= */

function playPreviousSong(){

  if (!playlist.length){
    return;
  }


  /*
    Standard media player behavior:

    If you're more than 3 seconds
    into a song, Previous restarts
    the current song.
  */

  if (
    currentAudio &&
    currentSourceType ===
      "playlist" &&
    currentAudio.currentTime > 3
  ){

    currentAudio.currentTime =
      0;

    return;
  }


  let previousIndex =
    currentPlaylistIndex - 1;


  if (
    currentPlaylistIndex < 0
  ){

    previousIndex = 0;
  }


  if (
    previousIndex < 0
  ){

    previousIndex =
      playlist.length - 1;
  }


  playPlaylistSong(
    previousIndex
  );
}


/* =========================
   SOUNDBOARD PAD EVENTS
========================= */

pads.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const sound =
          button.dataset.sound;


        if (sound){

          playSound(
            sound,
            button
          );
        }
      }
    );
  }
);


/* =========================
   STOP ALL BUTTON
========================= */

if (stopAllBtn){

  stopAllBtn.addEventListener(
    "click",
    stopAllSounds
  );
}


/* =========================
   MASTER VOLUME
========================= */

if (volumeSlider){

  volumeSlider.addEventListener(
    "input",
    () => {

      const volume =
        Number(
          volumeSlider.value
        );


      activeAudios.forEach(
        audio => {

          audio.volume =
            volume;
        }
      );
    }
  );
}


/* =========================
   MASTER PLAY / PAUSE
========================= */

if (playPauseBtn){

  playPauseBtn.addEventListener(
    "click",
    () => {

      if (!currentAudio){
        return;
      }


      try{

        if (
          currentAudio.paused
        ){

          currentAudio.play();

        }else{

          currentAudio.pause();
        }

      }catch{}
    }
  );
}


/* =========================
   PLAYLIST PLAY / PAUSE
========================= */

if (playlistPlayPauseBtn){

  playlistPlayPauseBtn
    .addEventListener(
      "click",
      () => {

        /*
          If a playlist song isn't
          currently selected, start
          the first song.
        */

        if (
          currentSourceType !==
            "playlist" ||
          !currentAudio
        ){

          const indexToPlay =
            currentPlaylistIndex >= 0
              ? currentPlaylistIndex
              : 0;


          playPlaylistSong(
            indexToPlay
          );

          return;
        }


        try{

          if (
            currentAudio.paused
          ){

            currentAudio.play();

          }else{

            currentAudio.pause();
          }

        }catch{}
      }
    );
}


/* =========================
   SEEK / SCRUB BAR
========================= */

if (songProgress){

  songProgress.addEventListener(
    "input",
    () => {

      if (
        !currentAudio ||
        currentSourceType !==
          "playlist" ||
        !currentAudio.duration
      ){

        return;
      }


      const percentage =
        Number(
          songProgress.value
        ) / 100;


      currentAudio.currentTime =
        percentage *
        currentAudio.duration;
    }
  );
}


/* =========================
   NEXT BUTTON
========================= */

if (nextSongBtn){

  nextSongBtn.addEventListener(
    "click",
    playNextSong
  );
}


/* =========================
   PREVIOUS BUTTON
========================= */

if (prevSongBtn){

  prevSongBtn.addEventListener(
    "click",
    playPreviousSong
  );
}


/* =========================
   SHUFFLE
========================= */

if (shuffleBtn){

  shuffleBtn.addEventListener(
    "click",
    () => {

      shuffleEnabled =
        !shuffleEnabled;


      shuffleBtn
        .classList
        .toggle(
          "is-active",
          shuffleEnabled
        );


      shuffleBtn.textContent =
        shuffleEnabled
          ? "Shuffle On"
          : "Shuffle";
    }
  );
}


/* =========================
   FULLSCREEN
========================= */

function fullscreenSupported(){

  return !!document
    .documentElement
    .requestFullscreen;
}


if (fullscreenBtn){

  if (!fullscreenSupported()){

    fullscreenBtn.style.display =
      "none";

  }else{

    fullscreenBtn.addEventListener(
      "click",
      async () => {

        try{

          if (
            !document
              .fullscreenElement
          ){

            await document
              .documentElement
              .requestFullscreen();

          }else{

            await document
              .exitFullscreen();
          }

        }catch{}
      }
    );
  }
}


/* =========================
   STARTUP
========================= */

renderPlaylist();

resetPlaylistDisplay();

setPlayPauseLabel();