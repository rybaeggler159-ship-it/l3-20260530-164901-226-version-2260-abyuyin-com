(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;
    var slideTimer = null;

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

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(slideTimer);
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            startSlider();
        });
    });

    startSlider();

    var searchInput = document.getElementById("searchInput");
    var searchResults = document.getElementById("searchResults");
    var searchSummary = document.getElementById("searchSummary");

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-cover\" href=\"" + escapeHtml(movie.url) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"movie-play\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function runSearch() {
        if (!searchInput || !searchResults || !window.SITE_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || searchInput.value || "").trim();
        searchInput.value = query;

        if (!query) {
            return;
        }

        var lowerQuery = query.toLowerCase();
        var results = window.SITE_MOVIES.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine]
                .join(" ")
                .toLowerCase()
                .indexOf(lowerQuery) !== -1;
        }).slice(0, 80);

        searchSummary.textContent = results.length ? "搜索结果：" + query : "没有找到匹配内容";
        searchResults.innerHTML = results.length ? results.map(movieCard).join("") : "<p>换一个关键词试试。</p>";
    }

    runSearch();
})();

function initMoviePlayer(streamUrl) {
    var video = document.querySelector(".js-player");
    var frame = document.querySelector(".video-frame");
    var overlay = document.querySelector(".player-overlay");
    var playButton = document.querySelector(".player-play");
    var muteButton = document.querySelector(".player-mute");
    var fullscreenButton = document.querySelector(".player-fullscreen");
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function attachMedia() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        attachMedia();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function togglePlay() {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    function updatePlayingState() {
        var isPlaying = !video.paused;
        if (overlay) {
            overlay.classList.toggle("is-hidden", isPlaying);
        }
        if (frame) {
            frame.classList.toggle("is-active", isPlaying);
        }
        if (playButton) {
            playButton.textContent = isPlaying ? "暂停" : "▶";
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    if (playButton) {
        playButton.addEventListener("click", togglePlay);
    }

    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "静音" : "音量";
        });
    }

    if (fullscreenButton && frame) {
        fullscreenButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (frame.requestFullscreen) {
                frame.requestFullscreen();
            }
        });
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updatePlayingState);
    video.addEventListener("pause", updatePlayingState);
    video.addEventListener("ended", updatePlayingState);
    attachMedia();
}
