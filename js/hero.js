// Страница героя: один шаблон для всех. Данные берутся из js/heroes-data.js по ?id=...
(function () {
  const IMG = "img/heroes/", AW = "img/awards/";
  const app = document.getElementById("app");
  const id = new URLSearchParams(location.search).get("id") || heroes[0].id;
  const h = heroes.find((x) => x.id === id);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LOGO = '<div class="logo"><img src="img/logo.png" alt=""></div>';
  const side = (file) => file ? `<div class="hp-side"><img src="${IMG}${file}" alt="" onerror="this.parentNode.classList.add('empty');this.remove()"></div>` : "";
  const block = (inner, file) => `<div class="hp-block${file ? "" : " noside"}"><div class="hp-text">${inner}</div>${side(file)}</div>`;

  if (!h) { app.innerHTML = '<div class="wrap"><div class="inner hp"><p class="hp-404">Герой не найден.</p></div></div>'; return; }
  document.title = h.name + " — Герои";
  const F = !!h.f; // героиня?
  const W = { his: F ? "её" : "его", hero: F ? "героине" : "герое", heroGen: F ? "героини" : "героя" };

  /* 1. Верхняя панель */
  const facts = (h.birthplace || h.years) ? `<div class="hp-white hp-facts">
      ${h.birthplace ? `<div><h3>Место рождения:</h3><p>${esc(h.birthplace)}</p></div>` : ""}
      ${h.years ? `<div><h3>Годы жизни:</h3><p>${esc(h.years)}</p></div>` : ""}</div>` : "";
  const top = `<section class="hp-top"><h1>${esc(h.name)}</h1><div class="hp-top-grid">
      <div class="hp-photo"><img src="${IMG}${h.photo}" alt="${esc(h.name)}" onerror="this.remove()"></div>
      <div class="hp-top-right"><div class="hp-white hp-brief"><h2>Кратко про ${W.heroGen}:</h2><p>${esc(h.brief || h.text)}</p></div>${facts}</div>
    </div></section>`;

  /* 2. Серая панель */
  let story = "";
  if (h.before) story += block(`<h2>Жизнь до войны</h2><p>${esc(h.before)}</p>`, h.photoBefore);
  if (h.deeds) story += block(`<h2>Подвиги ${W.heroGen}</h2>${h.deedsIntro ? `<p>${esc(h.deedsIntro)}</p>` : ""}<ul>${h.deeds.map((d) => `<li><b>${esc(d.t)}:</b> ${esc(d.d)}</li>`).join("")}</ul>`, h.photoDeeds);
  if (h.full && !h.before && !h.deeds) story += block(`<h2>О ${W.hero === "героине" ? "героине" : "герое"}</h2><p>${esc(h.full)}</p>`, h.photoBefore);
  if (h.after) story += `<div class="hp-text"><h2>Жизнь после войны</h2><p>${esc(h.after)}</p></div>`;
  if (h.awards) {
    story += `<div class="hp-text" id="awards"><h2>Достижения (список наград)</h2>${h.awardsText ? `<p>${esc(h.awardsText)}</p>` : ""}</div>
      <a class="hp-redbtn" href="#awards">ДОСТИЖЕНИЯ</a>
      <div class="hp-car-head"><span>О высочайшем признании заслуг перед государством, как в военное, так и в мирное время.</span>
        <div class="hp-arrows"><button type="button" id="carPrev" aria-label="Назад">‹</button><button type="button" id="carNext" aria-label="Вперёд">›</button></div></div>
      <div class="hp-car" id="car">${h.awards.map((a) => `<article class="hp-award"><div class="aw-img">${a.img ? `<img src="${AW}${a.img}" alt="" onerror="this.remove()">` : ""}</div><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></article>`).join("")}</div>
      <div class="hp-dots" id="dots"></div>`;
  }
  story = story ? `<section class="hp-story">${story}</section>` : "";

  /* 3. Мемориалы */
  let mem = "";
  if (h.memorials) {
    const rows = h.memorials.map((m) => m.rows.map((r, i) =>
      `<tr>${i === 0 ? `<td class="loc" rowspan="${m.rows.length}">${esc(m.place)}</td>` : ""}<td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")).join("");
    mem = `<section class="hp-mem"><h2>Места ${W.his} мемориалов</h2><p>${esc(h.memIntro || "Память о " + W.hero + " увековечена в местах, связанных с " + W.his + " жизнью и подвигом.")}</p>
      <div class="hp-tablewrap"><table class="hp-table"><thead><tr><th>Местоположение</th><th>Тип мемориала</th><th>Адрес / Место</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  /* 4. Карта */
  const map = h.map ? `<section class="hp-mapsec">${LOGO}<h2>Карта памяти героя</h2>
      <p>${esc(h.mapIntro || "Здесь вы можете увидеть, где увековечена память о " + W.hero + ".")}</p>
      <div class="hp-map"><iframe title="Карта памяти" loading="lazy" src="${esc(h.map)}"></iframe></div></section>` : "";

  app.innerHTML = `<div class="wrap"><div class="inner hp">${top}${story}${mem}${map}</div></div>`;

  /* Анимации появления при прокрутке */
  const targets = app.querySelectorAll(".hp-top, .hp-photo, .hp-white, .hp-block, .hp-story>.hp-text, .hp-redbtn, .hp-car-head, .hp-award, .hp-deeds-li, .hp-text li, .hp-mem, .hp-table tbody tr, .hp-mapsec, .hp-map, .logo");
  targets.forEach((el, i) => { el.classList.add("rv"); el.style.setProperty("--d", (i % 4) * 0.08 + "s"); });
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.12 });
  targets.forEach((el) => rio.observe(el));

  /* Карусель наград */
  const car = document.getElementById("car");
  if (car) {
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
})();
