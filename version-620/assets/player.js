import { H as Hls } from "./video-vendor-dru42stk.js";

export function setupPlayer(url) {
  const video = document.querySelector("[data-player]");
  const overlay = document.querySelector("[data-play-overlay]");
  const button = document.querySelector("[data-play-button]");
  let attached = false;
  let hls = null;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = url;
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  function toggleVideo() {
    if (!attached || video.paused) {
      start();
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", toggleVideo);
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
}
