(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    qsa('[data-hero]').forEach(function (hero) {
      var slides = qsa('[data-hero-slide]', hero);
      var dots = qsa('[data-hero-dot]', hero);
      var prev = qs('[data-hero-prev]', hero);
      var next = qs('[data-hero-next]', hero);
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }
      function start() {
        if (slides.length <= 1) return;
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function reset() {
        if (timer) window.clearInterval(timer);
        start();
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          reset();
        });
      });
      if (prev) prev.addEventListener('click', function () { show(index - 1); reset(); });
      if (next) next.addEventListener('click', function () { show(index + 1); reset(); });
      show(0);
      start();
    });

    qsa('[data-filter-form]').forEach(function (form) {
      var rootSelector = form.getAttribute('data-filter-root') || 'body';
      var root = qs(rootSelector) || document;
      var cards = qsa('[data-movie-card]', root);
      var input = qs('[name="q"]', form);
      var type = qs('[name="type"]', form);
      var year = qs('[name="year"]', form);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (input && initial && !input.value) input.value = initial;
      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-keywords'));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) ok = false;
          if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) ok = false;
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) ok = false;
          card.classList.toggle('hidden-card', !ok);
        });
      }
      ['input', 'change'].forEach(function (eventName) {
        form.addEventListener(eventName, apply);
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  });
})();
