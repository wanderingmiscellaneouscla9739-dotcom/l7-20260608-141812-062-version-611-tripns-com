(function () {
  function loadVideo(video, stream) {
    if (!video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        video._hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hlsPlayer.loadSource(stream);
        video._hlsPlayer.attachMedia(video);
      }
      return;
    }

    video.src = stream;
  }

  function playBox(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-button]');
    var stream = video ? video.getAttribute('data-stream') : '';

    loadVideo(video, stream);

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video) {
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
  }

  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));
  boxes.forEach(function (box) {
    var button = box.querySelector('[data-player-button]');
    var video = box.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        playBox(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        playBox(box);
      });
    }
  });
})();
