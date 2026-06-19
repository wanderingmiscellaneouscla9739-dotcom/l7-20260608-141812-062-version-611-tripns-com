(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.filter-grid'));
    if (!grids.length) {
      return;
    }
    var queryInput = document.querySelector('.filter-input');
    var yearSelect = document.querySelector('.filter-year');
    var typeSelect = document.querySelector('.filter-type');
    var emptyState = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }
    function filter() {
      var query = normalize(queryInput ? queryInput.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;
      grids.forEach(function (grid) {
        var items = Array.prototype.slice.call(grid.children);
        items.forEach(function (item) {
          var text = normalize(item.getAttribute('data-search'));
          var itemYear = normalize(item.getAttribute('data-year'));
          var itemType = normalize(item.getAttribute('data-type'));
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (year && itemYear !== year) {
            ok = false;
          }
          if (type && itemType !== type) {
            ok = false;
          }
          item.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }
    [queryInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
    filter();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('.video-player');
      var overlay = shell.querySelector('.player-overlay');
      if (!video || !overlay) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var attached = false;
      function attach() {
        if (attached || !stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        attached = true;
      }
      function play() {
        attach();
        overlay.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }
      overlay.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
}());
