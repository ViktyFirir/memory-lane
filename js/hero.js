// Страница героя: один шаблон для всех. Данные берутся из js/heroes-data.js по ?id=...
(function () {
  const IMG = "img/heroes/", AW = "img/awards/";
  const app = document.getElementById("app");
  const id = new URLSearchParams(location.search).get("id") || heroes[0].id;
  const h = heroes.find((x) => x.id === id);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Текст может быть строкой или массивом абзацев
  const P = (x) => (Array.isArray(x) ? x : [x]).map((t) => `<p>${esc(t)}</p>`).join("");
  const LOGO = '<div class="logo"><img src="img/logo.png" alt=""></div>';
  const side = (file) => file ? `<div class="hp-side"><img src="${IMG}${file}" alt="" onerror="var b=this.closest('.hp-block');if(b)b.classList.add('noside');this.parentNode.remove()"></div>` : "";
  const block = (inner, file) => `<div class="hp-block${file ? "" : " noside"}"><div class="hp-text">${inner}</div>${side(file)}</div>`;

  if (!h) { app.innerHTML = '<div class="wrap"><div class="inner hp"><p class="hp-404">Герой не найден.</p></div></div>'; return; }
  document.title = h.name + " — Герои";
  const F = !!h.f; // героиня?
  const W = { his: F ? "её" : "его", hero: F ? "героине" : "герое", heroGen: F ? "героини" : "героя" };

  /* 1. Верхняя панель */
  const facts = (h.birthplace || h.years) ? `<div class="hp-white hp-facts">
      ${h.birthplace ? `<div><h3>Место рождения:</h3><p>${esc(h.birthplace)}</p></div>` : ""}
      ${h.years ? `<div><h3>Годы жизни:</h3><p>${esc(h.years)}</p></div>` : ""}</div>` : "";
  const note = h.note ? `<div class="hp-white hp-note"><h3>Данные уточняются</h3><p>${esc(h.note)}</p></div>` : "";
  const top = `<section class="hp-top"><h1>${esc(h.name)}</h1><div class="hp-top-grid">
      <div class="hp-photo"><img src="${IMG}${h.photo}" alt="${esc(h.name)}" onerror="this.remove()"></div>
      <div class="hp-top-right"><div class="hp-white hp-brief"><h2>Кратко про ${W.heroGen}:</h2><p>${esc(h.brief || h.text)}</p></div>${facts}${note}</div>
    </div></section>`;

  /* 2. Серая панель */
  let story = "";
  if (h.before) story += block(`<h2>Жизнь до войны</h2>${P(h.before)}`, h.photoBefore);
  if (h.deeds) story += block(`<h2>Подвиги ${W.heroGen}</h2>${h.deedsIntro ? P(h.deedsIntro) : ""}<ul>${h.deeds.map((d) => `<li><b>${esc(d.t)}:</b> ${esc(d.d)}</li>`).join("")}</ul>`, h.photoDeeds);
  if (h.full && !h.before && !h.deeds) story += block(`<h2>О ${W.hero}</h2>${P(h.full)}`, h.photoBefore);
  if (h.after) story += `<div class="hp-text"><h2>Память и жизнь после подвига</h2>${P(h.after)}</div>`;
  if (h.awards) {
    const many = h.awards.length >= 3; // стрелки и пагинация только при 3+ наградах
    story += `<div class="hp-text" id="awards"><h2>Достижения (список наград)</h2>${h.awardsText ? `<p>${esc(h.awardsText)}</p>` : ""}</div>
      <a class="hp-redbtn" href="#awards">ДОСТИЖЕНИЯ</a>
      <div class="hp-car-head"><span>О высочайшем признании заслуг перед государством, как в военное, так и в мирное время.</span>
        ${many ? '<div class="hp-arrows"><button type="button" id="carPrev" aria-label="Назад">‹</button><button type="button" id="carNext" aria-label="Вперёд">›</button></div>' : ""}</div>
      <div class="hp-car" id="car">${h.awards.map((a) => `<article class="hp-award"><div class="aw-img">${a.img ? `<img src="${AW}${a.img}" alt="" onerror="this.remove()">` : ""}</div><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></article>`).join("")}</div>
      ${many ? '<div class="hp-dots" id="dots"></div>' : ""}`;
  }
  story = story ? `<section class="hp-story">${story}</section>` : "";

  /* 3. Мемориалы (строка [тип, адрес, широта, долгота, приблизительно?]) */
  const pts = [];
  let mem = "";
  if (h.memorials) {
    const rows = h.memorials.map((m) => m.rows.map((r, i) => {
      const has = typeof r[2] === "number" && typeof r[3] === "number";
      let idx = -1;
      if (has) { idx = pts.length; pts.push({ type: r[0], addr: r[1], place: m.place, lat: r[2], lng: r[3], approx: !!r[4] }); }
      return `<tr${has ? ` class="hp-go" data-i="${idx}" tabindex="0" title="Показать на карте"` : ""}>${i === 0 ? `<td class="loc" rowspan="${m.rows.length}">${esc(m.place)}</td>` : ""}<td class="tp">${esc(r[0])}</td><td class="ad">${esc(r[1])}</td><td class="pn">${has ? `<button type="button" class="hp-pinbtn" data-i="${idx}" aria-label="Показать на карте: ${esc(r[0])}"><svg viewBox="0 0 24 32" width="16" height="21" aria-hidden="true"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.600 12-20.300C24 5.200 18.600 0 12 0z" fill="currentColor"/><circle cx="12" cy="11.500" r="4.500" fill="#fff"/></svg></button>` : ""}</td></tr>`;
    }).join("")).join("");
    mem = `<section class="hp-mem"><h2>Места ${F ? "ее" : "его"} памяти</h2><p>${esc(h.memIntro || "Память о " + W.hero + " увековечена в местах, связанных с " + W.his + " жизнью и подвигом.")}</p>
      ${pts.length ? '<p class="hp-hint">Нажмите на строку таблицы или на значок метки — место откроется на карте ниже.</p>' : ""}
      <div class="hp-tablewrap"><table class="hp-table"><thead><tr><th>Местоположение</th><th>Тип мемориала</th><th>Адрес / Место</th><th>На карте</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  /* 4. Карта памяти */
  const places = [...new Set(pts.map((q) => q.place))];
  const map = pts.length ? `<section class="hp-mapsec">${LOGO}<h2>Карта памяти героя</h2>
      <p>${esc(h.mapIntro || "Здесь вы можете увидеть, где увековечена память о " + W.hero + ". Выберите населённый пункт, строку в таблице или красную метку — наведите на метку, чтобы увидеть название и адрес. Чтобы приближать карту колесом мыши, сначала нажмите на неё.")}</p>
      <div class="hp-mapbar" id="mapTabs" role="group" aria-label="Выбор места на карте">${places.map((pl, k) => `<button type="button" class="hp-chip" data-place="${k}">${esc(pl)}</button>`).join("")}${places.length > 1 ? '<button type="button" class="hp-chip" data-place="all">Все места</button>' : ""}</div>
      <div class="hp-map" id="hpMap"><p class="hp-mapfail" id="mapFail" hidden>Карта не загрузилась. Проверьте подключение к интернету или откройте место по ссылкам ниже.</p></div>
      <div class="hp-mapinfo" id="mapInfo" aria-live="polite"></div>
      <p class="hp-maplegend"><span class="hp-dotapprox"></span> Если у места указано «примерное», метка стоит в центре города или посёлка — точный адрес ещё уточняется.</p></section>` : "";

  /* 5. Источники */
  const src = (h.sources && h.sources.length) ? `<section class="hp-src"><h2>Источники</h2><ul>${h.sources.map((s) => `<li>${s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">${esc(s.t)}</a>` : esc(s.t)}</li>`).join("")}</ul></section>` : "";

  app.innerHTML = `<div class="wrap"><div class="inner hp">${top}${story}${mem}${map}${src}</div></div>`;

  /* Анимации появления при прокрутке */
  const targets = app.querySelectorAll(".hp-top, .hp-photo, .hp-white, .hp-block, .hp-story>.hp-text, .hp-redbtn, .hp-car-head, .hp-award, .hp-deeds-li, .hp-text li, .hp-mem, .hp-table tbody tr, .hp-mapsec, .hp-map, .logo, .hp-src");
  targets.forEach((el, i) => { el.classList.add("rv"); el.style.setProperty("--d", (i % 4) * 0.08 + "s"); });
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.12 });
  targets.forEach((el) => rio.observe(el));

  /* Карусель наград */
  const car = document.getElementById("car");
  if (car && document.getElementById("dots")) {
    const dots = document.getElementById("dots"), prev = document.getElementById("carPrev"), next = document.getElementById("carNext");
    [...car.children].forEach(() => dots.appendChild(document.createElement("i")));
    const step = () => car.children[0].getBoundingClientRect().width + 20;
    const update = () => {
      const i = Math.round(car.scrollLeft / step());
      [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
      prev.classList.toggle("on", car.scrollLeft > 5);
      next.classList.toggle("on", car.scrollLeft + car.clientWidth < car.scrollWidth - 5);
    };
    prev.onclick = () => car.scrollBy({ left: -step(), behavior: "smooth" });
    next.onclick = () => car.scrollBy({ left: step(), behavior: "smooth" });
    car.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* Карта памяти: OpenStreetMap (улицы, дома, названия) + красные метки с подсказкой при наведении */
  const mapEl = document.getElementById("hpMap");
  if (mapEl) {
    const fail = document.getElementById("mapFail");
    if (!window.L) { fail.hidden = false; return; }
    const info = document.getElementById("mapInfo");
    const rowsEl = [...app.querySelectorAll(".hp-go")];
    const chips = [...document.querySelectorAll("#mapTabs .hp-chip")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const map = L.map(mapEl, { minZoom: 3, maxZoom: 19, zoomSnap: 0.5, zoomDelta: 0.5, wheelPxPerZoomLevel: 90, scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a>" })
      .addTo(map);

    // метки с одинаковыми координатами слегка разводим, чтобы их можно было навести по отдельности
    const seen = {};
    pts.forEach((pt) => {
      const key = pt.lat.toFixed(4) + "," + pt.lng.toFixed(4);
      const n = (seen[key] = (seen[key] || 0) + 1) - 1;
      pt.ll = n ? [pt.lat + Math.sin(n * 2.4) * 0.0004 * Math.ceil(n / 3), pt.lng + Math.cos(n * 2.4) * 0.0007 * Math.ceil(n / 3)] : [pt.lat, pt.lng];
    });

    const pin = (approx) => L.divIcon({
      className: "map-marker" + (approx ? " is-approx" : ""),
      html: '<span class="mpin"><svg viewBox="0 0 24 32" width="30" height="40"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0z" fill="currentColor"/><circle cx="12" cy="11.5" r="4.5" fill="#fff"/></svg></span>',
      iconSize: [0, 0]
    });
    const links = (q) => `<div class="hp-maplinks">
        <a href="https://yandex.ru/maps/?pt=${q.lng},${q.lat}&z=${q.approx ? 12 : 17}&l=map" target="_blank" rel="noopener noreferrer">Яндекс Карты</a>
        <a href="https://www.google.com/maps/search/?api=1&query=${q.lat},${q.lng}" target="_blank" rel="noopener noreferrer">Google Карты</a>
        <a href="https://yandex.ru/maps/?rtext=~${q.lat},${q.lng}&rtt=auto" target="_blank" rel="noopener noreferrer">Построить маршрут</a></div>`;
    const card = (q) => `<div class="mp-type">${esc(q.type)}${q.approx ? ' <span class="mp-badge">примерное место</span>' : ""}</div><div class="mp-addr">${esc(q.addr)}</div><div class="mp-place">${esc(q.place)}</div>`;

    const markers = pts.map((pt, i) => {
      const m = L.marker(pt.ll, { icon: pin(pt.approx), riseOnHover: true, title: "" }).addTo(map);
      m.bindTooltip(`<div class="mp-tip">${card(pt)}</div>`, { direction: "top", offset: [0, -38], opacity: 1, className: "mp-tooltip" });
      m.bindPopup(`<div class="mp-pop-in">${card(pt)}${links(pt)}</div>`, { className: "mp-pop", offset: [0, -34], maxWidth: 300 });
      m.on("click", () => selectPoint(i, false));
      return m;
    });

    const mark = (i) => rowsEl.forEach((r) => r.classList.toggle("on", +r.dataset.i === i));
    const setChip = (k) => chips.forEach((c) => c.classList.toggle("on", c.dataset.place === String(k)));
    const fly = (ll, z) => { if (reduce) map.setView(ll, z); else map.flyTo(ll, z, { duration: 0.9 }); };

    function selectPoint(i, scroll) {
      const q = pts[i];
      mark(i); setChip(places.indexOf(q.place));
      info.innerHTML = card(q) + links(q);
      if (scroll) mapEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      map.invalidateSize();
      setTimeout(() => { fly(q.ll, q.approx ? 13 : 18); markers[i].openPopup(); }, scroll && !reduce ? 350 : 0);
    }
    function selectGroup(k) {
      const list = k === "all" ? pts : pts.filter((q) => q.place === places[k]);
      mark(-1); setChip(k); map.closePopup();
      info.innerHTML = `<div class="mp-type">${k === "all" ? "Все места памяти" : esc(places[k])}</div><div class="mp-addr">Меток на карте: ${list.length}. Наведите на метку или выберите строку в таблице, чтобы приблизить конкретное место.</div>`;
      map.invalidateSize();
      const b = L.latLngBounds(list.map((q) => q.ll));
      if (list.length === 1 || b.getNorthEast().equals(b.getSouthWest())) map.setView(list[0].ll, list[0].approx ? 13 : 17);
      else map.fitBounds(b.pad(0.3), { maxZoom: 16, animate: !reduce });
    }

    chips.forEach((c) => c.addEventListener("click", () => selectGroup(c.dataset.place === "all" ? "all" : +c.dataset.place)));
    const table = app.querySelector(".hp-table");
    table.addEventListener("click", (e) => { const tr = e.target.closest(".hp-go"); if (tr) selectPoint(+tr.dataset.i, true); });
    table.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const tr = e.target.closest(".hp-go");
      if (tr) { e.preventDefault(); selectPoint(+tr.dataset.i, true); }
    });

    // колесо мыши приближает карту только после клика по ней, чтобы не мешать прокрутке страницы
    map.on("click", () => map.scrollWheelZoom.enable());
    mapEl.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());

    // карта лежит внутри анимируемого блока: следим за размером и перестраиваем вид, как только он появился
    let first = true;
    const ro = new ResizeObserver(() => {
      if (!mapEl.clientWidth || !mapEl.clientHeight) return;
      map.invalidateSize();
      if (first) { first = false; selectGroup(0); }
    });
    ro.observe(mapEl);
    window.addEventListener("load", () => map.invalidateSize());
  }
})();