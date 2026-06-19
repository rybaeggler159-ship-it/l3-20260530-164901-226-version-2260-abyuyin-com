(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer;

    function showSlide(next) {
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

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var panel = input.closest('.search-panel');
    var section = panel ? panel.parentElement : document;
    var area = section ? section.querySelector('[data-search-area]') : document;
    var cards = area ? Array.prototype.slice.call(area.querySelectorAll('[data-title]')) : [];
    var activeFilter = '';

    function applySearch() {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedFilter = !activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedFilter));
      });
    }

    input.addEventListener('input', applySearch);

    if (panel) {
      panel.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter') || '';
          panel.querySelectorAll('[data-filter]').forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          applySearch();
        });
      });
    }
  });
})();
