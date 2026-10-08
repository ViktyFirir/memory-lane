// Страница события: собирает страницу по адресу event.html?id=<ключ>
// из js/events-data.js, затем включает анимации и слайдер карточек.
(function () {
  'use strict';

  var EVENTS = window.EVENTS || {};
  var app = document.getElementById('eventApp');
  if (!app) return;

  /* ---------- 0. Какое событие показывать ---------- */
  var id = new URLSearchParams(location.search).get('id');
  if (!Object.prototype.hasOwnProperty.call(EVENTS, id)) id = 'grodno';
  var ev = EVENTS[id];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function listItems(arr) {
    return arr.map(function (f) { return '<li><strong>' + esc(f.label) + '</strong> ' + esc(f.text) + '</li>'; }).join('');
  }
  function chronologyBlock(b) {
    var texts = b.text.map(function (t) { return '<p class="event-chronology__text">' + esc(t) + '</p>'; }).join('');
    var head = '<h3 class="event-chronology__subtitle">' + esc(b.title) + '</h3>';
    if (!b.img) return head + texts;
    return '<div class="event-chronology__row">' +
             '<div class="event-chronology__col">' + head + texts + '</div>' +
             '<div class="event-chronology__col"><img class="event-chronology__img" src="' + esc(b.img) + '" alt="' + esc(b.alt || b.title) + '"></div>' +
           '</div>';
  }
  function battleCard(key) {
    var e = EVENTS[key];
    return '<a class="event-battle-card" href="event.html?id=' + encodeURIComponent(key) + '">' +
             '<img class="event-battle-card__img" src="' + esc(e.cardImg) + '" alt="' + esc(e.title) + '">' +
             '<h3 class="event-battle-card__title">' + esc(e.cardTitle) + '</h3>' +
             '<p class="event-battle-card__text">' + esc(e.cardText) + '</p>' +
           '</a>';
  }

  var others = Object.keys(EVENTS).filter(function (k) { return k !== id; });

  document.title = ev.title;

  app.innerHTML =
    '<div class="event-hero" style="--hero:url(\'' + esc(ev.hero) + '\')">' +
      '<img class="event-hero__bg" src="' + esc(ev.hero) + '" alt="' + esc(ev.title) + '">' +
      '<h1 class="event-hero__title">' + esc(ev.title) + '</h1>' +
    '</div>' +

    '<div class="event-info">' +
      '<p class="event-info__text">' + esc(ev.intro) + '</p>' +
      '<span class="event-info__date">' + esc(ev.date) + '</span>' +
    '</div>' +

    '<section class="event-details"><div class="event-details__inner">' +
      '<div class="event-details__stripes">' +
        '<span class="event-details__stripe"></span>' +
        '<img class="event-details__icon" src="img/Vector.png" alt="" aria-hidden="true">' +
        '<span class="event-details__stripe"></span>' +
      '</div>' +
      '<div class="event-details__content">' +
        '<h2 class="event-details__title">' + esc(ev.detailsTitle) + '</h2>' +
        '<ul class="event-details__list">' + listItems(ev.facts) + '</ul>' +
        '<p class="event-details__text">' + esc(ev.lead) + '</p>' +

        '<section class="event-chronology">' +
          '<h2 class="event-chronology__badge">Хронология событий</h2>' +
          ev.chronology.map(chronologyBlock).join('') +
          '<ul class="event-chronology__list">' + listItems(ev.result) + '</ul>' +
        '</section>' +

        (others.length
          ? '<section class="event-battles">' +
              '<div class="event-battles__head">' +
                '<h2 class="event-battles__title">Другие великие сражения</h2>' +
                '<div class="event-battles__nav">' +
                  '<button class="event-battles__arrow" type="button" data-dir="-1" aria-label="Предыдущая карточка">‹</button>' +
                  '<button class="event-battles__arrow" type="button" data-dir="1" aria-label="Следующая карточка">›</button>' +
                '</div>' +
              '</div>' +
              '<div class="event-battles__track" id="battlesTrack">' + others.map(battleCard).join('') + '</div>' +
              '<div class="event-battles__dots" id="battlesDots" aria-hidden="true"></div>' +
            '</section>'
          : '') +
      '</div>' +
    '</div></section>';

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
