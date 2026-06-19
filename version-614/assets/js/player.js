(function () {
  function initPlayer() {
    var card = document.getElementById('player-card');
    var video = document.getElementById('movie-player');
    var startButton = document.getElementById('player-start');
    var errorBox = document.getElementById('player-error');

    if (!card || !video || !startButton) {
      return;
    }

    var source = card.getAttribute('data-m3u8');
    var hasLoaded = false;
    var hlsInstance = null;

    function showError(message) {
      if (!errorBox) {
        return;
      }
      errorBox.hidden = false;
      errorBox.textContent = message;
    }

    function hideError() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }
    }

    function loadSource() {
      if (hasLoaded) {
        return Promise.resolve();
      }

      if (!source) {
        showError('当前影片暂未配置播放源。');
        return Promise.reject(new Error('Missing source'));
      }

      hasLoaded = true;
      hideError();

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showError('网络连接异常，正在尝试重新加载。');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showError('媒体播放异常，正在尝试恢复。');
            hlsInstance.recoverMediaError();
          } else {
            showError('播放器初始化失败，请刷新页面重试。');
            hlsInstance.destroy();
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      showError('当前浏览器不支持 HLS 播放。');
      return Promise.reject(new Error('HLS unsupported'));
    }

    function play() {
      loadSource().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showError('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }).catch(function () {
        card.classList.remove('is-playing');
      });
    }

    startButton.addEventListener('click', function () {
      card.classList.add('is-playing');
      play();
    });

    video.addEventListener('play', function () {
      card.classList.add('is-playing');
      hideError();
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        card.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
}());
