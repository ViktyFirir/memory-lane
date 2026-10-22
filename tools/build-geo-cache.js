// Собирает js/geo-cache.js: заранее скачивает из OpenStreetMap положение всех улиц и мемориалов героев,
// чтобы страница героя показывала точную карту сразу, без ожидания.
// Запуск (нужен интернет и Node 18+):   node tools/build-geo-cache.js
// Заодно пишет tools/geo-report.txt — список мест, которые стоит проверить глазами
// (не найдено, найдено далеко от записанных координат, найдена только улица вместо дома).
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const heroes = vm.runInNewContext(fs.readFileSync(path.join(root, "js/heroes-data.js"), "utf8") + ";heroes");

const RAD = Math.PI / 180, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dist = (a, b) => { const dLa = (b[0] - a[0]) * RAD, dLo = (b[1] - a[1]) * RAD; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(dLo / 2) ** 2; return 12742000 * Math.asin(Math.sqrt(x)); };
const hash = (s) => { let x = 0; for (let k = 0; k < s.length; k++) x = (x * 31 + s.charCodeAt(k)) | 0; return (x >>> 0).toString(36); }; // как в js/hero.js
const round5 = (p) => p.map((c) => [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5]);
const qEsc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const NOT_STREET = /переулок|завулак|проезд|праезд|тупик|тупік/i, PLACE = /^(place|boundary)$/, ROAD = /^(highway|place|boundary|landuse)$/;
const UA = { "User-Agent": "memory-lane-geo-cache/1.0 (school project)" };
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];

async function overpass(query) {
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(query), headers: { "Content-Type": "application/x-www-form-urlencoded", ...UA } });
      if (r.ok) { const j = await r.json(); if (j && Array.isArray(j.elements)) return j; }
    } catch (e) {}
  }
  return null;
}
let last = 0;
async function nominatim(text, q, extra) {
  const r = q.g.r || 8000, dLa = r / 111320, dLo = r / (111320 * Math.cos(q.fb[0] * RAD));
  const vb = [q.fb[1] - dLo, q.fb[0] + dLa, q.fb[1] + dLo, q.fb[0] - dLa].join(",");
  await sleep(Math.max(0, last + 1100 - Date.now())); last = Date.now();
  try {
    const res = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=ru&bounded=1&addressdetails=1&viewbox=" + vb + (extra || "") + "&q=" + encodeURIComponent(text), { headers: UA });
    if (!res.ok) return null;
    const arr = await res.json();
    return arr.filter((it) => dist([+it.lat, +it.lon], q.fb) <= r * 1.2);
  } catch (e) { return null; }
}
const okHit = (it, text) => { // тот же критерий, что в js/hero.js
  const cls = it.category || it.class || "";
  if (!/\d/.test(text)) return true;
  if (ROAD.test(cls)) return false;
  return !!(it.address && it.address.house_number) || /^(building|amenity|office|shop|craft|man_made|historic)$/.test(cls);
};

(async () => {
  const cache = {}, report = [];
  for (const h of heroes) {
    const pts = [];
    (h.memorials || []).forEach((m) => m.rows.forEach((r) => {
      if (typeof r[2] === "number" && typeof r[3] === "number") pts.push({ type: r[0], addr: r[1], place: m.place, fb: [r[2], r[3]], g: r[5] || null });
    }));
    const key = (i) => h.id + ":" + i + ":" + hash(JSON.stringify(pts[i].g));
    const note = (i, msg) => report.push(`[${h.id}] ${pts[i].place} — ${pts[i].type} (${pts[i].addr}): ${msg}`);
    const streets = pts.map((_, i) => i).filter((i) => pts[i].g && pts[i].g.s);
    if (streets.length) {
      const body = streets.map((i) => { const q = pts[i]; return `way["highway"]["highway"!~"^(footway|steps|path|cycleway|track|bridleway|corridor|proposed)$"][~"^name(:ru|:be)?$"~"${qEsc(q.g.s)}"](around:${q.g.r || 8000},${q.fb[0]},${q.fb[1]});`; }).join("");
      const data = await overpass("[out:json][timeout:40];(" + body + ");out geom;");
      const res = {};
      if (data) data.elements.forEach((w) => {
        if (w.type !== "way" || !w.geometry || w.geometry.length < 2) return;
        const t = w.tags || {}, names = [t.name, t["name:ru"], t["name:be"]].filter(Boolean);
        if (names.every((n) => NOT_STREET.test(n) && !/улица|вуліца/i.test(n))) return;
        const p = w.geometry.map((c) => [c.lat, c.lon]), mid = p[Math.floor(p.length / 2)];
        let best = -1, bd = Infinity;
        streets.forEach((i) => { if (!names.some((n) => new RegExp(pts[i].g.s).test(n))) return; const d = dist(pts[i].fb, mid); if (d <= (pts[i].g.r || 8000) && d < bd) { bd = d; best = i; } });
        if (best >= 0) (res[best] = res[best] || []).push(p);
      });
      for (const i of streets) {
        if (res[i]) { cache[key(i)] = { k: "line", paths: res[i].map(round5) }; continue; }
        const arr = pts[i].g.n ? await nominatim(pts[i].g.n, pts[i], "&polygon_geojson=1") : null;
        const it = arr && arr.find((x) => (x.category || x.class) === "highway" && x.geojson && /LineString/.test(x.geojson.type));
        if (it) { const lines = it.geojson.type === "LineString" ? [it.geojson.coordinates] : it.geojson.coordinates; cache[key(i)] = { k: "line", paths: lines.map((l) => round5(l.map((c) => [c[1], c[0]]))) }; }
        else note(i, data ? "улица не найдена в OpenStreetMap" : "Overpass не ответил — запустите скрипт ещё раз");
      }
    }
    for (let i = 0; i < pts.length; i++) {
      const g = pts[i].g; if (!g || g.s) continue;
      let hit = null, failed = false;
      for (const text of g.q || []) {
        const arr = await nominatim(text, pts[i]);
        if (!arr) { failed = true; continue; }
        const good = arr.filter((x) => okHit(x, text));
        if (good.length) { const it = good[0]; hit = { k: "pt", lat: +it.lat, lng: +it.lon, precise: !PLACE.test(it.category || it.class || ""), by: text }; break; }
      }
      if (!hit) { note(i, failed ? "сервис не ответил — запустите скрипт ещё раз" : "не найдено, на карте будет «примерное место»"); continue; }
      const d = Math.round(dist([hit.lat, hit.lng], pts[i].fb)), by = hit.by; delete hit.by;
      cache[key(i)] = hit;
      if (hit.precise && d > 300) note(i, `OpenStreetMap ставит метку в ${d} м от координат в heroes-data.js (запрос «${by}») — проверьте глазами: https://www.openstreetmap.org/?mlat=${hit.lat}&mlon=${hit.lng}#map=18/${hit.lat}/${hit.lng}`);
      if (!hit.precise && !g.a) note(i, `найден только населённый пункт, а не сам объект (запрос «${by}»)`);
    }
    console.log("готово:", h.id);
  }
  fs.writeFileSync(path.join(root, "js/geo-cache.js"), "// Сгенерировано tools/build-geo-cache.js " + new Date().toISOString().slice(0, 10) + ". Не править вручную.\nwindow.GEO_CACHE = " + JSON.stringify(cache) + ";\n");
  fs.writeFileSync(path.join(__dirname, "geo-report.txt"), report.length ? report.join("\n") + "\n" : "Замечаний нет.\n");
  console.log("записано записей:", Object.keys(cache).length, "; замечаний:", report.length, "(см. tools/geo-report.txt)");
})();
