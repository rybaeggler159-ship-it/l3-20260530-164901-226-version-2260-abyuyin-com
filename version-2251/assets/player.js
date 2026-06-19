(function () {
  function attachSource(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return Promise.resolve();
    }

    video.src = src;
    return Promise.resolve();
  }

  document.querySelectorAll('.js-video-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var src = player.getAttribute('data-stream');
    var loaded = false;

    function start() {
      if (!video || !src) {
        return;
      }

      player.classList.add('is-playing');

      var ready = loaded ? Promise.resolve() : attachSource(video, src);
      loaded = true;
      ready.then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player) {
        start();
      }
    });
  });
})();
