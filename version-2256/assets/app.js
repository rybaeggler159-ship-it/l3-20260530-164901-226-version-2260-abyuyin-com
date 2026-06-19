(function () {
  var navButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function bindFilter(formSelector, inputSelector, listSelector) {
    var form = document.querySelector(formSelector);
    var input = document.querySelector(inputSelector);
    var list = document.querySelector(listSelector);

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var q = normalize(input.value);

      cards.forEach(function (card) {
        var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre'));
        card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
      });
    }

    input.addEventListener('input', apply);

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }

    return apply;
  }

  bindFilter('[data-filter-form]', '[data-filter-input]', '[data-filter-list]');

  var searchInput = document.querySelector('[data-search-input]');
  var applySearch = bindFilter('[data-search-form]', '[data-search-input]', '[data-search-list]');

  if (searchInput && applySearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      searchInput.value = q;
      applySearch();
    }
  }
})();
