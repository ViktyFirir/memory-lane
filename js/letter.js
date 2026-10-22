/* Страница письма: берёт ?id=... , ищет письмо в data/letters.js и выводит его на «кремовый лист».
   Пока данных нет (или id вида preview-N) — показывается лист-заглушка. */

const params = new URLSearchParams(location.search);
const id = params.get('id') || '';

const el = {
    to: document.getElementById('letterTo'),
    date: document.getElementById('letterDate'),
    body: document.getElementById('letterBody'),
    sign: document.getElementById('letterSign'),
    note: document.getElementById('letterNote')
};

async function loadLetters() {
    try {
        const mod = await import('../data/letters.js');
        return Array.isArray(mod.letters) ? mod.letters : [];
    } catch (err) {
        console.error('Не удалось загрузить data/letters.js (запустите сайт через локальный сервер):', err);
        return [];
    }
}

function paragraphs(text) {
    return String(text || '')
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => {
            const node = document.createElement('p');
            node.textContent = p;
            return node;
        });
}

function show(letter) {
    el.to.textContent = letter.to ? 'Кому: ' + letter.to : '';
    el.date.textContent = letter.date || '';
    el.body.replaceChildren(...paragraphs(letter.body));
    el.sign.textContent = letter.sign || letter.from || '';
    el.body.classList.toggle('is-poem', letter.form === 'poem');
    document.title = (letter.to ? 'Письмо: ' + letter.to : 'Письмо') + ' — Сохраним память вместе';
}

function showStub() {
    show({ to: '…', date: '…', from: '…', body: 'Здесь будет текст письма…' });
    el.note.textContent = 'Письмо скоро появится.';
    el.note.hidden = false;
}

const letters = await loadLetters();
const found = letters.find(l => l.id === id);

if (found) {
    show(found);
} else if (!letters.length || id.startsWith('preview')) {
    showStub();
} else {
    show({ body: 'Такого письма в каталоге нет.' });
    el.note.textContent = 'Вернитесь к каталогу и выберите другое письмо.';
    el.note.hidden = false;
}

/* ---------- «Читайте также»: 2 случайных письма, кроме открытого ---------- */
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

const others = letters.filter(l => l !== found);
for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
}
const picks = others.slice(0, 2);
if (picks.length) {
    document.getElementById('moreGrid').replaceChildren(...picks.map(buildCard));
    document.getElementById('moreLetters').hidden = false;
}
