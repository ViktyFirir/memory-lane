/* =====================================================================
   <site-footer> — общий футер сайта.

   Подключение на любой странице (в <head>, ПОСЛЕ style.css):
       <link rel="stylesheet" href="style.css">
       <link rel="stylesheet" href="components/footer.css">
       <script src="components/footer.js"></script>
   и в <body> в самом конце контента:
       <site-footer></site-footer>

   Меню, соцсети и тексты правятся ТОЛЬКО здесь — обновятся на всех страницах.
   ===================================================================== */
(() => {
    const SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
    const ROOT = SCRIPT_URL ? new URL('../', SCRIPT_URL).href : './';
    const HOME = ROOT + 'index.html';

    const trimIndex = path => path.replace(/index\.html$/, '');
    const onHome = trimIndex(location.pathname) === trimIndex(new URL(HOME).pathname);
    const href = hash => (onHome ? hash : HOME + hash);

    const MENU = [
        { hash: '#top',       label: 'Главная' },
        { hash: '#heroes',    label: 'Герои' },
        { hash: '#chronicle', label: 'История' },
        { hash: '#battles',   label: 'Битвы' },
        { hash: '#map',       label: 'Карта' }
    ];

    const SOCIALS = [
        { url: '#', label: 'Facebook',  icon: 'fab fa-facebook-f' },
        { url: '#', label: 'Twitter',   icon: 'fab fa-twitter' },
        { url: '#', label: 'Instagram', icon: 'fab fa-instagram' }
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
                    <div class="footer-socials">
                        ${SOCIALS.map(s => `<a href="${s.url}" aria-label="${s.label}"><i class="${s.icon}"></i></a>`).join('\n                        ')}
                    </div>
                </div>
                <div class="footer-menu-bottom">
                    <nav>
                        ${MENU.map(m => `<a href="${href(m.hash)}">${m.label}</a>`).join('\n                        ')}
                    </nav>
                    <span class="footer-motto">История не заканчивается на этих страницах.</span>
                </div>
            </div>
        </div>
    </div>
    <div class="footer-legal"><a href="#">Политика обработки персональных данных</a></div>
</footer>`;

    /* иконки соцсетей (Font Awesome): подключаем сами, если страница этого не сделала */
    const FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FA_URL;
        document.head.appendChild(link);
    }

    class SiteFooter extends HTMLElement {
        connectedCallback() {
            if (this.dataset.ready) return;
            this.dataset.ready = '1';
            this.innerHTML = template();
        }
    }

    if (!customElements.get('site-footer')) customElements.define('site-footer', SiteFooter);
})();
