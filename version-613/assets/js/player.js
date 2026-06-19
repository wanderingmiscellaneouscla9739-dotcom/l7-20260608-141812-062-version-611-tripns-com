var MoviePlayer = (function () {
  function mount(id, streamUrl) {
    var root = document.getElementById(id);

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var error = root.querySelector(".player-error");
    var hls = null;
    var loaded = false;

    function showError(message) {
      if (error) {
        error.textContent = message;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function attach() {
      if (loaded || !video || !streamUrl) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          showError("播放暂时不可用，请稍后再试");
          hls.destroy();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        showError("播放暂时不可用，请稍后再试");
      }
    }

    function play() {
      attach();
      hideOverlay();
      video.setAttribute("controls", "controls");

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showError("请再次点击播放");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", hideOverlay);
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  return {
    mount: mount
  };
})();
