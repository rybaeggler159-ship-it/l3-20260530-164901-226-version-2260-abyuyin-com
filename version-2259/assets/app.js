(function () {
    var menuButton = document.getElementById("menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prevButton = document.querySelector(".hero-prev");
    var nextButton = document.querySelector(".hero-next");
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function resetTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(nextSlide, 5200);
        }
    }

    if (slides.length) {
        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(currentSlide - 1);
                resetTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(currentSlide + 1);
                resetTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                resetTimer();
            });
        });

        resetTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll(".search-input")).forEach(function (input) {
        input.addEventListener("input", function () {
            var value = input.value.trim().toLowerCase();
            var scope = input.closest("section") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" ").toLowerCase();

                card.classList.toggle("is-filtered-out", value && text.indexOf(value) === -1);
            });
        });
    });

    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    var hlsInstance = null;

    function attachVideo() {
        if (!video || video.dataset.ready === "1") {
            return;
        }

        var src = video.getAttribute("data-src");
        if (!src) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
        } else {
            video.src = src;
        }

        video.dataset.ready = "1";
    }

    function beginPlayback() {
        if (!video) {
            return;
        }

        attachVideo();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", beginPlayback);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!video.dataset.ready) {
                beginPlayback();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
