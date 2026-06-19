(function () {
  var toggles = document.querySelectorAll('.menu-toggle');
  toggles.forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.querySelector('.mobile-panel');
      if (panel) {
        panel.classList.toggle('open');
      }
    });
  });

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = hero.querySelectorAll('.hero-slide');
    var tabs = hero.querySelectorAll('.hero-tab');
    var current = 0;

    function activate(index) {
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle('active', i === index);
      });
      current = index;
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5600);
    }
  }

  document.querySelectorAll('[data-filter-list]').forEach(function (scope) {
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function filterCards() {
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var matchYear = !year || card.dataset.year === year;
        var matchType = !type || card.dataset.type === type;
        card.style.display = matchYear && matchType ? '' : 'none';
      });
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', filterCards);
    }
  });

  document.querySelectorAll('.video-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.video-overlay');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');

    function bindSource() {
      if (!source || video.dataset.bound === '1') {
        return;
      }
      video.dataset.bound = '1';
      if (window.Hls && window.Hls.isSupported() && source.indexOf('.m3u8') !== -1) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlay() {
      bindSource();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('playing');
    });
  });

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.MOVIE_SEARCH_DATA) {
    var input = searchRoot.querySelector('[data-search-input]');
    var button = searchRoot.querySelector('[data-search-button]');
    var results = searchRoot.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
      input.value = initial;
    }

    function render(query) {
      var q = (query || '').trim().toLowerCase();
      var source = window.MOVIE_SEARCH_DATA;
      var filtered = q ? source.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(q) !== -1;
      }) : source.slice(0, 80);

      filtered = filtered.slice(0, 120);
      results.classList.toggle('empty', filtered.length === 0);
      results.innerHTML = filtered.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster" href="' + item.href + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="play-badge">▶</span>',
          '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
          '<h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '<div class="card-foot"><span>' + escapeHtml(item.genre) + '</span><strong>' + escapeHtml(item.score) + '</strong></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (button) {
      button.addEventListener('click', function () {
        render(input ? input.value : '');
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(initial);
  }
})();
