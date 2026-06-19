(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var regionFilter = scope.querySelector('[data-region-filter]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var sortSelect = scope.querySelector('[data-sort-select]');
    var grid = scope.querySelector('[data-card-grid]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-message]');
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (query && textOf(card).indexOf(query) === -1) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCards() {
      if (!grid || !sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice();
      sorted.sort(function (a, b) {
        if (mode === 'year-desc') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (mode === 'score-desc') {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        }
        if (mode === 'title-asc') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    sortCards();
    apply();
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.toggle('is-visible', Boolean(text));
    }

    function start() {
      if (!video || !stream) {
        setMessage('播放入口暂时不可用');
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      video.controls = true;

      if (shell.getAttribute('data-ready') === '1') {
        video.play().catch(function () {
          setMessage('请再次点击播放按钮开始观看');
        });
        return;
      }

      shell.setAttribute('data-ready', '1');
      setMessage('');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('请再次点击播放按钮开始观看');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放遇到网络问题，请稍后重试');
          }
        });
      } else {
        video.src = stream;
        video.play().catch(function () {
          setMessage('请再次点击播放按钮开始观看');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
