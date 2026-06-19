(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  const filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    const cards = Array.from(document.querySelectorAll(".movie-card-item"));
    const textInput = filterPanel.querySelector("[data-filter-text]");
    const yearSelect = filterPanel.querySelector("[data-filter-year]");
    const typeSelect = filterPanel.querySelector("[data-filter-type]");
    const resetButton = filterPanel.querySelector("[data-filter-reset]");
    const emptyState = document.querySelector("[data-empty-state]");

    function fillSelect(select, values) {
      values.forEach(function (value) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(yearSelect, Array.from(new Set(cards.map(function (card) {
      return card.dataset.year;
    }).filter(Boolean))).sort().reverse());

    fillSelect(typeSelect, Array.from(new Set(cards.map(function (card) {
      return card.dataset.type;
    }).filter(Boolean))).sort());

    function applyFilter() {
      const text = (textInput.value || "").trim().toLowerCase();
      const year = yearSelect.value;
      const type = typeSelect.value;
      let visibleCount = 0;

      cards.forEach(function (card) {
        const matchesText = !text || (card.dataset.title || "").toLowerCase().includes(text);
        const matchesYear = !year || card.dataset.year === year;
        const matchesType = !type || card.dataset.type === type;
        const visible = matchesText && matchesYear && matchesType;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    }

    [textInput, yearSelect, typeSelect].forEach(function (element) {
      element.addEventListener("input", applyFilter);
      element.addEventListener("change", applyFilter);
    });

    resetButton.addEventListener("click", function () {
      textInput.value = "";
      yearSelect.value = "";
      typeSelect.value = "";
      applyFilter();
    });
  }

  const searchResults = document.querySelector("[data-search-results]");
  if (searchResults && window.SEARCH_MOVIES) {
    const form = document.querySelector("[data-search-form]");
    const input = document.querySelector("[data-search-input]");
    const typeSelect = document.querySelector("[data-search-type]");
    const yearSelect = document.querySelector("[data-search-year]");
    const regionSelect = document.querySelector("[data-search-region]");
    const summary = document.querySelector("[data-result-summary]");
    const params = new URLSearchParams(window.location.search);

    function fillSearchSelect(select, values) {
      values.forEach(function (value) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSearchSelect(typeSelect, Array.from(new Set(window.SEARCH_MOVIES.map(function (item) {
      return item.type;
    }).filter(Boolean))).sort());

    fillSearchSelect(yearSelect, Array.from(new Set(window.SEARCH_MOVIES.map(function (item) {
      return item.year;
    }).filter(Boolean))).sort().reverse());

    fillSearchSelect(regionSelect, Array.from(new Set(window.SEARCH_MOVIES.map(function (item) {
      return item.region;
    }).filter(Boolean))).sort().slice(0, 80));

    input.value = params.get("q") || "";

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderCard(item) {
      const tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"./" + item.file + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
        "<img src=\"./" + item.cover + ".jpg\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-shade\"></span><span class=\"play-badge\">▶</span><span class=\"card-year\">" + escapeHtml(item.year) + "</span></a>" +
        "<div class=\"card-body\"><div class=\"card-tags\">" + tags + "</div>" +
        "<h3><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div></div></article>";
    }

    function applySearch() {
      const query = (input.value || "").trim().toLowerCase();
      const type = typeSelect.value;
      const year = yearSelect.value;
      const region = regionSelect.value;

      const matched = window.SEARCH_MOVIES.filter(function (item) {
        const text = [item.title, item.oneLine, item.summary, item.genre, item.region, item.year].concat(item.tags).join(" ").toLowerCase();
        return (!query || text.includes(query)) &&
          (!type || item.type === type) &&
          (!year || item.year === year) &&
          (!region || item.region === region);
      });

      const limited = matched.slice(0, 120);
      searchResults.innerHTML = limited.map(renderCard).join("");
      summary.textContent = matched.length ? "找到 " + matched.length + " 部影片，当前显示前 " + limited.length + " 部" : "没有找到匹配的影片";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const next = new URL(window.location.href);
      const query = input.value.trim();
      if (query) {
        next.searchParams.set("q", query);
      } else {
        next.searchParams.delete("q");
      }
      window.history.replaceState({}, "", next.toString());
      applySearch();
    });

    [input, typeSelect, yearSelect, regionSelect].forEach(function (element) {
      element.addEventListener("input", applySearch);
      element.addEventListener("change", applySearch);
    });

    applySearch();
  }
})();
