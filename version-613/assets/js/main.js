(function () {
  var navButton = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navButton && mobileNav) {
    navButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      navButton.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
    var scope = panel.closest("main") || document;
    var keyword = panel.querySelector("[data-filter='keyword']");
    var year = panel.querySelector("[data-filter='year']");
    var type = panel.querySelector("[data-filter='type']");
    var empty = panel.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var keywordValue = valueOf(keyword);
      var yearValue = valueOf(year);
      var typeValue = valueOf(type);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var matchesKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
        var matchesYear = !yearValue || String(card.dataset.year) === yearValue;
        var matchesType = !typeValue || String(card.dataset.type).toLowerCase() === typeValue;
        var matches = matchesKeyword && matchesYear && matchesType;

        card.hidden = !matches;

        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  });
})();
