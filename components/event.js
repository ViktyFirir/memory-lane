// Страница события: появление блоков при прокрутке + слайдер карточек сражений
(function () {
  'use strict';

  /* ---------- 1. Появление при скролле ----------
     data-animate ставим из JS: если скрипт не загрузился, контент остаётся видимым. */
  var targets = document.querySelectorAll(
    '.event-info, .event-details__inner, .event-details__list li, .event-details__text,' +
    '.event-chronology__badge, .event-chronology__subtitle, .event-chronology__text,' +
    '.event-chronology__row, .event-chronology__list, .event-battles'
  );
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { el.setAttribute('data-animate', ''); io.observe(el); });
  }

  /* ---------- 2. Слайдер сражений ---------- */
  var track = document.getElementById('battlesTrack');
  var dotsBox = document.getElementById('battlesDots');
  var prev = document.querySelector('.event-battles__arrow[data-dir="-1"]');
  var next = document.querySelector('.event-battles__arrow[data-dir="1"]');
  if (!track || !dotsBox || !prev || !next) return;

  var cards = Array.prototype.slice.call(track.children);
  var dots = [];

  function step() {
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }
  function maxScroll() { return track.scrollWidth - track.clientWidth; }

  cards.forEach(function (_, i) {
    var d = document.createElement('span');
    d.className = 'event-battles__dot';
    d.addEventListener('click', function () { track.scrollTo({ left: i * step(), behavior: 'smooth' }); });
    dotsBox.appendChild(d);
    dots.push(d);
  });

  function update() {
    var max = maxScroll();
    var scrollable = max > 4;
    // если все карточки помещаются — навигация не нужна
    prev.closest('.event-battles__nav').style.visibility = scrollable ? '' : 'hidden';
    dotsBox.style.display = scrollable ? '' : 'none';

    var atEnd = track.scrollLeft >= max - 4;
    var i = atEnd ? cards.length - 1 : Math.round(track.scrollLeft / step());
    dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });

    prev.disabled = track.scrollLeft <= 4;
    next.disabled = atEnd;
    prev.classList.toggle('is-active', !prev.disabled);
    next.classList.toggle('is-active', !next.disabled);
  }

  prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
})();
