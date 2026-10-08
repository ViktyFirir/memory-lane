/* =====================================================================
   <site-header> — общий хедер сайта (меню, бургер, боковая панель).

   Подключение на любой странице (в <head>, ПОСЛЕ style.css):
       <link rel="stylesheet" href="style.css">
       <link rel="stylesheet" href="components/header.css">
       <script src="components/header.js"></script>
   и в <body> там, где нужен хедер:
       <site-header></site-header>

   Необязательно:  <site-header active="heroes"></site-header>
   подсвечивает пункт меню (ключи — в списке LINKS ниже).

   Пункты меню правятся ТОЛЬКО здесь — они обновятся на всех страницах.
   Пути к картинкам и ссылки считаются от папки сайта, поэтому
   компонент работает и из вложенных папок.
   ===================================================================== */
(() => {
    const SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
    const ROOT = SCRIPT_URL ? new URL('../', SCRIPT_URL).href : './';
    const HOME = ROOT + 'index.html';

    /* стили компонента подключаем сами, если страница забыла добавить <link> */
    if (SCRIPT_URL && !document.querySelector('link[href*="header.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = ROOT + 'components/header.css';
        document.head.appendChild(link);
    }

    /* на главной ссылки остаются «#якорями», на остальных страницах ведут на index.html#якорь */
    const trimIndex = path => path.replace(/index\.html$/, '');
    const onHome = trimIndex(location.pathname) === trimIndex(new URL(HOME).pathname);
    /* page — отдельная страница (например heroes.html); без неё ссылка ведёт на якорь главной */
    const href = (hash, page) => (page ? ROOT + page : (onHome ? hash : HOME + hash));

    /* key — для атрибута active; main — в верхней панели (десктоп), все пункты — в боковом меню */
    const LINKS = [
        { key: 'home',      hash: '#top',       label: 'Главная', main: true },
        { key: 'heroes',    hash: '#heroes',    page: 'heroes.html', label: 'Герои', main: true },
        { key: 'history',   hash: '#history',   label: 'История', main: true },
        { key: 'battles',   hash: '#battles',   label: 'Битвы',   main: true },
        { key: 'map',       hash: '#map',       label: 'Карта' },
        { key: 'chronicle', hash: '#chronicle', label: 'Хроника' }
    ];

    const topLink = (l, active) =>
        `<a href="${href(l.hash, l.page)}" class="nav-link${l.key === active ? ' active' : ''}">${l.label}</a>`;

    const template = active => {
        const main = LINKS.filter(l => l.main);
        return `
<header class="main-header">
    <nav class="navbar">
        <button class="burger-menu" id="burgerToggle" aria-label="Открыть меню">
            <span></span><span></span><span></span>
        </button>

        <div class="nav-group">
            ${main.slice(0, 2).map(l => topLink(l, active)).join('\n            ')}
        </div>

        <a href="${href('#top')}" class="logo-container" aria-label="На главную">
            <div class="logo-circle">
                <img src="${ROOT}img/logo.png" alt="Логотип" class="logo-img">
            </div>
        </a>

        <div class="nav-group">
            ${main.slice(2).map(l => topLink(l, active)).join('\n            ')}
        </div>
    </nav>
</header>

<div class="side-panel" id="sidePanel" aria-hidden="true">
    <button class="close-btn" id="closePanel" aria-label="Закрыть меню">✕</button>
    <nav class="side-nav">
        ${LINKS.map(l => `<a href="${href(l.hash, l.page)}">${l.label}</a>`).join('\n        ')}
    </nav>
</div>`;
    };

    class SiteHeader extends HTMLElement {
        connectedCallback() {
            if (this.dataset.ready) return;
            this.dataset.ready = '1';
            this.innerHTML = template(this.getAttribute('active') || 'home');
            this.setup();
        }

        setup() {
            const $ = s => this.querySelector(s);
            const header = $('.main-header');
            const panel = $('#sidePanel');

            /* мобильное меню */
            const openMenu = () => {
                panel.classList.add('active');
                panel.setAttribute('aria-hidden', 'false');
                document.body.classList.add('menu-open');
            };
            const closeMenu = () => {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('menu-open');
            };
            $('#burgerToggle').addEventListener('click', openMenu);
            $('#closePanel').addEventListener('click', closeMenu);
            this.querySelectorAll('.side-nav a').forEach(a => a.addEventListener('click', closeMenu));
            document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

            /* фон хедера при прокрутке */
            const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();

            /* подсветка пункта меню по разделу на экране (только на странице, где эти разделы есть) */
            if (!onHome || !('IntersectionObserver' in window)) return;
            const links = [...this.querySelectorAll('.nav-link')];
            const targets = LINKS
                .filter(l => l.hash !== '#top' && !l.page)
                .map(l => document.getElementById(l.hash.slice(1)))
                .filter(Boolean);
            if (!targets.length) return;
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
                });
            }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
            targets.forEach(t => observer.observe(t));
        }
    }

    if (!customElements.get('site-header')) customElements.define('site-header', SiteHeader);
})();
