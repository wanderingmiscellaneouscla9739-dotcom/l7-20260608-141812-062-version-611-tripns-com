(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
            var next = carousel.querySelector("[data-carousel-next]");
            var prev = carousel.querySelector("[data-carousel-prev]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }

                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var keyword = panel.querySelector("[data-filter-keyword]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function applyFilter() {
                var text = valueOf(keyword);
                var yearValue = valueOf(year);
                var typeValue = valueOf(type);

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-keywords") || ""
                    ].join(" ").toLowerCase();
                    var matchText = !text || haystack.indexOf(text) !== -1;
                    var matchYear = !yearValue || (card.getAttribute("data-year") || "").toLowerCase() === yearValue;
                    var matchType = !typeValue || (card.getAttribute("data-type") || "").toLowerCase().indexOf(typeValue) !== -1;

                    card.hidden = !(matchText && matchYear && matchType);
                });
            }

            [keyword, year, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilter);
                    element.addEventListener("change", applyFilter);
                }
            });
        });
    });

    window.MovieSitePlayer = {
        init: function (streamUrl) {
            ready(function () {
                var video = document.querySelector("[data-player]");
                var cover = document.querySelector("[data-player-cover]");
                var button = document.querySelector("[data-play-button]");
                var attached = false;
                var hls = null;

                if (!video || !streamUrl) {
                    return;
                }

                function attach() {
                    if (attached) {
                        return;
                    }

                    attached = true;

                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = streamUrl;
                    }

                    video.controls = true;
                }

                function start() {
                    attach();

                    if (cover) {
                        cover.classList.add("is-hidden");
                    }

                    var promise = video.play();

                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                }

                if (button) {
                    button.addEventListener("click", function (event) {
                        event.preventDefault();
                        start();
                    });
                }

                if (cover) {
                    cover.addEventListener("click", function () {
                        start();
                    });
                }

                video.addEventListener("click", function () {
                    if (!attached) {
                        start();
                    }
                });

                window.addEventListener("beforeunload", function () {
                    if (hls) {
                        hls.destroy();
                    }
                });
            });
        }
    };
})();
