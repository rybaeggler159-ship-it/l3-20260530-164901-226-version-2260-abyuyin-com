(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function setMenuState(open) {
    const nav = qs('[data-nav]');
    const toggle = qs('[data-nav-toggle]');
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function initMenu() {
    const toggle = qs('[data-nav-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      const nav = qs('[data-nav]');
      const open = !nav.classList.contains('is-open');
      setMenuState(open);
    });
    qsa('[data-nav] a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 760) setMenuState(false);
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setMenuState(false);
    });
  }

  function getFilterValue(form, name) {
    const field = form.querySelector('[name="' + name + '"]');
    if (!field) return '';
    return (field.value || '').trim().toLowerCase();
  }

  function updateCounters(scope, visible, total) {
    const out = scope.querySelector('[data-filter-count]');
    if (out) {
      out.textContent = visible + ' / ' + total;
    }
  }

  function itemMatches(item, query, region, type, year) {
    const hay = (item.dataset.search || '').toLowerCase();
    if (query && !hay.includes(query)) return false;
    if (region && region !== 'all') {
      const value = (item.dataset.region || '').toLowerCase();
      if (!value.includes(region) && !region.includes(value)) return false;
    }
    if (type && type !== 'all') {
      const value = (item.dataset.type || '').toLowerCase();
      if (!value.includes(type)) return false;
    }
    if (year && year !== 'all') {
      const value = (item.dataset.year || '').toLowerCase();
      if (value !== year) return false;
    }
    return true;
  }

  function applyFilter(form) {
    const targetSelector = form.getAttribute('data-filter-target');
    const scopeSelector = form.getAttribute('data-filter-scope') || '.js-filter-scope';
    const scope = form.closest(scopeSelector) || document;
    const items = targetSelector ? qsa(targetSelector, document) : qsa('[data-filter-item]', scope);
    const query = getFilterValue(form, 'q');
    const region = getFilterValue(form, 'region');
    const type = getFilterValue(form, 'type');
    const year = getFilterValue(form, 'year');
    let visible = 0;

    items.forEach(function (item) {
      const show = itemMatches(item, query, region, type, year);
      item.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });

    updateCounters(scope, visible, items.length);
  }

  function initFilters() {
    qsa('[data-filter-form]').forEach(function (form) {
      const handler = function () { applyFilter(form); };
      qsa('input, select', form).forEach(function (field) {
        field.addEventListener('input', handler);
        field.addEventListener('change', handler);
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handler();
      });
      handler();
    });
  }

  function setActiveSource(buttons, activeBtn) {
    buttons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn === activeBtn);
      btn.setAttribute('aria-pressed', btn === activeBtn ? 'true' : 'false');
    });
  }

  function initPlayer(block) {
    const video = qs('video', block);
    if (!video) return;

    const overlay = qs('[data-play-overlay]', block);
    const status = qs('[data-player-status]', block);
    const buttons = qsa('[data-source]', block);
    const mp4 = block.getAttribute('data-mp4') || '';
    const hls = block.getAttribute('data-hls') || '';
    let hlsInstance = null;

    function destroyHls() {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
      hlsInstance = null;
    }

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    function setVideoSrc(src) {
      destroyHls();
      video.removeAttribute('src');
      video.load();
      video.src = src;
      video.load();
    }

    function useMp4() {
      if (!mp4) return;
      setVideoSrc(mp4);
      setStatus('当前播放：本地预览源');
      if (overlay) overlay.hidden = false;
    }

    function useHls() {
      if (!hls) {
        useMp4();
        return;
      }
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        destroyHls();
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(hls);
        hlsInstance.attachMedia(video);
        setStatus('当前播放：HLS 源');
      } else if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        setVideoSrc(hls);
        setStatus('当前播放：原生 HLS 源');
      } else {
        setStatus('当前浏览器暂未启用 HLS，已切回本地预览源');
        useMp4();
      }
      if (overlay) overlay.hidden = false;
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActiveSource(buttons, btn);
        if (btn.dataset.source === 'hls') {
          useHls();
        } else {
          useMp4();
        }
      });
    });

    if (buttons.length) setActiveSource(buttons, buttons[0]);

    video.addEventListener('play', function () {
      if (overlay) overlay.hidden = true;
    });
    video.addEventListener('pause', function () {
      if (overlay) overlay.hidden = false;
    });
    video.addEventListener('ended', function () {
      if (overlay) overlay.hidden = false;
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        video.play().catch(function () {});
      });
    }

    useMp4();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(initPlayer);
  }

  function initBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    const toggle = function () {
      btn.classList.toggle('hidden', window.scrollY < 500);
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initReveal() {
    const items = qsa('[data-reveal]');
    if (!items.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (item) { io.observe(item); });
  }

  ready(function () {
    initMenu();
    initFilters();
    initPlayers();
    initBackToTop();
    initReveal();
  });
})();
