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
  const W = { his: F ? "её" : "его", hero: F ? "героине" : "герое", heroGen: F ? "героини" : "героя", heroAcc: F ? "героиню" : "героя" };
  const ST = h.students === true; // герой из раздела «Герои наших студентов»

  /* 1. Верхняя панель */
  const facts = (h.birthplace || h.years) ? `<div class="hp-white hp-facts">
      ${h.birthplace ? `<div><h3>Место рождения:</h3><p>${esc(h.birthplace)}</p></div>` : ""}
      ${h.years ? `<div><h3>Годы жизни:</h3><p>${esc(h.years)}</p></div>` : ""}</div>` : "";
  const note = h.note ? `<div class="hp-white hp-note"><h3>Данные уточняются</h3><p>${esc(h.note)}</p></div>` : "";
    const top = `<section class="hp-top"><h1>${esc(h.name)}</h1><div class="hp-top-grid">
      <div class="hp-photo">${h.photo ? `<img src="${IMG}${h.photo}" alt="${esc(h.name)}" onerror="this.remove()">` : '<svg class="ph" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z"/></svg>'}</div>
      <div class="hp-top-right"><div class="hp-white hp-brief"><h2>${ST ? "Кратко" : "Кратко про героя"}</h2><p>${esc(h.brief || h.text)}</p></div>${facts}${note}</div>
    </div></section>`;

  /* 2. Серая панель */
    
  let story = "";
  if (ST) {
    // один общий заголовок «Биография», но фото сохраняются
    const fileBefore = h.photoBefore;
    const fileDeeds = h.photoDeeds;
    let bio = "";
    if (h.before) {
      bio += `<div class="hp-block${fileBefore ? "" : " noside"}"><div class="hp-text">${P(h.before)}</div>${side(fileBefore)}</div>`;
    }
    if (h.deeds) {
      let deedsHtml = "";
      if (h.deedsIntro) deedsHtml += P(h.deedsIntro);
      deedsHtml += `<ul>${h.deeds.map((d) => `<li><b>${esc(d.t)}:</b> ${esc(d.d)}</li>`).join("")}</ul>`;
      bio += `<div class="hp-block${fileDeeds ? "" : " noside"}"><div class="hp-text">${deedsHtml}</div>${side(fileDeeds)}</div>`;
    }
    if (h.full && !h.before && !h.deeds) {
      bio += `<div class="hp-block${fileBefore ? "" : " noside"}"><div class="hp-text">${P(h.full)}</div>${side(fileBefore)}</div>`;
    }
    if (h.after) bio += `<div class="hp-text">${P(h.after)}</div>`;
    if (bio) story += `<div class="hp-text"><h2>Биография</h2></div>${bio}`;
  } else {
    if (h.before) story += block(`<h2>Жизнь до войны</h2>${P(h.before)}`, h.photoBefore);
    if (h.deeds) story += block(`<h2>Подвиги ${W.heroGen}</h2>${h.deedsIntro ? P(h.deedsIntro) : ""}<ul>${h.deeds.map((d) => `<li><b>${esc(d.t)}:</b> ${esc(d.d)}</li>`).join("")}</ul>`, h.photoDeeds);
    if (h.full && !h.before && !h.deeds) story += block(`<h2>О ${W.hero}</h2>${P(h.full)}`, h.photoBefore);
    if (h.after) story += `<div class="hp-text"><h2>Память и жизнь после подвига</h2>${P(h.after)}</div>`;
  }
  if (h.awards) {
    const many = h.awards.length >= 3; // стрелки и пагинация только при 3+ наградах
    story += `<div class="hp-text" id="awards"><h2>Награды</h2>${h.awardsText ? `<p>${esc(h.awardsText)}</p>` : ""}</div>
      <a class="hp-redbtn" href="#awards">НАГРАДЫ</a>
      <div class="hp-car-head"><span>О высочайшем признании заслуг перед государством, как в военное, так и в мирное время.</span>
        ${many ? '<div class="hp-arrows"><button type="button" id="carPrev" aria-label="Назад">‹</button><button type="button" id="carNext" aria-label="Вперёд">›</button></div>' : ""}</div>
      <div class="hp-car" id="car">${h.awards.map((a) => `<article class="hp-award"><div class="aw-img">${a.img ? `<img src="${AW}${a.img}" alt="" onerror="this.remove()">` : ""}</div><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></article>`).join("")}</div>
      ${many ? '<div class="hp-dots" id="dots"></div>' : ""}`;
  }
  story = story ? `<section class="hp-story">${story}</section>` : "";

  /* 3. Мемориалы (строка [тип, адрес, широта, долгота, приблизительно?, геоданные?]) */
  const pts = [];
  let mem = "";
  if (h.memorials) {
    const rows = h.memorials.map((m) => m.rows.map((r, i) => {
      const has = typeof r[2] === "number" && typeof r[3] === "number";
      let idx = -1;
      if (has) { idx = pts.length; pts.push({ type: r[0], addr: r[1], place: m.place, lat: r[2], lng: r[3], approx: !!r[4], g: r[5] || null }); }
      return `<tr${has ? ` class="hp-go" data-i="${idx}" tabindex="0" title="Показать на карте"` : ""}>${i === 0 ? `<td class="loc" rowspan="${m.rows.length}">${esc(m.place)}</td>` : ""}<td class="tp">${esc(r[0])}</td><td class="ad">${esc(r[1])}</td><td class="pn">${has ? `<button type="button" class="hp-pinbtn" data-i="${idx}" aria-label="Показать на карте: ${esc(r[0])}"><svg viewBox="0 0 24 32" width="16" height="21" aria-hidden="true"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.600 12-20.300C24 5.200 18.600 0 12 0z" fill="currentColor"/><circle cx="12" cy="11.500" r="4.500" fill="#fff"/></svg></button>` : ""}</td></tr>`;
    }).join("")).join("");
    mem = `<section class="hp-mem"><h2>Места памяти</h2><p>${esc(h.memIntro || "Память о " + W.hero + " увековечена в местах, связанных с " + W.his + " жизнью и подвигом.")}</p>
      ${pts.length ? '<p class="hp-hint">Нажмите на строку таблицы или на значок метки — место откроется на карте ниже.</p>' : ""}
      <div class="hp-tablewrap"><table class="hp-table"><thead><tr><th>Местоположение</th><th>Тип мемориала</th><th>Адрес / Место</th><th>На карте</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  /* 4. Карта памяти */
  const places = [...new Set(pts.map((q) => q.place))];
  const map = pts.length ? `<section class="hp-mapsec">${LOGO}<h2>Карта памяти героя</h2>
      <p>${esc(h.mapIntro || "Здесь вы можете увидеть, где увековечена память о " + W.hero + ". Выберите населённый пункт, строку в таблице или красную метку — наведите на метку, чтобы увидеть название и адрес. Чтобы приближать карту колесом мыши, сначала нажмите на неё.")}</p>
      <div class="hp-mapbar" id="mapTabs" role="group" aria-label="Выбор места на карте">${places.map((pl, k) => `<button type="button" class="hp-chip" data-place="${k}">${esc(pl)}</button>`).join("")}${places.length > 1 ? '<button type="button" class="hp-chip" data-place="all">Все места</button>' : ""}</div>
      <div class="hp-map" id="hpMap"><p class="hp-mapfail" id="mapFail" hidden>Карта не загрузилась. Проверьте подключение к интернету или откройте место по ссылкам ниже.</p><div class="hp-maploading" id="mapLoad" hidden><span class="hp-spin"></span>Загружаем точное положение мест из OpenStreetMap…</div></div>
      <div class="hp-mapinfo" id="mapInfo" aria-live="polite"></div>
      <p class="hp-mapstatus" id="mapStatus" aria-live="polite"></p>
      <p class="hp-maplegend"><span class="hp-dotline"></span> Улица, названная в честь героя, подсвечена красной линией от начала до конца улицы.</p>
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

  /* Карта памяти: OpenStreetMap + красные метки + подсветка улиц целиком.
     Улицы (поле g.s в строке мемориала) подгружаются из OpenStreetMap и рисуются линией от начала до конца улицы.
     Мемориалы (поле g.q) уточняются по адресу через геокодер Nominatim.
     Неточные координаты из heroes-data.js на карте НЕ показываются, пока идёт уточнение: метки появляются, когда есть данные OpenStreetMap
     (из готового файла js/geo-cache.js, из кэша браузера или из живого запроса). Запасные координаты используются
     только если OpenStreetMap так и не ответил, и тогда метка честно помечена как «примерное место». */
  const mapEl = document.getElementById("hpMap");
  if (mapEl) {
    const fail = document.getElementById("mapFail");
    if (!window.L) { fail.hidden = false; return; }
    const info = document.getElementById("mapInfo");
    const status = document.getElementById("mapStatus") || document.createElement("p");
    const rowsEl = [...app.querySelectorAll(".hp-go")];
    const chips = [...document.querySelectorAll("#mapTabs .hp-chip")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const map = L.map(mapEl, { minZoom: 3, maxZoom: 19, zoomSnap: 0.5, zoomDelta: 0.5, wheelPxPerZoomLevel: 90, scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a>" })
      .addTo(map);

    /* ---------- вспомогательные функции ---------- */
    const RAD = Math.PI / 180;
    const dist = (a, b) => { // расстояние между точками [lat,lng], м
      const dLa = (b[0] - a[0]) * RAD, dLo = (b[1] - a[1]) * RAD;
      const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(dLo / 2) ** 2;
      return 12742000 * Math.asin(Math.sqrt(x));
    };
    const pathLen = (p) => { let s = 0; for (let k = 1; k < p.length; k++) s += dist(p[k - 1], p[k]); return s; };
    const fmtLen = (m) => m < 1000 ? "≈ " + Math.max(10, Math.round(m / 10) * 10) + " м" : "≈ " + (m / 1000).toFixed(1).replace(".", ",") + " км";
    const minDist = (e, nodes) => { let m = Infinity; for (const x of nodes) { const d = dist(e, x); if (d < m) m = d; } return m; };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const hash = (s) => { let x = 0; for (let k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) | 0; return (x >>> 0).toString(36); };

    /* ---------- точки ---------- */
    pts.forEach((pt) => { pt.fallback = [pt.lat, pt.lng]; pt.line = null; pt.pending = !!pt.g; });
    const loadEl = document.getElementById("mapLoad");
    const updLoad = () => { if (loadEl) loadEl.hidden = !pts.some((q) => q.pending); };

    // метки с одинаковыми координатами слегка разводим, чтобы их можно было навести по отдельности
    const markers = [];
    function layout() {
      const seen = {};
      pts.forEach((pt, i) => {
        if (pt.line) return;
        const key = pt.lat.toFixed(4) + "," + pt.lng.toFixed(4);
        const n = (seen[key] = (seen[key] || 0) + 1) - 1;
        const k = pt.approx ? 1 : 0.15; // у точных меток разведение совсем небольшое
        pt.ll = n ? [pt.lat + Math.sin(n * 2.4) * 0.0004 * k * Math.ceil(n / 3), pt.lng + Math.cos(n * 2.4) * 0.0007 * k * Math.ceil(n / 3)] : [pt.lat, pt.lng];
        if (markers[i]) markers[i].setLatLng(pt.ll);
      });
    }
    layout();

    const pin = (approx) => L.divIcon({
      className: "map-marker" + (approx ? " is-approx" : ""),
      html: '<span class="mpin"><svg viewBox="0 0 24 32" width="30" height="40"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0z" fill="currentColor"/><circle cx="12" cy="11.5" r="4.5" fill="#fff"/></svg></span>',
      iconSize: [0, 0]
    });
    const links = (q) => `<div class="hp-maplinks">
        <a href="https://yandex.ru/maps/?pt=${q.ll[1]},${q.ll[0]}&z=${q.line ? 16 : q.approx ? 12 : 17}&l=map" target="_blank" rel="noopener noreferrer">Яндекс Карты</a>
        <a href="https://www.google.com/maps/search/?api=1&query=${q.ll[0]},${q.ll[1]}" target="_blank" rel="noopener noreferrer">Google Карты</a>
        <a href="https://yandex.ru/maps/?rtext=~${q.ll[0]},${q.ll[1]}&rtt=auto" target="_blank" rel="noopener noreferrer">Построить маршрут</a></div>`;
    const card = (q) => `<div class="mp-type">${esc(q.type)}${q.approx ? ' <span class="mp-badge">примерное место</span>' : ""}</div><div class="mp-addr">${esc(q.addr)}</div>${q.line ? `<div class="mp-note">Улица подсвечена на карте целиком: ${fmtLen(q.line.len)}</div>` : ""}<div class="mp-place">${esc(q.place)}</div>`;
    const tipHtml = (q) => `<div class="mp-tip">${card(q)}</div>`;
    const popHtml = (q) => `<div class="mp-pop-in">${card(q)}${links(q)}</div>`;

    let cur = { mode: "group", k: 0 }; // что сейчас показано: группа меток или одна точка

    pts.forEach((pt, i) => {
      const m = L.marker(pt.ll, { icon: pin(pt.approx), riseOnHover: true, title: "" });
      if (!pt.pending) m.addTo(map); // точки, которые ещё уточняются, не показываем — иначе видна неточная метка
      m.bindTooltip(tipHtml(pt), { direction: "top", offset: [0, -38], opacity: 1, className: "mp-tooltip" });
      m.bindPopup(popHtml(pt), { className: "mp-pop", offset: [0, -34], maxWidth: 300 });
      m.on("click", () => selectPoint(i, false));
      markers[i] = m;
    });

    const mark = (i) => rowsEl.forEach((r) => r.classList.toggle("on", +r.dataset.i === i));
    const setChip = (k) => chips.forEach((c) => c.classList.toggle("on", c.dataset.place === String(k)));
    const fly = (ll, z) => { if (reduce) map.setView(ll, z); else map.flyTo(ll, z, { duration: 0.9 }); };
    const flyBounds = (b, maxZoom) => { if (reduce) map.fitBounds(b, { padding: [40, 40], maxZoom }); else map.flyToBounds(b, { padding: [40, 40], maxZoom, duration: 0.9 }); };

    function selectPoint(i, scroll, latlng) {
      const q = pts[i];
      cur = { mode: "point", i };
      mark(i); setChip(places.indexOf(q.place));
      info.innerHTML = card(q) + links(q);
      if (scroll) mapEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      map.invalidateSize();
      if (q.pending) { info.innerHTML = card(q) + '<div class="mp-note">Положение уточняется по данным OpenStreetMap…</div>'; fly(q.fallback, 13); return; }
      setTimeout(() => {
        if (q.line) { flyBounds(q.line.bounds, 17); q.line.hit.openPopup(latlng || q.ll); }
        else { fly(q.ll, q.approx ? 13 : 18); markers[i].openPopup(); }
      }, scroll && !reduce ? 350 : 0);
    }
    function groupBounds(list) {
      const b = L.latLngBounds([]);
      const ready = list.filter((q) => !q.pending);
      (ready.length ? ready : list).forEach((q) => { if (q.line) b.extend(q.line.bounds); else b.extend(q.ll); });
      return b;
    }
    function selectGroup(k, quiet) {
      const list = k === "all" ? pts : pts.filter((q) => q.place === places[k]);
      cur = { mode: "group", k };
      if (!quiet) { mark(-1); map.closePopup(); info.innerHTML = `<div class="mp-type">${k === "all" ? "Все места памяти" : esc(places[k])}</div><div class="mp-addr">Объектов на карте: ${list.length}. Наведите на метку или улицу либо выберите строку в таблице, чтобы приблизить конкретное место.</div>`; }
      setChip(k);
      map.invalidateSize();
      if (!mapEl.clientWidth) return;
      const b = groupBounds(list);
      if (b.getNorthEast().equals(b.getSouthWest())) map.setView(b.getCenter(), list[0].approx ? 13 : 17);
      else if (list.length === 1 && list[0].line) map.fitBounds(b.pad(0.3), { maxZoom: 17, animate: !reduce });
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

    /* ---------- уточнение положения: улицы целиком и точные адреса ---------- */
    let refitT = 0;
    function refresh(i) { // обновить всё, что зависит от координат точки i
      const q = pts[i];
      q.pending = false; updLoad();
      layout();
      if (q.line) {
        q.line.group.addTo(map);
        if (markers[i]) markers[i].remove();
        q.line.hit.setTooltipContent(tipHtml(q)); q.line.hit.setPopupContent(popHtml(q));
      } else {
        markers[i].setIcon(pin(q.approx));
        if (!map.hasLayer(markers[i])) markers[i].addTo(map);
        markers[i].setTooltipContent(tipHtml(q)); markers[i].setPopupContent(popHtml(q));
      }
      if (cur.mode === "point" && cur.i === i) info.innerHTML = card(q) + links(q);
      // если пользователь ещё ничего не выбирал — подстраиваем вид под уточнённые данные
      clearTimeout(refitT);
      refitT = setTimeout(() => {
        if (cur.mode === "group") { if (cur.k === "all" || q.place === places[cur.k]) selectGroup(cur.k, true); }
        else if (cur.mode === "point" && cur.i === i) { if (q.line) map.fitBounds(q.line.bounds.pad(0.3), { maxZoom: 17, animate: !reduce }); else map.setView(q.ll, q.approx ? 13 : 18, { animate: !reduce }); }
      }, 400);
    }

    // линия улицы: выбираем основную связную часть и подсвечиваем её целиком
    function pickCluster(paths) {
      const n = paths.length, par = paths.map((_, k) => k);
      const find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
      const touch = (a, b) => [a[0], a[a.length - 1]].some((e) => b.some((c) => dist(e, c) < 35));
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (touch(paths[a], paths[b]) || touch(paths[b], paths[a])) par[find(a)] = find(b);
      const groups = {};
      paths.forEach((p, k) => { (groups[find(k)] = groups[find(k)] || []).push(p); });
      const cl = Object.values(groups).map((g) => ({ g, len: g.reduce((s, p) => s + pathLen(p), 0) })).sort((a, b) => b.len - a.len);
      let keep = cl[0].g.slice();
      cl.slice(1).forEach((c) => { // близкие обрывки той же улицы (разрыв до 1,2 км) тоже оставляем
        const nodes = keep.flat();
        const gap = Math.min(...c.g.flatMap((p) => [p[0], p[p.length - 1]]).map((e) => minDist(e, nodes)));
        if (gap < 1200) keep = keep.concat(c.g);
      });
      return keep;
    }
    function streetEnds(paths) {
      const free = [];
      paths.forEach((p, a) => [p[0], p[p.length - 1]].forEach((e) => {
        const joined = paths.some((o, b) => b !== a && o.some((c) => dist(e, c) < 25));
        if (!joined) free.push(e);
      }));
      const pool = free.length >= 2 ? free : paths.flatMap((p) => [p[0], p[p.length - 1]]);
      let best = [pool[0], pool[pool.length - 1]], bd = -1;
      for (let a = 0; a < pool.length; a++) for (let b = a + 1; b < pool.length; b++) { const d = dist(pool[a], pool[b]); if (d > bd) { bd = d; best = [pool[a], pool[b]]; } }
      return best;
    }
    function applyLine(i, rawPaths) {
      const q = pts[i];
      const paths = pickCluster(rawPaths.filter((p) => p.length > 1));
      const all = paths.flat();
      const bounds = L.latLngBounds(all);
      const c = bounds.getCenter();
      const mid = all.reduce((b, x) => (dist(x, [c.lat, c.lng]) < dist(b, [c.lat, c.lng]) ? x : b), all[0]); // точка улицы ближе всего к центру
      const group = L.layerGroup();
      const style = { lineCap: "round", lineJoin: "round" };
      paths.forEach((p) => L.polyline(p, { ...style, color: "#fff", weight: 11, opacity: 0.95, interactive: false }).addTo(group));
      paths.forEach((p) => L.polyline(p, { ...style, color: "#c01414", weight: 6, opacity: 1, className: "mp-street", interactive: false }).addTo(group));
      streetEnds(paths).forEach((e) => L.circleMarker(e, { radius: 7, color: "#c01414", weight: 3, fillColor: "#fff", fillOpacity: 1, className: "mp-cap", interactive: false }).addTo(group));
      // невидимая широкая линия поверх улицы, чтобы её было легко навести и нажать
      const hl = L.featureGroup(paths.map((p) => L.polyline(p, { weight: 24, opacity: 0, ...style }))).addTo(group);
      hl.bindTooltip("", { sticky: true, direction: "top", offset: [0, -6], opacity: 1, className: "mp-tooltip" });
      hl.bindPopup("", { className: "mp-pop", maxWidth: 300, autoPan: false });
      hl.on("click", (e) => selectPoint(i, false, e.latlng));
      q.lat = mid[0]; q.lng = mid[1]; q.ll = mid; q.approx = false;
      q.line = { group, hit: hl, bounds, len: paths.reduce((s, p) => s + pathLen(p), 0), paths };
      refresh(i);
    }
    function applyPoint(i, r) {
      const q = pts[i];
      q.lat = r.lat; q.lng = r.lng;
      q.approx = q.g && q.g.a ? true : !r.precise;
      refresh(i);
    }

    // --- кэш в браузере (чтобы не нагружать сервисы при повторных заходах) ---
    const CK = "ml-geo-v2:", TTL = 14 * 864e5, TTL_NONE = 2 * 864e5; // «ничего не нашли» помним 2 дня
    const ckey = (i) => CK + h.id + ":" + i + ":" + hash(JSON.stringify(pts[i].g));
    const sget = (i) => (window.GEO_CACHE && window.GEO_CACHE[h.id + ":" + i + ":" + hash(JSON.stringify(pts[i].g))]) || null; // готовый файл js/geo-cache.js
    const cget = (i) => { const st = sget(i); if (st) return st; try { const o = JSON.parse(localStorage.getItem(ckey(i))); if (o && Date.now() - o.t < (o.v.k === "none" ? TTL_NONE : TTL)) return o.v; } catch (e) {} return null; };
    const cset = (i, v) => { try { localStorage.setItem(ckey(i), JSON.stringify({ t: Date.now(), v })); } catch (e) {} };
    const round5 = (p) => p.map((c) => [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5]);

    // --- Overpass: геометрия улиц (все улицы героя одним запросом) ---
    const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
    async function overpass(query) { // зеркала опрашиваем одновременно — берём самый быстрый ответ
      const one = async (url) => {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
        try {
          const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(query), headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: ctl.signal });
          if (!r.ok) throw new Error("http");
          const j = await r.json();
          if (j && Array.isArray(j.elements)) return j;
          throw new Error("bad");
        } finally { clearTimeout(to); }
      };
      try { return await Promise.any(OVERPASS.map(one)); } catch (e) { return null; }
    }
    const qEsc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const NOT_STREET = /переулок|завулак|проезд|праезд|тупик|тупік/i;
    async function loadStreets(idx) {
      const body = idx.map((i) => { const q = pts[i], g = q.g; return `way["highway"]["highway"!~"^(footway|steps|path|cycleway|track|bridleway|corridor|proposed)$"][~"^name(:ru|:be)?$"~"${qEsc(g.s)}"](around:${g.r || 8000},${q.fallback[0]},${q.fallback[1]});`; }).join("");
      const data = await overpass("[out:json][timeout:40];(" + body + ");out geom;");
      if (!data) return;
      idx.forEach((i) => { pts[i].opOk = true; });
      const res = {}, rx = {};
      idx.forEach((i) => { rx[i] = new RegExp(pts[i].g.s); });
      data.elements.forEach((w) => {
        if (w.type !== "way" || !w.geometry || w.geometry.length < 2) return;
        const t = w.tags || {}, names = [t.name, t["name:ru"], t["name:be"]].filter(Boolean);
        if (names.every((n) => NOT_STREET.test(n) && !/улица|вуліца/i.test(n))) return;
        const path = w.geometry.map((p) => [p.lat, p.lon]), mid = path[Math.floor(path.length / 2)];
        let best = -1, bd = Infinity;
        idx.forEach((i) => {
          if (!names.some((n) => rx[i].test(n))) return;
          const d = dist(pts[i].fallback, mid);
          if (d <= (pts[i].g.r || 8000) && d < bd) { bd = d; best = i; }
        });
        if (best >= 0) (res[best] = res[best] || []).push(path);
      });
      idx.forEach((i) => { if (res[i]) { const paths = res[i].map(round5); cset(i, { k: "line", paths }); applyLine(i, paths); } });
    }

    // --- Nominatim: адреса мемориалов (не чаще 1 запроса в секунду) ---
    let nomLast = 0, nomChain = Promise.resolve();
    const nomSlot = () => (nomChain = nomChain.then(() => sleep(Math.max(0, nomLast + 1100 - Date.now()))).then(() => { nomLast = Date.now(); }));
    async function nominatim(text, i, extra) {
      const q = pts[i], r = q.g.r || 8000;
      const dLa = r / 111320, dLo = r / (111320 * Math.cos(q.fallback[0] * RAD));
      const vb = [q.fallback[1] - dLo, q.fallback[0] + dLa, q.fallback[1] + dLo, q.fallback[0] - dLa].join(",");
      await nomSlot();
      try {
        const res = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=ru&bounded=1&addressdetails=1&viewbox=" + vb + (extra || "") + "&q=" + encodeURIComponent(text), { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        const arr = await res.json();
        return (Array.isArray(arr) ? arr : []).filter((it) => dist([+it.lat, +it.lon], q.fallback) <= r * 1.2);
      } catch (e) { return null; } // null — сервис не ответил (отличаем от «ничего не найдено»)
    }
    const PLACE = /^(place|boundary)$/;
    const ROAD = /^(highway|place|boundary|landuse)$/;
    // Если в запросе есть номер дома, принимаем только сам дом/объект. Центр улицы или кольцо — не подходят (так метка колледжа попала на кольцо).
    const okHit = (it, text) => {
      const cls = it.category || it.class || "";
      if (!/\d/.test(text)) return true;
      if (ROAD.test(cls)) return false;
      return !!(it.address && it.address.house_number) || /^(building|amenity|office|shop|craft|man_made|historic)$/.test(cls);
    };
    async function loadPoint(i) {
      const g = pts[i].g;
      let failed = false;
      for (const text of g.q || []) {
        const arr = await nominatim(text, i);
        if (!arr) { failed = true; continue; }
        const good = arr.filter((x) => okHit(x, text));
        if (good.length) {
          const it = good[0];
          const v = { k: "pt", lat: +it.lat, lng: +it.lon, precise: !PLACE.test(it.category || it.class || "") };
          cset(i, v); applyPoint(i, v); return true;
        }
      }
      if (!failed) cset(i, { k: "none" });
      return false;
    }
    async function loadStreetFallback(i) { // если в Overpass улицы нет — пробуем геометрию из Nominatim
      const g = pts[i].g;
      let failed = !pts[i].opOk; // Overpass не ответил — «ничего нет» запоминать нельзя
      if (g.n) {
        const arr = await nominatim(g.n, i, "&polygon_geojson=1");
        if (!arr) failed = true;
        const it = arr && arr.find((x) => (x.category || x.class) === "highway" && x.geojson && /LineString/.test(x.geojson.type));
        if (it) {
          const lines = it.geojson.type === "LineString" ? [it.geojson.coordinates] : it.geojson.coordinates;
          const paths = lines.map((l) => round5(l.map((c) => [c[1], c[0]])));
          cset(i, { k: "line", paths }); applyLine(i, paths); return true;
        }
      }
      if (g.fq) { // улицы нет на карте — хотя бы ставим метку в нужный район города
        const arr = await nominatim(g.fq, i);
        if (!arr) failed = true;
        else if (arr.length) { const v = { k: "pt", lat: +arr[0].lat, lng: +arr[0].lon, precise: false }; cset(i, v); applyPoint(i, v); return false; }
      }
      if (!failed) cset(i, { k: "none" });
      return false;
    }

    async function resolveAll() {
      const todo = pts.map((_, i) => i).filter((i) => pts[i].g);
      if (!todo.length) return;
      status.textContent = "Уточняем положение мест на карте…";
      let rest = [];
      todo.forEach((i) => {
        const c = cget(i);
        if (!c) rest.push(i);
        else if (c.k === "line") applyLine(i, c.paths);
        else if (c.k === "pt") applyPoint(i, c);
      });
      updLoad();
      const streets = rest.filter((i) => pts[i].g.s);
      const points = rest.filter((i) => !pts[i].g.s);
      // улицы (Overpass) и мемориалы (Nominatim) уточняем одновременно, а не по очереди
      await Promise.all([
        (async () => {
          if (streets.length) { try { await loadStreets(streets); } catch (e) {} }
          for (const i of streets) { if (pts[i].line) continue; try { await loadStreetFallback(i); } catch (e) {} }
        })(),
        (async () => { for (const i of points) { try { await loadPoint(i); } catch (e) {} } })()
      ]);
      // OpenStreetMap так и не дал ответа: показываем запасное положение, но честно как «примерное»
      pts.forEach((q, i) => { if (q.pending) { q.approx = true; refresh(i); } });
      const lines = pts.filter((q) => q.line).length, streetsAll = pts.filter((q) => q.g && q.g.s).length;
      const exact = pts.filter((q) => q.g && !q.g.s && !q.approx).length;
      const parts = [];
      if (streetsAll) parts.push("улиц показано целиком: " + lines + " из " + streetsAll);
      if (pts.some((q) => q.g && !q.g.s)) parts.push("мемориалов уточнено по адресу: " + exact);
      status.textContent = (lines || exact ? "Данные OpenStreetMap — " : "Не удалось получить уточнённые данные, показано примерное положение. ") + (lines || exact ? parts.join("; ") + "." : "");
    }
    resolveAll().catch(() => { status.textContent = ""; });
  }
})();