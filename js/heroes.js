// Каталог. Данные героев — в js/heroes-data.js (подключается до этого файла).
const PER_PAGE = 9;
const IMG_DIR = "img/heroes/";
const PLACEHOLDER = '<svg class="ph" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z"/></svg>';

const grid = document.getElementById("grid");
const pager = document.getElementById("pager");
const empty = document.getElementById("empty");
const input = document.getElementById("searchInput");

let list = heroes.slice();
let page = 1;

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
}, { threshold: 0.15 });

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function photoHTML(h) {
  return `<img src="${IMG_DIR}${h.photo}" alt="${esc(h.name)}" loading="lazy" onerror="this.parentNode.innerHTML=PLACEHOLDER">`;
}

function renderCards() {
  grid.innerHTML = "";
  const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  empty.hidden = slice.length > 0;
  slice.forEach((h, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.transitionDelay = (i % 3) * 0.1 + "s";
    card.innerHTML = `
      <div class="photo">${photoHTML(h)}</div>
      <h3>${esc(h.name)}</h3>
      <p>${esc(h.text)}</p>
      <a class="btn" href="hero.html?id=${encodeURIComponent(h.id)}">Узнать больше</a>`;
    grid.appendChild(card);
    io.observe(card);
  });
}

function renderPager() {
  pager.innerHTML = "";
  const total = Math.ceil(list.length / PER_PAGE);
  if (total < 1) return;
  const add = (n) => {
    const b = document.createElement("button");
    b.textContent = n;
    if (n === page) b.className = "cur";
    b.addEventListener("click", () => goTo(n));
    pager.appendChild(b);
  };
  const dots = () => { const s = document.createElement("span"); s.textContent = "…"; pager.appendChild(s); };
  if (total <= 10) { for (let n = 1; n <= total; n++) add(n); }
  else {
    const from = Math.max(2, page - 2), to = Math.min(total - 1, page + 2);
    add(1); if (from > 2) dots();
    for (let n = from; n <= to; n++) add(n);
    if (to < total - 1) dots(); add(total);
  }
}

function goTo(n) { page = n; renderCards(); renderPager(); document.getElementById("catalog").scrollIntoView({ behavior: "smooth" }); }

function search() {
  const q = input.value.trim().toLowerCase();
  list = heroes.filter((h) => (h.name + " " + h.text).toLowerCase().includes(q));
  page = 1; renderCards(); renderPager();
}

let timer;
input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(search, 250); });
document.getElementById("searchForm").addEventListener("submit", (e) => { e.preventDefault(); search(); });

renderCards();
renderPager();
