(function () {
  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  function qsa(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    if (slides.length > 1) {
      start();
    }
  }

  function initCardFilters() {
    var scopes = qsa('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-filter-year]', scope);
      var type = qs('[data-filter-type]', scope);
      var region = qs('[data-filter-region]', scope);
      var list = qs('[data-filter-list]', document) || scope.nextElementSibling;
      var cards = list ? qsa('.movie-card', list) : [];
      var counter = qs('[data-result-count]');

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var yearValue = normalize(year ? year.value : '');
        var typeValue = normalize(type ? type.value : '');
        var regionValue = normalize(region ? region.value : '');
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.textContent + ' ' + Object.values(card.dataset).join(' '));
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            ok = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            ok = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });
        if (counter) {
          counter.textContent = '共 ' + shown + ' 部影片';
        }
      }

      [input, year, type, region].forEach(function (element) {
        if (!element) {
          return;
        }
        element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function initTableFilter() {
    var scope = qs('[data-table-filter]');
    if (!scope) {
      return;
    }
    var input = qs('[data-table-filter-input]', scope);
    var rows = qsa('.rank-table tbody tr');
    if (!input) {
      return;
    }
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      rows.forEach(function (row) {
        var ok = normalize(row.textContent + ' ' + Object.values(row.dataset).join(' ')).indexOf(keyword) !== -1;
        row.style.display = ok ? '' : 'none';
      });
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('[data-play-button]', player);
      var hlsInstance = null;
      var source = player.dataset.src || '';

      function loadVideo(src, shouldPlay) {
        if (!video || !src) {
          return;
        }
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (shouldPlay) {
              video.play().catch(function () {});
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          if (shouldPlay) {
            video.play().catch(function () {});
          }
        } else {
          video.src = src;
          if (shouldPlay) {
            video.play().catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function () {
          overlay.classList.add('is-hidden');
          loadVideo(source, true);
        });
      }

      qsa('[data-source-button]', player.parentElement || document).forEach(function (button) {
        button.addEventListener('click', function () {
          source = button.dataset.src || source;
          qsa('[data-source-button]', player.parentElement || document).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          loadVideo(source, true);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCardFilters();
    initTableFilter();
    initPlayers();
  });
})();
