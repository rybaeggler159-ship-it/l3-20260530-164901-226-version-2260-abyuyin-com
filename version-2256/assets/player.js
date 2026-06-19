(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function showError(box) {
    var error = box.querySelector('.player-error');

    if (error) {
      error.hidden = false;
    }
  }

  function setup(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var source = box.getAttribute('data-video');
    var ready = false;

    if (!video || !source) {
      showError(box);
      return;
    }

    function attach(done) {
      if (ready) {
        done();
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        done();
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            done();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError(box);
            }
          });
        } else {
          video.src = source;
          ready = true;
          done();
        }
      });
    }

    function play() {
      attach(function () {
        var action = video.paused ? video.play() : video.pause();

        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            showError(box);
          });
        }
      });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', play);
    video.addEventListener('play', function () {
      box.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      box.classList.remove('playing');
    });
    video.addEventListener('error', function () {
      showError(box);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(setup);
})();
