(function () {
  window.setupMoviePlayer = function (source) {
    var box = document.querySelector('[data-player]');

    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var button = box.querySelector('.play-layer');
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function start() {
      attach();
      video.setAttribute('controls', 'controls');
      box.classList.add('is-playing');
      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
})();
