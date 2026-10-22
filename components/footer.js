/* =====================================================================
   <site-footer> — общий футер сайта.

   Подключение на любой странице (в <head>, ПОСЛЕ style.css):
       <link rel="stylesheet" href="style.css">
       <link rel="stylesheet" href="components/footer.css">
       <script src="components/footer.js"></script>
   и в <body> в самом конце контента:
       <site-footer></site-footer>

   Меню, соцсети, контакты, ссылки и тексты правятся ТОЛЬКО здесь —
   обновятся на всех страницах.
   ===================================================================== */
(() => {
    const SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
    const ROOT = SCRIPT_URL ? new URL('../', SCRIPT_URL).href : './';
    const HOME = ROOT + 'index.html';

    /* стили компонента подключаем сами, если страница забыла добавить <link> */
    if (SCRIPT_URL && !document.querySelector('link[href*="footer.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = ROOT + 'components/footer.css';
        document.head.appendChild(link);
    }

    const trimIndex = path => path.replace(/index\.html$/, '');
    const onHome = trimIndex(location.pathname) === trimIndex(new URL(HOME).pathname);
    const href = (hash, page) => (page ? ROOT + page : (onHome ? hash : HOME + hash));

    /* ---------- Данные ---------- */
    const YEAR_FROM = 2026;                       // год запуска проекта
    const YEAR_NOW = new Date().getFullYear();
    const YEARS = YEAR_NOW > YEAR_FROM ? `${YEAR_FROM}–${YEAR_NOW}` : `${YEAR_FROM}`;

    const COLLEGE = {
        name: 'Учреждение образования «Гродненский государственный политехнический колледж»',
        site: 'http://ggpk.by/',
        address: '230001, г. Гродно, ул. Советских пограничников, 2',
        phone: '+375 (152) 39-36-02',
        phoneNote: 'приемная',
        email: 'polyteh@ggpk.by'
    };

    const GOV_LINKS = [
        { url: 'http://president.gov.by/', label: 'Президент Республики Беларусь' },
        { url: 'http://edu.gov.by/',       label: 'Министерство образования Республики Беларусь' },
        { url: 'http://pravo.by/',         label: 'Национальный правовой Интернет-портал' }
    ];

    const LEGAL_LINKS = [
        { page: 'privacy.html', label: 'Политика обработки персональных данных' },
        { page: 'cookies.html', label: 'Использование файлов cookie' }
    ];

    const MENU = [
        { hash: '#top',       label: 'Главная' },
        { hash: '#heroes',    page: 'heroes.html', label: 'Герои' },
        { hash: '#letters',   page: 'catalog.html', label: 'Письма' },
        { hash: '#chronicle', label: 'История' },
        { hash: '#battles',   label: 'Битвы' },
        { hash: '#map',       label: 'Карта' }
    ];

    const template = () => `
<footer class="footer">
    <div class="footer-hero">
        <div class="footer-hero-inner">
            <img src="${ROOT}img/Vector.png" class="footer-flower" alt="">
            <div class="section-kicker">ФИНАЛ / ПАМЯТЬ</div>
            <h2 class="footer-title">За каждым именем на этом сайте — судьба человека,<br>который отдал жизнь за мирное небо над нашей головой.</h2>
            <p class="footer-text">Если у Вас есть материалы или истории о ветеранах вашей семьи — свяжитесь с нами.<br>Давайте сохраним память вместе.</p>
        </div>
    </div>

    <div class="footer-nav">
        <div class="footer-nav-content">
            <div class="footer-logo"><img src="${ROOT}img/logo.png" alt="Логотип"></div>
            <div class="footer-menu-block">
                <div class="footer-menu-top">
                    <h3>Навигация по сайту</h3>
                </div>
                <div class="footer-menu-bottom">
                    <nav>
                        ${MENU.map(m => `<a href="${href(m.hash, m.page)}">${m.label}</a>`).join('\n                        ')}
                    </nav>
                    <span class="footer-motto">История не заканчивается на этих страницах.</span>
                </div>
            </div>
        </div>
    </div>

    <div class="footer-info">
        <div class="footer-info-grid">
            <section class="footer-info-col">
                <h4>Контакты</h4>
                <address>
                    <p>${COLLEGE.address}</p>
                    <p>Тел.: <a href="tel:${COLLEGE.phone.replace(/[^+\d]/g, '')}">${COLLEGE.phone}</a> (${COLLEGE.phoneNote})</p>
                    <p>E-mail: <a href="mailto:${COLLEGE.email}">${COLLEGE.email}</a></p>
                </address>
            </section>

            <section class="footer-info-col">
                <h4>Организация и ресурсы</h4>
                <ul>
                    <li><a href="${COLLEGE.site}" target="_blank" rel="noopener">Официальный сайт колледжа</a></li>
                    ${GOV_LINKS.map(g => `<li><a href="${g.url}" target="_blank" rel="noopener">${g.label}</a></li>`).join('\n                    ')}
                </ul>
            </section>

            <section class="footer-info-col">
                <h4>Правовая информация</h4>
                <ul>
                    ${LEGAL_LINKS.map(l => `<li><a href="${ROOT}${l.page}">${l.label}</a></li>`).join('\n                    ')}
                    <li><button type="button" class="footer-a11y" aria-pressed="false"><i class="fas fa-eye" aria-hidden="true"></i> Версия для слабовидящих</button></li>
                </ul>
            </section>
        </div>
    </div>

    <div class="footer-legal">
        <p class="footer-copy">© ${YEARS} ${COLLEGE.name}. Историко-патриотический проект учащихся и преподавателей Гродненского государственного политехнического колледжа.</p>
        <p class="footer-copy">Вышестоящая организация: Главное управление образования Гродненского облисполкома.</p>
        <p class="footer-copy">При использовании материалов сайта ссылка на источник обязательна.</p>
    </div>
</footer>`;

    /* иконки соцсетей (Font Awesome): подключаем сами, если страница этого не сделала */
    const FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FA_URL;
        document.head.appendChild(link);
    }

    /* ---------- Версия для слабовидящих ----------
       Класс на <html>, состояние хранится в localStorage и действует на всех страницах.
       Применяем сразу при загрузке скрипта, чтобы не было «мигания». */
    const A11Y_KEY = 'a11y-mode';
    const readA11y = () => { try { return localStorage.getItem(A11Y_KEY) === '1'; } catch (e) { return false; } };
    const writeA11y = on => { try { localStorage.setItem(A11Y_KEY, on ? '1' : '0'); } catch (e) {} };
    document.documentElement.classList.toggle('a11y', readA11y());

    class SiteFooter extends HTMLElement {
        connectedCallback() {
            if (this.dataset.ready) return;
            this.dataset.ready = '1';
            this.innerHTML = template();

            const btn = this.querySelector('.footer-a11y');
            const sync = () => btn.setAttribute('aria-pressed', document.documentElement.classList.contains('a11y'));
            btn.addEventListener('click', () => {
                const on = document.documentElement.classList.toggle('a11y');
                writeA11y(on);
                document.dispatchEvent(new Event('a11y-change'));
            });
            document.addEventListener('a11y-change', sync);
            sync();
        }
    }

    if (!customElements.get('site-footer')) customElements.define('site-footer', SiteFooter);
})();
