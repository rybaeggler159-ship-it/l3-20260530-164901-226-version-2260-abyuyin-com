(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var scope = document.querySelector(panel.getAttribute('data-scope') || 'body');
    var keywordInput = panel.querySelector('[data-filter="keyword"]');
    var regionSelect = panel.querySelector('[data-filter="region"]');
    var typeSelect = panel.querySelector('[data-filter="type"]');
    var clearButton = panel.querySelector('[data-clear-filter]');
    var empty = document.querySelector('[data-filter-empty]');

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          ok = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          ok = false;
        }

        card.classList.toggle('hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [keywordInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && keywordInput) {
      keywordInput.value = query;
      applyFilters();
    }
  });
})();
