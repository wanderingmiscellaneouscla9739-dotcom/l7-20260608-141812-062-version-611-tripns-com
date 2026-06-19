(function () {
  function loadVideo(shell) {
    if (!shell || shell.getAttribute('data-ready') === '1') return;
    var video = shell.querySelector('video');
    var src = shell.getAttribute('data-src');
    if (!video || !src) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      shell._hls = hls;
    } else {
      video.src = src;
    }
    video.controls = true;
    shell.setAttribute('data-ready', '1');
  }

  function play(shell) {
    var cover = shell.querySelector('.player-cover');
    var video = shell.querySelector('video');
    loadVideo(shell);
    if (cover) cover.classList.add('hidden');
    if (video) {
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
      var cover = shell.querySelector('.player-cover');
      if (cover) {
        cover.addEventListener('click', function (event) {
          event.preventDefault();
          play(shell);
        });
      }
      shell.addEventListener('click', function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') return;
        play(shell);
      });
    });
  });
})();
