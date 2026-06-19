(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('.site-nav');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initImageFallbacks() {
    qsa('img[data-fallback-title]').forEach(function (image) {
      image.addEventListener('error', function () {
        var parent = image.closest('.poster-bg') || image.closest('.hero-media');
        if (parent) {
          parent.classList.add('is-missing');
        }
        image.remove();
      }, { once: true });
    });
  }

  function initHeroCarousel() {
    var carousel = qs('[data-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-slide-to]', carousel);
    var prev = qs('.hero-prev', carousel);
    var next = qs('.hero-next', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var list = qs('#movie-list');
    var cards = list ? qsa('.movie-card, tr[data-title]', list) : [];
    var search = qs('#movie-search');
    var year = qs('#year-filter');
    var region = qs('#region-filter');
    var type = qs('#type-filter');
    var sort = qs('#sort-filter');
    var count = qs('#filter-count');
    var empty = qs('.empty-result');

    if (!list || cards.length === 0) {
      return;
    }

    function textFor(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.textContent
      ].join(' '));
    }

    function applySort() {
      if (!sort) {
        return;
      }

      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'hot-desc') {
          return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
        }
        if (mode === 'title-asc') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
    }

    function applyFilters() {
      var keyword = search ? normalize(search.value) : '';
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchKeyword = !keyword || textFor(card).indexOf(keyword) !== -1;
        var matchYear = !selectedYear || String(card.dataset.year) === selectedYear;
        var matchRegion = !selectedRegion || String(card.dataset.region) === selectedRegion;
        var matchType = !selectedType || String(card.dataset.type) === selectedType;
        var shouldShow = matchKeyword && matchYear && matchRegion && matchType;

        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function onChange() {
      applySort();
      applyFilters();
    }

    [search, year, region, type, sort].forEach(function (control) {
      if (control) {
        control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', onChange);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && search) {
      search.value = query;
    }

    onChange();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initImageFallbacks();
    initHeroCarousel();
    initFilters();
  });
}());
