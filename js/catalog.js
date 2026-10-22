/* Каталог писем: читает data/letters.js и строит карточки.
   Если массив пуст — показывает заглушку «Письма скоро появятся…».
   Для проверки вёрстки без данных откройте catalog.html?preview — появятся 6 карточек-пустышек. */

const grid = document.getElementById('lettersGrid');
const empty = document.getElementById('lettersEmpty');

async function loadLetters() {
    try {
        const mod = await import('../data/letters.js');
        return Array.isArray(mod.letters) ? mod.letters : [];
    } catch (err) {
        console.error('Не удалось загрузить data/letters.js (модули не работают при открытии файла напрямую — запустите через локальный сервер):', err);
        return [];
    }
}

function row(label, value, extra = '') {
    const r = document.createElement('span');
    r.className = 'meta-row ' + extra;
    const l = document.createElement('span');
    l.className = 'meta-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'meta-value';
    v.textContent = value || '…';
    r.append(l, v);
    return r;
}

function buildCard(letter) {
    const a = document.createElement('a');
    a.className = 'letter-card';
    a.href = 'letter.html?id=' + encodeURIComponent(letter.id);

    const body = document.createElement('span');
    body.className = 'card-body';

    const meta = document.createElement('span');
    meta.className = 'card-meta';
    meta.append(
        row('Кому:', letter.to),
        row('От кого:', letter.from),
        row('Дата письма:', letter.date || 'не указана', 'is-date')
    );
    if (letter.preview) {
        const ex = document.createElement('span');
        ex.className = 'card-excerpt';
        ex.textContent = letter.preview;
        meta.append(ex);
    }

    const mini = document.createElement('span');
    mini.className = 'mini-sheet';
    mini.setAttribute('aria-hidden', 'true');

    body.append(meta, mini);
    a.append(body);
    return a;
}

const PREVIEW = Array.from({ length: 6 }, (_, i) => ({ id: 'preview-' + (i + 1), to: '…', from: '…', date: '…' }));

const data = await loadLetters();
const list = data.length ? data : (new URLSearchParams(location.search).has('preview') ? PREVIEW : []);

if (list.length) {
    grid.replaceChildren(...list.map(buildCard));
    empty.hidden = true;
} else {
    grid.hidden = true;
    empty.hidden = false;
}
