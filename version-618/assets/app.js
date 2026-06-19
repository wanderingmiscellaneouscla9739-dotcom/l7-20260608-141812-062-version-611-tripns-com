(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.getAttribute('data-slide-target') || '0');
      showSlide(target);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var pageInputs = Array.prototype.slice.call(document.querySelectorAll('.page-filter-input'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chips button'));
  var activeType = 'all';

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterItems() {
    var inputValue = '';
    pageInputs.forEach(function (input) {
      if (document.activeElement === input || input.id === 'librarySearchInput') {
        inputValue = normalized(input.value);
      }
    });

    if (!inputValue && pageInputs.length) {
      inputValue = normalized(pageInputs[0].value);
    }

    var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .library-row'));
    items.forEach(function (item) {
      var haystack = normalized(item.getAttribute('data-search'));
      var type = item.getAttribute('data-type') || '';
      var matchesText = !inputValue || haystack.indexOf(inputValue) !== -1;
      var matchesType = activeType === 'all' || type.indexOf(activeType) !== -1;
      item.classList.toggle('is-hidden-by-filter', !(matchesText && matchesType));
    });
  }

  pageInputs.forEach(function (input) {
    input.addEventListener('input', filterItems);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (other) {
        other.classList.remove('active');
      });
      button.classList.add('active');
      activeType = button.getAttribute('data-filter-value') || 'all';
      filterItems();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var libraryInput = document.getElementById('librarySearchInput');
  if (query && libraryInput) {
    libraryInput.value = query;
    filterItems();
  }
})();
