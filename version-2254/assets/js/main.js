(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var textInput = root.querySelector("[data-filter-text]");
      var regionInput = root.querySelector("[data-filter-region]");
      var typeInput = root.querySelector("[data-filter-type]");
      var yearInput = root.querySelector("[data-filter-year]");
      var categoryInput = root.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      if (root.hasAttribute("data-query-from-url") && textInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        textInput.value = query;
      }

      function apply() {
        var text = textInput ? textInput.value.trim().toLowerCase() : "";
        var region = regionInput ? regionInput.value : "";
        var type = typeInput ? typeInput.value : "";
        var year = yearInput ? yearInput.value : "";
        var category = categoryInput ? categoryInput.value : "";

        cards.forEach(function (card) {
          var search = (card.dataset.search || "").toLowerCase();
          var match = true;
          if (text && search.indexOf(text) === -1) {
            match = false;
          }
          if (region && card.dataset.region !== region) {
            match = false;
          }
          if (type && card.dataset.type !== type) {
            match = false;
          }
          if (year && card.dataset.year !== year) {
            match = false;
          }
          if (category && card.dataset.category !== category) {
            match = false;
          }
          card.classList.toggle("is-hidden", !match);
        });
      }

      [textInput, regionInput, typeInput, yearInput, categoryInput].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var source = shell.getAttribute("data-video-src");
      var fallback = shell.getAttribute("data-fallback-video");
      var attached = false;
      var hls;

      if (!video) {
        return;
      }

      function useFallback() {
        if (fallback) {
          video.src = fallback;
        }
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        if (!source) {
          useFallback();
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              try {
                hls.destroy();
              } catch (error) {}
              useFallback();
            }
          });
          return;
        }
        useFallback();
      }

      function play() {
        attachSource();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
