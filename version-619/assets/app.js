(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-mobile-menu]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        show(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
    }

    function setupFilters() {
        var filterInput = document.querySelector("[data-local-filter]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!cards.length) {
            return;
        }
        var activeType = "all";
        function apply() {
            var query = normalize(filterInput ? filterInput.value : "");
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var typeMatched = activeType === "all" || type.indexOf(activeType) !== -1 || year === activeType;
                var queryMatched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle("hide-card", !(typeMatched && queryMatched));
            });
        }
        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q) {
                filterInput.value = q;
            }
            filterInput.addEventListener("input", apply);
        }
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeType = normalize(button.getAttribute("data-filter-value"));
                filterButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, buttonId, coverId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var cover = document.getElementById(coverId);
        var attached = false;
        var hlsInstance = null;
        if (!video || !button || !sourceUrl) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        var trigger = cover || button;
        trigger.addEventListener("click", play);
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("emptied", function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
            hlsInstance = null;
            attached = false;
        });
    };

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
})();
