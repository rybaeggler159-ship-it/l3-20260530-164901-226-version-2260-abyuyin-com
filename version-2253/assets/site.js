
(function () {
  const doc = document;
  const qs = (sel, root = doc) => root.querySelector(sel);
  const qsa = (sel, root = doc) => Array.from(root.querySelectorAll(sel));

  const body = doc.body;
  const menuToggle = qs('[data-menu-toggle]');
  const mobilePanel = qs('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      const open = mobilePanel.hidden;
      mobilePanel.hidden = !open;
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  function normalizeQuery(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getCards(root) {
    return qsa('.movie-card,[data-filter-item]', root);
  }

  function applyFilters(scope) {
    const root = scope || qs('[data-filter-scope]') || doc;
    const search = qs('[data-search-input]', root) || qs('[data-search-input]');
    const typeButtons = qsa('[data-type-filter]', root);
    const cards = getCards(root);
    if (!cards.length) return;

    let currentType = 'all';
    const activeType = typeButtons.find(btn => btn.classList.contains('is-active'));
    if (activeType) currentType = activeType.dataset.typeFilter || 'all';

    const query = normalizeQuery(search ? search.value : '');
    const tokens = query ? query.split(' ').filter(Boolean) : [];

    let visibleCount = 0;
    cards.forEach(card => {
      const type = (card.dataset.type || '').toLowerCase();
      const index = normalizeQuery(card.dataset.searchIndex || card.textContent || '');
      const matchType = currentType === 'all' || type === currentType.toLowerCase();
      const matchQuery = !tokens.length || tokens.every(token => index.includes(token));
      const show = matchType && matchQuery;
      card.hidden = !show;
      if (show) visibleCount += 1;
    });

    const empty = qs('[data-empty-state]', scope || doc);
    if (empty) empty.hidden = visibleCount !== 0;

    const counter = qs('[data-result-count]', scope || doc);
    if (counter) counter.textContent = String(visibleCount);
  }

  qsa('[data-search-input]').forEach(input => {
    input.addEventListener('input', () => applyFilters(input.closest('[data-filter-scope]') || qs('[data-filter-scope]') || doc));
  });

  qsa('[data-type-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scope = btn.closest('[data-filter-scope]') || qs('[data-filter-scope]') || doc;
      qsa('[data-type-filter]', scope).forEach(item => item.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilters(scope);
    });
  });

  function initHeroSlider(slider) {
    const slides = qsa('[data-hero-slide]', slider);
    if (!slides.length) return;

    const dotsWrap = qs('[data-hero-dots]', slider);
    const prevBtn = qs('[data-hero-prev]', slider);
    const nextBtn = qs('[data-hero-next]', slider);
    let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    if (index < 0) index = 0;

    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) => `<button class="hero__dot${i === index ? ' is-active' : ''}" type="button" aria-label="切换到第 ${i + 1} 张"></button>`).join('');
    }

    const dots = dotsWrap ? qsa('.hero__dot', dotsWrap) : [];

    function update(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => update(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => update(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => update(i)));

    let timer = window.setInterval(() => update(index + 1), 5000);

    slider.addEventListener('mouseenter', () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    });
    slider.addEventListener('mouseleave', () => {
      if (!timer) timer = window.setInterval(() => update(index + 1), 5000);
    });
    slider.addEventListener('focusin', () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    });
    slider.addEventListener('focusout', () => {
      if (!timer) timer = window.setInterval(() => update(index + 1), 5000);
    });
  }

  qsa('[data-hero-slider]').forEach(initHeroSlider);

  function setPlayerSource(player) {
    const video = qs('video', player);
    if (!video) return;

    const hlsUrl = player.dataset.m3u8 || '';
    const fallback = player.dataset.fallback || '';
    const canNativeHls =
      video.canPlayType('application/vnd.apple.mpegurl') ||
      video.canPlayType('application/x-mpegURL');

    if (canNativeHls && hlsUrl) {
      video.src = hlsUrl;
      player.dataset.source = 'hls';
    } else if (fallback) {
      video.src = fallback;
      player.dataset.source = 'mp4';
    }

    video.preload = 'metadata';

    let fallbackSwitched = false;
    video.addEventListener('error', () => {
      if (!fallbackSwitched && fallback && video.src.indexOf(fallback) === -1) {
        fallbackSwitched = true;
        video.src = fallback;
        video.load();
      }
    });
  }

  qsa('[data-player]').forEach(player => {
    setPlayerSource(player);
    const video = qs('video', player);
    const playButton = qs('[data-play-button]', player);
    if (!video || !playButton) return;

    const shell = player.querySelector('.player-shell') || player;
    const showOverlay = () => shell.classList.remove('is-playing');
    const hideOverlay = () => shell.classList.add('is-playing');

    playButton.addEventListener('click', async () => {
      try {
        hideOverlay();
        if (video.readyState === 0) video.load();
        await video.play();
      } catch (err) {
        console.warn('播放失败，尝试回退源', err);
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
  });

  const backTop = qs('[data-back-top]');
  if (backTop) {
    const update = () => {
      const show = window.scrollY > 460;
      backTop.classList.toggle('is-visible', show);
      backTop.hidden = !show;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  qsa('[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copyLink || window.location.href;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '已复制';
        window.setTimeout(() => (btn.textContent = '复制链接'), 1600);
      } catch {
        window.prompt('复制以下链接：', text);
      }
    });
  });

  // Apply filters on load for any page that already contains controls
  const defaultScope = qs('[data-filter-scope]');
  if (defaultScope) applyFilters(defaultScope);
})();
